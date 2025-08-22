import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { useDispatch, connect } from "react-redux";
import { Button, Form, Input, Label } from "reactstrap";
import { setChartDate } from "../../../store/actions";

const AdmissionFormModal = ({
  isOpen,
  toggle,
  patient,
  chartDate,
  doctors,
  psychologists,
  admissions,
  admissiontype,
  setAdmissiontype,
  adultationype,
  setAdultationtype,
  supporttype,
  setSupporttype,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!chartDate) {
      dispatch(setChartDate(new Date().toISOString()));
    }
  }, [dispatch, chartDate]);

  const handleDateChange = (selectedDates) => {
    if (selectedDates?.length) {
      const selectedDate = selectedDates[0];
      const existing = new Date(chartDate || new Date());
      existing.setFullYear(selectedDate.getFullYear());
      existing.setMonth(selectedDate.getMonth());
      existing.setDate(selectedDate.getDate());
      dispatch(setChartDate(existing.toISOString()));
    }
  };

  const handleTimeChange = (selectedDates) => {
    if (selectedDates?.length) {
      const selectedTime = selectedDates[0];
      const existing = new Date(chartDate || new Date());
      existing.setHours(selectedTime.getHours());
      existing.setMinutes(selectedTime.getMinutes());
      existing.setSeconds(selectedTime.getSeconds());
      dispatch(setChartDate(existing.toISOString()));
    }
  };

  return (
    <CustomModal isOpen={isOpen} title="Admission" toggle={toggle}>
      {/* No form, just controlled inputs */}
      <div>
        {/* Date + Time */}
        <p className="text-muted mt-0 mb-1">Chart date and time</p>
        <div className="d-flex justify-content-center align-items-center">
          <Flatpickr
            name="dateOfAdmission"
            value={chartDate ? new Date(chartDate) : ""}
            onChange={handleDateChange}
            disabled
            options={{ dateFormat: "d M, Y" }}
            className="form-control shadow-none bg-light"
            id="dateOfAdmission"
          />
          <span className="ms-3 me-3">at</span>
          <Flatpickr
            name="timeOfAdmission"
            disabled
            value={chartDate ? new Date(chartDate) : ""}
            onChange={handleTimeChange}
            options={{
              enableTime: true,
              noCalendar: true,
              dateFormat: "h:i K",
              time_24hr: false,
            }}
            className="form-control shadow-none bg-light"
            id="timeOfAdmission"
          />
        </div>

        {/* Patient / Doctor / Psychologist */}
        <div className="mt-3">
          <p className="text-muted mb-0">Patient Name:</p>
          <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
            {patient?.name || "Patient Name"}
          </p>
        </div>
        <div className="mt-3">
          <p className="text-muted mb-0">Doctor Name:</p>
          <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
            {admissions[0]?.doctor?.name || "Doctor Name"}
          </p>
        </div>
        <div className="mt-3">
          <p className="text-muted mb-0">Psychologist Name:</p>
          <p className="text-primary ms-3 mb-0 font-semi-bold fs-6">
            {admissions[0]?.psychologist?.name || "Psychologist Name"}
          </p>
        </div>

        {/* Admission Type */}
        <div className="mt-3">
          <Label className="text-muted mb-1">Admission Type</Label>
          <Input
            type="select"
            value={admissiontype}
            onChange={(e) => setAdmissiontype(e.target.value)}
          >
            <option value="">Select Admission Type</option>
            <option value="INDEPENDENT_ADMISSION">Independent Admission</option>
            <option value="SUPPORTIVE_ADMISSION">Supportive Admission</option>
          </Input>
        </div>

        {/* Conditional fields */}
        {admissiontype === "INDEPENDENT_ADMISSION" && (
          <div className="mt-3">
            <Label className="text-muted mb-1">Adultation Type</Label>
            <Input
              type="select"
              value={adultationype}
              onChange={(e) => setAdultationtype(e.target.value)}
            >
              <option value="">Select Adultation</option>
              <option value="ADULT">Adult (18+)</option>
              <option value="MINOR">Minor (below 18)</option>
            </Input>
          </div>
        )}

        {admissiontype === "SUPPORTIVE_ADMISSION" && (
          <div className="mt-3">
            <Label className="text-muted mb-1">Support Type</Label>
            <Input
              type="select"
              value={supporttype}
              onChange={(e) => setSupporttype(e.target.value)}
            >
              <option value="">Select Support Type</option>
              <option value="UPTO30DAYS">Upto 30 days</option>
              <option value="BEYOND30DAYS">Beyond 30 days Upto 90 days</option>
            </Input>
          </div>
        )}

        {/* Save just closes modal */}
        <div className="text-center mt-4">
          <Button
            type="button"
            color="primary"
            onClick={toggle} // just close
          >
            Save
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

AdmissionFormModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  patient: PropTypes.object,
  chartDate: PropTypes.string,
};

const mapStateToProps = (state) => ({
  chartDate: state.Chart.chartDate,
  patient: state.Patient.patient,
  doctors: state.User?.doctor,
  psychologists: state.User?.counsellors,
  admissions: state.Chart.data,
});

export default connect(mapStateToProps)(AdmissionFormModal);
