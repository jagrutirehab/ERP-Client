import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button } from "reactstrap";
import { set } from "date-fns";

//flatpicker
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

import CustomModal from "../../../Components/Common/Modal";

//data
import {
  ADVANCE_PAYMENT,
  DEPOSIT,
  DRAFT_INVOICE,
  INVOICE,
  REFUND,
  WRITE_OFF,
} from "../../../Components/constants/patient";

//redux
import { connect, useDispatch, useSelector } from "react-redux";
import { createEditBill, setBillDate } from "../../../store/actions";

const BillDate = ({
  isOpen,
  toggle,
  billDate,
  editBillData,
  patient,
  admission,
}) => {
  const dispatch = useDispatch();
  const PatientCenter = useSelector(
    (state) => state.Patient.patient.center._id,
  );

  const paymentCenters = [
    "651f8abfed3d16334ae5a908",
    "65b0143a5f1da510dc3094cb",
  ];

  const isPaymentCenter = paymentCenters.includes(PatientCenter);

  useEffect(() => {
    if (isOpen) dispatch(setBillDate(new Date().toISOString()));
  }, [dispatch, isOpen]);

  console.log({ billDate, editBillData, patient, admission });

  // console.log("patient", patient);

  return (
    <React.Fragment>
      <CustomModal
        title={"When did the Patient visit happen?"}
        isOpen={isOpen}
        toggle={() => {
          toggle();
          dispatch(createEditBill({ data: null, bill: null, isOpen: false }));
        }}
      >
        <div>
          <Form>
            <p className="text-muted mt-0 mb-1">Bill date and time</p>
            <div className="d-flex justify-content-center align-items-center">
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  value={billDate || ""}
                  onChange={([e]) => {
                    const concat = set(new Date(billDate), {
                      year: e.getFullYear(),
                      month: e.getMonth(),
                      date: e.getDate(),
                    });
                    dispatch(setBillDate(concat.toISOString()));
                  }}
                  options={{
                    dateFormat: "d M, Y",
                    maxDate: editBillData.bill
                      ? new Date()
                      : new Date(
                          new Date().setMonth(new Date().getMonth() + 1),
                        ),
                    // enable: [
                    //   function (date) {
                    //     return date.getDate() === new Date().getDate();
                    //   },
                    // ],
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </span>
              <span className="ms-3 me-3">at</span>
              <span>
                <Flatpicker
                  name="dateOfAdmission"
                  value={billDate || ""}
                  onChange={([e]) => {
                    const concat = set(new Date(billDate), {
                      hours: e.getHours(),
                      minutes: e.getMinutes(),
                      seconds: e.getSeconds(),
                      milliseconds: e.getMilliseconds(),
                    });
                    dispatch(setBillDate(concat.toISOString()));
                  }}
                  options={{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: "G:i:S K",
                    time_24hr: false,
                    // defaultDate: moment().format('LT'),
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </span>
            </div>
            <div className="d-flex align-items-center mt-3">
              <p className="text-muted d-block mb-0">Name:</p>
              <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
                {/* {user?.name} */}
                Doctor Name
              </p>
            </div>
          </Form>
        </div>
        <div className="d-flex justify-content-end gap-3">
          {/* <Button
            outline
            disabled={
              PatientCenter === "65b0143a5f1da510dc3094cb"
                ? editBillData.bill === null ||
                  editBillData.bill === INVOICE ||
                  editBillData.bill === REFUND ||
                  editBillData.bill === DRAFT_INVOICE ||
                  editBillData.bill === DEPOSIT
                : editBillData.bill === INVOICE ||
                  editBillData.bill === REFUND ||
                  editBillData.bill === DRAFT_INVOICE ||
                  editBillData.bill === DEPOSIT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  bill: ADVANCE_PAYMENT,
                  isOpen: true,
                  admission,
                })
              );
              toggle();
            }}
          >
            {PatientCenter === "65b0143a5f1da510dc3094cb"
              ? "Payment"
              : "Advance Payment"} */}
          {/* Advance Payment */}
          {/* Payment */}
          {/* </Button> */}
          {/* <Button
            outline
            disabled={
              isPaymentCenter
                ? editBillData.bill === null ||
                  editBillData.bill === INVOICE ||
                  editBillData.bill === REFUND ||
                  editBillData.bill === DRAFT_INVOICE ||
                  editBillData.bill === DEPOSIT
                : editBillData.bill === INVOICE ||
                  editBillData.bill === REFUND ||
                  editBillData.bill === DRAFT_INVOICE ||
                  editBillData.bill === DEPOSIT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  bill: ADVANCE_PAYMENT,
                  isOpen: true,
                  admission,
                }),
              );
              toggle();
            }}
          >
            {isPaymentCenter ? "Payment" : "Advance Payment"}
          </Button> */}
          <Button
            outline
            disabled={
              editBillData.bill === null ||
              editBillData.bill === INVOICE ||
              editBillData.bill === REFUND ||
              editBillData.bill === DRAFT_INVOICE ||
              editBillData.bill === DEPOSIT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  bill: ADVANCE_PAYMENT,
                  isOpen: true,
                  admission,
                }),
              );
              toggle();
            }}
          >
            Payment
          </Button>
          <Button
            outline
            disabled={
              editBillData.bill === INVOICE ||
              editBillData.bill === REFUND ||
              editBillData.bill === DRAFT_INVOICE ||
              editBillData.bill === ADVANCE_PAYMENT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  bill: DEPOSIT,
                  isOpen: true,
                  admission,
                }),
              );
              toggle();
            }}
          >
            Deposit
          </Button>
          <Button
            outline
            disabled={
              editBillData.bill === ADVANCE_PAYMENT ||
              editBillData.bill === DRAFT_INVOICE ||
              editBillData.bill === DEPOSIT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  patient,
                  bill: INVOICE,
                  isOpen: true,
                  admission,
                }),
              );
              toggle();
            }}
          >
            Inovice
          </Button>
          <Button
            outline
            disabled={
              editBillData.bill === ADVANCE_PAYMENT ||
              editBillData.bill === INVOICE ||
              editBillData.bill === REFUND ||
              editBillData.bill === DEPOSIT
            }
            size="sm"
            onClick={() => {
              dispatch(
                createEditBill({
                  ...editBillData,
                  patient,
                  bill: DRAFT_INVOICE,
                  isOpen: true,
                  admission,
                }),
              );
              toggle();
            }}
          >
            Inovice Draft
          </Button>
          {/* {editBillData?.bill === null && (
            <Button
              outline
              size="sm"
              onClick={() => {
                console.log("Write Off clicked");
              }}
            >
              Write Off
            </Button>
          )} */}
        </div>
      </CustomModal>
    </React.Fragment>
  );
};

BillDate.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  billDate: PropTypes.any,
  editBillData: PropTypes.object,
  patient: PropTypes.object.isRequired,
  admission: PropTypes.string,
};

const mapStateToProps = (state) => ({
  billDate: state.Bill.billDate,
  editBillData: state.Bill.billForm,
  patient: state.Patient.patient,
});

export default connect(mapStateToProps)(BillDate);
