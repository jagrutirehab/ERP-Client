import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { getDIsForGRN } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const DISelector = ({ onBack, onSelect }) => {
  const handleAuthError = useAuthError();
  const [dis, setDis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDIsForGRN()
      .then((res) => {
        if (!cancelled) setDis(res?.data || []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load DIs.");
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
          <h4>Select Delivery Intimation</h4>
          <p>Choose a received Delivery Intimation to verify and create a Goods Receipt Note.</p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      {loading && <div className="text-muted p-3">Loading...</div>}

      {!loading && dis.length === 0 && (
        <div className="uom-empty-state">
          <p className="uom-empty-title">Nothing pending GRN</p>
          <p className="uom-empty-sub">
            Mark a Delivery Intimation as "Received" first, or all are already verified.
          </p>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {dis.map((di) => (
          <div
            key={di._id}
            className="uom-table-card p-3"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(di)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">{di.intimationNumber}</div>
                <div className="text-muted small">
                  PO: {di.poId?.poNumber} · {di.poId?.vendorId?.tradeName || di.poId?.vendorId?.legalName || "—"}
                </div>
                <div className="text-muted small mt-1">
                  Invoice #{di.invoiceNumber} · Received {dateFmt(di.receivedAt)}
                </div>
              </div>
              <div className="text-muted small">{di.lineItems?.length || 0} line(s)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DISelector;