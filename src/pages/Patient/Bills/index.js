import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { connect, useDispatch } from "react-redux";
import Wrapper from "../Components/Wrapper";
import {
  ADVANCE_PAYMENT,
  DEPOSIT,
  INVOICE,
  OPD,
  REFUND,
} from "../../../Components/constants/patient";
import AdvancePayment from "./AdvancePayment";
import Invoice from "./Invoice";
import { DropdownItem, Row } from "reactstrap";
import {
  createEditBill,
  depositToAdvance,
  removeBill,
  setTotalAmount,
  togglePrint,
} from "../../../store/actions";
import DeleteModal from "../../../Components/Common/DeleteModal";
import RenderWhen from "../../../Components/Common/RenderWhen";
import Deposit from "./Deposit";
import { format } from "date-fns";

const Bills = ({
  addmissions,
  addmission,
  data,
  toggleDateModal,
  patient,
  user,
}) => {
  const dispatch = useDispatch();
  const [bill, setBill] = useState({
    bill: null,
    isOpen: false,
  });

  const [dpstToAdvance, setDepositToAdvance] = useState({
    deposit: null,
    isOpen: false,
  });

  const cancelDepositConversion = () => {
    setDepositToAdvance({
      deposit: null,
      isOpen: false,
    });
  };

  const proceedDepositConversion = () => {
    dispatch(
      depositToAdvance({
        depositId: dpstToAdvance.deposit?.deposit?._id,
        amount: dpstToAdvance.deposit?.deposit?.totalAmount,
        author: user?._id,
        patient: dpstToAdvance.deposit?.patient,
        center: dpstToAdvance.deposit?.center?._id,
        addmission: dpstToAdvance.deposit?.addmission,
        paymentModes: dpstToAdvance.deposit?.deposit?.paymentModes,
        // date: dpstToAdvance.deposit?.date,
      })
    );
    setDepositToAdvance({
      deposit: null,
      isOpen: false,
    });
  };

  const editBill = (bill) => {
    dispatch(createEditBill({ data: bill, bill: bill.bill, isOpen: false }));
    toggleDateModal();
  };

  // make new algo with capabilities of carry forward reserver advance & payable --------------------------------
  //---------------------
  let calcAdvance = 0; //holds calculated advance
  let adReserve = 0; //holds reserve advance // 5,000
  let previousPayable = 0; //holds arreras
  let totalDeposit = 0;
  let totalAdvance = 0;
  let totalPayable = 0;
  const newBills = (_.cloneDeep(data) || []).map((item, idx) => {
    if (item.bill === ADVANCE_PAYMENT) {
      calcAdvance += parseFloat(item.advancePayment?.totalAmount); //10000
      if (previousPayable && previousPayable > adReserve + calcAdvance) {
        //1000
        previousPayable -= adReserve + calcAdvance;
        item.advancePayment.calculatedPayable = previousPayable;
        calcAdvance = 0;
        adReserve = 0;
      } else {
        calcAdvance += adReserve - previousPayable;
        if (item.advancePayment) {
          item.advancePayment.calculatedAdvance = calcAdvance;
        }
        previousPayable = 0;
        adReserve = 0;
      }

      //totalAdvance
      totalAdvance += item.advancePayment.totalAmount;
    } else if (
      (item.bill === INVOICE || item.bill === REFUND) &&
      item.type !== OPD
    ) {
      if (adReserve > 0) {
        adReserve += calcAdvance; //30000
        //check for advance payment reserved or left
        if (adReserve > parseFloat(item.invoice?.payable)) {
          item.invoice.currentAdvance = adReserve;
          adReserve = adReserve - parseFloat(item.invoice?.payable); //change grandtotal to payNow
          item.invoice.calculatedAdvance = adReserve;
          item.invoice.calculatedPayable = 0;
        } else {
          item.invoice.currentAdvance = adReserve;
          // item.invoice.currentPayable = previousPayable;
          previousPayable = 0 + parseFloat(item.invoice?.payable) - adReserve; //change grandtotal to payNow
          item.invoice.calculatedPayable = previousPayable;
          adReserve = 0;
        }
        calcAdvance = 0;
      } else {
        // item.invoice.calculatedAdvance = calcAdvance;
        //set totalPreviousPayable to next invoice

        if (calcAdvance > parseFloat(item.invoice?.payable) + previousPayable) {
          item.invoice.currentAdvance = calcAdvance;
          //new addition add previousPayable
          adReserve =
            calcAdvance - (parseFloat(item.invoice?.payable) + previousPayable);
          item.invoice.calculatedAdvance = adReserve; // new addition set previousPayable to next invoice
          item.invoice.calculatedPayable = 0;
          previousPayable = 0;
        } else {
          if (item.invoice) {
            item.invoice.currentAdvance = calcAdvance;
            item.invoice.previousPayable = previousPayable;
            previousPayable += parseFloat(item.invoice?.payable) - calcAdvance;
            item.invoice.calculatedPayable = previousPayable;
          } // new addition set previousPayable to next invoice
        }
        calcAdvance = 0;
      }

      //totalPayable
      totalPayable += item.invoice?.payable || 0;
    }

    if (item.bill === DEPOSIT) totalDeposit += item.deposit.remainingAmount;

    if (item.bill === "REFUND" && calcAdvance === 0 && adReserve === 0) {
      item.invoice.refund = 0;
    } else if (
      item.bill === "REFUND" &&
      (calcAdvance || adReserve) > (item.invoice.calculatedPayable || 0)
    ) {
      const remainingAdvance =
        (calcAdvance || adReserve) - item.invoice.calculatedPayable;
      // item.invoice.refund =
      //   item.invoice?.refund < (calcAdvance || adReserve)
      //     ? remainingAdvance - item.invoice?.refund
      //     : remainingAdvance;
      if (item.invoice?.refund < (calcAdvance || adReserve)) {
        item.invoice.refund =
          remainingAdvance - (remainingAdvance - item.invoice?.refund);
        calcAdvance = remainingAdvance - item.invoice?.refund;
      } else {
        item.invoice.refund = remainingAdvance;
        calcAdvance = 0;
      }
      // item.invoice.currentAdvance = 0;
      adReserve = 0;
    }
    return item;
  });

  useEffect(() => {
    if (
      newBills?.length > 0 &&
      addmissions?.length > 0 &&
      addmissions[0]._id === addmission._id &&
      patient.addmissions?.includes(addmission?._id)
    ) {
      const bill = newBills[0];
      if (bill.bill === INVOICE) {
        dispatch(
          setTotalAmount({
            calculatedPayable: bill.invoice?.calculatedPayable,
            calculatedAdvance: bill.invoice?.calculatedAdvance,
            totalPayable,
            totalAdvance,
            totalDeposit,
          })
        );
      } else {
        dispatch(
          setTotalAmount({
            calculatedPayable: bill.advancePayment?.calculatedPayable ?? 0,
            calculatedAdvance: bill.advancePayment?.calculatedAdvance,
            totalPayable,
            totalAdvance,
            totalDeposit,
          })
        );
      }
    } else if (!patient.addmissions?.includes(addmission?.addmissionId))
      dispatch(setTotalAmount({ totalPayable: 0, totalAdvance: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, newBills, addmissions, addmission]);

  const cancelDelete = () => {
    setBill({
      bill: null,
      isOpen: false,
    });
  };

  const deleteBill = () => {
    dispatch(removeBill(bill.bill._id));
    setBill({
      bill: null,
      isOpen: false,
    });
  };

  const getBill = (bill) => {
    setBill({
      bill,
      isOpen: true,
    });
  };

  const printBill = (chart, patient) => {
    dispatch(
      togglePrint({ data: chart, modal: true, patient, admission: addmission })
    );
  };

  return (
    <React.Fragment>
      <div className="timeline-2">
        <div className="timeline-continue">
          <Row className="timeline-right">
            {(newBills || [])
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((bill) => (
                <Wrapper
                  key={bill._id}
                  item={bill}
                  name="Billing"
                  editItem={editBill}
                  deleteItem={getBill}
                  printItem={printBill}
                  extraOptions={(item) => (
                    <RenderWhen isTrue={item.bill === DEPOSIT}>
                      <DropdownItem
                        onClick={() =>
                          setDepositToAdvance({ deposit: item, isOpen: true })
                        }
                        href="#"
                      >
                        <i className="ri-exchange-dollar-line align-bottom text-muted me-2"></i>
                        Convert to Advance
                      </DropdownItem>
                    </RenderWhen>
                  )}
                  toggleDateModal={toggleDateModal}
                  disableEdit={
                    bill.bill === ADVANCE_PAYMENT &&
                    user?.email !== "rijutarafder000@gmail.com"
                      ? true
                      : false
                  }
                  itemId={`${bill?.id?.prefix}${bill?.id?.patientId}-${bill?.id?.value}`}
                  disableDelete={addmission?.dischargeDate ? true : false}
                >
                  <RenderWhen isTrue={bill.bill === ADVANCE_PAYMENT}>
                    <AdvancePayment data={bill?.advancePayment} />
                  </RenderWhen>
                  <RenderWhen isTrue={bill.bill === DEPOSIT}>
                    <Deposit data={bill?.deposit} />
                  </RenderWhen>
                  <RenderWhen
                    isTrue={bill.bill === INVOICE || bill.bill === REFUND}
                  >
                    <Invoice data={bill?.invoice} bill={bill} />
                  </RenderWhen>
                </Wrapper>
              ))}
          </Row>
        </div>
      </div>
      <DeleteModal
        onCloseClick={cancelDelete}
        onDeleteClick={deleteBill}
        show={bill.isOpen}
      />
      <DeleteModal
        onCloseClick={cancelDepositConversion}
        onDeleteClick={proceedDepositConversion}
        messsage={"Are you sure you want to convert Deposit to Advance"}
        buttonMessage={"Yes Proceed"}
        show={dpstToAdvance.isOpen}
      />
    </React.Fragment>
  );
};

Bills.propTypes = {
  data: PropTypes.array,
  toggleDateModal: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.User.user,
  addmissions: state.Bill.data,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(Bills);

// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import _ from "lodash";

// import { connect, useDispatch } from "react-redux";
// import Wrapper from "../Components/Wrapper";
// import {
//   ADVANCE_PAYMENT,
//   DEPOSIT,
//   INVOICE,
//   OPD,
//   REFUND,
// } from "../../../Components/constants/patient";
// import AdvancePayment from "./AdvancePayment";
// import Invoice from "./Invoice";
// import { DropdownItem, Row } from "reactstrap";
// import {
//   createEditBill,
//   depositToAdvance,
//   removeBill,
//   setTotalAmount,
//   togglePrint,
// } from "../../../store/actions";
// import DeleteModal from "../../../Components/Common/DeleteModal";
// import RenderWhen from "../../../Components/Common/RenderWhen";
// import Deposit from "./Deposit";

// const Bills = ({
//   addmissions,
//   addmission,
//   data,
//   toggleDateModal,
//   patient,
//   user,
// }) => {
//   const [bill, setBill] = useState({
//     bill: null,
//     isOpen: false,
//   });
//   const [dpstToAdvance, setDepositToAdvance] = useState({
//     deposit: null,
//     isOpen: false,
//   });

//   console.log(dpstToAdvance, "deposit to advance");

//   const cancelDepositConversion = () => {
//     setDepositToAdvance({
//       deposit: null,
//       isOpen: false,
//     });
//   };

//   // depositId,
//   // amount,
//   // advance
//   // author,
//   // patient,
//   // center,
//   // addmission,
//   // paymentModes,
//   // date,
//   // type,
//   const proceedDepositConversion = () => {
//     dispatch(
//       depositToAdvance({
//         depositId: dpstToAdvance.deposit?.deposit?._id,
//         amount: dpstToAdvance.deposit?.deposit?.totalAmount,
//         author: user?._id,
//         patient: dpstToAdvance.deposit?.patient,
//         center: dpstToAdvance.deposit?.center?._id,
//         addmission: dpstToAdvance.deposit?.addmission,
//         paymentModes: dpstToAdvance.deposit?.deposit?.paymentModes,
//         // date: dpstToAdvance.deposit?.date,
//       })
//     );
//     setDepositToAdvance({
//       deposit: null,
//       isOpen: false,
//     });
//   };

//   const dispatch = useDispatch();

//   const editBill = (bill) => {
//     dispatch(createEditBill({ data: bill, bill: bill.bill, isOpen: false }));
//     toggleDateModal();
//   };

//   // make new algo with capabilities of carry forward reserver advance & payable --------------------------------
//   //---------------------
//   let calcAdvance = 0; //holds calculated advance
//   let adReserve = 0; //holds reserve advance // 5,000
//   let previousPayable = 0; //holds arreras
//   let calcDeposit = 0; //hold deposits
//   const newBills = (_.cloneDeep(data) || []).map((item, idx) => {
//     if (item.bill === ADVANCE_PAYMENT) {
//       calcAdvance += parseFloat(item.advancePayment?.totalAmount); //10000
//       if (previousPayable && previousPayable > adReserve + calcAdvance) {
//         //1000
//         previousPayable -= adReserve + calcAdvance;
//         item.advancePayment.calculatedPayable = previousPayable;
//         calcAdvance = 0;
//         adReserve = 0;
//       } else {
//         calcAdvance += adReserve - previousPayable;
//         if (item.advancePayment) {
//           item.advancePayment.calculatedAdvance = calcAdvance;
//         }
//         previousPayable = 0;
//         adReserve = 0;
//       }
//     } else if (
//       (item.bill === INVOICE || item.bill === REFUND) &&
//       item.type !== OPD
//     ) {
//       if (adReserve > 0) {
//         adReserve += calcAdvance; //30000
//         //check for advance payment reserved or left
//         if (adReserve > parseFloat(item.invoice?.payable)) {
//           item.invoice.currentAdvance = adReserve;
//           adReserve = adReserve - parseFloat(item.invoice?.payable); //change grandtotal to payNow
//           item.invoice.calculatedAdvance = adReserve;
//           item.invoice.calculatedPayable = 0;
//         } else {
//           item.invoice.currentAdvance = adReserve;
//           // item.invoice.currentPayable = previousPayable;
//           previousPayable = 0 + parseFloat(item.invoice?.payable) - adReserve; //change grandtotal to payNow
//           item.invoice.calculatedPayable = previousPayable;
//           adReserve = 0;
//         }
//         calcAdvance = 0;
//       } else {
//         // item.invoice.calculatedAdvance = calcAdvance;
//         //set totalPreviousPayable to next invoice

//         if (calcAdvance > parseFloat(item.invoice?.payable) + previousPayable) {
//           item.invoice.currentAdvance = calcAdvance;
//           //new addition add previousPayable
//           adReserve =
//             calcAdvance - (parseFloat(item.invoice?.payable) + previousPayable);
//           item.invoice.calculatedAdvance = adReserve; // new addition set previousPayable to next invoice
//           item.invoice.calculatedPayable = 0;
//           previousPayable = 0;
//         } else {
//           if (item.invoice) {
//             item.invoice.currentAdvance = calcAdvance;
//             item.invoice.previousPayable = previousPayable;
//             previousPayable += parseFloat(item.invoice?.payable) - calcAdvance;
//             item.invoice.calculatedPayable = previousPayable;
//           } // new addition set previousPayable to next invoice
//         }
//         calcAdvance = 0;
//       }
//     } else if (item.bill === DEPOSIT) {
//       calcDeposit += item.deposit?.totalAmount;
//     }

//     if (item.bill === "REFUND" && calcAdvance === 0 && adReserve === 0) {
//       item.invoice.refund = 0;
//     } else if (
//       item.bill === "REFUND" &&
//       (calcAdvance || adReserve) > (item.invoice.calculatedPayable || 0)
//     ) {
//       const remainingAdvance =
//         (calcAdvance || adReserve) - item.invoice.calculatedPayable;
//       // item.invoice.refund =
//       //   item.invoice?.refund < (calcAdvance || adReserve)
//       //     ? remainingAdvance - item.invoice?.refund
//       //     : remainingAdvance;
//       if (item.invoice?.refund < (calcAdvance || adReserve)) {
//         item.invoice.refund =
//           remainingAdvance - (remainingAdvance - item.invoice?.refund);
//         calcAdvance = remainingAdvance - item.invoice?.refund;
//       } else {
//         item.invoice.refund = remainingAdvance;
//         calcAdvance = 0;
//       }
//       // item.invoice.currentAdvance = 0;
//       adReserve = 0;
//     }
//     return item;
//   });

//   useEffect(() => {
//     if (
//       newBills?.length > 0 &&
//       addmissions?.length > 0 &&
//       addmissions[0]._id === addmission._id &&
//       patient.addmissions?.includes(addmission?._id)
//     ) {
//       const bill = newBills[0];
//       if (bill.bill === INVOICE) {
//         dispatch(
//           setTotalAmount({
//             totalPayable: bill.invoice?.calculatedPayable,
//             totalAdvance: bill.invoice?.calculatedAdvance,
//             totalDeposit: calcDeposit,
//           })
//         );
//       } else {
//         dispatch(
//           setTotalAmount({
//             totalPayable: bill.advancePayment?.calculatedPayable ?? 0,
//             totalAdvance: bill.advancePayment?.calculatedAdvance,
//             totalDeposit: calcDeposit,
//           })
//         );
//       }
//     } else if (!patient.addmissions?.includes(addmission?.addmissionId))
//       dispatch(setTotalAmount({ totalPayable: 0, totalAdvance: 0 }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dispatch, newBills, addmissions, addmission]);

//   const cancelDelete = () => {
//     setBill({
//       bill: null,
//       isOpen: false,
//     });
//   };

//   const deleteBill = () => {
//     dispatch(removeBill(bill.bill._id));
//     setBill({
//       bill: null,
//       isOpen: false,
//     });
//   };

//   const getBill = (bill) => {
//     setBill({
//       bill,
//       isOpen: true,
//     });
//   };

//   const printBill = (chart, patient) => {
//     dispatch(togglePrint({ data: chart, modal: true, patient }));
//   };

//   return (
//     <React.Fragment>
//       <div className="timeline-2">
//         <div className="timeline-continue">
//           <Row className="timeline-right">
//             {(newBills || [])
//               .sort((a, b) => new Date(b.date) - new Date(a.date))
//               .map((bill) => (
//                 <Wrapper
//                   key={bill._id}
//                   item={bill}
//                   name="Billing"
//                   editItem={editBill}
//                   deleteItem={getBill}
//                   printItem={printBill}
//                   extraOptions={(item) => (
//                     <RenderWhen isTrue={item.bill === DEPOSIT}>
//                       <DropdownItem
//                         onClick={() =>
//                           setDepositToAdvance({ deposit: item, isOpen: true })
//                         }
//                         href="#"
//                       >
//                         <i className="ri-exchange-dollar-line align-bottom text-muted me-2"></i>
//                         Convert to Advance
//                       </DropdownItem>
//                     </RenderWhen>
//                   )}
//                   toggleDateModal={toggleDateModal}
//                   disableEdit={
//                     (bill.bill === ADVANCE_PAYMENT || bill.bill === DEPOSIT) &&
//                     user?.email !== "rijutarafder000@gmail.com"
//                       ? true
//                       : false
//                   }
//                   disableDelete={addmission?.dischargeDate ? true : false}
//                 >
//                   <RenderWhen isTrue={bill.bill === ADVANCE_PAYMENT}>
//                     <AdvancePayment data={bill?.advancePayment} />
//                   </RenderWhen>
//                   <RenderWhen isTrue={bill.bill === DEPOSIT}>
//                     <Deposit data={bill?.deposit} />
//                   </RenderWhen>
//                   <RenderWhen
//                     isTrue={bill.bill === INVOICE || bill.bill === REFUND}
//                   >
//                     <Invoice data={bill?.invoice} bill={bill} />
//                   </RenderWhen>
//                 </Wrapper>
//               ))}
//           </Row>
//         </div>
//       </div>
//       <DeleteModal
//         onCloseClick={cancelDelete}
//         onDeleteClick={deleteBill}
//         show={bill.isOpen}
//       />
//       <DeleteModal
//         onCloseClick={cancelDepositConversion}
//         onDeleteClick={proceedDepositConversion}
//         messsage={"Are you sure you want to convert Deposit to Advance"}
//         buttonMessage={"Yes Proceed"}
//         show={dpstToAdvance.isOpen}
//       />
//     </React.Fragment>
//   );
// };

// Bills.propTypes = {
//   data: PropTypes.array,
//   toggleDateModal: PropTypes.func.isRequired,
// };

// const mapStateToProps = (state) => ({
//   user: state.User.user,
//   addmissions: state.Bill.data,
//   patient: state.Patient.patient,
// });

// export default connect(mapStateToProps)(Bills);
