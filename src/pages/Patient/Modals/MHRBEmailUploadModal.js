import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchPatientById, fetchChartsAddmissions } from "../../../store/actions";
import { uploadMHRBEmail } from "../../../helpers/backend_helper";

/**
 * Unlike the other "Add Records" options, MHRB Email Form has no in-app form
 * to fill — it's just a signed PDF received by email and uploaded as-is.
 */
const MHRBEmailUploadModal = ({ isOpen, toggle, patient, addmissionId }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setIsConfirmed(false);
    toggle();
  };

  const handleUpload = async () => {
    if (!addmissionId) {
      toast.error(
        "Could not tell which admission this form belongs to. Please reopen the patient and try again.",
      );
      return;
    }
    if (!file) {
      toast.warning("Please choose a PDF file first.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.warning("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("mhrbEmailForm", file);
      formData.append("id", addmissionId);

      await uploadMHRBEmail(formData);

      toast.success("MHRB email uploaded successfully!");
      dispatch(fetchPatientById(patient?._id));
      if (patient?.addmissions?.length) {
        dispatch(fetchChartsAddmissions(patient.addmissions));
      }
      setFile(null);
      setIsConfirmed(false);
      toggle();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose}>MHRB Email Upload</ModalHeader>
      <ModalBody>
        <Input
          type="file"
          accept="application/pdf"
          disabled={uploading}
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <FormGroup check className="mt-3">
          <Input
            type="checkbox"
            id="mhrbEmailConfirmCheckbox"
            checked={isConfirmed}
            disabled={uploading}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
          <Label check for="mhrbEmailConfirmCheckbox">
            I confirm this email was sent to the MHRB and relates only to
            this patient.
          </Label>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleUpload}
          disabled={uploading || !file || !isConfirmed}
        >
          {uploading ? <Spinner size="sm" /> : "Upload"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MHRBEmailUploadModal;
