import React, { useState } from "react";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import RenderFields from "../../../../Components/Common/RenderFields";
import { validateChart } from "../../../../helpers/backend_helper";
import ValidateConfirmationModal from "../Components/ValidateConfirmationModal";
import { setEventChart } from "../../../../store/features/booking/bookingSlice";

// radio with click-to-clear (single tick selects, tick again removes) -> optional
const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const fields = [
  { label: "Physiotherapy", name: "physiotherapy", type: "radio", options: yesNo },
  { label: "Walking", name: "walking", type: "radio", options: yesNo },
  { label: "Home Medicines", name: "homeMedicines", type: "radio", options: yesNo },
  { label: "Exercise", name: "exercise", type: "radio", options: yesNo },
  { label: "Food Requirement", name: "foodRequirement", type: "radio", options: yesNo },
  {
    label: "External Doctor Visits",
    name: "externalDoctorVisits",
    type: "radio",
    options: yesNo,
  },
  { label: "Extra Care Taker", name: "extraCareTaker", type: "radio", options: yesNo },
];

const SpecialRequirementsForm = ({ validation, closeForm, editChartData, author }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const response = await validateChart(editChartData?._id);
      toast.success("Successfully Validated.");
      setIsVerified(true);
      dispatch({
        type: "editDetailAdmission/fulfilled",
        payload: {
          type: response.payload.type,
          payload: response.payload,
        },
      });
      if (response?.payload?.type === "OPD" && response.payload.appointment) {
        dispatch(
          setEventChart({
            chart: response.payload,
            appointment: response.payload.appointment,
            patient: response.payload.patient,
          })
        );
      }
      closeForm();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to Validate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />
        <div className="mt-3 d-flex gap-3 justify-content-end">
          {editChartData &&
            !editChartData.doctorValidatorId &&
            editChartData.needsValidation &&
            author?.role === "DOCTOR" &&
            !isVerified && (
              <Button
                disabled={loading || validation.dirty}
                onClick={() => setIsModalOpen(true)}
                size="sm"
                color="success"
                type="button"
                title={
                  validation.dirty
                    ? "Please save your changes before validating"
                    : ""
                }
              >
                {loading ? "Validating..." : "Validate"}
              </Button>
            )}
          <Button onClick={closeForm} size="sm" color="danger" type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Save
          </Button>
        </div>
        <ValidateConfirmationModal
          isOpen={isModalOpen}
          toggle={() => setIsModalOpen(!isModalOpen)}
          loading={loading}
          isVerified={isVerified}
          onConfirm={handleValidate}
        />
      </div>
    </React.Fragment>
  );
};

SpecialRequirementsForm.propTypes = {};

export default SpecialRequirementsForm;
