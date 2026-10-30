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
  hasGenerated: propHasGenerated,
  isGenerating: propIsGenerating,
  uploadedAudio: propUploadedAudio,
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
  const isGenerating = propIsGenerating ?? context?.isGenerating ?? false;
  const hasGenerated = propHasGenerated ?? context?.hasGenerated ?? false;
  const uploadedAudio = propUploadedAudio ?? context?.uploadedAudio ?? null;

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAlreadyValidated = Boolean(
    editChartData?.detailAdmission?.validation?.isValidated ||
      (isEdit && Boolean(validation?.values?.isValidated || validation?.values?.validation?.isValidated))
  );

  const isDoctor = (() => {
    try {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed?.role &&
          String(parsed.role).trim().toUpperCase() === "DOCTOR"
        ) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    if (
      author?.role &&
      String(author.role).trim().toUpperCase() === "DOCTOR"
    ) {
      return true;
    }
    return false;
  })();

  const isAiRecord = Boolean(
    validation?.values?.aiGenerated ||
      uploadedAudio?.url ||
      validation?.values?.audioDetails ||
      editChartData?.detailAdmission?.aiGenerated ||
      editChartData?.detailAdmission?.audioDetails?.url
  );

  const isAiComplete =
    !isGenerating &&
    (Boolean(hasGenerated) ||
      Boolean(validation?.values?.aiGenerated) ||
      (isEdit &&
        Boolean(
          editChartData?.detailAdmission?.aiReviewed ||
            editChartData?.detailAdmission?.validation?.isValidated
        )));

  const isValidationDisabled = isAiRecord && !isAiComplete;

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

        {isAlreadyValidated ? (
          <div
            className="p-3 my-3 shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-2"
            style={{
              backgroundColor: "#ecfdf5",
              border: "2px solid #10b981",
              borderRadius: "8px",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <i className="ri-checkbox-circle-fill text-success fs-3 flex-shrink-0"></i>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold fs-6 text-success">AI Validated</span>
                </div>
                <div className="small text-muted" style={{ color: "#065f46" }}>
                  {editChartData?.detailAdmission?.validation?.validatedBy?.name ||
                  validation?.values?.validatedByName ? (
                    <>
                      Validated by{" "}
                      <strong>
                        {editChartData?.detailAdmission?.validation?.validatedBy?.name ||
                          validation?.values?.validatedByName}
                      </strong>
                      {editChartData?.detailAdmission?.validation?.validatedAt && (
                        <>
                          {" "}
                          on{" "}
                          {new Date(
                            editChartData.detailAdmission.validation.validatedAt
                          ).toLocaleDateString()}
                        </>
                      )}
                      . This clinical record is permanently validated.
                    </>
                  ) : (
                    "This clinical record has been reviewed and permanently validated. Validation is non-revertable."
                  )}
                </div>
              </div>
            </div>
            <span className="badge bg-success py-1 px-2 fs-7 d-inline-flex align-items-center gap-1">
              <i className="ri-check-line"></i> Validated
            </span>
          </div>
        ) : (
          <div
            className="p-3 my-3"
            style={{
              backgroundColor: "rgba(64, 81, 137, 0.08)",
              borderLeft: "4px solid var(--vz-primary, #405189)",
              borderRadius: "6px",
            }}
          >
            <div className="form-check form-check-outline mb-2 d-flex align-items-center">
              <input
                className="form-check-input"
                type="checkbox"
                id="ai-reviewed-checkbox"
                name="aiReviewed"
                checked={Boolean(
                  validation.values.aiReviewed || validation.values.isValidated
                )}
                disabled={isValidationDisabled}
                title={
                  isValidationDisabled
                    ? "Cannot validate an AI-generated record until AI validation is successfully completed."
                    : ""
                }
                onChange={(e) => {
                  if (isValidationDisabled) return;
                  validation.setFieldValue("aiReviewed", e.target.checked);
                  validation.setFieldValue("isValidated", e.target.checked);
                }}
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  cursor: isValidationDisabled ? "not-allowed" : "pointer",
                  marginTop: 0,
                  flexShrink: 0,
                }}
              />
              <label
                className={`form-check-label ms-2 fs-6 mb-0 ${
                  isValidationDisabled ? "text-muted" : "cursor-pointer"
                }`}
                htmlFor="ai-reviewed-checkbox"
                style={{ color: isValidationDisabled ? "#94a3b8" : "var(--vz-primary, #405189)" }}
                title={
                  isValidationDisabled
                    ? "Cannot validate an AI-generated record until AI validation is successfully completed."
                    : ""
                }
              >
                I have reviewed and validated this clinical record, This is non revertable once validated.*
                {isDoctor && (
                  <span className="ms-1" style={{ color: "#2d3a61" }}>(Mandatory for Doctors)</span>
                )}
              </label>
            </div>
            <div className="small ms-4 ps-1" style={{ color: "#5b6b94" }}>
              {isDoctor
                ? "Doctors must validate Detail History upon submission. This is non revertable once validated."
                : "Checking this box records you as the clinical validator. This is non revertable once validated."}
            </div>

            {isDoctor && !validation.values.isValidated && !isAlreadyValidated && (
              <div className="text-danger small ms-4 ps-1 mt-1">
                * Doctors must validate Detail History upon submission
              </div>
            )}

            {isValidationDisabled && (
              <div
                className="alert alert-warning py-2 px-3 mt-2 mb-0 d-flex align-items-center gap-2"
                style={{
                  fontSize: "0.85rem",
                  borderLeft: "4px solid #f59e0b",
                  backgroundColor: "#fffbeb",
                  color: "#92400e",
                }}
              >
                <i className="ri-error-warning-line fs-5 flex-shrink-0"></i>
                <span>
                  <strong>AI Validation Guardrail:</strong> Cannot validate an AI-generated record until AI validation is successfully completed.
                </span>
              </div>
            )}
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

          {/* Bottom Right: Save */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            <Button
              size="sm"
              type="submit"
              color="primary"
              disabled={loading}
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
  hasGenerated: PropTypes.bool,
  isGenerating: PropTypes.bool,
  uploadedAudio: PropTypes.object,
};

export default SpecialRequirementsForm;
