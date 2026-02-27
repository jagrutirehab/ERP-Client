import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Form, FormFeedback, Row } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import InvoiceTable from "./Components/InvoiceTable";
import InvoiceFooter from "./Components/InvoiceFooter";
import SubmitForm from "./Components/SubmitForm";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  addInvoice,
  createEditBill,
  fetchBills,
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
  ...rest
}) => {
  const dispatch = useDispatch();

  // console.log("Data : ", {
  //   patient,
  //   center,
  // });

  console.log("type type type", type);

  const editData = editBillData
    ? type === OPD
      ? editBillData.receiptInvoice
      : editBillData.invoice
    : null;
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
  const [categories, setCategories] = useState([]);

  console.log("center", center);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: center ? center : patient?.center?._id,
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
      if (editData) {
        const response = await dispatch(
          updateInvoice({
            id: editBillData._id,
            billId: editData._id,
            appointment: appointment?._id,
            shouldPrintAfterSave,
            ...values,
            paymentModes,
          }),
        ).unwrap();
        dispatch(
          setBillingStatus({
            patientId: patient._id,
            billingStatus: response.billingStatus,
          }),
        );
      } else {
        const response = await dispatch(
          addInvoice({
            ...values,
            appointment: appointment?._id,
            paymentModes,
            shouldPrintAfterSave,
          }),
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

  console.log("editBillData", editBillData);
  useEffect(() => {
    if (editBillData) {
      const invoice =
        editBillData.type === OPD
          ? editBillData.receiptInvoice
          : editBillData.invoice;
      console.log("invoice", invoice);

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

      console.log("defaultPriceObj", defaultPriceObj);

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

  console.log("invoiceList before valid cost fecth", invoiceList);

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

  console.log("availablePrices", availablePrices);

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

  console.log("invoiceList from duepayment", invoiceList);
  console.log("totalDiscount from duepayment", totalDiscount);

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
          <Row>
            <Col md={8}>
              {/* {type === "IPD" && (
                <div className="mb-3">
                  <InvoiceDateRange validation={validation} />
                </div>
              )} */}

              <Inovice
                data={invoiceList}
                dataList={invoiceProcedures}
                fieldName={"name"}
                addItem={addInvoiceItem}
                categories={categories}
                setCategories={setCategories}
                center={center || patient?.center}
              />
            </Col>
          </Row>

          <InvoiceTable
            isEdit={Boolean(editBillData)}
            invoiceList={invoiceList}
            setInvoiceList={setInvoiceList}
            onUOMChange={handleUOMChange}
            {...rest}
            center={patient?.center}
          />
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
            isLatest={isLatest}
            {...rest}
          />
          <SubmitForm
            {...rest}
            enteredRefundAmount={validation.values.refund}
            bill={invoiceType}
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
  admission: state.Bill.billForm.admission,
  invoiceProcedures: state.Setting.invoiceProcedures,
  ttlAdvance: state.Bill.totalAdvance,
  totalRefund: state.Bill.data[0]?.totalRefund,
});

export default connect(mapStateToProps)(DuePayment);
