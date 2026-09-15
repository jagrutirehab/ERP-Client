import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { getGRNsForInvoice } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const GRNSelector = ({ onBack, onSelect }) => {
  const handleAuthError = useAuthError();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getGRNsForInvoice()
      .then((res) => {
        if (!cancelled) setGrns(res?.data || []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load GRNs.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Select Goods Receipt Note</h4>
          <p>Choose a GRN to record the vendor's invoice against and run the three-way match.</p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      {loading && <div className="text-muted p-3">Loading...</div>}

      {!loading && grns.length === 0 && (
        <div className="uom-empty-state">
          <p className="uom-empty-title">Nothing pending invoice</p>
          <p className="uom-empty-sub">
            Create a GRN first, or all GRNs already have an invoice recorded.
          </p>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {grns.map((grn) => (
          <div
            key={grn._id}
            className="uom-table-card p-3"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(grn)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">{grn.grnNumber}</div>
                <div className="text-muted small">
                  PO: {grn.poId?.poNumber} ·{" "}
                  {grn.poId?.vendorId?.tradeName || grn.poId?.vendorId?.legalName || "—"}
                </div>
                <div className="text-muted small mt-1">Received {dateFmt(grn.receivedDate)}</div>
              </div>
              <div className="text-muted small">{grn.lineItems?.length || 0} line(s)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GRNSelector;