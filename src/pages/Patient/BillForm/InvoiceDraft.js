import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import InvoiceTable from "./Components/InvoiceTable";
import InvoiceFooter from "./Components/InvoiceFooter";
import SubmitForm from "./Components/SubmitForm";
import { connect, useDispatch, useSelector } from "react-redux";
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
  const remainingAdvance = useSelector((state) => state.Bill.calculatedAdvance);
  console.log("remainingAdvance", remainingAdvance);

  const totalAdvance = remainingAdvance || 0;
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
  const [whileEditAvailablePrices, setWhileEditAvailablePrices] = useState([]);

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
      const finalPayload = {
        ...values,
        invoiceList: invoiceList,
      };

      if (editData) {
        dispatch(
          updateDraftInvoice({
            id: editDraftData._id,
            billId: editData._id,
            ...finalPayload,
          }),
        );
      } else {
        dispatch(
          addDraftInvoice({
            ...finalPayload,
            shouldPrintAfterSave,
          }),
        );
      }

      dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
      validation.resetForm();
    },
  });

  useEffect(() => {
    let tCost = 0;
    let tDiscount = 0;
    let tTax = 0;

    (invoiceList || []).forEach((item) => {
      const totalValue =
        item.unit && item.cost ? Number(item.unit) * Number(item.cost) : 0;

      let discount = 0;

      if (item.discount) {
        discount =
          item.discountType === "%"
            ? (Number(item.discount) / 100) * totalValue
            : Number(item.discount);
      }

      const tax = item.tax ? (Number(item.tax) / 100) * totalValue : 0;

      tCost += totalValue;
      tDiscount += discount < totalValue ? discount : 0;
      tTax += tax;
    });

    const gTotal = tCost - tDiscount + tTax;

    const wDiscount =
      wholeDiscount.unit === "%"
        ? (Number(wholeDiscount.value) / 100) * gTotal
        : Number(wholeDiscount.value || 0);

    const payable = gTotal >= wDiscount ? gTotal - wDiscount : gTotal;

  const advance = totalAdvance;

    let calculatedRefund = 0;

    if (invoiceType === "REFUND") {
      calculatedRefund = advance > payable ? advance - payable : 0;
    }
    setTotalCost(tCost);
    setTotalDiscount(tDiscount + wDiscount);
    setTotalTax(tTax);
    setGrandTotal(gTotal);
    setTotalPayable(payable);
    setRefund(calculatedRefund);
  }, [invoiceList, wholeDiscount, invoiceType, totalAdvance]);

  console.log("editDraftData from draft", editDraftData);
  

  useEffect(() => {
    if (editDraftData) {
      console.log("Draft Effect Triggered");

      const invoice =
        editDraftData.type === OPD
          ? editDraftData.receiptInvoice
          : editDraftData.invoice;
      console.log("invoice from draft", invoice);

      console.log("Invoice Object:", invoice);
      console.log("InvoiceList from Draft:", invoice?.invoiceList);

      const sendingArray = invoice.invoiceList || [];
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
          fromDraft: true,
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
      // setTotalAdvance(invoice?.currentAdvance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDraftData]);

  console.log("totalAdvance before useEffect", totalAdvance);

  // useEffect(() => {
  //   if (ttlAdvance && !editDraftData) setTotalAdvance(ttlAdvance);
  //   console.log("totalAdvance after useEffect", totalAdvance);
  // }, [editDraftData, ttlAdvance]);

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
            // discount: 0,
            // discountType: "₹",
          },
        ];
      });
    }
  };

  console.log("editDraftData from Redux:", editDraftData);
  console.log("Total Refund:", refund);

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
            type={"draft"}
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
            isDraft={"draft"}
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