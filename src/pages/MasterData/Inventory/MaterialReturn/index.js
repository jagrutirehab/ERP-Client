import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label } from "reactstrap";
import { toast } from "react-toastify";
import {
  getStockLedger,
  createMaterialReturn,
  getAllCenters,
  getStockBalances,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

const MaterialReturn = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "MATERIAL_RETURN", "WRITE");
  
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [centers, setCenters] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [centerId, setCenterId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllCenters()
      .then((res) => setCenters(res?.payload || res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStockLedger({ referenceType: "material_return" })
      .then((res) => {
        if (!cancelled) setReturns(res?.data || []);
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
    setCenterId("");
    setItemName("");
    setQuantity("");
    setRemarks("");
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
    if (!centerId || !itemName.trim() || !quantity) return toast.error("Fill in all required fields");
    const qty = Number(quantity);
    if (!qty || qty <= 0) return toast.error("Enter a valid quantity");

    setSubmitting(true);
    try {
      await createMaterialReturn({ itemName, centerId, quantity: qty, remarks });
      toast.success("Material return recorded successfully");
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
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.transactionDate)}</span>,
      width: "180px",
    },
    { name: "Item", selector: (row) => row.itemName },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "Qty Returned",
      width: "120px",
      cell: (row) => <span className="text-success fw-semibold">+{row.quantity}</span>,
    },
    { name: "Balance After", width: "120px", selector: (row) => row.balanceAfter },
    { name: "Reference", cell: (row) => <span className="uom-cell-muted small">{row.referenceNumber}</span> },
    { name: "Remarks", cell: (row) => <span className="uom-cell-muted small">{row.remarks || "—"}</span> },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Material Returns</h4>
          <p>Unused or defective stock returned to inventory</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Return
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={returns}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No material returns yet</div>}
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered>
        <ModalBody className="p-4">
          <h5 className="mb-3">Return Material</h5>

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

          <Label>Item</Label>
          <Input
            type="select"
            className="mb-3"
            value={itemName}
            disabled={!centerId}
            onChange={(e) => setItemName(e.target.value)}
          >
            <option value="">{!centerId ? "Select site first" : "Select item (or type below)"}</option>
            {stockOptions.map((s) => (
              <option key={s._id} value={s.itemName}>
                {s.itemName} (Current: {s.quantity})
              </option>
            ))}
          </Input>

          <Label>Quantity</Label>
          <Input
            type="number"
            min={1}
            className="mb-3"
            value={quantity}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Unused, returned by Nursing department"
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Return"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MaterialReturn;