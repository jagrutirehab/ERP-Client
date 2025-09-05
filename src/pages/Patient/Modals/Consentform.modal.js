import { useEffect } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../Components/Common/Modal";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { useDispatch, connect } from "react-redux";
import { Button, Input, Label } from "reactstrap";
import { setChartDate } from "../../../store/actions";

const ConsentFormModal = ({
  isOpen,
  toggle,
  patient,
  chartDate,
  admissions,
  details,
  setDetails,
  setOpenform,
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

        <>
          <div
            className="mt-3"
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <p className="text-muted mb-0">
              Patient:{" "}
              <span className="text-primary font-semi-bold fs-6 ms-1">
                {(patient?.name || "Patient Name").toUpperCase()}
              </span>
            </p>

            <p className="text-muted mb-0">
              Doctor:{" "}
              <span className="text-primary font-semi-bold fs-6 ms-1">
                {(admissions[0]?.doctor?.name || "Doctor Name").toUpperCase()}
              </span>
            </p>

            <p className="text-muted mb-0">
              Psychologist:{" "}
              <span className="text-primary font-semi-bold fs-6 ms-1">
                {(
                  admissions[0]?.psychologist?.name || "Psychologist Name"
                ).toUpperCase()}
              </span>
            </p>
          </div>

          <div className="mt-3">
            <Label className="text-muted mb-1">Ward / Room</Label>
            <Input
              type="number"
              value={details?.ward}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, ward: e.target.value }))
              }
              placeholder="Enter Ward / Room"
            />
          </div>
          <div className="mt-3">
            <Label className="text-muted mb-1">Bed</Label>
            <Input
              type="text"
              value={details?.bed}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, bed: e.target.value }))
              }
              placeholder="Enter Bed"
            />
          </div>
          <div className="mt-3">
            <Label className="text-muted mb-1">IPD Number</Label>
            <Input
              type="text"
              value={details?.IPDnum}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, IPDnum: e.target.value }))
              }
              placeholder="Enter IPD Number"
            />
          </div>

          <div className="mt-3">
            <Label className="text-muted mb-1">Room Type</Label>
            <Input
              type="text"
              value={details?.roomtype}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, roomtype: e.target.value }))
              }
              placeholder="Monthly / Daily"
            />
          </div>
          <div className="mt-3">
            <Label className="text-muted mb-1">
              Price for selected Room type (Monthly)
            </Label>
            <Input
              type="number"
              value={details?.toPay}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, toPay: e.target.value }))
              }
              placeholder="₹ ************"
            />
          </div>

          <div className="mt-3">
            <Label className="text-muted mb-1">
              Price for selected Room type (daily)
            </Label>
            <Input
              type="number"
              value={details?.semiprivate}
              onChange={(e) =>
                setDetails((prev) => ({
                  ...prev,
                  semiprivate: e.target.value,
                }))
              }
              placeholder="₹ ************"
            />
          </div>

          <div className="mt-3">
            <Label className="text-muted mb-1">
              Willing To Pay Rs. as Refundable Advance Deposit
            </Label>
            <Input
              type="number"
              value={details?.advDeposit}
              onChange={(e) =>
                setDetails((prev) => ({
                  ...prev,
                  advDeposit: e.target.value,
                }))
              }
              placeholder="₹ ************"
            />
          </div>

          {/* Next Button */}
          <div className="text-center mt-4">
            <Button
              type="button"
              color="success"
              onClick={() => {
                toggle();
                setOpenform(true);
              }}
            >
              Submit
            </Button>
          </div>
        </>
      </div>
    </CustomModal>
  );
};

ConsentFormModal.propTypes = {
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

export default connect(mapStateToProps)(ConsentFormModal);
