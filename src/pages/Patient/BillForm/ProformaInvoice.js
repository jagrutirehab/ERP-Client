import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import InvoiceTable from "./Components/InvoiceTable";
import InvoiceFooter from "./Components/InvoiceFooter";
import SubmitForm from "./Components/SubmitForm";
import { connect, useDispatch } from "react-redux";
import {
  addInvoice,
  createEditBill,
  updateInvoice,
  createProformaBill,
  addProformaInvoice
} from "../../../store/actions";
import { CASH, INVOICE, OPD } from "../../../Components/constants/patient";
import Inovice from "../Dropdowns/Inovice";
import { updateProformaInvoice } from "../../../store/features/bill/billSlice.js";

const ProformaInvoice = ({
  author,
  patient,
  center,
  billDate,
  editBillData,
  admission,
  invoiceProcedures,
  ttlAdvance = 0,
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
    editBillData ? editBillData.bill : INVOICE
  );
  const [paymentModes, setPaymentModes] = useState([{ type: CASH }]);
  const [categories, setCategories] = useState([]);

  console.log(patient, "patient");

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
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
      // invoiceList: Yup.array().length(1, 'Please add atleast 1 Procedure'),
      // totalCost: Yup.number().test(
      //   "total-cost",
      //   "Total cost in required",
      //   function (value) {
      //     const bill = this.parent.bill;
      //     if (!value && bill === INVOICE) {
      //       return this.createError({
      //         message: "Total cost is required",
      //       });
      //     }
      //     return true;
      //   }
      // ),
      // grandTotal: Yup.number().test(
      //   "grand-total",
      //   "Grand total in required",
      //   function (value) {
      //     const bill = this.parent.bill;
      //     if (!value && bill === INVOICE) {
      //       return this.createError({
      //         message: "Grand total is required",
      //       });
      //     }
      //     return true;
      //   }
      // ),
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
    onSubmit: (values) => {
      // if (editData) {
      //   dispatch(
      //     addProformaInvoice({
      //       id: editBillData._id,
      //       billId: editData._id,
      //       appointment: appointment?._id,
      //       shouldPrintAfterSave,
      //       ...values,
      //       paymentModes,
      //     })
      //   );
      // } else {

      // }

      if (editData) {
        dispatch(
          updateProformaInvoice({
            id: editBillData._id,
            billId: editData._id,
            appointment: appointment?._id,
            shouldPrintAfterSave,
            ...values,
            paymentModes,
          })
        );
      } else {
        dispatch(
          addProformaInvoice({
            ...values,
            appointment: appointment?._id,
            paymentModes,
            shouldPrintAfterSave,
          })
        );
      }

      // dispatch(
      //   addProformaInvoice({
      //     ...values,
      //     appointment: appointment?._id,
      //     paymentModes,
      //     shouldPrintAfterSave,
      //   })
      // );
      dispatch(createProformaBill({ data: null, bill: null, isOpen: false }));
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
          editBillData.invoice?.currentAdvance > gTotal
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

  useEffect(() => {
    if (ttlAdvance && !editBillData) setTotalAdvance(ttlAdvance);
  }, [editBillData, ttlAdvance]);

  const addInvoiceItem = (item, data) => {
    if (!item) return;

    const checkItem = data.find((_) => _.slot?.name === (item?.name || item));

    if (!checkItem) {
      setInvoiceList((prevValue) => {
        return [
          ...prevValue,
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
          <SubmitForm {...rest} />
        </Form>
      </div>
    </React.Fragment>
  );
};

ProformaInvoice.propTypes = {
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
  billDate: state.Bill.billDate,
  editBillData: state.Bill.billForm.data,
  appointment: state.Bill.billForm.appointment,
  shouldPrintAfterSave: state.Bill.billForm.shouldPrintAfterSave,
  admission: state.Bill.billForm.admission,
  invoiceProcedures: state.Setting.invoiceProcedures,
  ttlAdvance: state.Bill.totalAdvance,
  // totalAdvancePayment: state.Bill.totalAdvancePayment,
  // totalInvoicePayment: state.Bill.totalInvoicePayment,
  totalRefund: state.Bill.data[0]?.totalRefund,
});

export default connect(mapStateToProps)(ProformaInvoice);

// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Button, Form, FormFeedback } from "reactstrap";

// // Formik Validation
// import * as Yup from "yup";
// import { useFormik } from "formik";

// import InvoiceTable from "./Components/InvoiceTable";
// import InvoiceFooter from "./Components/InvoiceFooter";
// import SubmitForm from "./Components/SubmitForm";
// import { connect, useDispatch } from "react-redux";
// import {
//   addDraftInvoice,
//   addInvoice,
//   createEditBill,
//   updateInvoice,
// } from "../../../store/actions";
// import { CASH, INVOICE, OPD } from "../../../Components/constants/patient";
// import Inovice from "../Dropdowns/Inovice";

// const proformaInvoice = ({
//   author,
//   patient,
//   center,
//   billDate,
//   editBillData,
//   admission,
//   invoiceProcedures,
//   ttlAdvance = 0,
//   totalDeposit,
//   appointment,
//   type,
//   shouldPrintAfterSave,
//   ...rest
// }) => {
//   const dispatch = useDispatch();

//   const editData = editBillData
//     ? type === OPD
//       ? editBillData.receiptInvoice
//       : editBillData.invoice
//     : null;

//   const [totalAdvance, setTotalAdvance] = useState(ttlAdvance);
//   const [invoiceList, setInvoiceList] = useState([]);
//   //all total values
//   const [totalCost, setTotalCost] = useState(0);
//   const [totalDiscount, setTotalDiscount] = useState(0);
//   const [totalTax, setTotalTax] = useState(0);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [wholeDiscount, setWholeDiscount] = useState({
//     unit: "₹",
//     value: 0,
//   });
//   // const [fromDeposit, setFromDeposit] = useState(0);
//   const [totalPayable, setTotalPayable] = useState(0);
//   const [refund, setRefund] = useState(0);
//   const [invoiceType, setInvoiceType] = useState(
//     editBillData ? editBillData.bill : INVOICE
//   );
//   const [paymentModes, setPaymentModes] = useState([{ type: CASH }]);
//   const [categories, setCategories] = useState([]);

//   const validation = useFormik({
//     // enableReinitialize : use this flag when initial values needs to be changed
//     enableReinitialize: true,
//     initialValues: {
//       author: author?._id,
//       patient: patient?._id,
//       center: center ? center : patient?.center?._id,
//       addmission: admission || patient?.addmission?._id,
//       invoiceList: invoiceList,
//       totalCost: totalCost,
//       totalDiscount: totalDiscount,
//       // fromDeposit,
//       grandTotal: grandTotal,
//       payable: totalPayable,
//       paymentModes: 0,
//       refund,
//       date: billDate,
//       type,
//       bill: invoiceType,
//     },
//     validationSchema: Yup.object({
//       // invoiceList: Yup.array().length(1, 'Please add atleast 1 Procedure'),
//       // totalCost: Yup.number().test(
//       //   "total-cost",
//       //   "Total cost in required",
//       //   function (value) {
//       //     const bill = this.parent.bill;
//       //     if (!value && bill === INVOICE) {
//       //       return this.createError({
//       //         message: "Total cost is required",
//       //       });
//       //     }
//       //     return true;
//       //   }
//       // ),
//       // grandTotal: Yup.number().test(
//       //   "grand-total",
//       //   "Grand total in required",
//       //   function (value) {
//       //     const bill = this.parent.bill;
//       //     if (!value && bill === INVOICE) {
//       //       return this.createError({
//       //         message: "Grand total is required",
//       //       });
//       //     }
//       //     return true;
//       //   }
//       // ),
//       // fromDeposit: Yup.number()
//       //   .required("fromDeposit is required")
//       //   .min(0, "fromDeposit must be at least 0")
//       //   .test(
//       //     "fromDeposit-vs-totalDeposit",
//       //     "fromDeposit must be less than or equal to totalDeposit",
//       //     function (value) {
//       //       console.log(value, "value -----", totalDeposit);

//       //       return value <= totalDeposit;
//       //     }
//       //   ),
//       invoiceList: Yup.array().of(
//         Yup.object({
//           unitOfMeasurement: Yup.string().required(
//             "Unit of measurement is required"
//           ),
//         })
//       ),
//       ...(type === OPD && {
//         paymentModes: Yup.number().test(
//           "paymentModes",
//           "Payments should match total payable",
//           function (value) {
//             const payable = this.parent.payable;

//             if (value !== payable) {
//               return this.createError({
//                 message: "Payments should match total payable",
//               });
//             }
//             return true;
//           }
//         ),
//       }),
//       bill: Yup.string().required("Bill type required!"),
//     }),
//     onSubmit: (values) => {
//       //validations
//       // if (totalDiscount > totalCost) return;

//       console.log({ values }, "values");

//       if (editData) {
//         dispatch(
//           updateInvoice({
//             id: editBillData._id,
//             billId: editData._id,
//             appointment: appointment?._id,
//             shouldPrintAfterSave,
//             ...values,
//             paymentModes,
//           })
//         );
//       } else {
//         dispatch(
//           addInvoice({
//             ...values,
//             appointment: appointment?._id,
//             paymentModes,
//             shouldPrintAfterSave,
//           })
//         );
//       }
//       dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
//       validation.resetForm();
//     },
//   });

//   useEffect(() => {
//     (() => {
//       let tCost = 0;
//       // let tDiscount = 0;
//       let gTotal = 0;
//       (invoiceList || []).forEach((item) => {
//         //only add discount to total discount if less than item total cost
//         // let discount = 0;
//         let totalValue =
//           item.unit && item.cost
//             ? parseFloat(item.unit) * parseFloat(item.cost)
//             : 0;

//         // if (item.discount) {
//         //   discount =
//         //     item.discountUnit === "%"
//         //       ? parseFloat((parseInt(item.discount) / 100) * totalValue)
//         //       : parseInt(item.discount);
//         // }
//         tCost += totalValue;
//         // tDiscount += discount < totalValue ? discount : 0;
//       });

//       // STEPS
//       // 1: Get total cost
//       // 2: Subtract discount from total cost
//       // 3: Subtract advance amount from step 2 amount
//       // 4: Get grand total
//       // 5: Subtract desposit from grand total
//       // 6: Get payable

//       const wDiscount =
//         wholeDiscount.unit === "%"
//           ? (parseFloat(wholeDiscount.value) / 100) * totalCost
//           : parseFloat(wholeDiscount.value);

//       // gTotal = tCost - tDiscount;
//       // gTotal = tCost >= wDiscount ? tCost - wDiscount : tCost;

//       // let calcPayable =
//       //   grandTotal >= wDiscount ? grandTotal - wDiscount : grandTotal;
//       const advance = editBillData
//         ? editBillData?.invoice?.currentAdvance
//         : totalAdvance;

//       gTotal = tCost >= wDiscount ? tCost - wDiscount : tCost;
//       // gTotal = advance >= gTotal ? 0 : gTotal - advance;

//       let refund = 0;
//       if (invoiceType === "REFUND" && editBillData?.invoice?.refund) {
//         refund =
//           editBillData.invoice.currentAdvance > gTotal
//             ? editBillData.invoice?.currentAdvance - gTotal
//             : 0;
//       } else if (invoiceType === "REFUND") {
//         // refund = gTotal > advance ? 0 : advance - gTotal;
//         refund = gTotal > advance ? 0 : advance - gTotal;
//       }

//       // gTotal = advance >= gTotal ? 0 : gTotal - advance;
//       // let refund = 0;
//       // if (invoiceType === "REFUND" && editBillData?.invoice?.refund) {
//       //   refund =
//       //     editBillData.invoice.currentAdvance > gTotal
//       //       ? editBillData.invoice?.currentAdvance + (wDiscount || 0) - gTotal
//       //       : 0;
//       // } else if (invoiceType === "REFUND") {
//       //   refund = gTotal > advance ? 0 : advance + (wDiscount || 0) - gTotal;
//       // }

//       // let calcPayable =
//       //   fromDeposit > calcPayable ? 0 : calcPayable - fromDeposit;
//       // let calcPayable = fromDeposit > gTotal ? 0 : gTotal - fromDeposit;
//       let calcPayable = advance > gTotal ? 0 : gTotal - advance;

//       setTotalCost(tCost);
//       setTotalDiscount(wDiscount);
//       setGrandTotal(gTotal);
//       setTotalPayable(calcPayable);
//       // setFromDeposit()
//       setRefund(refund);
//       validation.setFieldValue(
//         "paymentModes",
//         paymentModes?.reduce(
//           (sum, val) => parseInt(sum) + parseInt(val.amount),
//           0
//         )
//       );
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     totalCost,
//     totalDiscount,
//     totalTax,
//     grandTotal,
//     wholeDiscount,
//     totalPayable,
//     // fromDeposit,
//     invoiceList,
//     invoiceType,
//     totalAdvance,
//     paymentModes,
//   ]);

//   useEffect(() => {
//     if (editBillData) {
//       const invoice =
//         editBillData.type === OPD
//           ? editBillData.receiptInvoice
//           : editBillData.invoice;
//       setInvoiceList(invoice.invoiceList);
//       setGrandTotal(invoice.grandTotal);
//       setPaymentModes(invoice.paymentModes);
//       setWholeDiscount((prevValue) => ({
//         ...prevValue,
//         value: invoice.totalDiscount,
//       }));
//       // setFromDeposit(invoice.fromDeposit);
//       setTotalPayable(invoice.payable);
//       setTotalAdvance(invoice?.currentAdvance);
//       validation.setFieldValue(
//         "paymentModes",
//         paymentModes.reduce(
//           (sum, val) => parseInt(sum) + parseInt(val.amount),
//           0
//         )
//       );
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [editBillData]);

//   useEffect(() => {
//     if (ttlAdvance && !editBillData) setTotalAdvance(ttlAdvance);
//   }, [editBillData, ttlAdvance]);

//   const addInvoiceItem = (item, data) => {
//     if (!item) return;

//     console.log(invoiceList, "list");
//     console.log(item, "item");

//     const checkItem = data.find((_) => _.slot?.name === (item?.name || item));
//     const check2 = invoiceList.find(
//       (_) => _.slot?.name === (item.name || item)
//     );

//     if (!checkItem && !check2) {
//       setInvoiceList((prevValue) => {
//         return [
//           ...prevValue,
//           {
//             slot: item.name ? item.name : item,
//             category: item.category ? item.category : "",
//             unit: parseInt(item.unit) || 0,
//             cost: parseInt(item.cost) || 0,
//             unitOfMeasurement: item.unitOfMeasurement || "",
//             comments: "",
//           },
//         ];
//       });
//     }
//   };

//   return (
//     <React.Fragment>
//       <div>
//         <Form
//           onSubmit={(e) => {
//             e.preventDefault();
//             validation.handleSubmit();
//             // toggle();
//             return false;
//           }}
//           className="needs-validation"
//           action="#"
//         >
//           <Inovice
//             data={invoiceList}
//             dataList={invoiceProcedures}
//             fieldName={"name"}
//             addItem={addInvoiceItem}
//             categories={categories}
//             setCategories={setCategories}
//           />
//           <InvoiceTable
//             invoiceList={invoiceList}
//             setInvoiceList={setInvoiceList}
//             {...rest}
//           />
//           {validation.touched.invoiceList && validation.errors.invoiceList ? (
//             <>
//               {validation.errors.invoiceList.map((error, index) => (
//                 <FormFeedback type="invalid" className="d-block">
//                   {error.unitOfMeasurement}
//                 </FormFeedback>
//               ))}
//             </>
//           ) : null}
//           <InvoiceFooter
//             totalCost={totalCost}
//             totalDiscount={totalDiscount}
//             grandTotal={grandTotal}
//             advance={
//               editBillData
//                 ? editBillData?.invoice?.currentAdvance
//                 : totalAdvance
//             }
//             wholeDiscount={wholeDiscount}
//             setWholeDiscount={setWholeDiscount}
//             // fromDeposit={fromDeposit}
//             // setFromDeposit={setFromDeposit}
//             payable={totalPayable}
//             refund={refund}
//             totalAdvance={totalAdvance}
//             validation={validation}
//             setInvoiceType={setInvoiceType}
//             type={type}
//             // OPD
//             paymentModes={paymentModes}
//             setPaymentModes={setPaymentModes}
//             // OPD
//             {...rest}
//           />
//           <SubmitForm {...rest} />
//         </Form>
//       </div>
//     </React.Fragment>
//   );
// };

// proformaInvoice.propTypes = {
//   author: PropTypes.object.isRequired,
//   patient: PropTypes.object.isRequired,
//   billDate: PropTypes.any.isRequired,
//   editBillData: PropTypes.object,
//   appointment: PropTypes.object,
// };

// const mapStateToProps = (state) => ({
//   author: state.User.user,
//   patient: state.Bill.billForm?.patient,
//   center: state.Bill.billForm?.center,
//   billDate: state.Bill.billDate,
//   editBillData: state.Bill.billForm.data,
//   appointment: state.Bill.billForm.appointment,
//   shouldPrintAfterSave: state.Bill.billForm.shouldPrintAfterSave,
//   admission: state.Bill.billForm.admission,
//   invoiceProcedures: state.Setting.invoiceProcedures,
//   ttlAdvance: state.Bill.totalAdvance,
//   totalDeposit: state.Bill.totalDeposit,
//   // totalAdvancePayment: state.Bill.totalAdvancePayment,
//   // totalInvoicePayment: state.Bill.totalInvoicePayment,
//   totalRefund: state.Bill.data[0]?.totalRefund,
// });

// export default connect(mapStateToProps)(proformaInvoice);
