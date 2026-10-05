import React, { useRef, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import jsPDF from "jspdf";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DnrConsentForm from "../Views/AdmissionForms/DnrConsentForm";
import { captureSection } from "../Views/AdmissionForms/captureSection";
import { fetchPatientById, fetchChartsAddmissions } from "../../../store/actions";
import { dnrFormFilled } from "../../../helpers/backend_helper";
import { useForm } from "react-hook-form";

/**
 * The DNR (Do Not Resuscitate) consent, as a standalone form — mirrors
 * ECTConsentFormModal.js: own useForm() instance, own ref, generated to a
 * PDF and uploaded as the draft record.
 */
const DnrConsentFormModal = ({
  isOpen,
  toggle,
  patient,
  admissions,
  addmissionId,
}) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const formRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileName = `${patient?.id?.value || ""}-${patient?.name || "patient"}-dnr-form.pdf`;

  const buildPdf = async () => {
    const pdf = new jsPDF("p", "pt", "a4");
    await captureSection(formRef, pdf, true, 1.0);
    return pdf;
  };

  const onSubmit = async (data) => {
    if (!addmissionId) {
      toast.error("No active admission found for this patient");
      return;
    }

    setSaving(true);
    try {
      const pdf = await buildPdf();
      const blob = pdf.output("blob");

      const formData = new FormData();
      formData.append("dnrFormRaw", blob, fileName);

      Object.entries(data || {}).forEach(([field, value]) => {
        if (value !== undefined && value !== null && String(value).trim()) {
          formData.append(field, String(value).trim());
        }
      });

      await dnrFormFilled(addmissionId, formData);
      dispatch(fetchPatientById(patient?._id));
      if (patient?.addmissions?.length) {
        dispatch(fetchChartsAddmissions(patient.addmissions));
      }

      try {
        const url = URL.createObjectURL(blob);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(url);
        setPreviewOpen(true);
      } catch (previewError) {
        console.error("PDF preview failed:", previewError);
        toast.warn(
          "Do Not Resuscitate form saved, but the PDF preview could not be opened",
        );
      }

      toast.success("Do Not Resuscitate form saved successfully!");
      toggle();
    } catch (error) {
      toast.error(
        error?.message || "Failed to save the Do Not Resuscitate form",
      );
    } finally {
      setSaving(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
        <ModalHeader toggle={toggle}>Do Not Resuscitate Form</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} id="dnr-consent-form">
            <div ref={formRef}>
              <DnrConsentForm
                register={register}
                patient={patient}
                admissions={admissions}
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" outline onClick={toggle} disabled={saving}>
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            form="dnr-consent-form"
            disabled={saving}
          >
            {saving ? (
              <span className="d-inline-flex align-items-center gap-1">
                <Spinner size="sm" /> Saving...
              </span>
            ) : (
              "Save and Print"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={previewOpen} toggle={closePreview} size="xl" centered>
        <ModalHeader toggle={closePreview}>
          Do Not Resuscitate Form Preview
        </ModalHeader>
        <ModalBody style={{ height: "75vh", padding: 0 }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Do Not Resuscitate Form"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={closePreview}>
            Close
          </Button>
          <Button color="primary" onClick={handleDownload}>
            Download
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default DnrConsentFormModal;
