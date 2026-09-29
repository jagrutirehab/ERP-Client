import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Col, Form, FormFeedback, Row } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import InvoiceTable from "./Components/InvoiceTable";
import InvoiceFooter from "./Components/InvoiceFooter";
import {
  evaluatePosGuards,
  usePosTerminal,
} from "./Components/posGuards";
import SubmitForm from "./Components/SubmitForm";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  addInvoice,
  createEditBill,
  fetchBills,
  fetchPaymentAccounts,
  updateInvoice,
} from "../../../store/actions";
import { CASH, INVOICE, OPD } from "../../../Components/constants/patient";
import Inovice from "../Dropdowns/Inovice";
import { setBillingStatus } from "../../../store/features/patient/patientSlice";
import {
  getProceduresByCenterid,
  getProceduresByid,
} from "../../../helpers/backend_helper";
import InvoiceDateRange from "./Components/InvoiceDateRange";
import FromDateModal from "./Components/FromDateModal";

// Each paymentModes row may carry a transient `evidenceFiles` array (Files, never sent as-is).
// Strip it before the array goes out as JSON, and collect it separately for FormData —
// one entry per file, with the mode repeated so the backend can pair them positionally.
const stripEvidenceFiles = (modes) =>
  (modes || []).map(({ evidenceFiles, ...rest }) => rest);

const collectEvidenceFiles = (modes) =>
  (modes || []).flatMap((mode) =>
    (mode.evidenceFiles || []).map((file) => ({ file, mode: mode.type }))
  );

// The invoice draft as it stands when the charge is sent. `availablePrices`
// is a fetched lookup rebuilt on load, so it is dropped rather than stored.
const buildInvoiceSnapshot = (invoiceList, wholeDiscount, paymentModes) => ({
  invoiceList: (invoiceList || []).map(
    ({ availablePrices, ...item }) => item,
  ),
  wholeDiscount,
  // An invoice can be split across tenders — cash plus a card charge, say.
  // Only one of them goes to the terminal, so the others have to be kept or
  // the restored invoice would no longer add up to the payable amount.
  paymentModes: (paymentModes || []).map(
    ({ evidenceFiles, ...mode }) => mode,
  ),
});

// IDs of Pine Labs charges already approved on the terminal. The server
// re-reads each from its own record before billing them.
const collectPosTransactionIds = (modes) =>
  (modes || []).map((mode) => mode.posTransaction).filter(Boolean);

const buildTransactionProofFormData = (payload, evidenceEntries) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (
      key === "invoiceList" ||
      key === "paymentModes" ||
      key === "posTransactionIds"
    ) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  evidenceEntries.forEach(({ file }) => formData.append("transactionProof", file));
  formData.append(
    "transactionProofModes",
    JSON.stringify(evidenceEntries.map((entry) => entry.mode))
  );
  return formData;
};

const DuePayment = ({
  author,
  patient,
  center,
  billData,
  billDate,
  editBillData,
  admission,
  invoiceProcedures,
  appointment,
  type,
  shouldPrintAfterSave,
  isLatest,
  posPrefill,
  ...rest
}) => {
  const dispatch = useDispatch();

  // console.log("Data : ", {
  //   patient,
  //   center,
  // });

  const editData = editBillData
    ? type === OPD
      ? editBillData.receiptInvoice
      : editBillData.invoice
    : null;
  const existingTransactionProof = editData?.transactionProof;
  // getProceduresByid
  const advpayment = useSelector((state) => state.Bill.calculatedAdvance);

  const [totalAdvance, setTotalAdvance] = useState(advpayment);
  const [invoiceList, setInvoiceList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [arrayToSend, setArrayToSend] = useState(null);
  const [availablePrices, setAvailablePrices] = useState([]);
  const [whileEditAvailablePrices, setWhileEditAvailablePrices] = useState([]);
  const [initialFromDate, setInitialFromDate] = useState("");
  const [initialToDate, setInitialToDate] = useState("");
  const [wholeDiscount, setWholeDiscount] = useState({
    unit: "₹",
    value: 0,
  });
  const [totalPayable, setTotalPayable] = useState(0);
  const [refund, setRefund] = useState(0);
  const [invoiceType, setInvoiceType] = useState(
    editBillData ? editBillData.bill : INVOICE,
  );
  const [paymentModes, setPaymentModes] = useState([{ type: CASH }]);

  // Opened from the POS dashboard to bill a charge the terminal already took.
  // Only the tender is known — the procedures still have to be entered — so
  // the payment row comes back filled and locked and nothing else changes.
  const isPosRecovery = !!posPrefill && !editBillData;

  // Restore the invoice draft the charge was taken against, so the cashier
  // is not left retyping procedures for money already collected.
  useEffect(() => {
    if (!isPosRecovery) return;
    const snapshot = posPrefill.invoiceSnapshot;
    if (!snapshot) return;
    if (Array.isArray(snapshot.invoiceList)) {
      // Dates survive the round trip as full ISO strings; a date input only
      // renders YYYY-MM-DD, so trim them back on the way in.
      const asDateInput = (v) =>
        v ? String(v).slice(0, 10) : v;
      setInvoiceList(
        snapshot.invoiceList.map((item) => ({
          ...item,
          availablePrices: [],
          ...(item.fromDate ? { fromDate: asDateInput(item.fromDate) } : {}),
          ...(item.toDate ? { toDate: asDateInput(item.toDate) } : {}),
        })),
      );
    }
    if (snapshot.wholeDiscount) setWholeDiscount(snapshot.wholeDiscount);
  }, [isPosRecovery, posPrefill]);

  useEffect(() => {
    if (!isPosRecovery) return;
    const result = posPrefill.result || {};
    const tender = result.paymentMode || posPrefill.requestedMode;

    // The row this charge actually paid, with the terminal's own values.
    const charged = {
      type: tender,
      amount: posPrefill.amount,
      transactionId: result.rrn || result.transactionId || "",
      cardNumber: String(result.cardNumber || "")
        .replace(/[^0-9]/g, "")
        .slice(-4),
      posTransaction: posPrefill._id,
      posApprovalCode: result.approvalCode,
      posReferenceId: posPrefill.plutusTransactionReferenceId,
      posPayerVpa: result.upiPayerVpa,
    };

    const saved = posPrefill.invoiceSnapshot?.paymentModes;
    if (!Array.isArray(saved) || !saved.length) {
      setPaymentModes([charged]);
      return;
    }

    // Overlay the charged row onto the saved split, leaving the other tenders
    // (cash, cheque) exactly as the cashier entered them. Matched on tender
    // and amount, and only the first match, so a second identical row is not
    // credited to the same swipe.
    let overlaid = false;
    const restored = saved.map((mode) => {
      if (
        !overlaid &&
        !mode.posTransaction &&
        mode.type === tender &&
        Number(mode.amount) === Number(posPrefill.amount)
      ) {
        overlaid = true;
        return { ...mode, ...charged };
      }
      return mode;
    });

    setPaymentModes(overlaid ? restored : [...restored, charged]);
  }, [isPosRecovery, posPrefill]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const ptCenter = center ? center : patient?.center?._id;

  // Guards: a card/UPI row on a POS centre must carry an approved charge
  // before the invoice may be saved, and once one is approved the form cannot
  // be abandoned — the money is already gone. OPD rows key the tender on
  // `type`, hence the tenderKey below.
  const { posAvailable } = usePosTerminal(ptCenter);
  const { blockSave, saveReason, blockCancel, cancelReason } =
    evaluatePosGuards(paymentModes, {
      posAvailable: posAvailable && type === OPD,
      tenderKey: "type",
      readOnly: isPosRecovery,
    });

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: ptCenter,
      addmission: admission || patient?.addmission?._id,
      invoiceList: invoiceList,
      totalCost: totalCost,
      totalDiscount: totalDiscount,
      grandTotal: grandTotal,
      payable: totalPayable,
      paymentModes: 0,
      refund,
      date: billDate,
      type,
      bill: invoiceType,
      // fromDate: initialFromDate,
      // toDate: initialToDate,
    },
    validationSchema: Yup.object({
      ...(type === OPD && {
        paymentModes: Yup.number().test(
          "paymentModes",
          "Payments should match total payable",
          function (value) {
            const payable = this.parent.payable;

            if (value !== payable) {
              return this.createError({
                message: "Payments should match total payable",
              });
            }
            return true;
          },
        ),
      }),
      bill: Yup.string().required("Bill type required!"),
      invoiceList: Yup.array().of(
        Yup.object().shape({
          discountReason: Yup.string().when("discount", {
            is: (val) => Number(val) > 0,
            then: (schema) => schema.required("Discount reason is required"),
            otherwise: (schema) => schema.nullable(),
          }),
          fromDate: Yup.date()
            .nullable()
            .when("category", {
              is: (val) => val?.toLowerCase() === "room charges",
              then: (schema) => schema.required("From Date is required"),
            })
            .test(
              "fromDate-check",
              "From Date cannot be greater than To Date",
              function (value) {
                const { toDate } = this.parent;
                if (!value || !toDate) return true;
                return new Date(value) <= new Date(toDate);
              },
            ),

          toDate: Yup.date()
            .nullable()
            .when("category", {
              is: (val) => val?.toLowerCase() === "room charges",
              then: (schema) => schema.required("To Date is required"),
            })
            .test(
              "toDate-check",
              "To Date must be greater than or equal to From Date",
              function (value) {
                const { fromDate } = this.parent;
                if (!value || !fromDate) return true;
                return new Date(value) >= new Date(fromDate);
              },
            ),
        }),
      ),

      // ...(type === "IPD" && {
      //   fromDate: Yup.date().required("From date is required"),

      //   toDate: Yup.date()
      //     .required("To date is required")
      //     .min(Yup.ref("fromDate"), "To date must be greater than From date")
      //     .test(
      //       "not-same-date",
      //       "From and To date cannot be same",
      //       function (value) {
      //         const { fromDate } = this.parent;
      //         if (!fromDate || !value) return true;

      //         return new Date(fromDate).getTime() !== new Date(value).getTime();
      //       },
      //     ),
      // }),
    }),

    onSubmit: async (values) => {
      const evidenceEntries = collectEvidenceFiles(paymentModes);
      const cleanPaymentModes = stripEvidenceFiles(paymentModes);

      if (editData) {
        const payload = {
          id: editBillData._id,
          billId: editData._id,
          appointment: appointment?._id,
          shouldPrintAfterSave,
          ...values,
          paymentModes: cleanPaymentModes,
        };
        const response = await dispatch(
          updateInvoice(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          ),
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          }),
        );
      } else {
        const posTransactionIds = collectPosTransactionIds(paymentModes);
        const payload = {
          ...values,
          appointment: appointment?._id,
          paymentModes: cleanPaymentModes,
          ...(posTransactionIds.length ? { posTransactionIds } : {}),
          shouldPrintAfterSave,
        };
        const response = await dispatch(
          addInvoice(
            evidenceEntries.length > 0
              ? buildTransactionProofFormData(payload, evidenceEntries)
              : payload
          ),
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          }),
        );
        const admissionId = admission || patient?.addmission?._id;
        if (admissionId) {
          await dispatch(fetchBills(admissionId));
        }
      }
      dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

  useEffect(() => {
    console.log({ ptCenter });
    if (ptCenter) {
      dispatch(
        fetchPaymentAccounts({
          centerIds: [ptCenter],
          page: 1,
          limit: 1000,
        }),
        // fetchPaymentAccounts({ centerIds: userCenters, page: 1, limit: 1000 })
      );
    }
  }, [dispatch, ptCenter, editBillData]);

  useEffect(() => {
    if (!editBillData) {
      const admissionId = patient?.addmission?._id;

      if (!admissionId) return;

      (async () => {
        try {
          const resultAction = await dispatch(fetchBills(admissionId));

          if (fetchBills.fulfilled.match(resultAction)) {
            const bills = resultAction.payload?.payload || [];

            // Step 1: filter
            const invoices = bills.filter(
              (item) => item.bill === "INVOICE" && item.type === "IPD",
            );

            // Step 2: sort by createdAt (newest first)
            invoices.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );

            // Step 3: pick latest
            const latestInvoice = invoices[0];

            // FromDate and to Date Carry Forward
            // if (latestInvoice?.invoice && type === "IPD") {
            //   const previousInvoice = latestInvoice.invoice;

            //   setInitialFromDate(
            //     previousInvoice.fromDate
            //       ? new Date(previousInvoice.fromDate)
            //           .toISOString()
            //           .split("T")[0]
            //       : "",
            //   );

            //   setInitialToDate(
            //     previousInvoice.toDate
            //       ? new Date(previousInvoice.toDate).toISOString().split("T")[0]
            //       : "",
            //   );
            // }
            // FromDate and to Date Carry Forward

            console.log("latestInvoice", latestInvoice);
            const sendingArray = latestInvoice?.invoice?.invoiceList || [];

            setArrayToSend(sendingArray);

            if (sendingArray.length) {
              setInvoiceList(
                sendingArray.map((item) => ({
                  category: item.category || "",
                  comments: item.comments || "",
                  cost: item.cost || 0,
                  slot: item.slot || "",
                  unit: item.unit || 1,
                  unitOfMeasurement: item.unitOfMeasurement || "",
                  availablePrices: [],
                  fromDate: item.fromDate
                    ? new Date(item.fromDate).toISOString().split("T")[0]
                    : "",
                  toDate: item.toDate
                    ? new Date(item.toDate).toISOString().split("T")[0]
                    : "",
                  isNew: false,
                  discountReason: item.discountReason || "",
                })),
              );
            }
          } else if (fetchBills.rejected.match(resultAction)) {
            console.log("❌ Rejected error:", resultAction.error);
          }
        } catch (err) {
          console.error("Dispatch error:", err);
        }
      })();
    } else {
      return;
    }
  }, [dispatch, patient?.addmission?._id, editBillData]);

  useEffect(() => {
    (() => {
      let tCost = 0;
      let tDiscount = 0;
      let tTax = 0;
      let gTotal = 0;
      (invoiceList || []).forEach((item) => {
        let discount = 0;
        let totalValue =
          item.unit && item.cost
            ? parseFloat(item.unit) * parseFloat(item.cost)
            : 0;

        if (item.discount) {
          discount = parseFloat(item.discount);
        }

        const tax = () => (parseInt(item.tax) / 100) * totalValue;
        tCost += totalValue;
        tDiscount += discount <= totalValue ? discount : totalValue;
        tTax += item.tax ? tax() : 0;
      });

      gTotal = tCost - tDiscount + tTax;

      const wDiscount =
        wholeDiscount.unit === "%"
          ? (parseFloat(wholeDiscount.value || 0) / 100) * gTotal
          : parseFloat(wholeDiscount.value || 0);

      let calcPaybel = gTotal >= wDiscount ? gTotal - wDiscount : 0;

      // setTotalPayable(calcPaybel);

      // gTotal = tCost - tDiscount + tTax;

      const advance = editBillData
        ? editBillData?.invoice?.currentAdvance
        : totalAdvance;

      let refund = 0;
      if (invoiceType === "REFUND" && editBillData?.invoice?.refund) {
        refund =
          editBillData.invoice.currentAdvance > gTotal
            ? editBillData.invoice?.currentAdvance + (wDiscount || 0) - gTotal
            : 0;
      } else if (invoiceType === "REFUND") {
        refund = gTotal > advance ? 0 : advance + (wDiscount || 0) - gTotal;
      }
      setTotalCost(tCost);
      const finalTotalDiscount = tDiscount + wDiscount;
      setTotalDiscount(finalTotalDiscount);
      setTotalTax(tTax);
      setGrandTotal(gTotal);
      setTotalPayable(calcPaybel);
      setRefund(refund);
      validation.setFieldValue(
        "paymentModes",
        paymentModes?.reduce(
          (sum, val) => parseInt(sum) + parseInt(val.amount || 0),
          0,
        ),
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // totalCost,
    totalDiscount,
    totalTax,
    grandTotal,
    wholeDiscount,
    totalPayable,
    invoiceList,
    invoiceType,
    totalAdvance,
    paymentModes,
  ]);

  useEffect(() => {
    if (editBillData) {
      const invoice =
        editBillData.type === OPD
          ? editBillData.receiptInvoice
          : editBillData.invoice;

      setInitialFromDate(
        invoice?.fromDate
          ? new Date(invoice.fromDate).toISOString().split("T")[0]
          : "",
      );

      setInitialToDate(
        invoice?.toDate
          ? new Date(invoice.toDate).toISOString().split("T")[0]
          : "",
      );

      const sendingArray = invoice?.invoiceList || [];

      setWhileEditAvailablePrices(sendingArray);

      setInvoiceList(
        sendingArray.map((item) => ({
          category: item?.category || "",
          comments: item?.comments || "",
          cost: item?.cost || 0,
          slot: item?.slot || "",
          unit: item?.unit || 1,
          unitOfMeasurement: item?.unitOfMeasurement || "",
          availablePrices: [],
          isEditMode: true,
          discount: item?.discount || 0,
          discountType: item?.discountType || "₹",
          fromDate: item.fromDate
            ? new Date(item.fromDate).toISOString().split("T")[0]
            : "",
          toDate: item.toDate
            ? new Date(item.toDate).toISOString().split("T")[0]
            : "",
          isNew: false,
          discountReason: item.discountReason || "",
        })),
      );
      setGrandTotal(invoice.grandTotal);
      setPaymentModes(invoice.paymentModes);
      const itemDisc =
        invoice.invoiceList?.reduce(
          (sum, item) => sum + (Number(item.discount) || 0),
          0,
        ) || 0;

      setWholeDiscount({
        unit: "₹",
        value: (Number(invoice.totalDiscount) || 0) - itemDisc,
      });
      setTotalPayable(invoice.payable);
      setTotalAdvance(invoice?.currentAdvance);
      validation.setFieldValue(
        "paymentModes",
        paymentModes?.reduce(
          (sum, val) => parseInt(sum) + parseInt(val.amount || 0),
          0,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editBillData]);

  const addInvoiceItem = (item, data) => {
    if (!item) return;

    const invoiceItems = Array.isArray(data) ? data : [];

    const checkItem = invoiceItems.find((currentItem) => {
      const slotName = currentItem?.slot;
      const itemName = item?.name || item;
      return slotName === itemName;
    });

    if (!checkItem) {
      console.log("item", item);
      const centerMatch = item?.center?.find(
        (d) =>
          String(d?.center?._id) === String(patient?.center?._id || center),
      );
      // console.log("centerMatch", centerMatch);

      const defaultPriceObj =
        centerMatch?.prices && centerMatch.prices.length > 0
          ? centerMatch.prices[0]
          : null;

      const exactCost = defaultPriceObj ? defaultPriceObj.price : 0;
      const dynamicUOM =
        defaultPriceObj?.unit ||
        item?.center?.find((c) => c?.prices?.length)?.prices?.[0]?.unit ||
        undefined;
      //

      setInvoiceList((prevValue) => {
        const prevArray = Array.isArray(prevValue) ? prevValue : [];

        return [
          ...prevArray,
          {
            slot: item.name ? item.name : item,
            category:
              typeof item.category === "object"
                ? item.category.name
                : item.category,
            unit: parseInt(item.unit) || 1,
            cost: exactCost,
            unitOfMeasurement: dynamicUOM,
            comments: "",
            availablePrices: centerMatch?.prices || [],
            fromDate: "",
            toDate: "",
            isNew: true,
            discountReason: "",
          },
        ];
      });
    }
  };

  // console.log("patient from invoice", patient);

  const handleUOMChange = (index, newUnit) => {
    setInvoiceList((prevList) => {
      const updatedList = [...prevList];
      const item = updatedList[index];

      const priceData = item.availablePrices?.find((p) => p.unit === newUnit);

      if (priceData) {
        updatedList[index] = {
          ...item,
          unitOfMeasurement: newUnit,
          cost: priceData.price,
        };
      } else {
        updatedList[index] = {
          ...item,
          unitOfMeasurement: newUnit,
        };
      }
      return updatedList;
    });
  };

  const fetchValidCosts = async (slotName) => {
    if (!slotName) return;

    try {
      const slotNames = invoiceList.map((item) => item.slot);
      const response = await getProceduresByCenterid({
        proNames: slotNames,
        centerId: center || patient?.center?._id,
      });

      const procedurePriceMap = {};

      response?.data?.forEach((proc) => {
        procedurePriceMap[proc.name] = proc?.center?.[0]?.prices || [];
      });

      setAvailablePrices(procedurePriceMap);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!invoiceList?.length) return;

    fetchValidCosts(invoiceList[0]?.slot);
  }, [invoiceList[0]?.slot]);

  // useEffect(() => {
  //   if (!availablePrices?.length) return;

  //   setInvoiceList((prev) =>
  //     prev.map((item) => {
  //       if (editBillData) {
  //         return { ...item, availablePrices };
  //       }

  //       const matched = availablePrices.find(
  //         (p) => p.unit === item.unitOfMeasurement,
  //       );

  //       // If no match is found AND the item is "new" (no cost/UOM yet),
  //       // then apply the first default.
  //       if (!matched && !item.unitOfMeasurement) {
  //         const first = availablePrices[0];
  //         return {
  //           ...item,
  //           availablePrices,
  //           unitOfMeasurement: first.unit,
  //           cost: first.price,
  //         };
  //       }

  //       // If it already has a UOM but we found a price match, update just the cost/prices
  //       return {
  //         ...item,
  //         availablePrices,
  //         cost: matched ? matched.price : item.cost,
  //       };
  //     }),
  //   );
  // }, [availablePrices, editBillData]);

  useEffect(() => {
    if (!availablePrices || Object.keys(availablePrices).length === 0) return;

    setInvoiceList((prev) =>
      prev.map((item) => {
        if (editBillData) {
          return {
            ...item,
            availablePrices: availablePrices[item.slot] || [],
          };
        }

        if (!item.isNew) {
          return {
            ...item,
            availablePrices: availablePrices[item.slot] || [],
          };
        }

        const pricesForItem = availablePrices[item.slot] || [];

        const matched = pricesForItem.find(
          (p) => p.unit === item.unitOfMeasurement,
        );

        if (!matched && !item.unitOfMeasurement && pricesForItem.length) {
          const first = pricesForItem[0];
          return {
            ...item,
            availablePrices: pricesForItem,
            unitOfMeasurement: first.unit,
            cost: first.price,
          };
        }

        return {
          ...item,
          availablePrices: pricesForItem,
          cost: matched && matched.price > 0 ? matched.price : item.cost,
          // cost: matched ? matched.price : item.cost,
        };
      }),
    );
  }, [availablePrices, editBillData]);

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          className="needs-validation"
          action="#"
        >
          {isPosRecovery && (
            <Alert color="info" className="fs-12 py-2">
              <i className="ri-bank-card-line me-1"></i>
              Billing a payment the terminal already took on{" "}
              <strong>
                {new Date(posPrefill.createdAt).toLocaleString()}
              </strong>
              {posPrefill.result?.rrn ? ` (RRN ${posPrefill.result.rrn})` : ""}.
              The invoice and tender are restored exactly as they were when the
              charge was sent and cannot be changed — nobody is charged again.
              Press Save to record it.
            </Alert>
          )}

          <Row>
            <Col md={8}>
              {/* {type === "IPD" && (
                <div className="mb-3">
                  <InvoiceDateRange validation={validation} />
                </div>
              )} */}

              {/* Nothing may be added to an invoice that is only being
                  recorded — the total has to match the money already taken. */}
              {!isPosRecovery && (
              <Inovice
                data={invoiceList}
                dataList={invoiceProcedures}
                fieldName={"name"}
                addItem={addInvoiceItem}
                categories={categories}
                setCategories={setCategories}
                center={center || patient?.center}
              />
              )}
            </Col>
          </Row>

          {/* A fieldset disables every control inside it natively, which is
              both shorter and safer than tracking each input in the table —
              nothing here may change once the money has been taken. */}
          <fieldset
            disabled={isPosRecovery}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
            <InvoiceTable
              isEdit={Boolean(editBillData)}
              invoiceList={invoiceList}
              setInvoiceList={setInvoiceList}
              onUOMChange={handleUOMChange}
              {...rest}
              center={patient?.center}
              validation={validation}
              setShowModal={setShowModal}
              setSelectedIndex={setSelectedIndex}
            />
          </fieldset>
          {/* {validation.touched.invoiceList && validation.errors.invoiceList ? (
            <>
              {validation.errors.invoiceList.map((error, index) => (
                <FormFeedback key={index} type="invalid" className="d-block">
                  {error.unitOfMeasurement}
                </FormFeedback>
              ))}
            </>
          ) : null} */}
          <InvoiceFooter
            isEdit={Boolean(editBillData)}
            totalCost={totalCost}
            totalDiscount={totalDiscount}
            itemDiscount={invoiceList?.reduce(
              (sum, item) => sum + (parseFloat(item.discount) || 0),
              0,
            )}
            totalTax={totalTax}
            grandTotal={grandTotal}
            wholeDiscount={wholeDiscount}
            setWholeDiscount={setWholeDiscount}
            payable={totalPayable}
            refund={refund}
            totalAdvance={totalAdvance}
            validation={validation}
            setInvoiceType={setInvoiceType}
            type={type}
            paymentModes={paymentModes}
            setPaymentModes={setPaymentModes}
            // Enables "Charge on POS" on OPD card/UPI rows. Editing an
            // existing invoice does not re-charge, so it is offered on new
            // invoices only.
            readOnly={isPosRecovery}
            posContext={
              editData
                ? undefined
                : {
                    center: ptCenter,
                    patient: patient?._id,
                    addmission: admission || patient?.addmission?._id,
                    purpose: "INVOICE",
                    billType: type,
                    appointment: appointment?._id,
                    // Kept so a charge that never got billed restores the
                    // whole invoice, not just the tender.
                    invoiceSnapshot: buildInvoiceSnapshot(
                      invoiceList,
                      wholeDiscount,
                      paymentModes,
                    ),
                  }
            }
            isLatest={isLatest}
            existingTransactionProof={existingTransactionProof}
            {...rest}
          />
          <SubmitForm
            {...rest}
            enteredRefundAmount={validation.values.refund}
            bill={invoiceType}
            blockSave={blockSave}
            saveReason={saveReason}
            blockCancel={blockCancel}
            cancelReason={cancelReason}
          />

          <FromDateModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            fromDate={fromDate}
            setFromDate={setFromDate}
            onSubmit={() => {
              if (selectedIndex !== null) {
                setInvoiceList((prev) => {
                  const updated = [...prev];
                  updated[selectedIndex].fromDate = fromDate;
                  return updated;
                });
              }

              setShowModal(false);
              setFromDate("");
            }}
          />
        </Form>
      </div>
    </React.Fragment>
  );
};

DuePayment.propTypes = {
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  billDate: PropTypes.any.isRequired,
  editBillData: PropTypes.object,
  appointment: PropTypes.object,
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  patient: state.Bill.billForm?.patient,
  center: state.Bill.billForm?.center,
  billData: state.Bill,
  billDate: state.Bill.billDate,
  editBillData: state.Bill.billForm.data,
  appointment: state.Bill.billForm.appointment,
  shouldPrintAfterSave: state.Bill.billForm.shouldPrintAfterSave,
  posPrefill: state.Bill.billForm.posPrefill,
  admission: state.Bill.billForm.admission,
  invoiceProcedures: state.Setting.invoiceProcedures,
  ttlAdvance: state.Bill.totalAdvance,
  totalRefund: state.Bill.data[0]?.totalRefund,
});

export default connect(mapStateToProps)(DuePayment);
