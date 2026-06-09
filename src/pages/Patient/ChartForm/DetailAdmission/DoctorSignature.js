import React, { useEffect, useState } from "react";
import RenderFields from "../../../../Components/Common/RenderFields";
import { Button } from "reactstrap";
import { getICDCodes, validateChart } from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import ValidateConfirmationModal from "../Components/ValidateConfirmationModal";
import { useDispatch } from "react-redux";
import { setEventChart } from "../../../../store/features/booking/bookingSlice";

const DoctorSignature = ({ validation, closeForm, editChartData, author }) => {
  const dispatch = useDispatch();

  const [icdOptions, setIcdOptions] = useState([]);

  useEffect(() => {
    const loadICD = async () => {
      try {
        const res = await getICDCodes();
        console.log("res", res);

        const formatted = res?.map(icd => ({
          value: icd._id,
          label: `${icd.code} - ${icd.text}`,
        }));

        setIcdOptions(formatted);

      } catch (err) {
        console.log(err);
      }
    };

    loadICD();
  }, []);

  const fields = [
    {
      label: "Provisional Diagnosis",
      name: "provisionaldiagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
    },
    {
      label: "Final Diagnosis",
      name: "diagnosis",
      type: "select2",
      isMulti: true,
      options: icdOptions,
    },
    {
      label: "Managment Plan: (INDOOR / Out Patient)",
      name: "managmentPlan",
      type: "text",
    },
    {
      label: "Investigations",
      name: "investigation",
      type: "checkbox",
      options: ["CBC", "BSL", "LFT", "RFT", "HIV", "TFT", "VIT B-12", "VIT D3"],
    },
    {
      label: "Special Test",
      name: "specialTest",
      type: "text",
    },
    {
      label: "Psychological Testing",
      name: "treatment",
      type: "text",
    },
  ];

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
    <>
      <RenderFields fields={fields} validation={validation} />
      <div className="mt-3 d-flex gap-3 justify-content-end">
        {editChartData && !editChartData.validatorId && editChartData.needsValidation && author?.role === "DOCTOR" && !isVerified && (
          <Button
            disabled={loading || validation.dirty}
            onClick={() => setIsModalOpen(true)}
            size="sm"
            color="success"
            type="button"
            title={validation.dirty ? "Please save your changes before validating" : ""}
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
    </>
  );
};

export default DoctorSignature;