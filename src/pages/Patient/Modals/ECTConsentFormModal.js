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
  const [pdfUrl, setPdfUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileName = `${patient?.id?.value || ""}-${patient?.name || "patient"}-ect-consent-form.pdf`;

  const buildPdf = async () => {
    const pdf = new jsPDF("p", "pt", "a4");
    // Both pages are one document, so page 1 starts the PDF and page 2 follows.
    await captureSection(pagesRef, pdf, true);
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
      formData.append("ectConsentFormRaw", blob, fileName);

      // The typed answers, saved as data beside the PDF — the same thing
      // addmissionfromRaw and consentfromRaw do. Without this they exist only
      // as pixels in the rasterised form: unqueryable and unreportable.
      //
      // Iterating `data` rather than naming the sixteen fields keeps this
      // correct when a field is added to either page; the server destructures
      // what it knows, so that is the bound. Safe because this modal owns its
      // own useForm() instance (see the docblock) — `data` holds these fields
      // and nothing else. Blank inputs are skipped so an untouched field
      // stores nothing rather than "".
      Object.entries(data || {}).forEach(([field, value]) => {
        if (value !== undefined && value !== null && String(value).trim()) {
          formData.append(field, String(value).trim());
        }
      });

      await dispatch(addECTConsent({ addmissionId, formData })).unwrap();
      await dispatch(fetchPatientById(patient?._id));

      // Saved — now show the PDF, reusing the very blob just uploaded so the
      // printed copy and the stored copy cannot differ. The standalone Preview
      // button is gone, so this is the only way to a paper copy and it can't
      // happen without a record. Set before toggle() closes the form: that
      // unmounts `pagesRef`, and a capture taken afterwards would produce a
      // blank document.
      try {
        const url = URL.createObjectURL(blob);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(url);
        setPreviewOpen(true);
      } catch (previewError) {
        // The consent IS saved — never turn that into a failure.
        console.error("PDF preview failed:", previewError);
        toast.warn("Consent saved, but the PDF preview could not be opened");
      }

      toggle();
    } catch (error) {
      toast.error(error?.message || "Failed to save the ECT consent form");
    } finally {
      setSaving(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  // Downloads the blob the preview is already showing. Rebuilding from
  // `pagesRef` would not work here: the preview only opens after a save, which
  // closes the form modal and unmounts that ref, so captureSection would return
  // an untouched pdf and hand the user a blank page.
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
          {/* Saving is the only way to get the printed consent — the standalone
              Preview button was removed so a signed paper copy can't exist
              without a record of it in the system. The preview opens from
              onSubmit on success. */}
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
              "Save and Print"
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
