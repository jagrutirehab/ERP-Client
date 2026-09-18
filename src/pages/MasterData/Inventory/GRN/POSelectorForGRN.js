import React, { useState, useEffect } from "react";
import { Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import { getPOsForGRN } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const POSelectorForGRN = ({ onBack, onSelect }) => {
  const handleAuthError = useAuthError();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchPOs = async () => {
      setLoading(true);
      try {
        const res = await getPOsForGRN({ search });
        if (cancelled) return;
        setPos(res?.data || []);
      } catch (error) {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Couldn't load POs.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPOs();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Select Purchase Order</h4>
          <p>Choose an approved PO that still has items pending receipt.</p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="PO #, vendor, or item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="text-muted p-3">Loading...</div>}

      {!loading && pos.length === 0 && (
        <div className="uom-empty-state">
          <p className="uom-empty-title">No POs pending receipt</p>
          <p className="uom-empty-sub">All approved POs are fully received.</p>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {pos.map((po) => (
          <div
            key={po._id}
            className="uom-table-card p-3"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(po)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">{po.poNumber}</div>
                <div className="text-muted small">
                  {po.vendorId?.tradeName || po.vendorId?.legalName || "—"}
                </div>
                <div className="text-muted small mt-1">Ordered {dateFmt(po.poDate)}</div>
              </div>
              <div className="text-end">
                <div className="text-muted small">{po.lines.length} line(s)</div>
                <div className="fw-semibold text-warning">{po.totalToReceive} to receive</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default POSelectorForGRN;