import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Select from "react-select";
import {
  addAdditionDetails,
  getICDCodes,
} from "../../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchAdditionalDiagnosis } from "../../../../store/actions";

const AdditionalDetailsModal = ({ isOpen, toggle, chart }) => {
  const [selectedCode, setSelectedCode] = useState(null);
  const [summary, setSummary] = useState("");
  const [icdOptions, setIcdOptions] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      loadICD();
    }
  }, [isOpen]);

  const loadICD = async () => {
    setLoadingCodes(true);
    try {
      const codes = await getICDCodes();
      // Shape data for react-select: { value, label }
      const options = (codes || []).map((code) => ({
        value: code._id,
        label: `${code.code} - ${code.text}`,
      }));
      setIcdOptions(options);
    } catch (error) {
      console.log("Error fetching ICD codes", error);
    } finally {
      setLoadingCodes(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      chart_id: chart?._id,
      code_id: selectedCode?.value,
      patient: chart?.patient,
      admission: chart?.addmission,
      summary,
    };

    setSubmitting(true);
    try {
      const res = await addAdditionDetails(payload);
      console.log("Response:", res);
      toast.success("Additional details added successfully");
      dispatch(
        fetchAdditionalDiagnosis({
          patient: chart?.patient,
          admission: chart?.addmission,
        }),
      );
      resetForm();
      toggle();
    } catch (error) {
      console.log("Error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  const handleClose = () => {
    resetForm();
    toggle();
  };

  const resetForm = () => {
    setSelectedCode(null);
    setSummary("");
    setIcdOptions([]);
  };

  const isFormValid = selectedCode && summary.trim();

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Add Additional Details</ModalHeader>

      <ModalBody>
        {/* Auto-populated — read only */}
        <FormGroup>
          <Label>Patient ID</Label>
          <Input type="text" value={chart?.patient || ""} readOnly disabled />
        </FormGroup>

        <FormGroup>
          <Label>Admission ID</Label>
          <Input
            type="text"
            value={chart?.addmission || ""}
            readOnly
            disabled
          />
        </FormGroup>

        {/* ICD Code — React Select */}
        <FormGroup>
          <Label>
            ICD Code <span className="text-danger">*</span>
          </Label>
          <Select
            options={icdOptions}
            value={selectedCode}
            onChange={(option) => setSelectedCode(option)}
            isLoading={loadingCodes}
            isSearchable
            placeholder="Search or select ICD code..."
            loadingMessage={() => "Loading codes..."}
            noOptionsMessage={() => "No codes found"}
          />
        </FormGroup>

        {/* Summary */}
        <FormGroup>
          <Label>
            Summary <span className="text-danger">*</span>
          </Label>
          <Input
            type="textarea"
            rows={4}
            placeholder="Enter summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </FormGroup>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || submitting} // ← add submitting
        >
          {submitting ? "Submitting..." : "Submit"} // ← loading text
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdditionalDetailsModal;
