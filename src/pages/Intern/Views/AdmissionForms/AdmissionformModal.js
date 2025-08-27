import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { useDispatch, connect } from "react-redux";
import { Button, Input, Label } from "reactstrap";
import CustomModal from "../../../../Components/Common/Modal";
import { setChartDate } from "../../../../store/actions";

const AdmissionFormModal = ({
  isOpen,
  toggle,
  intern,
  chartDate,
  details,
  setDetails,
  setOpenform,
}) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // step 1 = dropdowns, step 2 = inputs

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

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className="mt-3 d-flex align-items-center">
              <p className="text-muted mb-0 me-2">Intern Name:</p>
              <p className="text-primary mb-0 font-semi-bold fs-6">
                {(intern?.intern?.name || "Intern Name").toUpperCase()}
              </p>
            </div>

            {/* Next Button */}
            <div className="text-center mt-4">
              <Button type="button" color="primary" onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className="mt-3">
              <Label className="text-muted mb-1">From Date</Label>
              <Input
                type="date"
                value={details?.from}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, from: e.target.value }))
                }
                placeholder="Select From date"
              />
            </div>
            <div className="mt-3">
              <Label className="text-muted mb-1">To Date</Label>
              <Input
                type="date"
                value={details?.to}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, to: e.target.value }))
                }
                placeholder="To Date"
              />
            </div>
            <div className="mt-3">
              <Label className="text-muted mb-1">Designation</Label>
              <Input
                type="text"
                value={details?.position}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="Designation"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center mt-4">
              <Button
                type="button"
                color="success"
                onClick={() => {
                  toggle();
                  setOpenform(true);
                  setStep(1);
                }}
              >
                Submit
              </Button>
            </div>
          </>
        )}
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
