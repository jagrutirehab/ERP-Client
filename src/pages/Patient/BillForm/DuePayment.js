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
  const [wholeDiscount, setWholeDiscount] = useState({
    unit: "₹",
    value: 0,
  });
  const [totalPayable, setTotalPayable] = useState(0);
  const [refund, setRefund] = useState(0);
  const [invoiceType, setInvoiceType] = useState(
    editBillData ? editBillData.bill : INVOICE
  );
  const [paymentModes, setPaymentModes] = useState([{ type: CASH }]);
  const [categories, setCategories] = useState([]);

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
      invoiceList: Yup.array().of(
        Yup.object({
          unitOfMeasurement: Yup.string().required(
            "Unit of measurement is required"
          ),
        })
      ),
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
          }
        ),
      }),
      bill: Yup.string().required("Bill type required!"),
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
          })
        ).unwrap();
        dispatch(setBillingStatus({ patientId: patient._id, billingStatus: response.billingStatus }));
      } else {
       const response = await dispatch(
          addInvoice({
            ...values,
            appointment: appointment?._id,
            paymentModes,
            shouldPrintAfterSave,
          })
        ).unwrap();
        dispatch(setBillingStatus({ patientId: patient._id, billingStatus: response.billingStatus }));
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
              (item) => item.bill === "INVOICE" && item.type === "IPD"
            );

            // Step 2: sort by createdAt (newest first)
            invoices.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            // Step 3: pick latest
            const latestInvoice = invoices[0];

            setInvoiceList(latestInvoice?.invoice?.invoiceList);
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
        //only add discount to total discount if less than item total cost
        let discount = 0;
        let totalValue =
          item.unit && item.cost
            ? parseFloat(item.unit) * parseFloat(item.cost)
            : 0;

        if (item.discount) {
          discount =
            item.discountUnit === "%"
              ? parseFloat((parseInt(item.discount) / 100) * totalValue)
              : parseInt(item.discount);
        }
        const tax = () => (parseInt(item.tax) / 100) * totalValue;
        tCost += totalValue;
        tDiscount += discount < totalValue ? discount : 0;
        tTax += item.tax ? tax() : 0;
      });

      const wDiscount =
        wholeDiscount.unit === "%"
          ? (parseFloat(wholeDiscount.value) / 100) * totalCost
          : parseFloat(wholeDiscount.value);
      let calcPaybel =
        grandTotal >= wDiscount ? grandTotal - wDiscount : grandTotal;

      // setTotalPayable(calcPaybel);

      gTotal = tCost - tDiscount + tTax;

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
      setTotalDiscount(wDiscount);
      setTotalTax(tTax);
      setGrandTotal(gTotal);
      setTotalPayable(calcPaybel);
      setRefund(refund);
      validation.setFieldValue(
        "paymentModes",
        paymentModes?.reduce(
          (sum, val) => parseInt(sum) + parseInt(val.amount),
          0
        )
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    totalCost,
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
      setInvoiceList(invoice.invoiceList);
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
        paymentModes.reduce(
          (sum, val) => parseInt(sum) + parseInt(val.amount),
          0
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editBillData]);

  const addInvoiceItem = (item, data) => {
    if (!item) return;

    const invoiceItems = Array.isArray(data) ? data : [];

    const checkItem = invoiceItems.find((currentItem) => {
      const slotName = currentItem?.slot?.name;
      const itemName = item?.name || item;
      return slotName === itemName;
    });

    if (!checkItem) {
      setInvoiceList((prevValue) => {
        const prevArray = Array.isArray(prevValue) ? prevValue : [];
        return [
          ...prevArray,
          {
            slot: item.name ? item.name : item,
            category: item.category ? item.category : "",
            unit: parseInt(item.unit) || 0,
            cost: parseInt(item.cost) || 0,
            unitOfMeasurement: item.unitOfMeasurement || "",
            comments: "",
          },
        ];
      });
    }
  };

  return (
    <React.Fragment>
      <div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            // toggle();
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
          />
          <InvoiceTable
            invoiceList={invoiceList}
            setInvoiceList={setInvoiceList}
            {...rest}
          />
          {validation.touched.invoiceList && validation.errors.invoiceList ? (
            <>
              {validation.errors.invoiceList.map((error, index) => (
                <FormFeedback type="invalid" className="d-block">
                  {error.unitOfMeasurement}
                </FormFeedback>
              ))}
            </>
          ) : null}
          <InvoiceFooter
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
            // OPD
            paymentModes={paymentModes}
            setPaymentModes={setPaymentModes}
            // OPD
            {...rest}
          />
          {/* <SubmitForm {...rest} /> */}
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
