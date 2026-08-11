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
import ECTConsentForm from "../Views/AdmissionForms/ECTConsentForm";
import ECTConsentForm2 from "../Views/AdmissionForms/ECTConsentForm2";
import { captureSection } from "../Views/AdmissionForms/captureSection";
import { fetchPatientById } from "../../../store/actions";
import { addECTConsent } from "../../../store/features/chart/chartSlice";
import { useForm } from "react-hook-form";

/**
 * The ECT informed consent, as a standalone form.
 *
 * These two pages used to be baked into the general Consent Form PDF. They now
 * stand on their own so an ECT consent can be recorded when ECT is actually
 * decided, rather than for every admission.
 *
 * Deliberately owns its own useForm() instance — the consent bundle shares one
 * across every section, which is why field names collide there.
 */
const ECTConsentFormModal = ({
  isOpen,
  toggle,
  patient,
  admissions,
  addmissionId,
}) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const pagesRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const fileName = `${patient?.id?.value || ""}-${patient?.name || "patient"}-ect-consent-form.pdf`;

  const buildPdf = async () => {
    const pdf = new jsPDF("p", "pt", "a4");
    // Both pages are one document, so page 1 starts the PDF and page 2 follows.
    await captureSection(pagesRef, pdf, true);
    return pdf;
  };

  const onSubmit = async () => {
    if (!addmissionId) {
      toast.error("No active admission found for this patient");
      return;
    }

    setSaving(true);
    try {
      const pdf = await buildPdf();
      const blob = pdf.output("blob");

      const formData = new FormData();
      formData.append("ectConsentFormRaw", blob, fileName);

      await dispatch(addECTConsent({ addmissionId, formData })).unwrap();
      await dispatch(fetchPatientById(patient?._id));

      toggle();
    } catch (error) {
      toast.error(error?.message || "Failed to save the ECT consent form");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setGenerating(true);
    try {
      const pdf = await buildPdf();
      const url = URL.createObjectURL(pdf.output("blob"));

      // Mobile browsers won't render a blob in an iframe.
      if (isMobile) {
        window.open(url, "_blank");
      } else {
        setPdfUrl(url);
        setPreviewOpen(true);
      }
    } catch (error) {
      toast.error(error?.message || "Failed to generate the preview");
    } finally {
      setGenerating(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const handleDownload = async () => {
    const pdf = await buildPdf();
    pdf.save(fileName);
  };

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
        <ModalHeader toggle={toggle}>ECT Consent Form</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} id="ect-consent-form">
            <div ref={pagesRef}>
              <ECTConsentForm
                register={register}
                patient={patient}
                admissions={admissions}
              />
              <ECTConsentForm2
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
            color="secondary"
            outline
            onClick={handlePreview}
            disabled={generating || saving}
          >
            {generating ? (
              <span className="d-inline-flex align-items-center gap-1">
                <Spinner size="sm" /> Generating...
              </span>
            ) : (
              "Preview"
            )}
          </Button>
          <Button
            color="primary"
            type="submit"
            form="ect-consent-form"
            disabled={saving}
          >
            {saving ? (
              <span className="d-inline-flex align-items-center gap-1">
                <Spinner size="sm" /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={previewOpen} toggle={closePreview} size="xl" centered>
        <ModalHeader toggle={closePreview}>ECT Consent Form Preview</ModalHeader>
        <ModalBody style={{ height: "75vh", padding: 0 }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="ECT Consent Form"
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

export default ECTConsentFormModal;
