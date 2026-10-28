import React, { useState, useEffect, useCallback } from "react";
import { Button, Input, Modal, ModalBody, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getAssetScans,
  getAssetScan,
  actOnAssetScan,
  updateAssetScan,
  uploadAssetScanImage,
  deleteAssetScanImage,
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
import PhotoPicker, { PhotoLightbox } from "../shared/PhotoPicker";
import "../../UnitOfMeasurement/uom.scss";

const ACTION_TEXT = {
  verify: { button: "Approve", done: "Approve", color: "success" },
  reject: { button: "Reject", done: "Reject", color: "danger" },
  halt: { button: "Halt", done: "Halt", color: "secondary" },
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
// the deepest category level that was chosen, or a dash
const deepestCategory = (row) =>
  [row?.categoryL4, row?.categoryL3, row?.categoryL2, row?.categoryL1].map((c) => c?.name).find(Boolean) || DASH;

// the photos saved for a verification (uploaded here, or filled in by an import)
const photosOf = (s) => (Array.isArray(s?.images) ? s.images.filter((i) => i && i.url) : []);
// For a verification that came from HiSYNC: how many photos exist there (nothing is fetched from HiSYNC)
const hisyncLine = (s) => {
  if (s?.source !== "external_import") return "";
  return s.externalImageCount > 0
    ? `${s.externalImageCount} photo(s) exist in HiSYNC. HiSYNC code: ${s.hisyncScanCode || DASH}`
    : "No photo was taken for this scan";
};

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
  const [filters, setFilters] = useState({ jobId: "", centerId: "", category: "", tagStatus: "", photo: "" });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const goFirstPage = () => setPage(1);
  const [showFilters, setShowFilters] = useState(false);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, verified: 0, rejected: 0, halted: 0 });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [selected, setSelected] = useState([]); // the cards that are ticked (kept while moving between pages)

  // one request at a time for every action on this screen
  const [acting, runAction] = useBusy();
  const [reasonModal, setReasonModal] = useState(null); // { action, ids, label }
  const [reason, setReason] = useState("");
  const [approveModal, setApproveModal] = useState(null); // { scan } for one, { bulk: true, ids } for selected
  const [resultModal, setResultModal] = useState(null); // { action, message, done, failed, results }
  const [detail, setDetail] = useState(null); // { id, loading, error, data, warnings }
  const [lightbox, setLightbox] = useState({ photos: [], index: null });

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
      photo: filters.photo || undefined,
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
  const clearSelection = () => setSelected([]);
  const toggleSelect = (row) =>
    setSelected((list) => (list.some((r) => r._id === row._id) ? list.filter((r) => r._id !== row._id) : [...list, row]));
  const clearFilters = () => {
    setFilters({ jobId: "", centerId: "", category: "", tagStatus: "", photo: "" });
    setSearch("");
    setTab("");
    goFirstPage();
  };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const filtersOn = tab || search || activeFilterCount > 0;

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

  // remove one saved photo (only while the verification is waiting for review or halted)
  const removePhoto = (scan, img) =>
    runAction(async () => {
      try {
        const res = await deleteAssetScanImage(scan._id, img.path);
        toast.success(res?.message || "Photo removed");
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
      }
      loadDetail(scan._id);
      refresh();
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
    } else if (action === "verify") {
      setApproveModal({ scan: row });
    } else {
      runOne(row, action);
    }
  };
  const startBulk = (action) => {
    if (selected.length === 0) return toast.error("Select at least one verification");
    if (selected.length > 200) return toast.error("You can act on at most 200 verifications at a time");
    if (action === "verify") return setApproveModal({ bulk: true, ids: selected.map((r) => r._id) });
    setReason("");
    setReasonModal({ action, ids: selected.map((r) => r._id), label: `${selected.length} selected verification(s)`, bulk: true });
  };
  // Approve (the API action is still "verify"): one click = one request; the popup closes when it is done
  const confirmApprove = () =>
    runAction(async () => {
      const m = approveModal;
      try {
        if (m.bulk) {
          const res = await bulkActOnAssetScans({ action: "verify", ids: m.ids });
          clearSelection();
          setResultModal({ action: "verify", message: res?.message, done: res?.done, failed: res?.failed, results: res?.results || [] });
        } else {
          const res = await actOnAssetScan(m.scan._id, "verify", {});
          toast.success(res?.message || "Verification approved");
          (res?.warnings || []).forEach((w) => toast.warn(w.message || String(w)));
        }
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
      }
      setApproveModal(null);
      refresh();
      if (!m.bulk && detail?.id === m.scan._id) loadDetail(m.scan._id);
    });

  const confirmReasonModal = () => {
    const m = reasonModal;
    if (m.bulk) return runMany(m.action, m.ids, reason.trim());
    const row = rows.find((r) => r._id === m.ids[0]) || { _id: m.ids[0] };
    return runOne(row, m.action, reason.trim());
  };

  // ----- one verification as a card -----
  const ACCENT = { pending: "#f79009", verified: "#12b76a", rejected: "#f04438", halted: "#98a2b3" };
  const renderCard = (row) => {
    const photos = photosOf(row);
    const title = deepestCategory(row);
    const path = categoryPath(row);
    const ticked = selected.some((r) => r._id === row._id);
    const place = [row.roomNo && `Room ${row.roomNo}`, row.floorNo && `Floor ${row.floorNo}`].filter(Boolean).join(" · ");
    return (
      <div key={row._id} className="scan-card" style={{ borderLeft: `4px solid ${ACCENT[row.status] || "#e5e7eb"}`, background: ticked ? "#f5f7ff" : "#fff" }}>
        {canReview && (
          <input type="checkbox" className="form-check-input scan-card-check" checked={ticked} onChange={() => toggleSelect(row)} aria-label={`Select ${row.scanCode}`} />
        )}
        <div className="scan-card-thumb" onClick={() => loadDetail(row._id)} role="button" aria-label="Open details">
          {photos[0] ? <img src={photos[0].url} alt="First photo" /> : <i className="bx bx-image-alt"></i>}
        </div>
        <div className="scan-card-body">
          <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div style={{ minWidth: 0 }}>
              <div className="scan-card-title" onClick={() => loadDetail(row._id)} role="button">
                {title === DASH ? <span className="text-danger">No category</span> : title}
              </div>
              {title !== DASH && path !== title && <div className="text-muted small">{path}</div>}
            </div>
            <ScanStatusPill status={row.status} />
          </div>

          <div className="scan-card-facts">
            <span className="scan-chip"><b>{row.quantity}</b> {Number(row.quantity) === 1 ? "unit" : "units"}</span>
            <span className="scan-chip" style={{ fontFamily: "monospace" }}>{row.tagNumber ? `Tag ${row.tagNumber}` : "No tag"}</span>
            {place && <span className="scan-chip">{place}</span>}
            <span className="scan-chip">{photos.length > 0 ? `${photos.length} photo(s)` : "No photo"}</span>
          </div>

          <div className="text-muted small">
            {row.jobId?.jobCode || DASH} · {row.centerId?.title || DASH} · {dateTimeFmt(row.scannedAt)}
            {row.scannedBy?.name ? ` · ${row.scannedBy.name}` : ""} · <span style={{ fontFamily: "monospace" }}>{row.scanCode}</span>
          </div>

          {(row.inRegister || (row.source === "external_import" && row.externalImageCount > 0)) && (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {row.inRegister && <Badge bg="#ecfdf3" color="#027a48">In register</Badge>}
              {row.source === "external_import" && row.externalImageCount > 0 && (
                <Badge bg="#eff8ff" color="#175cd3">{row.externalImageCount} photo(s) in HiSYNC</Badge>
              )}
            </div>
          )}

          <div className="scan-card-actions">
            {canReview && canVerify(row) && (
              <>
                <Button size="sm" color="success" disabled={acting} onClick={() => startAction(row, "verify")}>Approve</Button>
                <Button size="sm" color="danger" outline disabled={acting} onClick={() => startAction(row, "reject")}>Reject</Button>
                <Button size="sm" color="secondary" outline disabled={acting} onClick={() => startAction(row, "halt")}>Halt</Button>
              </>
            )}
            {canAdd && canEditRow(row) && (
              <Button size="sm" color="light" disabled={acting} onClick={() => openEdit(row)}>Edit</Button>
            )}
            <Button size="sm" color="light" onClick={() => loadDetail(row._id)}>View</Button>
          </div>
        </div>
      </div>
    );
  };

  const allOnPageTicked = rows.length > 0 && rows.every((r) => selected.some((s) => s._id === r._id));
  const toggleWholePage = () =>
    setSelected((list) =>
      allOnPageTicked
        ? list.filter((s) => !rows.some((r) => r._id === s._id))
        : [...list, ...rows.filter((r) => !list.some((s) => s._id === r._id))],
    );
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const shownFrom = total === 0 ? 0 : (page - 1) * perPage + 1;
  const shownTo = Math.min(page * perPage, total);

  const tabCount = (key) =>
    key === "" ? statusCounts.pending + statusCounts.verified + statusCounts.rejected + statusCounts.halted : statusCounts[key] || 0;

  const modalAction = reasonModal ? ACTION_TEXT[reasonModal.action] : null;

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Verifications</h4>
          <p>Things found during verification jobs. Approving an entry puts it in the Fixed Asset Register.</p>
        </div>
        {canAdd && (
          <Button color="primary" onClick={() => navigate("/vendor-management/asset-scan-add")}>
            <i className="bx bx-plus me-1"></i> Add Verification
          </Button>
        )}
      </div>

      <style>{`
        .scan-card { display: flex; gap: 12px; align-items: flex-start; border: 1px solid #eef0f3; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .scan-card-check { width: 18px; height: 18px; margin-top: 4px; flex: none; }
        .scan-card-thumb { width: 76px; height: 76px; border-radius: 10px; background: #f2f4f7; flex: none; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; color: #98a2b3; font-size: 30px; }
        .scan-card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .scan-card-body { flex: 1; min-width: 0; }
        .scan-card-title { font-weight: 700; font-size: 16px; word-break: break-word; cursor: pointer; }
        .scan-card-facts { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
        .scan-chip { background: #f2f4f7; border-radius: 8px; padding: 2px 10px; font-size: 13px; }
        .scan-card-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .scan-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .scan-tabs button { flex: none; }
        @media (max-width: 575px) {
          .scan-card { padding: 12px; }
          .scan-card-thumb { width: 60px; height: 60px; font-size: 24px; }
          .scan-card-actions .btn { flex: 0 0 auto; }
        }
      `}</style>

      {/* Status tabs, with the counts from the server */}
      <div className="scan-tabs mb-3">
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
                padding: "6px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label} <span style={{ opacity: 0.75 }}>({tabCount(t.key)})</span>
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="uom-search-wrap" style={{ flex: "1 1 240px", maxWidth: 420 }}>
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search code, tag, room..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              goFirstPage();
            }}
          />
        </div>
        <Button color={showFilters || activeFilterCount > 0 ? "primary" : "light"} outline={activeFilterCount > 0 && !showFilters} onClick={() => setShowFilters((v) => !v)}>
          <i className="bx bx-filter-alt me-1"></i> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
        {filtersOn && <Button color="light" onClick={clearFilters}>Clear all</Button>}
      </div>

      {showFilters && (
        <div className="p-3 mb-3" style={{ background: "#f8f9fa", border: "1px solid #eef0f3", borderRadius: 12 }}>
          <Row>
            <Col xs={12} md={4} className="mb-2">
              <Label className="small mb-1">Job</Label>
              <Input type="select" value={filters.jobId} onChange={setFilter("jobId")}>
                <option value="">All jobs</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.jobCode} - {j.jobName}</option>
                ))}
              </Input>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <Label className="small mb-1">Site</Label>
              <Input type="select" value={filters.centerId} onChange={setFilter("centerId")}>
                <option value="">All sites</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </Input>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <Label className="small mb-1">Category</Label>
              <Input type="select" value={filters.category} onChange={setFilter("category")}>
                <option value="">All categories</option>
                <option value="none">No category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Input>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <Label className="small mb-1">Tag status</Label>
              <Input type="select" value={filters.tagStatus} onChange={setFilter("tagStatus")}>
                <option value="">Any tag status</option>
                {Object.entries(TAG_STATUS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Input>
            </Col>
            <Col xs={12} md={4} className="mb-2">
              <Label className="small mb-1">Photos</Label>
              <Input type="select" value={filters.photo} onChange={setFilter("photo")}>
                <option value="">Any photo</option>
                <option value="none">No photo</option>
              </Input>
            </Col>
          </Row>
        </div>
      )}

      {/* Select all on this page, and the bulk actions */}
      {canReview && rows.length > 0 && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <input type="checkbox" className="form-check-input" style={{ width: 20, height: 20 }} id="selectPage" checked={allOnPageTicked} onChange={toggleWholePage} />
          <label htmlFor="selectPage" className="small mb-0">Select all on this page</label>
        </div>
      )}
      {canReview && selected.length > 0 && (
        <div
          className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 px-3"
          style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10 }}
        >
          <span className="fw-semibold me-2">{selected.length} selected</span>
          <Button size="sm" color="success" disabled={acting} onClick={() => startBulk("verify")}>Approve selected</Button>
          <Button size="sm" color="danger" outline disabled={acting} onClick={() => startBulk("reject")}>Reject selected</Button>
          <Button size="sm" color="secondary" outline disabled={acting} onClick={() => startBulk("halt")}>Halt selected</Button>
          <Button size="sm" color="light" className="ms-auto" onClick={clearSelection}>Clear selection</Button>
        </div>
      )}

      {loadError && (
        <div className="p-3 mb-3 d-flex align-items-center justify-content-between" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
          <span className="text-danger">{loadError}</span>
          <Button size="sm" color="light" onClick={refresh}>Try again</Button>
        </div>
      )}

      {/* The verifications, one card each */}
      <div style={{ opacity: loading && rows.length > 0 ? 0.6 : 1 }}>
        {loading && rows.length === 0 ? (
          <div className="uom-table-card p-4 text-center text-muted">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="uom-table-card">
            <div className="uom-empty-state">
              <p className="uom-empty-title">{filtersOn ? "No verifications match these filters" : "No verifications yet"}</p>
              <p className="uom-empty-sub">
                {filtersOn ? "Try a different tab or clear the filters." : "Use Add Verification to record what was found in a verification job."}
              </p>
            </div>
          </div>
        ) : (
          rows.map(renderCard)
        )}
      </div>

      {total > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 mb-4">
          <span className="text-muted small">Showing {shownFrom}–{shownTo} of {total}</span>
          <div className="d-flex align-items-center gap-2">
            <Input type="select" style={{ width: 90 }} value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Input>
            <Button size="sm" color="light" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>‹ Previous</Button>
            <span className="small">Page {page} of {lastPage}</span>
            <Button size="sm" color="light" disabled={page >= lastPage || loading} onClick={() => setPage((p) => p + 1)}>Next ›</Button>
          </div>
        </div>
      )}

      <PhotoLightbox
        photos={lightbox.photos}
        index={lightbox.index}
        onClose={() => setLightbox({ photos: [], index: null })}
        onIndex={(i) => setLightbox((l) => ({ ...l, index: i }))}
      />

      {/* Approve: confirmation popup */}
      <Modal isOpen={!!approveModal} toggle={() => !acting && setApproveModal(null)} centered>
        <ModalBody className="p-4">
          {approveModal && (() => {
            const s = approveModal.scan;
            const n = approveModal.ids?.length || 0;
            const lines = s
              ? [
                  ["Verification code", s.scanCode],
                  ["Category", deepestCategory(s)],
                  ["Tag number", s.tagNumber || DASH],
                  ["Quantity", s.quantity != null ? String(s.quantity) : DASH],
                  ["Status", SCAN_STATUS[s.status]?.label || DASH],
                  ["Job", s.jobId?.jobCode || DASH],
                  ["Site", s.centerId?.title || DASH],
                ]
              : [];
            return (
              <>
                <h5 className="mb-2">{approveModal.bulk ? "Approve Verifications" : "Approve Verification"}</h5>
                <p className="mb-3">
                  {approveModal.bulk
                    ? `Are you sure you want to approve ${n} verification${n === 1 ? "" : "s"}?`
                    : "Are you sure you want to approve this verification?"}
                </p>
                {lines.length > 0 && (
                  <div className="mb-3 p-3" style={{ background: "#f8f9fa", borderRadius: 10 }}>
                    {lines.map(([label, value]) => (
                      <div key={label} className="d-flex justify-content-between py-1" style={{ fontSize: 14 }}>
                        <span className="text-muted">{label}</span>
                        <span className="fw-semibold text-end">{value || DASH}</span>
                      </div>
                    ))}
                  </div>
                )}
                {s && (() => {
                  const ph = photosOf(s);
                  return (
                    <div className="d-flex align-items-center gap-3 mb-3">
                      {ph[0] && <img src={ph[0].url} alt="First photo" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />}
                      <div>
                        <div className="fw-semibold">{ph.length > 0 ? `${ph.length} photo(s)` : "No photo"}</div>
                        {hisyncLine(s) && <div className="text-muted small">{hisyncLine(s)}</div>}
                      </div>
                    </div>
                  );
                })()}
                <div className="d-flex justify-content-end gap-2">
                  <Button color="light" disabled={acting} onClick={() => setApproveModal(null)}>Cancel</Button>
                  <Button color="success" disabled={acting} onClick={confirmApprove}>
                    {acting ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </>
            );
          })()}
        </ModalBody>
      </Modal>

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
                        <div className="col-12"><Field label="Remarks" value={d.remarks} /></div>
                      </div>

                      {(() => {
                        const photos = photosOf(d);
                        const canPhotos = canAdd && canEditRow(d); // photos can change only while waiting for review or halted
                        const tagCount = photos.filter((i) => i.kind === "tag").length;
                        const line = hisyncLine(d);
                        return (
                          <div className="mb-4">
                            <div style={sectionTitle} className="mb-2">PHOTOS ({photos.length})</div>
                            {line && <div className="text-muted small mb-2">{line}</div>}
                            {photos.length === 0 ? (
                              !line && <div className="text-muted mb-2" style={{ fontSize: 13 }}>No photo</div>
                            ) : (
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                {photos.map((img, i) => (
                                  <div key={img.path || img.url} style={{ width: 104 }}>
                                    <div style={{ position: "relative", width: 104, height: 104, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                                      <img
                                        src={img.url}
                                        alt={img.kind === "tag" ? "Tag photo" : "Asset photo"}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }}
                                        onClick={() => setLightbox({ photos, index: i })}
                                      />
                                      {canPhotos && img.path && (
                                        <button
                                          type="button"
                                          aria-label="Remove photo"
                                          disabled={acting}
                                          onClick={() => removePhoto(d, img)}
                                          style={{ position: "absolute", top: 4, right: 4, width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 18, lineHeight: "28px" }}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                    <div className="small text-muted text-center">{img.kind === "tag" ? "Tag photo" : "Asset photo"}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {canPhotos && (
                              <PhotoPicker
                                key={d._id}
                                hideDone
                                existingTag={tagCount}
                                existingAsset={photos.length - tagCount}
                                onUpload={(file, kind) => {
                                  const fd = new FormData();
                                  fd.append("file", file);
                                  return uploadAssetScanImage(d._id, kind, fd);
                                }}
                                onUploaded={() => {
                                  loadDetail(d._id);
                                  refresh();
                                }}
                              />
                            )}
                          </div>
                        );
                      })()}

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

                      {((canAdd && canEditRow(d)) || (canReview && canVerify(d))) && (
                        <div className="d-flex flex-wrap gap-2 justify-content-end">
                          {canAdd && canEditRow(d) && (
                            <Button color="light" disabled={acting} onClick={() => openEdit(d)}>Edit</Button>
                          )}
                          {canReview && (
                            <>
                          {canVerify(d) && (
                            <>
                              <Button color="success" disabled={acting} onClick={() => setApproveModal({ scan: d })}>Approve</Button>
                              <Button color="danger" outline disabled={acting} onClick={() => startAction({ _id: d._id, scanCode: d.scanCode }, "reject")}>Reject</Button>
                              <Button color="secondary" outline disabled={acting} onClick={() => startAction({ _id: d._id, scanCode: d.scanCode }, "halt")}>Halt</Button>
                            </>
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
