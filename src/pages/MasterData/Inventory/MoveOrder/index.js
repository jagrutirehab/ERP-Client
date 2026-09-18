import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getMoveOrders,
  createMoveOrder,
  getStorageLocations,
  getStockBalances,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const MoveOrder = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "MOVE_ORDER", "WRITE");

  const [moveOrders, setMoveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [allLocations, setAllLocations] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getStorageLocations({ status: "active" })
      .then((res) => setAllLocations(res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMoveOrders()
      .then((res) => {
        if (!cancelled) setMoveOrders(res?.data || []);
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
    setItemName("");
    setQuantity(1);
    setFromLocationId("");
    setToLocationId("");
    setRemarks("");
    setAvailableItems([]);
    setModalOpen(true);
  };

  const handleSwap = () => {
    setFromLocationId(toLocationId);
    setToLocationId(fromLocationId);
  };

  const handleSourceLocationChange = (locationId) => {
    setFromLocationId(locationId);
    setItemName("");
    const location = allLocations.find((l) => l._id === locationId);
    const centerId = location?.centerId?._id || location?.centerId;
    if (!centerId) {
      setAvailableItems([]);
      return;
    }
    getStockBalances({ centerId })
      .then((res) => setAvailableItems(res?.data || []))
      .catch(() => setAvailableItems([]));
  };

  const handleSubmit = async () => {
    if (!itemName.trim() || !fromLocationId || !toLocationId) {
      return toast.error("Fill in all required fields");
    }
    if (fromLocationId === toLocationId) {
      return toast.error("Source and Destination location must differ");
    }

    const sourceLocation = allLocations.find((l) => l._id === fromLocationId);
    const destLocation = allLocations.find((l) => l._id === toLocationId);
    const sourceCenterId = sourceLocation?.centerId?._id || sourceLocation?.centerId;
    const destCenterId = destLocation?.centerId?._id || destLocation?.centerId;
    if (sourceCenterId !== destCenterId) {
      return toast.error(
        "Source and Destination must be in the same center (use Inventory Transfer for cross-center moves)",
      );
    }

    setSubmitting(true);
    try {
      await createMoveOrder({
        centerId: sourceCenterId,
        itemName,
        quantity: Number(quantity),
        fromLocationId,
        toLocationId,
        remarks,
      });
      toast.success("Move order recorded successfully");
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
    { name: "Move #", selector: (row) => row.moveOrderNumber, sortable: true, width: "160px" },
    { name: "Item", selector: (row) => row.itemName },
    {
      name: "Center",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>,
    },
    {
      name: "From → To",
      cell: (row) => (
        <span className="uom-cell-muted">
          {row.fromLocationId?.name || "—"} → {row.toLocationId?.name || "—"}
        </span>
      ),
    },
    { name: "Qty", width: "80px", selector: (row) => row.quantity },
    {
      name: "Date",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Move Orders</h4>
          <p>Internal movement within the same warehouse</p>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        {canCreate && (
          <Button color="primary" onClick={openModal}>
            <i className="bx bx-plus me-1"></i> New Move Order
          </Button>
        )}
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={moveOrders}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No move orders yet</div>}
        />
      </div>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalBody className="p-4">
          <h5 className="mb-1">Create Move Order Request</h5>
          <p className="text-muted small mb-3">
            {allLocations.length} active locations · search by name or code
          </p>

          <Row className="align-items-end mb-3">
            <Col md={5}>
              <Label>Source Location</Label>
              <Input
                type="select"
                value={fromLocationId}
                onChange={(e) => handleSourceLocationChange(e.target.value)}
              >
                <option value="">Select source location</option>
                {allLocations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.code}) — {l.centerId?.title}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={2} className="text-center">
              <Button color="light" onClick={handleSwap} title="Swap">
                <i className="bx bx-transfer-alt"></i> Swap
              </Button>
            </Col>
            <Col md={5}>
              <Label>Destination Location</Label>
              <Input
                type="select"
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
              >
                <option value="">Select destination location</option>
                {allLocations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.code}) — {l.centerId?.title}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>Item Description</Label>
          <Input
            type="select"
            className="mb-3"
            value={itemName}
            disabled={!fromLocationId}
            onChange={(e) => setItemName(e.target.value)}
          >
            <option value="">
              {!fromLocationId
                ? "Select source location first"
                : availableItems.length === 0
                  ? "No item available for this location"
                  : "Select item"}
            </option>
            {availableItems.map((s) => (
              <option key={s._id} value={s.itemName}>
                {s.itemName} (Available: {s.quantity})
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

          <Label>Remarks (optional)</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Move"}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MoveOrder;