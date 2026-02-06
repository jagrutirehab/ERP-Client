import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import InvoiceTable from "./Components/InvoiceTable";
import InvoiceFooter from "./Components/InvoiceFooter";
import SubmitForm from "./Components/SubmitForm";
import { connect, useDispatch } from "react-redux";
import {
  addDraftInvoice,
  createEditBill,
  updateDraftInvoice,
} from "../../../store/actions";
import {
  CASH,
  DRAFT_INVOICE,
  OPD,
} from "../../../Components/constants/patient";
import Inovice from "../Dropdowns/Inovice";

const InvoiceDraft = ({
  author,
  patient,
  center,
  billDate,
  editDraftData,
  invoiceProcedures,
  ttlAdvance = 0,
  appointment,
  type,
  shouldPrintAfterSave,
  ...rest
}) => {
  const dispatch = useDispatch();
  const editData = editDraftData ? editDraftData.invoice : null;

  const [totalAdvance, setTotalAdvance] = useState(ttlAdvance);
  const [invoiceList, setInvoiceList] = useState([]);
  //all total values
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
    editDraftData ? editDraftData.bill : DRAFT_INVOICE,
  );
  const [paymentModes, setPaymentModes] = useState([{ type: CASH }]);
  const [categories, setCategories] = useState([]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      author: author?._id,
      patient: patient?._id,
      center: center ? center : patient?.center?._id,
      invoiceList: invoiceList,
      totalCost: totalCost,
      totalDiscount: totalDiscount,
      grandTotal: grandTotal,
      payable: totalPayable,
      refund,
      date: billDate,
      type,
      bill: invoiceType,
    },
    validationSchema: Yup.object({
      bill: Yup.string().required("Bill type required!"),
    }),
    onSubmit: (values) => {
      if (editData) {
        dispatch(
          updateDraftInvoice({
            id: editDraftData._id,
            billId: editData._id,
            ...values,
          }),
        );
      } else {
        dispatch(
          addDraftInvoice({
            ...values,
            shouldPrintAfterSave,
          }),
        );
      }
      dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

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

      gTotal = tCost - tDiscount + tTax;

      const advance = editDraftData
        ? editDraftData?.invoice?.currentAdvance
        : totalAdvance;

      let refund = 0;
      if (invoiceType === "REFUND" && editDraftData?.invoice?.refund) {
        refund =
          editDraftData.invoice.currentAdvance > gTotal
            ? editDraftData.invoice?.currentAdvance + (wDiscount || 0) - gTotal
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
    if (editDraftData) {
      const invoice =
        editDraftData.type === OPD
          ? editDraftData.receiptInvoice
          : editDraftData.invoice;
      setInvoiceList(invoice.invoiceList);
      setGrandTotal(invoice.grandTotal);
      setPaymentModes(invoice.paymentModes);
      setWholeDiscount((prevValue) => ({
        ...prevValue,
        value: invoice.totalDiscount,
      }));
      setTotalPayable(invoice.payable);
      setTotalAdvance(invoice?.currentAdvance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDraftData]);

  useEffect(() => {
    if (ttlAdvance && !editDraftData) setTotalAdvance(ttlAdvance);
  }, [editDraftData, ttlAdvance]);

  const addInvoiceItem = (item, data) => {
    if (!item) return;

    const checkItem = data.find((_) => _.slot?.name === (item?.name || item));

    if (!checkItem) {
      console.log("item", item);
      const centerMatch = item?.center?.find(
        (d) =>
          String(d?.center?._id) === String(patient?.center?._id || center),
      );

      const defaultPriceObj =
        centerMatch?.prices && centerMatch.prices.length > 0
          ? centerMatch.prices[0]
          : null;

      const exactCost = defaultPriceObj ? defaultPriceObj.price : 0;
      const dynamicUOM =
        defaultPriceObj?.unit ||
        item?.center?.find((c) => c?.prices?.length)?.prices?.[0]?.unit ||
        undefined;

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
            unit: parseInt(item.unit) || 0,
            cost: exactCost,
            unitOfMeasurement: dynamicUOM,
            comments: "",
            availablePrices: centerMatch?.prices || [],
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
            {...rest}
          />
          <SubmitForm {...rest} />
        </Form>
      </div>
    </React.Fragment>
  );
};

InvoiceDraft.propTypes = {
  author: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  billDate: PropTypes.any.isRequired,
  editDraftData: PropTypes.object,
  appointment: PropTypes.object,
};

const mapStateToProps = (state) => ({
  author: state.User.user,
  patient: state.Bill.billForm?.patient,
  center: state.Bill.billForm?.center,
  billDate: state.Bill.billDate,
  editDraftData: state.Bill.billForm.data,
  appointment: state.Bill.billForm.appointment,
  shouldPrintAfterSave: state.Bill.billForm.shouldPrintAfterSave,
  invoiceProcedures: state.Setting.invoiceProcedures,
  ttlAdvance: state.Bill.totalAdvance,
  totalRefund: state.Bill.data[0]?.totalRefund,
});

export default connect(mapStateToProps)(InvoiceDraft);
