import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getInventoryTransfers,
  createInventoryTransfer,
  getAllCenters,
  getStockBalances,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const InventoryTransfer = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "INVENTORY_TRANSFER", "WRITE");

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fromCenterId, setFromCenterId] = useState("");
  const [toCenterId, setToCenterId] = useState("");
  const [expectedDispatch, setExpectedDispatch] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState([{ itemName: "", quantity: 1 }]);
  const [availableStock, setAvailableStock] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInventoryTransfers()
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

  const openModal = () => {
    setTitle("");
    setFromCenterId("");
    setToCenterId("");
    setExpectedDispatch("");
    setRemarks("");
    setLines([{ itemName: "", quantity: 1 }]);
    setAvailableStock([]);
    setModalOpen(true);
  };

  const handleFromCenterChange = (centerId) => {
    setFromCenterId(centerId);
    setLines([{ itemName: "", quantity: 1 }]);
    if (!centerId) {
      setAvailableStock([]);
      return;
    }
    getStockBalances({ centerId })
      .then((res) => setAvailableStock(res?.data || []))
      .catch(() => {});
  };

  const updateLine = (idx, field, value) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    );
  };
  const addLine = () =>
    setLines((prev) => [...prev, { itemName: "", quantity: 1 }]);
  const removeLine = (idx) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!fromCenterId || !toCenterId) return toast.error("Select both centers");
    if (fromCenterId === toCenterId)
      return toast.error("From and To center must differ");
    if (lines.some((l) => !l.itemName.trim() || Number(l.quantity) <= 0)) {
      return toast.error("Fill in all line items with valid quantity");
    }

    setSubmitting(true);
    try {
      await createInventoryTransfer({
        title,
        fromCenterId,
        toCenterId,
        expectedDispatch: expectedDispatch || undefined,
        remarks,
        lineItems: lines.map((l) => ({
          itemName: l.itemName,
          quantity: Number(l.quantity),
        })),
      });
      toast.success("Inventory transfer completed successfully");
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      name: "Transfer #",
      selector: (row) => row.transferNumber,
      sortable: true,
      width: "160px",
    },
    {
      name: "From",
      cell: (row) => (
        <span className="uom-cell-muted">{row.fromCenterId?.title || "—"}</span>
      ),
    },
    {
      name: "To",
      cell: (row) => (
        <span className="uom-cell-muted">{row.toCenterId?.title || "—"}</span>
      ),
    },
    {
      name: "Items",
      width: "90px",
      cell: (row) => (
        <span className="uom-cell-muted">{row.lineItems?.length || 0}</span>
      ),
    },
    {
      name: "Date",
      cell: (row) => (
        <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Inventory Transfer</h4>
          <p>Move stock between warehouses / branches</p>
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
          noDataComponent={
            <div className="uom-empty-state">No transfers yet</div>
          }
        />
      </div>

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          <h5 className="mb-3">New Inventory Transfer</h5>
          <Label>Transfer Title</Label>
          <Input
            className="mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Row>
            <Col md={6} className="mb-3">
              <Label>Source Site</Label>
              <Input
                type="select"
                value={fromCenterId}
                onChange={(e) => handleFromCenterChange(e.target.value)}
              >
                <option value="">Select center</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6} className="mb-3">
              <Label>Destination Site</Label>
              <Input
                type="select"
                value={toCenterId}
                onChange={(e) => setToCenterId(e.target.value)}
              >
                <option value="">Select center</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>Transfer Items</Label>
          {!fromCenterId && (
            <div className="text-muted small mb-2">
              Please select a source site first
            </div>
          )}
          {lines.map((l, idx) => {
            const stockRow = availableStock.find(
              (s) => s.itemName === l.itemName,
            );
            const availableQty = stockRow?.quantity ?? 0;
            return (
              <Row key={idx} className="mb-2">
                <Col md={5}>
                  <Input
                    type="select"
                    value={l.itemName}
                    disabled={!fromCenterId}
                    onChange={(e) =>
                      updateLine(idx, "itemName", e.target.value)
                    }
                  >
                    <option value="">Select item</option>
                    {availableStock.map((s) => (
                      <option key={s._id} value={s.itemName}>
                        {s.itemName} (Available: {s.quantity})
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={2}>
                  <Input value={l.itemName ? availableQty : "N/A"} disabled />
                </Col>
                <Col md={3}>
                  <Input
                    type="number"
                    min={1}
                    max={availableQty || undefined}
                    placeholder="Qty to transfer"
                    value={l.quantity}
                    onChange={(e) =>
                      updateLine(idx, "quantity", e.target.value)
                    }
                  />
                </Col>
                <Col md={2}>
                  <Button
                    color="light"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(idx)}
                  >
                    <i className="bx bx-trash text-danger"></i>
                  </Button>
                </Col>
              </Row>
            );
          })}
          <div className="mb-3">
            <Button color="light" size="sm" onClick={addLine}>
              <i className="bx bx-plus me-1"></i> Add line
            </Button>
          </div>

          <Label>Expected Dispatch</Label>
          <Input
            type="date"
            className="mb-3"
            value={expectedDispatch}
            onChange={(e) => setExpectedDispatch(e.target.value)}
          />

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              color="light"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Transfer"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default InventoryTransfer;
