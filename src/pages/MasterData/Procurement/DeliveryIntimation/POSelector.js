import React, { useState, useEffect } from "react";
import { Input, Button } from "reactstrap";
import { toast } from "react-toastify";
import { getPOsForDelivery } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const POSelector = ({ onBack, onSelect }) => {
  const handleAuthError = useAuthError();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchPOs = async () => {
      setLoading(true);
      try {
        const res = await getPOsForDelivery({ search });
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
          <p>Choose an approved Purchase Order to create a Delivery Intimation.</p>
        </div>
        <Button color="light" onClick={onBack}>
          <i className="bx bx-arrow-back me-1"></i> Back
        </Button>
      </div>

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input
          placeholder="Search by PO Number or Vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="text-muted p-3">Loading purchase orders...</div>}

      {!loading && pos.length === 0 && (
        <div className="uom-empty-state">
          <p className="uom-empty-title">No purchase orders pending delivery</p>
          <p className="uom-empty-sub">
            All approved POs are fully delivered, or none exist yet.
          </p>
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
                <div className="text-muted small mt-1">
                  Ordered {dateFmt(po.poDate)}
                  {po.expectedDeliveryDate && <> · Due {dateFmt(po.expectedDeliveryDate)}</>}
                </div>
                <div className="text-muted small">
                  {po.pendingLines} of {po.totalLines} line(s) pending
                </div>
              </div>
              <div className="text-end">
                <div className="text-muted small">PO Value</div>
                <div className="fw-semibold">{money(po.netPayable)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default POSelector;