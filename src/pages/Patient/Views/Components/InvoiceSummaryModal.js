import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Spinner, Alert } from "reactstrap";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";

import CustomModal from "../../../../Components/Common/Modal";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import { getPatientLedger } from "../../../../helpers/backend_helper";
import InvoiceSummaryPdf from "../../../../Components/Print/Bills/InvoiceSummary";
import PDFErrorBoundary from "../../../../Components/Print/PDFErrorBoundary";

const InvoiceSummaryModal = ({ isOpen, toggle, patient, admission, center }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [backendCenter, setBackendCenter] = useState(null);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const admissionId = admission?._id || admission?.addmissionId;

  const resolveActiveCenter = () => {
    if (backendCenter && typeof backendCenter === "object" && backendCenter.name) {
      return backendCenter;
    }
    if (admission?.center && typeof admission.center === "object" && admission.center.name) {
      return admission.center;
    }
    if (center && typeof center === "object" && center.name) {
      return center;
    }
    if (patient?.center && typeof patient.center === "object" && patient.center.name) {
      return patient.center;
    }
    return patient?.center || center || null;
  };
  const activeCenter = resolveActiveCenter();

  useEffect(() => {
    if (!isOpen || !patient?._id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getPatientLedger({
      patient: patient._id,
      addmission: admissionId,
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res?.payload || []);
        if (res?.center && typeof res.center === "object" && res.center.name) {
          setBackendCenter(res.center);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load invoice summary. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, patient?._id, admissionId]);

  const fileName = `${patient?.id?.value || "patient"}-${(
    patient?.name || "patient"
  ).replace(/\s+/g, "_")}-categorized-breakdown.pdf`;

  return (
    <CustomModal
      className="overflow-auto text-center"
      isOpen={isOpen}
      toggle={toggle}
      title="Invoice Summary"
      centered
      size="xl"
    >
      {loading && (
        <div className="py-5">
          <Spinner />
        </div>
      )}

      {!loading && error && <Alert color="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="mb-3 d-flex justify-content-center">
            <PDFDownloadLink
              document={
                <InvoiceSummaryPdf
                  patient={patient}
                  center={activeCenter}
                  admission={admission}
                  rows={rows}
                />
              }
              fileName={fileName}
              className="btn btn-primary btn-sm"
            >
              {({ loading: downloadLoading }) =>
                downloadLoading ? <Spinner size="sm" /> : "Print / Download"
              }
            </PDFDownloadLink>
          </div>

          {isMobile ? (
            <p className="text-muted">
              Preview not available on this screen size — use Print / Download above.
            </p>
          ) : (
            <PDFErrorBoundary>
              <PDFViewer width={"100%"} height={600}>
                <InvoiceSummaryPdf
                  patient={patient}
                  center={activeCenter}
                  admission={admission}
                  rows={rows}
                />
              </PDFViewer>
            </PDFErrorBoundary>
          )}
        </>
      )}
    </CustomModal>
  );
};

InvoiceSummaryModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  patient: PropTypes.object,
  admission: PropTypes.object,
  center: PropTypes.object,
};

export default InvoiceSummaryModal;
