import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getAssetScans,
  getAssetScan,
  actOnAssetScan,
  updateAssetScan,
  bulkActOnAssetScans,
  getVerificationJobs,
  getAssetCategories,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useReferenceList } from "../../../../Components/Hooks/useReferenceData";
import { useDebounce } from "../../../../Components/Hooks/useDebounce";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import {
  DASH,
  ScanStatusPill,
  SCAN_STATUS,
  TAG_STATUS_LABEL,
  categoryPath,
  dateTimeFmt,
  errText,
  useBusy,
} from "../shared/assetUi";
import CategoryLevelSelect, { EMPTY_CATEGORY } from "../shared/CategoryLevelSelect";
import "../../UnitOfMeasurement/uom.scss";

const ACTION_TEXT = {
  verify: { button: "Verify", done: "Verify", color: "success" },
  reject: { button: "Reject", done: "Reject", color: "danger" },
  halt: { button: "Halt", done: "Halt", color: "secondary" },
  reconcile: { button: "Reconcile", done: "Reconcile", color: "primary" },
};

const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: SCAN_STATUS.pending.label },
  { key: "verified", label: SCAN_STATUS.verified.label },
  { key: "rejected", label: SCAN_STATUS.rejected.label },
  { key: "halted", label: SCAN_STATUS.halted.label },
];

const canVerify = (row) => row.status === "pending";
// a waiting or halted verification can be edited; a verified or rejected one cannot
const canEditRow = (row) => row.status === "pending" || row.status === "halted";
const idOf = (v) => (v && typeof v === "object" ? v._id : v || "");
const canReconcile = (row) => row.status === "verified" && !row.isReconciled;

const Badge = ({ children, bg, color }) => (
  <span
    style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}
  >
    {children}
  </span>
);

const Field = ({ label, value }) => (
  <div className="col-sm-6">
    <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
    <div className="fw-semibold" style={{ fontSize: 14 }}>{value || DASH}</div>
  </div>
);

const ScanIntake = () => {
  const handleAuthError = useAuthError();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canAdd = hasPermission("MASTERDATA", "ASSET_SCAN", "WRITE");
  const canReview = hasPermission("MASTERDATA", "ASSET_SCAN", "DELETE");

  const { items: centers } = useReferenceList("centers");
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [tab, setTab] = useState("");
  const [filters, setFilters] = useState({ jobId: "", centerId: "", category: "", tagStatus: "", reconciled: "" });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [resetPage, setResetPage] = useState(false);
  const goFirstPage = () => {
    setPage(1);
    setResetPage((r) => !r);
  };

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, verified: 0, rejected: 0, halted: 0 });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [selected, setSelected] = useState([]);
  const [clearToggle, setClearToggle] = useState(false);

  // one request at a time for every action on this screen
  const [acting, runAction] = useBusy();
  const [reasonModal, setReasonModal] = useState(null); // { action, ids, label }
  const [reason, setReason] = useState("");
  const [resultModal, setResultModal] = useState(null); // { action, message, done, failed, results }
  const [detail, setDetail] = useState(null); // { id, loading, error, data, warnings }

  // edit a waiting or halted verification
  const [editModal, setEditModal] = useState(null); // the scan being edited
  const [editForm, setEditForm] = useState(null);
  const [editCategory, setEditCategory] = useState(EMPTY_CATEGORY);
  const [savingEdit, runSaveEdit] = useBusy();

  useEffect(() => {
    getVerificationJobs({})
      .then((res) => setJobs(res?.data || []))
      .catch(() => {});
    getAssetCategories({ level: 1, status: "active" })
      .then((res) => setCategories(res?.data || []))
      .catch(() => {});
  }, []);

  const refresh = useCallback(() => setRefreshFlag((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    const base = {
      jobId: filters.jobId || undefined,
      centerId: filters.centerId || undefined,
      category: filters.category || undefined,
      tagStatus: filters.tagStatus || undefined,
      reconciled: filters.reconciled || undefined,
      search: debouncedSearch.trim() || undefined,
    };
    // the tab counts must not depend on the tab itself, so they come from their own request
    Promise.all([
      getAssetScans({ ...base, status: tab || undefined, page, limit: perPage }),
      getAssetScans({ ...base, limit: 1 }),
    ])
      .then(([list, counts]) => {
        if (cancelled) return;
        setRows(list?.data || []);
        setTotal(list?.total || 0);
        setStatusCounts({ pending: 0, verified: 0, rejected: 0, halted: 0, ...(counts?.statusCounts || {}) });
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) setLoadError(errText(error, "The verifications could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filters, debouncedSearch, page, perPage, refreshFlag]);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    goFirstPage();
  };
  const clearSelection = () => {
    setSelected([]);
    setClearToggle((t) => !t);
  };
  const clearFilters = () => {
    setFilters({ jobId: "", centerId: "", category: "", tagStatus: "", reconciled: "" });
    setSearch("");
    setTab("");
    goFirstPage();
  };
  const filtersOn = tab || search || Object.values(filters).some(Boolean);

  const loadDetail = (id) => {
    setDetail((d) => ({ ...(d && d.id === id ? d : {}), id, loading: true, error: "" }));
    getAssetScan(id)
      .then((res) => setDetail({ id, loading: false, error: "", data: res?.data, warnings: res?.warnings || [] }))
      .catch((error) => {
        if (handleAuthError(error)) setDetail(null);
        else setDetail({ id, loading: false, error: errText(error, "The verification could not be loaded.") });
      });
  };

  // ----- one scan -----
  const runOne = (row, action, why) =>
    runAction(async () => {
      try {
        const res = await actOnAssetScan(row._id, action, why ? { reason: why } : {});
        toast.success(res?.message || `${ACTION_TEXT[action].done} done`);
        (res?.warnings || []).forEach((w) => toast.warn(w.message || String(w)));
        setReasonModal(null);
        setReason("");
        refresh();
        if (detail?.id === row._id) loadDetail(row._id);
        return true;
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
        refresh();
        return false;
      }
    });

  // ----- selected scans -----
  const runMany = (action, ids, why) =>
    runAction(async () => {
      try {
        const res = await bulkActOnAssetScans({ action, ids, reason: why || undefined });
        setReasonModal(null);
        setReason("");
        clearSelection();
        refresh();
        setResultModal({ action, message: res?.message, done: res?.done, failed: res?.failed, results: res?.results || [] });
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
      }
    });

  const openEdit = (scan) => {
    setEditModal(scan);
    setEditForm({
      quantity: scan.quantity ?? "",
      tagNumber: scan.tagNumber || "",
      oldTagNumber: scan.oldTagNumber || "",
      tagStatus: scan.tagStatus || "",
      roomNo: scan.roomNo || "",
      floorNo: scan.floorNo || "",
      remarks: scan.remarks || "",
    });
    setEditCategory({
      categoryL1: idOf(scan.categoryL1),
      categoryL2: idOf(scan.categoryL2),
      categoryL3: idOf(scan.categoryL3),
      categoryL4: idOf(scan.categoryL4),
    });
  };

  const handleSaveEdit = () =>
    runSaveEdit(async () => {
      if (!editCategory.categoryL1) return toast.error("Category level 1 is required. Choose a category before saving");
      try {
        const res = await updateAssetScan(editModal._id, {
          categoryL1: editCategory.categoryL1,
          categoryL2: editCategory.categoryL2 || "",
          categoryL3: editCategory.categoryL3 || "",
          categoryL4: editCategory.categoryL4 || "",
          quantity: editForm.quantity === "" ? undefined : Number(editForm.quantity),
          tagNumber: editForm.tagNumber.trim(),
          oldTagNumber: editForm.oldTagNumber.trim(),
          tagStatus: editForm.tagStatus,
          roomNo: editForm.roomNo.trim(),
          floorNo: editForm.floorNo.trim(),
          remarks: editForm.remarks.trim(),
        });
        toast.success(res?.message || "Verification updated successfully");
        (res?.warnings || []).forEach((w) => toast.warn(w.message || String(w)));
        const id = editModal._id;
        setEditModal(null);
        refresh();
        if (detail?.id === id) loadDetail(id);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
        refresh();
      }
    });

  const startAction = (row, action) => {
    if (action === "reject" || action === "halt") {
      setReason("");
      setReasonModal({ action, ids: [row._id], label: row.scanCode });
    } else {
      runOne(row, action);
    }
  };
  const startBulk = (action) => {
    if (selected.length === 0) return toast.error("Select at least one verification");
    if (selected.length > 200) return toast.error("You can act on at most 200 verifications at a time");
    setReason("");
    setReasonModal({ action, ids: selected.map((r) => r._id), label: `${selected.length} selected verification(s)`, bulk: true });
  };
  const confirmReasonModal = () => {
    const m = reasonModal;
    if (m.bulk) return runMany(m.action, m.ids, reason.trim());
    const row = rows.find((r) => r._id === m.ids[0]) || { _id: m.ids[0] };
    return runOne(row, m.action, reason.trim());
  };

  const columns = [
    {
      name: "Verification",
      sortable: false,
      width: "150px",
      cell: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div className="fw-semibold" style={{ fontFamily: "monospace", fontSize: 13 }}>{row.scanCode}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{row.jobId?.jobCode || DASH}</div>
        </div>
      ),
    },
    {
      name: "Category",
      minWidth: "200px",
      cell: (row) => <span className="uom-cell-primary" style={{ fontSize: 13 }}>{categoryPath(row)}</span>,
    },
    { name: "Qty", width: "70px", right: true, cell: (row) => <span className="fw-semibold">{row.quantity}</span> },
    {
      name: "Tag",
      minWidth: "150px",
      cell: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontFamily: "monospace", fontSize: 13 }}>{row.tagNumber || DASH}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {row.tagStatus ? TAG_STATUS_LABEL[row.tagStatus] : ""}
            {row.oldTagNumber ? ` · old ${row.oldTagNumber}` : ""}
          </div>
        </div>
      ),
    },
    {
      name: "Found at",
      minWidth: "150px",
      cell: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div className="uom-cell-muted">{row.centerId?.title || DASH}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {[row.roomNo && `Room ${row.roomNo}`, row.floorNo && `Floor ${row.floorNo}`].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    {
      name: "Status",
      minWidth: "190px",
      cell: (row) => (
        <div className="d-flex flex-column align-items-start gap-1 py-1">
          <ScanStatusPill status={row.status} />
          <div className="d-flex gap-1">
            {row.inRegister && <Badge bg="#ecfdf3" color="#027a48">In register</Badge>}
            {row.isReconciled && <Badge bg="#eef2ff" color="#4f46e5">Reconciled</Badge>}
          </div>
        </div>
      ),
    },
    {
      name: "Recorded",
      minWidth: "150px",
      cell: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div className="uom-cell-muted small">{dateTimeFmt(row.scannedAt)}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{row.scannedBy?.name || DASH}</div>
        </div>
      ),
    },
    {
      name: "",
      right: true,
      minWidth: "300px",
      cell: (row) => (
        <div className="d-flex flex-wrap justify-content-end gap-1">
          {canReview && canVerify(row) && (
            <>
              <Button size="sm" color="success" disabled={acting} onClick={() => startAction(row, "verify")}>Verify</Button>
              <Button size="sm" color="danger" outline disabled={acting} onClick={() => startAction(row, "reject")}>Reject</Button>
              <Button size="sm" color="secondary" outline disabled={acting} onClick={() => startAction(row, "halt")}>Halt</Button>
            </>
          )}
          {canReview && canReconcile(row) && (
            <Button size="sm" color="primary" disabled={acting} onClick={() => startAction(row, "reconcile")}>Reconcile</Button>
          )}
          {canAdd && canEditRow(row) && (
            <Button size="sm" color="light" disabled={acting} onClick={() => openEdit(row)}>Edit</Button>
          )}
          <Button size="sm" color="light" onClick={() => loadDetail(row._id)}>View</Button>
        </div>
      ),
    },
  ];

  const tabCount = (key) =>
    key === "" ? statusCounts.pending + statusCounts.verified + statusCounts.rejected + statusCounts.halted : statusCounts[key] || 0;

  const modalAction = reasonModal ? ACTION_TEXT[reasonModal.action] : null;

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Verifications</h4>
          <p>Things found during verification jobs. Verifying an entry puts it in the Fixed Asset Register.</p>
        </div>
        {canAdd && (
          <Button color="primary" onClick={() => navigate("/vendor-management/asset-scan-add")}>
            <i className="bx bx-plus me-1"></i> Add Verification
          </Button>
        )}
      </div>

      {/* Status tabs, with the counts from the server */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key || "all"}
              type="button"
              onClick={() => {
                setTab(t.key);
                goFirstPage();
                clearSelection();
              }}
              style={{
                border: `1px solid ${on ? "#4f46e5" : "#e5e7eb"}`,
                background: on ? "#eef2ff" : "#fff",
                color: on ? "#4f46e5" : "#495057",
                borderRadius: 999,
                padding: "5px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label} <span style={{ opacity: 0.75 }}>({tabCount(t.key)})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        <div className="uom-search-wrap" style={{ maxWidth: 260 }}>
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search job code, scan code, tag, room..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              goFirstPage();
            }}
          />
        </div>
        <Input type="select" style={{ width: 190, maxWidth: "100%", textOverflow: "ellipsis" }} value={filters.jobId} onChange={setFilter("jobId")}>
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id} title={`${j.jobCode} - ${j.jobName}`}>{j.jobCode} - {j.jobName}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 170 }} value={filters.centerId} onChange={setFilter("centerId")}>
          <option value="">All centers</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 170 }} value={filters.category} onChange={setFilter("category")}>
          <option value="">All categories</option>
          <option value="none">No category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 150 }} value={filters.tagStatus} onChange={setFilter("tagStatus")}>
          <option value="">Any tag status</option>
          {Object.entries(TAG_STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 150 }} value={filters.reconciled} onChange={setFilter("reconciled")}>
          <option value="">Reconciled: any</option>
          <option value="true">Reconciled</option>
          <option value="false">Not reconciled</option>
        </Input>
        {filtersOn && (
          <Button color="light" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      {/* Bulk actions */}
      {canReview && selected.length > 0 && (
        <div
          className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 px-3"
          style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10 }}
        >
          <span className="fw-semibold me-2">{selected.length} selected</span>
          <Button size="sm" color="success" disabled={acting} onClick={() => startBulk("verify")}>Verify selected</Button>
          <Button size="sm" color="danger" outline disabled={acting} onClick={() => startBulk("reject")}>Reject selected</Button>
          <Button size="sm" color="secondary" outline disabled={acting} onClick={() => startBulk("halt")}>Halt selected</Button>
          <Button size="sm" color="primary" disabled={acting} onClick={() => startBulk("reconcile")}>Reconcile selected</Button>
          <Button size="sm" color="light" className="ms-auto" onClick={clearSelection}>Clear selection</Button>
        </div>
      )}

      {loadError && (
        <div className="p-3 mb-3 d-flex align-items-center justify-content-between" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
          <span className="text-danger">{loadError}</span>
          <Button size="sm" color="light" onClick={refresh}>Try again</Button>
        </div>
      )}

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={rows}
          progressPending={loading}
          pagination
          paginationServer
          paginationResetDefaultPage={resetPage}
          paginationTotalRows={total}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[25, 50, 100]}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(n, p) => {
            setPerPage(n);
            setPage(p);
          }}
          selectableRows={canReview}
          onSelectedRowsChange={({ selectedRows }) => setSelected(selectedRows)}
          clearSelectedRows={clearToggle}
          highlightOnHover
          customStyles={{
            headCells: {
              style: { backgroundColor: "#f8f9fa", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3, color: "#6c757d" },
            },
            rows: { style: { minHeight: 62 } },
          }}
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">{filtersOn ? "No verifications match these filters" : "No verifications yet"}</p>
              <p className="uom-empty-sub">
                {filtersOn ? "Try a different tab or clear the filters." : "Use Add Verification to record what was found in a verification job."}
              </p>
            </div>
          }
        />
      </div>

      {/* Reject / halt (reason) and bulk confirmation */}
      <Modal isOpen={!!reasonModal} toggle={() => !acting && setReasonModal(null)} centered>
        <ModalBody className="p-4">
          {reasonModal && (
            <>
              <h5 className="mb-1">
                {modalAction.button} {reasonModal.bulk ? "selected verifications" : "verification"}
              </h5>
              <p className="text-muted small mb-3">{reasonModal.label}</p>
              {(reasonModal.action === "reject" || reasonModal.action === "halt") && (
                <>
                  <Label className="small">
                    Reason {reasonModal.action === "reject" ? <span className="text-danger">*</span> : <span className="text-muted">(optional)</span>}
                  </Label>
                  <Input
                    type="textarea"
                    rows={3}
                    className="mb-3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={reasonModal.action === "reject" ? "Why is this being rejected?" : "Why is this being halted?"}
                  />
                </>
              )}
              {reasonModal.action === "verify" && (
                <p className="mb-3">One register asset is created for each unit of every selected verification that is waiting for review.</p>
              )}
              {reasonModal.action === "reconcile" && (
                <p className="mb-3">Mark the selected verified verifications as matched with the register.</p>
              )}
              <div className="d-flex justify-content-end gap-2">
                <Button color="light" disabled={acting} onClick={() => setReasonModal(null)}>Cancel</Button>
                <Button
                  color={modalAction.color}
                  disabled={acting || (reasonModal.action === "reject" && !reason.trim())}
                  onClick={confirmReasonModal}
                >
                  {acting ? "Working..." : modalAction.button}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* Result of a bulk action: every scan, done or failed, with the reason */}
      <Modal isOpen={!!resultModal} toggle={() => setResultModal(null)} centered size="lg">
        <ModalBody className="p-4">
          {resultModal && (
            <>
              <h5 className="mb-1">{ACTION_TEXT[resultModal.action].button} selected: result</h5>
              <p className="mb-3">
                <span className="text-success fw-semibold">{resultModal.done} done</span>
                {" · "}
                <span className={resultModal.failed > 0 ? "text-danger fw-semibold" : "text-muted"}>{resultModal.failed} failed</span>
              </p>
              <div style={{ maxHeight: 380, overflowY: "auto", border: "1px solid #eef0f3", borderRadius: 8 }}>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 150 }}>Verification</th>
                      <th style={{ width: 90 }}>Result</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultModal.results.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: "monospace", fontSize: 13 }}>{r.scanCode || r.id}</td>
                        <td>
                          <span className={r.status === "done" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                            {r.status === "done" ? "Done" : "Failed"}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>
                          {r.message}
                          {(r.warnings || []).map((w, i) => (
                            <div key={i} className="text-warning" style={{ fontSize: 12 }}>{w.message}</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button color="primary" onClick={() => setResultModal(null)}>Close</Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* Edit a waiting or halted verification */}
      <Modal isOpen={!!editModal} toggle={() => !savingEdit && setEditModal(null)} centered size="lg">
        <ModalBody className="p-4">
          {editModal && editForm && (
            <>
              <h5 className="mb-1">Edit verification</h5>
              <p className="text-muted small mb-3" style={{ fontFamily: "monospace" }}>{editModal.scanCode}</p>
              {!editCategory.categoryL1 && (
                <div className="p-3 mb-3" style={{ background: "#fffaeb", border: "1px solid #fedf89", borderRadius: 10, color: "#93370d" }}>
                  This verification has no category. Choose one before it can be verified.
                </div>
              )}
              <CategoryLevelSelect value={editCategory} onChange={setEditCategory} required disabled={savingEdit} />
              <Row>
                <Col md={3} className="mb-3">
                  <Label className="small">Quantity</Label>
                  <Input type="number" min={1} step={1} value={editForm.quantity} onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))} />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Tag number</Label>
                  <Input value={editForm.tagNumber} onChange={(e) => setEditForm((f) => ({ ...f, tagNumber: e.target.value }))} />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Old tag number</Label>
                  <Input value={editForm.oldTagNumber} onChange={(e) => setEditForm((f) => ({ ...f, oldTagNumber: e.target.value }))} />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Tag status</Label>
                  <Input type="select" value={editForm.tagStatus} onChange={(e) => setEditForm((f) => ({ ...f, tagStatus: e.target.value }))}>
                    <option value="">Not given</option>
                    {Object.entries(TAG_STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Input>
                </Col>
              </Row>
              <Row>
                <Col md={3} className="mb-3">
                  <Label className="small">Room</Label>
                  <Input value={editForm.roomNo} onChange={(e) => setEditForm((f) => ({ ...f, roomNo: e.target.value }))} />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Floor</Label>
                  <Input value={editForm.floorNo} onChange={(e) => setEditForm((f) => ({ ...f, floorNo: e.target.value }))} />
                </Col>
                <Col md={6} className="mb-3">
                  <Label className="small">Remarks</Label>
                  <Input value={editForm.remarks} onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))} />
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button color="light" disabled={savingEdit} onClick={() => setEditModal(null)}>Cancel</Button>
                <Button color="primary" disabled={savingEdit} onClick={handleSaveEdit}>
                  {savingEdit ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* Detail */}
      <Modal isOpen={!!detail} toggle={() => setDetail(null)} centered size="lg">
        <ModalBody className="p-0">
          {detail && (
            <>
              <div className="d-flex align-items-center gap-3 p-4" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="flex-grow-1">
                  <h5 className="mb-1" style={{ fontFamily: "monospace" }}>{detail.data?.scanCode || "Verification"}</h5>
                  {detail.data && (
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <ScanStatusPill status={detail.data.status} />
                      {detail.data.inRegister && <Badge bg="#ecfdf3" color="#027a48">In register</Badge>}
                      {detail.data.isReconciled && <Badge bg="#eef2ff" color="#4f46e5">Reconciled</Badge>}
                    </div>
                  )}
                </div>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setDetail(null)} />
              </div>

              <div className="p-4">
                {detail.loading && !detail.data && <div className="text-muted">Loading...</div>}
                {detail.error && (
                  <div className="p-3 mb-3" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
                    <span className="text-danger">{detail.error}</span>{" "}
                    <button type="button" className="btn btn-link btn-sm p-0" onClick={() => loadDetail(detail.id)}>Try again</button>
                  </div>
                )}

                {detail.data && (() => {
                  const d = detail.data;
                  const sectionTitle = { fontSize: 12, fontWeight: 600, letterSpacing: 0.3, color: "#6c757d" };
                  return (
                    <>
                      {(detail.warnings || []).map((w, i) => (
                        <div key={i} className="p-3 mb-3" style={{ background: "#fffaeb", border: "1px solid #fedf89", borderRadius: 10 }}>
                          <i className="bx bx-error me-2" style={{ color: "#b54708" }}></i>
                          <span style={{ color: "#93370d" }}>{w.message}</span>
                        </div>
                      ))}

                      <div style={sectionTitle} className="mb-2">DETAILS</div>
                      <div className="row g-3 mb-4">
                        <Field label="Job" value={d.jobId ? `${d.jobId.jobCode} - ${d.jobId.jobName}` : ""} />
                        <Field label="Found at" value={d.centerId?.title} />
                        <div className="col-12"><Field label="Category" value={categoryPath(d)} /></div>
                        <Field label="Quantity" value={String(d.quantity)} />
                        <Field label="Room / Floor" value={[d.roomNo && `Room ${d.roomNo}`, d.floorNo && `Floor ${d.floorNo}`].filter(Boolean).join(" · ")} />
                        <Field label="Tag number" value={d.tagNumber} />
                        <Field label="Old tag number" value={d.oldTagNumber} />
                        <Field label="Tag status" value={d.tagStatus ? TAG_STATUS_LABEL[d.tagStatus] : ""} />
                        <Field label="Recorded" value={`${dateTimeFmt(d.scannedAt)}${d.scannedBy?.name ? ` by ${d.scannedBy.name}` : ""}`} />
                        {d.reviewedAt && <Field label="Decided" value={`${dateTimeFmt(d.reviewedAt)}${d.reviewedBy?.name ? ` by ${d.reviewedBy.name}` : ""}`} />}
                        {d.rejectionReason && <Field label="Rejection reason" value={d.rejectionReason} />}
                        {d.haltReason && <Field label="Halt reason" value={d.haltReason} />}
                        {d.isReconciled && <Field label="Reconciled" value={`${dateTimeFmt(d.reconciledAt)}${d.reconciledBy?.name ? ` by ${d.reconciledBy.name}` : ""}`} />}
                        <div className="col-12"><Field label="Remarks" value={d.remarks} /></div>
                      </div>

                      {d.status === "verified" && (
                        <>
                          <div style={sectionTitle} className="mb-2">ASSETS CREATED IN THE REGISTER ({(d.createdAssets || []).length})</div>
                          {(d.createdAssets || []).length === 0 ? (
                            <div className="text-muted mb-4" style={{ fontSize: 13 }}>No register assets are linked to this verification.</div>
                          ) : (
                            <table className="table table-sm mb-3">
                              <thead>
                                <tr><th>Asset number</th><th>Name</th><th>Status</th></tr>
                              </thead>
                              <tbody>
                                {d.createdAssets.map((a) => (
                                  <tr key={a._id}>
                                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>{a.assetTag}</td>
                                    <td>{a.assetName}</td>
                                    <td className="text-capitalize">{String(a.status || "").replace(/_/g, " ")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          {d.tagNumber && (
                            <div className="text-muted small mb-3">
                              {d.isTaggedToFar
                                ? `Tag ${d.tagNumber} is fitted to the first asset. The other units still need tags.`
                                : `Tag ${d.tagNumber} was not fitted to an asset.`}
                            </div>
                          )}
                        </>
                      )}

                      {((canAdd && canEditRow(d)) || (canReview && (canVerify(d) || canReconcile(d)))) && (
                        <div className="d-flex flex-wrap gap-2 justify-content-end">
                          {canAdd && canEditRow(d) && (
                            <Button color="light" disabled={acting} onClick={() => openEdit(d)}>Edit</Button>
                          )}
                          {canReview && (
                            <>
                          {canVerify(d) && (
                            <>
                              <Button color="success" disabled={acting} onClick={() => runOne({ _id: d._id }, "verify")}>Verify</Button>
                              <Button color="danger" outline disabled={acting} onClick={() => startAction({ _id: d._id, scanCode: d.scanCode }, "reject")}>Reject</Button>
                              <Button color="secondary" outline disabled={acting} onClick={() => startAction({ _id: d._id, scanCode: d.scanCode }, "halt")}>Halt</Button>
                            </>
                          )}
                          {canReconcile(d) && (
                            <Button color="primary" disabled={acting} onClick={() => runOne({ _id: d._id }, "reconcile")}>Reconcile</Button>
                          )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="d-flex justify-content-end px-4 py-3" style={{ background: "#fafbfc", borderTop: "1px solid #f1f3f5" }}>
                <Button color="light" onClick={() => setDetail(null)}>Close</Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ScanIntake;
