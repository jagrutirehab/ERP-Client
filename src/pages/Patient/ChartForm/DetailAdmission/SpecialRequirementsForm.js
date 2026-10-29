import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import RenderFields from "../../../../Components/Common/RenderFields";
import { validateChart } from "../../../../helpers/backend_helper";
import ValidateConfirmationModal from "../Components/ValidateConfirmationModal";
import { setEventChart } from "../../../../store/features/booking/bookingSlice";
import { DetailHistoryClearContext } from "./DetailHistoryClearContext";

// radio with click-to-clear (single tick selects, tick again removes) -> optional
const yesNo = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const fields = [
  {
    label: "Physiotherapy",
    name: "physiotherapy",
    type: "radio",
    options: yesNo,
  },
  { label: "Walking", name: "walking", type: "radio", options: yesNo },
  {
    label: "Home Medicines",
    name: "homeMedicines",
    type: "radio",
    options: yesNo,
  },
  { label: "Exercise", name: "exercise", type: "radio", options: yesNo },
  {
    label: "Food Requirement",
    name: "foodRequirement",
    type: "radio",
    options: yesNo,
  },
  {
    label: "External Doctor Visits",
    name: "externalDoctorVisits",
    type: "radio",
    options: yesNo,
  },
  {
    label: "Extra Care Taker",
    name: "extraCareTaker",
    type: "radio",
    options: yesNo,
  },
  {
    label: "Details",
    name: "specialRequirementsDetails",
    type: "textarea",
  },
];

const SpecialRequirementsForm = ({
  validation,
  closeForm,
  editChartData,
  author,
  onClearForm: propOnClearForm,
  isEdit: propIsEdit,
}) => {
  const isEdit = Boolean(
    propIsEdit ??
      editChartData?._id ??
      validation?.values?.id ??
      validation?.values?.chartId
  );
  const dispatch = useDispatch();
  const context = useContext(DetailHistoryClearContext);
  const onClear = propOnClearForm || context?.onClearForm;
  const isGenerating = context?.isGenerating || false;

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
          }),
        );
      }
      closeForm();
    } catch (error) {
      toast.error(error.message || "Failed to Validate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div>
        <RenderFields fields={fields} validation={validation} />

        {!isEdit && validation.values.aiGenerated && (
          <div
            className="p-3 my-3 shadow-sm"
            style={{
              backgroundColor: "#f1f5f9", // distinct background highlight
              border: "2px solid #0f172a", // solid dark navy/gray border
              borderRadius: "8px",
            }}
          >
            <div className="form-check form-check-outline mb-1 d-flex align-items-center">
              <input
                className="form-check-input"
                type="checkbox"
                id="ai-reviewed-checkbox"
                name="aiReviewed"
                checked={Boolean(validation.values.aiReviewed)}
                onChange={(e) => {
                  validation.setFieldValue("aiReviewed", e.target.checked);
                }}
                style={{
                  border: "2px solid #0f172a", // solid dark navy/gray checkbox border
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: "pointer",
                  marginTop: 0,
                  flexShrink: 0,
                }}
              />
              <label
                className="form-check-label fw-bold cursor-pointer ms-2 fs-6 mb-0"
                htmlFor="ai-reviewed-checkbox"
                style={{ color: "#0f172a" }}
              >
                I have reviewed and validated the AI-generated data{" "}
                <span className="text-danger">*</span>
              </label>
            </div>
            <div className="small text-muted ms-4 ps-1" style={{ color: "#334155" }}>
              This record was populated with AI assistance. Clinical verification is mandatory before saving to the database.
              You may uncheck this box, review or edit any fields across previous tabs, and re-check before saving.
            </div>
          </div>
        )}

        <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Bottom Left: Cancel and Clear Form */}
          <div className="d-flex align-items-center gap-2">
            <Button onClick={closeForm} size="sm" color="danger" type="button">
              Cancel
            </Button>
            {onClear && (
              <Button
                type="button"
                color="outline-danger"
                size="sm"
                onClick={onClear}
                disabled={isGenerating}
                title="Clear all form fields and saved draft"
              >
                <i className="ri-delete-bin-line me-1"></i> Clear Form
              </Button>
            )}
          </div>

          {/* Bottom Right: AI validation warning, Validate, and Save */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            {!isEdit && validation.values.aiGenerated && !validation.values.aiReviewed && (
              <small className="text-danger fw-semibold">
                * Please validate the AI-generated data to enable Save.
              </small>
            )}

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
            <Button
              size="sm"
              type="submit"
              color="primary"
              disabled={Boolean(!isEdit && validation.values.aiGenerated && !validation.values.aiReviewed)}
              title={
                !isEdit && validation.values.aiGenerated && !validation.values.aiReviewed
                  ? "Please check 'I have reviewed and validated the AI-generated data' to save."
                  : ""
              }
            >
              Save
            </Button>
          </div>
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

SpecialRequirementsForm.propTypes = {
  validation: PropTypes.object,
  closeForm: PropTypes.func,
  editChartData: PropTypes.object,
  author: PropTypes.object,
  onClearForm: PropTypes.func,
  isEdit: PropTypes.bool,
};

export default SpecialRequirementsForm;
