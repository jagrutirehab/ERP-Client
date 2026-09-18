import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getReorderRules,
  createReorderRule,
  deleteReorderRule,
  getReorderAlerts,
  getAllCenters,
  getVendors,
  getStockBalances,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const ReorderRule = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "REORDER_RULE", "WRITE");
  const canDelete = hasPermission("MASTERDATA", "REORDER_RULE", "DELETE");

  const [tab, setTab] = useState("rules");
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [centerId, setCenterId] = useState("");
  const [preferredVendorId, setPreferredVendorId] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [reorderQty, setReorderQty] = useState("");
  const [safetyStock, setSafetyStock] = useState("0");
  const [leadTimeDays, setLeadTimeDays] = useState("0");
  const [maxStockLevel, setMaxStockLevel] = useState("");
  const [remarks, setRemarks] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
    getVendors({})
      .then((res) => setVendors(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetcher = tab === "rules" ? getReorderRules() : getReorderAlerts();
    fetcher
      .then((res) => {
        if (cancelled) return;
        if (tab === "rules") setRules(res?.data || []);
        else setAlerts(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, refreshFlag]);

  const openModal = () => {
    setItemName("");
    setCenterId("");
    setPreferredVendorId("");
    setReorderLevel("");
    setReorderQty("");
    setSafetyStock("0");
    setLeadTimeDays("0");
    setMaxStockLevel("");
    setRemarks("");
    setActive(true);
    setStockOptions([]);
    setModalOpen(true);
  };

  const handleCenterChange = (id) => {
    setCenterId(id);
    setItemName("");
    if (!id) {
      setStockOptions([]);
      return;
    }
    getStockBalances({ centerId: id })
      .then((res) => setStockOptions(res?.data || []))
      .catch(() => setStockOptions([]));
  };

  const handleSubmit = async () => {
    if (!itemName.trim() || !centerId || reorderLevel === "" || reorderQty === "") {
      return toast.error("Fill in all required fields (Item, Site, Reorder Point, Reorder Qty)");
    }
    setSubmitting(true);
    try {
      await createReorderRule({
        itemName,
        centerId,
        preferredVendorId: preferredVendorId || undefined,
        reorderLevel: Number(reorderLevel),
        reorderQty: Number(reorderQty),
        safetyStock: Number(safetyStock) || 0,
        leadTimeDays: Number(leadTimeDays) || 0,
        maxStockLevel: maxStockLevel !== "" ? Number(maxStockLevel) : undefined,
        remarks,
        status: active ? "active" : "inactive",
      });
      toast.success("Reorder rule created successfully");
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

  const handleDelete = async (id) => {
    try {
      await deleteReorderRule(id);
      toast.success("Reorder rule deleted successfully");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Couldn't delete.");
      }
    }
  };

  const ruleColumns = [
    { name: "Item", selector: (row) => row.itemName, sortable: true },
    {
      name: "Site",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Preferred Vendor",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.preferredVendorId?.tradeName || row.preferredVendorId?.legalName || "—"}
        </span>
      ),
    },
    { name: "Reorder Pt", width: "110px", selector: (row) => row.reorderLevel },
    { name: "Reorder Qty", width: "110px", selector: (row) => row.reorderQty },
    { name: "Safety Stock", width: "110px", selector: (row) => row.safetyStock },
    { name: "Lead Time", width: "100px", cell: (row) => `${row.leadTimeDays || 0}d` },
    {
      name: "Status",
      width: "100px",
      cell: (row) => (
        <span className={`uom-status-pill ${row.status === "active" ? "status-active" : "status-inactive"}`}>
          <span className="dot"></span> {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      right: true,
      cell: (row) =>
        canDelete && (
          <Button size="sm" color="light" onClick={() => handleDelete(row._id)}>
            <i className="bx bx-trash text-danger"></i>
          </Button>
        ),
    },
  ];

  const alertColumns = [
    { name: "Item", selector: (row) => row.itemName, sortable: true },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Current Qty",
      cell: (row) => <span className="text-danger fw-semibold">{row.currentQty}</span>,
    },
    { name: "Reorder Level", width: "140px", selector: (row) => row.reorderLevel },
    { name: "Suggested Reorder Qty", width: "180px", selector: (row) => row.reorderQty },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Reorder Rules</h4>
          <p>Automatic alerts when stock falls below a set level</p>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <Button color={tab === "rules" ? "primary" : "light"} onClick={() => setTab("rules")}>
          Rules
        </Button>
        <Button color={tab === "alerts" ? "primary" : "light"} onClick={() => setTab("alerts")}>
          Active Alerts {alerts.length > 0 && `(${alerts.length})`}
        </Button>
      </div>

      {tab === "rules" && canCreate && (
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Rule
          </Button>
        </div>
      )}

      <div className="uom-table-card">
        <DataTable
          columns={tab === "rules" ? ruleColumns : alertColumns}
          data={tab === "rules" ? rules : alerts}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">
              {tab === "rules" ? "No reorder rules yet" : "No items below reorder level"}
            </div>
          }
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-3">Rule Configuration</h5>

          <Row>
            <Col md={6} className="mb-3">
              <Label>Site</Label>
              <Input
                type="select"
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
            </Col>
            <Col md={6} className="mb-3">
              <Label>Item</Label>
              <Input
                type="select"
                value={itemName}
                disabled={!centerId}
                onChange={(e) => setItemName(e.target.value)}
              >
                <option value="">{!centerId ? "Select site first" : "Select item"}</option>
                {stockOptions.map((s) => (
                  <option key={s._id} value={s.itemName}>
                    {s.itemName}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>Preferred Vendor</Label>
          <Input
            type="select"
            className="mb-4"
            value={preferredVendorId}
            onChange={(e) => setPreferredVendorId(e.target.value)}
          >
            <option value="">Select vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.tradeName || v.legalName}
              </option>
            ))}
          </Input>

          <h6 className="fw-semibold mb-3">Stock Parameters</h6>
          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Reorder Point <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
              />
            </Col>
            <Col md={6} className="mb-3">
              <Label>
                Reorder Quantity <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-3">
              <Label>Safety Stock</Label>
              <Input
                type="number"
                min={0}
                value={safetyStock}
                onChange={(e) => setSafetyStock(e.target.value)}
              />
            </Col>
            <Col md={4} className="mb-3">
              <Label>Lead Time (Days)</Label>
              <Input
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
              />
            </Col>
            <Col md={4} className="mb-3">
              <Label>Max Stock Level</Label>
              <Input
                type="number"
                min={0}
                value={maxStockLevel}
                onChange={(e) => setMaxStockLevel(e.target.value)}
              />
            </Col>
          </Row>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              id="reorderActiveSwitch"
            />
            <label className="form-check-label" htmlFor="reorderActiveSwitch">
              Active
            </label>
          </div>

          <Label>Remarks</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create Rule"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ReorderRule;