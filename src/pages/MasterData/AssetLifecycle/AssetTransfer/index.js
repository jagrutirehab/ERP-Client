import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getAssetTransfers,
  createAssetTransfer,
  getFixedAssets,
  getAllCenters,
  getStorageLocations,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const AssetTransfer = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ASSET_TRANSFER", "WRITE");

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [assets, setAssets] = useState([]);
  const [centers, setCenters] = useState([]);
  const [locations, setLocations] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [toCenterId, setToCenterId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFixedAssets({})
      .then((res) => setAssets(res?.data || []))
      .catch(() => {});
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAssetTransfers({})
      .then((res) => {
        if (!cancelled) setTransfers(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  const selectedAsset = assets.find((a) => a._id === assetId);

  const openModal = () => {
    setAssetId("");
    setToCenterId("");
    setToLocationId("");
    setReason("");
    setRemarks("");
    setLocations([]);
    setModalOpen(true);
  };

  const handleToCenterChange = (id) => {
    setToCenterId(id);
    setToLocationId("");
    if (!id) {
      setLocations([]);
      return;
    }
    getStorageLocations({ centerId: id, status: "active" })
      .then((res) => setLocations(res?.data || []))
      .catch(() => setLocations([]));
  };

  const handleSubmit = async () => {
    if (!assetId) return toast.error("Select an asset");
    if (!toCenterId) return toast.error("Select destination site");
    if (!reason.trim()) return toast.error("Enter a reason for transfer");

    setSubmitting(true);
    try {
      await createAssetTransfer({
        assetId,
        toCenterId,
        toLocationId: toLocationId || undefined,
        reason,
        remarks,
      });
      toast.success("Asset transferred successfully");
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { name: "Transfer #", selector: (row) => row.transferNumber, sortable: true, width: "150px" },
    {
      name: "Asset",
      cell: (row) => <span className="uom-cell-primary">{row.assetId?.assetName || "—"}</span>,
    },
    {
      name: "From",
      cell: (row) => (
        <span className="uom-cell-muted small">
          {row.fromCenterId?.title || "—"}
          {row.fromLocationId ? ` (${row.fromLocationId.name})` : ""}
        </span>
      ),
    },
    {
      name: "To",
      cell: (row) => (
        <span className="uom-cell-muted small">
          {row.toCenterId?.title || "—"}
          {row.toLocationId ? ` (${row.toLocationId.name})` : ""}
        </span>
      ),
    },
    { name: "Reason", cell: (row) => <span className="small text-muted">{row.reason}</span> },
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.transferDate)}</span>,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Asset Transfer</h4>
          <p>Move a specific asset to a new site or location — keeps full transfer history</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Transfer
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={transfers}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No asset transfers yet</div>}
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-3">New Asset Transfer</h5>

          <Label>Asset</Label>
          <Input
            type="select"
            className="mb-3"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          >
            <option value="">Select asset</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.assetName} ({a.assetTag})
              </option>
            ))}
          </Input>

          {selectedAsset && (
            <div className="uom-table-card p-3 mb-3">
              <div className="text-muted small mb-1">Current Location (From)</div>
              <div className="fw-semibold">
                {selectedAsset.centerId?.title || "Not set"}
                {selectedAsset.storageLocationId ? ` — ${selectedAsset.storageLocationId.name}` : ""}
              </div>
            </div>
          )}

          <Row>
            <Col md={6} className="mb-3">
              <Label>Destination Site (To)</Label>
              <Input
                type="select"
                value={toCenterId}
                onChange={(e) => handleToCenterChange(e.target.value)}
              >
                <option value="">Select site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6} className="mb-3">
              <Label>Destination Location (optional)</Label>
              <Input
                type="select"
                value={toLocationId}
                disabled={!toCenterId}
                onChange={(e) => setToLocationId(e.target.value)}
              >
                <option value="">{!toCenterId ? "Select site first" : "Not specified"}</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>Reason</Label>
          <Input
            className="mb-3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Department relocation, better utilization"
          />

          <Label>Remarks</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Transferring..." : "Transfer Asset"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AssetTransfer;