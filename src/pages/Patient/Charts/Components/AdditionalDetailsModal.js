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
  const dispatch = useDispatch();
  const [selectedCodes, setSelectedCodes] = useState([]); // ← array
  const [summary, setSummary] = useState("");
  const [icdOptions, setIcdOptions] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadICD();
    }
  }, [isOpen]);

  const loadICD = async () => {
    setLoadingCodes(true);
    try {
      const codes = await getICDCodes();
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
      code_id: selectedCodes.map((c) => c.value), // ← array of IDs
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
          admission: chart?.addmission || undefined,
          chart_id: !chart?.addmission ? chart?._id : undefined,
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
    setSelectedCodes([]);
    setSummary("");
    setIcdOptions([]);
  };

  const isFormValid = selectedCodes.length > 0 && summary.trim();

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Add Additional Details</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>
            ICD Codes <span className="text-danger">*</span>
          </Label>
          <Select
            options={icdOptions}
            value={selectedCodes}
            onChange={(options) => setSelectedCodes(options || [])}
            isLoading={loadingCodes}
            isMulti
            isSearchable
            placeholder="Search or select ICD codes..."
            loadingMessage={() => "Loading codes..."}
            noOptionsMessage={() => "No codes found"}
          />
        </FormGroup>

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
          disabled={!isFormValid || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdditionalDetailsModal;
