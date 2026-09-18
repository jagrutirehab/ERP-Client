import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getStockAdjustments,
  createStockAdjustment,
  getAllCenters,
  getStockBalances,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const REASON_OPTIONS = [
  "Damage",
  "Loss",
  "Found (unrecorded stock)",
  "Expired",
  "Cycle count variance",
  "Other",
];

const emptyLine = () => ({
  itemName: "",
  type: "increase",
  reason: "",
  quantity: 1,
  remarks: "",
});

const StockAdjustment = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "STOCK_ADJUSTMENT", "WRITE");

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [centerId, setCenterId] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStockAdjustments()
      .then((res) => {
        if (!cancelled) setAdjustments(res?.data || []);
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
    setCenterId("");
    setDescription("");
    setLines([emptyLine()]);
    setStockOptions([]);
    setModalOpen(true);
  };

  const handleCenterChange = (id) => {
    setCenterId(id);
    setLines([emptyLine()]);
    if (!id) {
      setStockOptions([]);
      return;
    }
    getStockBalances({ centerId: id })
      .then((res) => setStockOptions(res?.data || []))
      .catch(() => setStockOptions([]));
  };

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!centerId) return toast.error("Select a site");
    const invalid = lines.find(
      (l) => !l.itemName.trim() || !l.reason.trim() || Number(l.quantity) <= 0,
    );
    if (invalid) return toast.error("Fill in Item, Reason and a valid Quantity for every line");

    setSubmitting(true);
    try {
      await createStockAdjustment({
        title,
        centerId,
        description,
        lineItems: lines.map((l) => ({
          itemName: l.itemName,
          type: l.type,
          reason: l.reason,
          quantity: Number(l.quantity),
          remarks: l.remarks,
        })),
      });
      toast.success("Stock adjustment applied successfully");
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
    { name: "Adjustment #", selector: (row) => row.adjustmentNumber, sortable: true, width: "160px" },
    { name: "Title", cell: (row) => <span className="uom-cell-primary">{row.title || "—"}</span> },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Items",
      width: "80px",
      cell: (row) => <span className="uom-cell-muted">{row.lineItems?.length || 0}</span>,
    },
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
    {
      name: "Actions",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => setDetailModal(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Stock Adjustments</h4>
          <p>Manual corrections to stock discrepancies</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Adjustment
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={adjustments}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No adjustments yet</div>}
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-3">Adjustment Information</h5>

          <Label>Title</Label>
          <Input
            className="mb-3"
            placeholder="e.g., Cycle Count Variance Adjustment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Label>Site</Label>
          <Input
            type="select"
            className="mb-3"
            value={centerId}
            onChange={(e) => handleCenterChange(e.target.value)}
          >
            <option value="">Select site</option>
            {centers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Input>

          <Label>Description</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Label className="fw-semibold">Adjustment Items</Label>
          {lines.map((l, idx) => (
            <div key={idx} className="uom-table-card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold small">Item #{idx + 1}</div>
                <Button
                  size="sm"
                  color="light"
                  disabled={lines.length === 1}
                  onClick={() => removeLine(idx)}
                >
                  <i className="bx bx-trash text-danger"></i>
                </Button>
              </div>
              <Row>
                <Col md={6} className="mb-2">
                  <Label className="small">
                    Item <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={l.itemName}
                    disabled={!centerId}
                    onChange={(e) => updateLine(idx, "itemName", e.target.value)}
                  >
                    <option value="">{!centerId ? "Select site first" : "Select item"}</option>
                    {stockOptions.map((s) => (
                      <option key={s._id} value={s.itemName}>
                        {s.itemName} (Current: {s.quantity})
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={3} className="mb-2">
                  <Label className="small">
                    Type <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={l.type}
                    onChange={(e) => updateLine(idx, "type", e.target.value)}
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </Input>
                </Col>
                <Col md={3} className="mb-2">
                  <Label className="small">
                    Quantity <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={l.quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-2">
                  <Label className="small">
                    Reason <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    value={l.reason}
                    onChange={(e) => updateLine(idx, "reason", e.target.value)}
                  >
                    <option value="">Select reason</option>
                    {REASON_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={6} className="mb-2">
                  <Label className="small">Remarks</Label>
                  <Input
                    value={l.remarks}
                    onChange={(e) => updateLine(idx, "remarks", e.target.value)}
                  />
                </Col>
              </Row>
            </div>
          ))}

          <div className="mb-4">
            <Button color="light" size="sm" onClick={addLine}>
              <i className="bx bx-plus me-1"></i> Add Item
            </Button>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create Adjustment"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} toggle={() => setDetailModal(null)} centered size="lg">
        <ModalBody className="p-4">
          {detailModal && (
            <>
              <h5 className="mb-1">{detailModal.adjustmentNumber}</h5>
              <p className="text-muted small mb-3">
                {detailModal.title} · {detailModal.centerId?.title}
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.lineItems.map((li, idx) => (
                      <tr key={idx}>
                        <td>{li.itemName}</td>
                        <td className={li.type === "increase" ? "text-success" : "text-danger"}>
                          {li.type === "increase" ? "Increase" : "Decrease"}
                        </td>
                        <td>{li.quantity}</td>
                        <td className="small text-muted">{li.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button color="light" onClick={() => setDetailModal(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default StockAdjustment;