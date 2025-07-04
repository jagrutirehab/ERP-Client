import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button } from "reactstrap";
import { set } from "date-fns";
import Flatpicker from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import CustomModal from "../../../Components/Common/Modal";
import { RECEIPT } from "../../../Components/constants/intern";
import { connect, useDispatch } from "react-redux";
import {
  createEditInternBill,
  setInternBillDate,
} from "../../../store/actions";

const BillDate = ({ isOpen, toggle, billDate, editBillData, intern }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) dispatch(setInternBillDate(new Date().toISOString()));
  }, [dispatch, isOpen]);

  return (
    <React.Fragment>
      <CustomModal
        title={"Intern Admission Date?"}
        isOpen={isOpen}
        toggle={() => {
          toggle();
          dispatch(
            createEditInternBill({ data: null, bill: null, isOpen: false })
          );
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
                    dispatch(setInternBillDate(concat.toISOString()));
                  }}
                  options={{
                    dateFormat: "d M, Y",
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
                    dispatch(setInternBillDate(concat.toISOString()));
                  }}
                  options={{
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: "G:i:S K",
                    time_24hr: false,
                  }}
                  className="form-control shadow-none bg-light"
                  id="dateOfAdmission"
                />
              </span>
            </div>
            <div className="d-flex align-items-center mt-3">
              <p className="text-muted d-block mb-0">Name:</p>
              <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
                Course Name
              </p>
            </div>
          </Form>
        </div>
        <div className="d-flex justify-content-end gap-3">
          <Button
            outline
            size="sm"
            onClick={() => {
              dispatch(
                createEditInternBill({
                  ...editBillData,
                  intern,
                  bill: RECEIPT,
                  isOpen: true,
                })
              );
              toggle();
            }}
          >
            Receipt
          </Button>
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
  intern: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  billDate: state.Intern.billDate,
  editBillData: state.Intern.billForm,
  intern: state.Intern.intern,
});

export default connect(mapStateToProps)(BillDate);
