import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, FormFeedback } from "reactstrap";
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
import { getProceduresByCenterid } from "../../../helpers/backend_helper";

const normalizeInvoiceList = (list, isEdit = false) => {
  return list.map((item) => {
    if (isEdit) return item;

    if (
      !Array.isArray(item.availablePrices) ||
      item.availablePrices.length === 0
    ) {
      return item;
    }

    const matched = item.availablePrices.find(
      (p) =>
        p &&
        p.unit &&
        String(p.unit).toLowerCase() ===
          String(item.unitOfMeasurement || "").toLowerCase(),
    );

    if (matched) {
      return {
        ...item,
        cost: Number(matched.price),
      };
    }

    return item;
  });
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
  ...rest
}) => {
  const dispatch = useDispatch();

  console.log("Data : ", {
    patient,
    center,
  });

  const editMode = Boolean(editBillData);
  console.log("edit mode", editMode);

  const editData = editBillData
    ? type === OPD
      ? editBillData.receiptInvoice
      : editBillData.invoice
    : null;

  const advpayment = useSelector((state) => state.Bill.calculatedAdvance);

  const [totalAdvance, setTotalAdvance] = useState(advpayment);
  const [invoiceList, setInvoiceList] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [prefilledUpdated, setprefilledUpdated] = useState();
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
  const [itemsDiscount, setItemsDiscount] = useState(0);
  const [afterDiscount, setAfterDiscount] = useState(0);

  const centerId =
    typeof center === "string" ? center : center?._id || patient?.center?._id;

  const fetchCarryForwardUpdates = async () => {
    if (!centerId) return;
    if (!invoiceList?.length) return;

    const params = {
      centerId,
      proName: invoiceList[0]?.slot,
    };

    console.log("FINAL PARAMS SENT TO AXIOS =>", params);

    const response = await getProceduresByCenterid(params);
    setprefilledUpdated(response?.data);
    console.log("API RESPONSE =>", response);
  };

  useEffect(() => {
    if (!centerId) return;
    if (!invoiceList?.length) return;

    fetchCarryForwardUpdates();
  }, [invoiceList?.[0]?.slot, centerId]);

  useEffect(() => {
    if (!prefilledUpdated) return;
    if (!invoiceList.length) return;

    setInvoiceList((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              availablePrices: prefilledUpdated?.[0]?.center?.[0]?.prices || [],
            }
          : item,
      ),
    );
  }, [prefilledUpdated]);

  useEffect(() => {
    if (!invoiceList.length) return;
    if (editMode) return;

    setInvoiceList((prev) => normalizeInvoiceList(prev, false));
  }, [invoiceList.map((i) => i.availablePrices?.length).join(",")]);

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
    },
    validationSchema: Yup.object({
      // invoiceList: Yup.array().of(
      //   Yup.object({
      //     unitOfMeasurement: Yup.string().required(
      //       "Unit of measurement is required",
      //     ),
      //   }),
      // ),
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
    }),
    onSubmit: async (values) => {
      console.log("values", values);

      const updatedInvoiceList = values.invoiceList.map((item) => ({
        ...item,
        originalCost: item.originalCost ?? item.cost ?? 0,
        cost: Number(item.afterDiscount ?? item.finalCost ?? item.cost),
      }));
      // const finalTotalDiscount =
      //   Number(itemsDiscount || 0) + Number(values.totalDiscount || 0);

      if (editData) {
        const response = await dispatch(
          updateInvoice({
            id: editBillData._id,
            billId: editData._id,
            appointment: appointment?._id,
            shouldPrintAfterSave,
            ...values,
            invoiceList: updatedInvoiceList,
            totalDiscount,
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
            invoiceList: updatedInvoiceList,
            totalDiscount,
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
            console.log("invoice List", latestInvoice?.invoice?.invoiceList[0]);
            const initialData = latestInvoice?.invoice?.invoiceList[0];
            console.log("initial", initialData);
            console.log("prefilledUpdated", prefilledUpdated);

            setInvoiceList(
              normalizeInvoiceList(
                [
                  {
                    slot: initialData?.slot,
                    category:
                      typeof initialData.category === "object"
                        ? initialData.category.name
                        : initialData.category,
                    unit: parseInt(initialData.unit) || 1,
                    cost: initialData?.cost,
                    unitOfMeasurement: initialData?.unitOfMeasurement,
                    comments: "",
                    availablePrices:
                      prefilledUpdated?.[0]?.center?.[0]?.prices || [],
                    discountType: "₹",
                    discountValue: 0,
                  },
                ],
                editMode,
              ),
            );
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
    let tCost = 0;
    let rowItemsDiscount = 0;
    let tTax = 0;

    // 1. Calculate Row-level totals
    (invoiceList || []).forEach((item) => {
      const qty = parseFloat(item.unit) || 0;
      const cost = parseFloat(item.cost) || 0;
      const totalValue = qty * cost;

      let discount = 0;
      const dValue = parseFloat(item.discountValue) || 0;
      const dType = item.discountType || "₹";

      if (dValue > 0) {
        discount = dType === "%" ? (dValue / 100) * totalValue : dValue;
      }

      tCost += totalValue;
      rowItemsDiscount += discount < totalValue ? discount : 0;

      if (item.tax) {
        tTax += (parseFloat(item.tax) / 100) * totalValue;
      }
    });

    // 2. Apply Whole/Global Discount
    const baseAfterItems = Math.max(tCost - rowItemsDiscount, 0);
    const wDiscountValue = parseFloat(wholeDiscount.value) || 0;
    const wDiscountCalc =
      wholeDiscount.unit === "%"
        ? (wDiscountValue / 100) * baseAfterItems
        : wDiscountValue;

    const safeWholeDiscount = Math.min(wDiscountCalc, baseAfterItems);
    const finalTotalDiscount = rowItemsDiscount + safeWholeDiscount;

    // 3. Calculate Totals
    const calculatedGrandTotal = tCost - rowItemsDiscount + tTax;
    const calculatedPayable = Math.max(
      calculatedGrandTotal - safeWholeDiscount,
      0,
    );

    // 4. Calculate Refund
    const currentAdvance = editBillData
      ? editBillData?.invoice?.currentAdvance || 0
      : totalAdvance || 0;

    let calculatedRefund = 0;
    if (invoiceType === "REFUND") {
      // If advance is 500 and payable is 400, refund is 100
      calculatedRefund =
        currentAdvance > calculatedPayable
          ? currentAdvance - calculatedPayable
          : 0;
    }

    // 5. Batch State Updates
    setTotalCost(tCost);
    setItemsDiscount(rowItemsDiscount);
    setTotalDiscount(finalTotalDiscount);
    setTotalTax(tTax);
    setGrandTotal(calculatedGrandTotal);
    setTotalPayable(calculatedPayable);
    setRefund(calculatedRefund);

    // Update Formik
    validation.setFieldValue("payable", calculatedPayable);
    validation.setFieldValue("totalDiscount", finalTotalDiscount);
    validation.setFieldValue("refund", calculatedRefund);

    const paymentSum = Array.isArray(paymentModes)
      ? paymentModes.reduce((sum, val) => sum + Number(val?.amount || 0), 0)
      : 0;
    validation.setFieldValue("paymentModes", paymentSum);
  }, [
    invoiceList,
    wholeDiscount,
    invoiceType,
    totalAdvance,
    paymentModes,
    editBillData,
  ]);

  useEffect(() => {
    if (editBillData) {
      const invoice =
        editBillData.type === OPD
          ? editBillData.receiptInvoice
          : editBillData.invoice;
      setInvoiceList(
        invoice.invoiceList.map((item, idx) => ({
          ...item,
          availablePrices:
            prefilledUpdated?.[idx]?.center?.[0]?.prices ||
            item.availablePrices ||
            [],
          isInitialized: true,
        })),
      );
      setGrandTotal(invoice.grandTotal);
      setPaymentModes(invoice.paymentModes);
      setWholeDiscount((prevValue) => ({
        ...prevValue,
        value: invoice.totalDiscount,
      }));
      setTotalPayable(invoice.payable);
      setTotalAdvance(invoice?.currentAdvance);
      validation.setFieldValue(
        "paymentModes",
        Array.isArray(paymentModes)
          ? paymentModes.reduce((sum, val) => sum + Number(val?.amount || 0), 0)
          : 0,
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
            originalCost: exactCost,
            unitOfMeasurement: dynamicUOM,
            comments: "",
            availablePrices: centerMatch?.prices || [],
            isInitialized: false,
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
          originalCost: item.originalCost ?? priceData.price,
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

  useEffect(() => {
    let tDiscount = 0;
    let aDiscount = 0;

    invoiceList.forEach((item) => {
      const qty = Number(item.unit || 1);
      const cost = Number(item.cost || 0);
      const rowTotal = qty * cost;

      let discount = 0;

      const discountValue = Number(item.discountValue || 0);
      const discountType = item.discountType || "₹";

      if (discountValue > 0) {
        discount =
          discountType === "%"
            ? (discountValue / 100) * rowTotal
            : discountValue;
      }

      tDiscount += discount;
    });

    setItemsDiscount(tDiscount);
    setAfterDiscount(aDiscount);
  }, [invoiceList]);

  console.log("aDiscount", afterDiscount);

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
          <Inovice
            data={invoiceList}
            dataList={invoiceProcedures}
            fieldName={"name"}
            addItem={addInvoiceItem}
            categories={categories}
            setCategories={setCategories}
            center={center || patient?.center}
          />
          <InvoiceTable
            invoiceList={invoiceList}
            setInvoiceList={setInvoiceList}
            onUOMChange={handleUOMChange}
            {...rest}
            center={patient?.center}
            isEdit={Boolean(editBillData)}
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
            afterDiscount={afterDiscount}
            itemsDiscount={itemsDiscount}
            totalCost={totalCost}
            totalDiscount={totalDiscount}
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
