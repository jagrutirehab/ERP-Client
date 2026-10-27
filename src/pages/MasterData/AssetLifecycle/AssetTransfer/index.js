import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import {
  getAssetTransferRequests,
  createAssetTransferRequest,
  getFixedAssets,
  getStorageLocations,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useReferenceList } from "../../../../Components/Hooks/useReferenceData";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import { errText } from "../shared/assetUi";
import useConfirm from "../shared/useConfirm";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const CONDITIONS = [
  { value: "good", label: "Good" },
  { value: "needs_repair", label: "Needs Repair" },
  { value: "scrap", label: "Scrap" },
];

const NO_SITE = "none";

const emptyItem = () => ({
  assetId: "",
  condition: "good",
});

const AssetTransferRequest = () => {
  const handleAuthError = useAuthError();
  const [confirm, confirmDialog] = useConfirm();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ASSET_TRANSFER", "WRITE");

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [assets, setAssets] = useState([]);
  const { items: centers } = useReferenceList("centers");
  const [locations, setLocations] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fromCenterId, setFromCenterId] = useState("");
  const [toCenterId, setToCenterId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const assetReq = useRef(0);
  const [submitting, setSubmitting] = useState(false);

  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAssetTransferRequests({})
      .then((res) => {
        if (!cancelled) setTransfers(res?.data || []);
      })
      .catch((error) => {
        if (!cancelled && !handleAuthError(error)) toast.error(errText(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const openModal = () => {
    setTitle("");
    setFromCenterId("");
    setToCenterId("");
    setToLocationId("");
    setReason("");
    setRemarks("");
    setItems([emptyItem()]);
    setAssets([]);
    setLocations([]);
    setModalOpen(true);
  };

  const handleFromCenterChange = (id) => {
    setFromCenterId(id);
    setItems([emptyItem()]);
    if (!id) {
      assetReq.current++;
      setAssets([]);
      setAssetsLoading(false);
      return;
    }
    const req = ++assetReq.current;
    setAssetsLoading(true);
    const noSite = id === NO_SITE;
    getFixedAssets(noSite ? { status: "active" } : { centerId: id, status: "active" })
      .then((res) => {
        if (req !== assetReq.current) return;
        const list = res?.data || [];
        setAssets(
          list.filter(
            (a) => (noSite ? !a.centerId : true) && !a.assignedTo && !a.pendingWriteOff,
          ),
        );
      })
      .catch(() => {
        if (req === assetReq.current) setAssets([]);
      })
      .finally(() => {
        if (req === assetReq.current) setAssetsLoading(false);
      });
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

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim() || !fromCenterId || !toCenterId || !reason.trim()) {
      return toast.error(
        "Fill in Title, Source Site, Destination Site, and Reason",
      );
    }
    if (fromCenterId === toCenterId && !toLocationId) {
      return toast.error(
        "Source and Destination site are the same — pick a destination location too",
      );
    }
    const invalid = items.find((it) => !it.assetId);
    if (invalid) return toast.error("Select an asset for every item");
    const sameSpot = items
      .map((it) => assets.find((a) => a._id === it.assetId))
      .find(
        (a) =>
          a &&
          String(a.centerId?._id || "") === String(toCenterId) &&
          String(a.storageLocationId?._id || "") === String(toLocationId || ""),
      );
    if (sameSpot) {
      return toast.error(
        `${sameSpot.assetName} is already at that site and location`,
      );
    }
    const ok = await confirm({
      title: "Transfer assets",
      message: `Transfer ${items.length} asset(s) now? The assets move to the destination immediately.`,
      confirmText: "Transfer",
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      await createAssetTransferRequest({
        title,
        toCenterId,
        toLocationId: toLocationId || undefined,
        items: items.map((it) => ({
          assetId: it.assetId,
          condition: it.condition,
        })),
        reason,
        remarks,
      });
      toast.success("Asset(s) transferred successfully");
      setModalOpen(false);
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(errText(error));
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
      width: "150px",
    },
    {
      name: "Title",
      cell: (row) => <span title={row.title}>{row.title}</span>,
      wrap: true,
    },
    {
      name: "Items",
      width: "80px",
      cell: (row) => (
        <span className="uom-cell-muted">{row.items?.length || 0}</span>
      ),
    },
    {
      name: "Destination",
      cell: (row) => (
        <span className="uom-cell-muted small">
          {row.toCenterId?.title || "—"}
          {row.toLocationId ? ` (${row.toLocationId.name})` : ""}
        </span>
      ),
    },
    {
      name: "Reason",
      wrap: true,
      cell: (row) => (
        <span className="small text-muted" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      name: "Date",
      cell: (row) => (
        <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>
      ),
    },
    {
      name: "",
      right: true,
      width: "100px",
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
          <h4>Asset Transfer</h4>
          <p>
            Move assets to a new site or location — multi-item, with condition
            tracking
          </p>
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
            <div className="uom-empty-state">No asset transfers yet</div>
          }
        />
      </div>

      {confirmDialog}
      <Modal
        isOpen={modalOpen}
        toggle={() => !submitting && setModalOpen(false)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          <h5 className="mb-1">Transfer Assets</h5>
          <p className="text-muted small mb-3">
            Assets move to the destination as soon as you submit
          </p>

          <h6 className="fw-semibold mb-3">Basic Details</h6>
          <Label>
            Transfer Title <span className="text-danger">*</span>
          </Label>
          <Input
            className="mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Label>
            Source Site (assets will be pulled from here){" "}
            <span className="text-danger">*</span>
          </Label>
          <Input
            type="select"
            className="mb-3"
            value={fromCenterId}
            onChange={(e) => handleFromCenterChange(e.target.value)}
          >
            <option value="">Select source site</option>
            <option value={NO_SITE}>No site assigned</option>
            {centers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Input>

          <Row>
            <Col md={6} className="mb-3">
              <Label>
                Destination Site (To) <span className="text-danger">*</span>
              </Label>{" "}
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
                <option value="">
                  {!toCenterId ? "Select site first" : "Not specified"}
                </option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Label>
            Reason <span className="text-danger">*</span>
          </Label>
          <Input
            className="mb-4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <h6 className="fw-semibold mb-3">Transfer Items</h6>
          {items.map((it, idx) => {
            const asset = assets.find((a) => a._id === it.assetId);
            return (
              <div key={idx} className="uom-table-card p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold small">Item #{idx + 1}</div>
                  <Button
                    size="sm"
                    color="light"
                    disabled={items.length === 1}
                    onClick={() => removeItem(idx)}
                  >
                    <i className="bx bx-trash text-danger"></i>
                  </Button>
                </div>
                <Row>
                  <Col md={5} className="mb-2">
                    <Label className="small">
                      Asset <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      value={it.assetId}
                      disabled={!fromCenterId}
                      onChange={(e) =>
                        updateItem(idx, "assetId", e.target.value)
                      }
                    >
                      <option value="">
                        {!fromCenterId
                          ? "Select source site first"
                          : assetsLoading
                            ? "Loading assets..."
                            : assets.length === 0
                              ? "No eligible assets at this site"
                              : "Select asset"}
                      </option>
                      {assets
                        .filter(
                          (a) =>
                            a._id === it.assetId ||
                            !items.some((o, i) => i !== idx && o.assetId === a._id),
                        )
                        .map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.assetName} ({a.assetTag || a.serialNumber || "no tag"})
                          </option>
                        ))}
                    </Input>
                    {asset && (
                      <div className="text-muted small mt-1">
                        Current: {asset.centerId?.title || "—"}
                      </div>
                    )}
                  </Col>
                  <Col md={7} className="mb-2">
                    <Label className="small">Condition (record only)</Label>
                    <Input
                      type="select"
                      value={it.condition}
                      onChange={(e) =>
                        updateItem(idx, "condition", e.target.value)
                      }
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Input>
                  </Col>
                </Row>
              </div>
            );
          })}

          <div className="mb-3">
            <Button
              color="light"
              size="sm"
              onClick={addItem}
              disabled={!fromCenterId}
            >
              <i className="bx bx-plus me-1"></i> Add Item
            </Button>
          </div>

          <Label>Remarks</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-4"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="d-flex justify-content-end gap-2">
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
              {submitting ? "Transferring..." : "Create Transfer"}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={!!detailModal}
        toggle={() => setDetailModal(null)}
        centered
        size="lg"
      >
        <ModalBody className="p-4">
          {detailModal && (
            <>
              <h5 className="mb-1">{detailModal.title}</h5>
              <p className="text-muted small mb-3">
                {detailModal.transferNumber} · {detailModal.reason}
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Condition</th>
                      <th>Expected Dispatch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailModal.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.assetId?.assetName || "—"}</td>
                        <td className="small text-muted">
                          {it.fromCenterId?.title || "—"}
                          {it.fromLocationId
                            ? ` (${it.fromLocationId.name})`
                            : ""}
                        </td>
                        <td className="small text-primary fw-semibold">
                          {detailModal.toCenterId?.title || "—"}
                          {detailModal.toLocationId
                            ? ` (${detailModal.toLocationId.name})`
                            : ""}
                        </td>
                        <td className="text-capitalize small">
                          {it.condition?.replace("_", " ")}
                        </td>
                        <td className="small text-muted">
                          {dateFmt(it.expectedDispatchDate)}
                        </td>
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

export default AssetTransferRequest;
