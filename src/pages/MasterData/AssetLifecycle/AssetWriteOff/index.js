import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getAssetWriteOffRequests,
  createAssetWriteOffRequest,
  approveAssetWriteOffRequest,
  rejectAssetWriteOffRequest,
  getAllCenters,
  getFixedAssets,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const emptyItem = () => ({
  assetId: "",
  disposalType: "write_off",
  reason: "",
  estValue: 0,
  buyerName: "",
});

const StatusPill = ({ status }) => {
  const map = {
    pending: { label: "Pending", cls: "status-draft" },
    approved: { label: "Approved", cls: "status-active" },
    rejected: { label: "Rejected", cls: "status-blacklisted" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const AssetWriteOffRequest = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ASSET_WRITEOFF", "WRITE");
  const canApprove = hasPermission("MASTERDATA", "ASSET_WRITEOFF", "DELETE");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);
  const [assets, setAssets] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [centerId, setCenterId] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAssetWriteOffRequests({})
      .then((res) => {
        if (!cancelled) setRequests(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshFlag]);

  const openModal = () => {
    setTitle("");
    setDescription("");
    setCenterId("");
    setItems([emptyItem()]);
    setAssets([]);
    setModalOpen(true);
  };

  const handleCenterChange = (id) => {
    setCenterId(id);
    setItems([emptyItem()]);
    if (!id) {
      setAssets([]);
      return;
    }
    getFixedAssets({ centerId: id, status: "active" })
      .then((res) => setAssets(res?.data || []))
      .catch(() => setAssets([]));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const totalEstValue = items.reduce((sum, it) => sum + (Number(it.estValue) || 0), 0);

  const handleSubmit = async () => {
    if (!centerId || !title.trim()) return toast.error("Fill in Site and Title");
    const invalid = items.find((it) => !it.assetId || !it.reason.trim());
    if (invalid) return toast.error("Select an asset and enter a reason for every item");
    const invalidSale = items.find((it) => it.disposalType === "sale" && !it.buyerName.trim());
    if (invalidSale) return toast.error("Enter Buyer Name for items marked as Sale");

    setSubmitting(true);
    try {
      await createAssetWriteOffRequest({
        title,
        description,
        centerId,
        items: items.map((it) => ({
          assetId: it.assetId,
          disposalType: it.disposalType,
          reason: it.reason,
          estValue: Number(it.estValue) || 0,
          buyerName: it.disposalType === "sale" ? it.buyerName : undefined,
        })),
      });
      toast.success("Write-off request created successfully");
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

  const handleApprove = async (id) => {
    try {
      const res = await approveAssetWriteOffRequest(id);
      toast.success(res?.message || "Request approved");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't approve.");
      }
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return toast.error("Provide a rejection reason");
    try {
      await rejectAssetWriteOffRequest(rejectTarget._id, { rejectionReason: rejectReason });
      toast.success("Request rejected");
      setRejectTarget(null);
      setRejectReason("");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't reject.");
      }
    }
  };

  const columns = [
    { name: "Scrap ID", selector: (row) => row.requestNumber, sortable: true, width: "150px" },
    { name: "Title", selector: (row) => row.title },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Items",
      width: "80px",
      cell: (row) => <span className="uom-cell-muted">{row.items?.length || 0}</span>,
    },
    {
      name: "Est. Value",
      cell: (row) => (
        <span className="uom-cell-primary">
          {money(row.items?.reduce((s, it) => s + (it.estValue || 0), 0))}
        </span>
      ),
    },
    { name: "Status", width: "120px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
    {
      name: "Actions",
      right: true,
      width: "180px",
      cell: (row) =>
        row.status === "pending" &&
        canApprove && (
          <div className="d-flex gap-2">
            <Button size="sm" color="success" onClick={() => handleApprove(row._id)}>
              Approve
            </Button>
            <Button size="sm" color="danger" outline onClick={() => setRejectTarget(row)}>
              Reject
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Asset Write-off / Scrap Requests</h4>
          <p>Submit a request to write off, scrap, or sell capitalized assets</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> Create Write-off Request
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={requests}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No write-off requests yet</div>}
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-1">Create Write-off Request</h5>
          <p className="text-muted small mb-3">
            Submit a request to write off or scrap a capitalized asset
          </p>

          <h6 className="fw-semibold mb-3">Basic Details</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Scrap Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Col>
            <Col md={6} className="mb-3">
              <Label>Source Site</Label>
              <Input type="select" value={centerId} onChange={(e) => handleCenterChange(e.target.value)}>
                <option value="">Select source site</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>Scrap Description</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe why these assets are being written off..."
          />

          <h6 className="fw-semibold mb-3">Write-off Items</h6>
          {items.map((it, idx) => (
            <div key={idx} className="uom-table-card p-3 mb-3">
              <div className="d-flex justify-content-between mb-2">
                <div className="fw-semibold small">Item #{idx + 1}</div>
                <Button size="sm" color="light" disabled={items.length === 1} onClick={() => removeItem(idx)}>
                  <i className="bx bx-trash text-danger"></i>
                </Button>
              </div>
              <Row>
                <Col md={6} className="mb-2">
                  <Label className="small">Item</Label>
                  <Input
                    type="select"
                    value={it.assetId}
                    disabled={!centerId}
                    onChange={(e) => updateItem(idx, "assetId", e.target.value)}
                  >
                    <option value="">{!centerId ? "Select site first" : "Select asset"}</option>
                    {assets.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.assetName} ({a.assetTag})
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={3} className="mb-2">
                  <Label className="small">Disposal Type</Label>
                  <Input
                    type="select"
                    value={it.disposalType}
                    onChange={(e) => updateItem(idx, "disposalType", e.target.value)}
                  >
                    <option value="write_off">Write-off / Scrap</option>
                    <option value="sale">Sale</option>
                  </Input>
                </Col>
                <Col md={3} className="mb-2">
                  <Label className="small">Est. Value</Label>
                  <Input
                    type="number"
                    min={0}
                    value={it.estValue}
                    onChange={(e) => updateItem(idx, "estValue", e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={it.disposalType === "sale" ? 6 : 12} className="mb-2">
                  <Label className="small">Write-off Reason</Label>
                  <Input value={it.reason} onChange={(e) => updateItem(idx, "reason", e.target.value)} />
                </Col>
                {it.disposalType === "sale" && (
                  <Col md={6} className="mb-2">
                    <Label className="small">Buyer Name</Label>
                    <Input
                      value={it.buyerName}
                      onChange={(e) => updateItem(idx, "buyerName", e.target.value)}
                    />
                  </Col>
                )}
              </Row>
            </div>
          ))}

          <div className="mb-3">
            <Button color="light" size="sm" onClick={addItem}>
              <i className="bx bx-plus me-1"></i> Add another item
            </Button>
          </div>

          <div className="uom-table-card p-3 mb-4" style={{ maxWidth: 320, marginLeft: "auto" }}>
            <div className="d-flex justify-content-between">
              <span className="text-muted small">Total estimated value</span>
              <span className="fw-bold">{money(totalEstValue)}</span>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Submit Request"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={!!rejectTarget} toggle={() => setRejectTarget(null)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-3">Reject Request</h5>
          <Label>Reason</Label>
          <Input
            type="textarea"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmReject}>
              Reject
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AssetWriteOffRequest;