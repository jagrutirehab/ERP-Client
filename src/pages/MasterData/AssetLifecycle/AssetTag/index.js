import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Label, Row, Col, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getAssetTags,
  createAssetTags,
  createSingleAssetTag,
  markAssetTagStatus,
  fitAssetTag,
  getAssetCategories,
  getFixedAssets,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { useReferenceList } from "../../../../Components/Hooks/useReferenceData";
import { useDebounce } from "../../../../Components/Hooks/useDebounce";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import { DASH, chipText, errText, useBusy } from "../shared/assetUi";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const STATUS_META = {
  available: { label: "Available", cls: "status-active" },
  reserved: { label: "Reserved", cls: "status-draft" },
  in_transit: { label: "In transit", cls: "status-draft" },
  received: { label: "Received", cls: "status-draft" },
  used: { label: "Used", cls: "status-draft" },
  assigned: { label: "Assigned", cls: "status-draft" },
  not_used: { label: "Not used", cls: "status-inactive" },
  damaged: { label: "Damaged", cls: "status-blacklisted" },
  lost: { label: "Lost", cls: "status-blacklisted" },
};
// a tag in one of these statuses, not fitted to an asset, can be marked damaged or lost
const CAN_MARK = ["available", "reserved", "in_transit", "received", "not_used"];

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.available;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const AssetTag = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ASSET_TAG", "WRITE");

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  // filters (done by the server)
  const EMPTY_FILTERS = { tagType: "", status: "", centerId: "", categoryL1: "", batch: "" };
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const debouncedBatch = useDebounce(filters.batch, 400);
  const debouncedSearch = useDebounce(search, 400);
  const { items: centers } = useReferenceList("centers");
  const [level1, setLevel1] = useState([]);
  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const filtersOn = search || Object.values(filters).some(Boolean);

  // one tag with a printed number
  const EMPTY_ONE = { tagCode: "", tagType: "fixed", epcCode: "", centerId: "", categoryL1: "", batchId: "", notes: "" };
  const [showOne, setShowOne] = useState(false);
  const [one, setOne] = useState(EMPTY_ONE);
  const [creatingOne, runCreateOne] = useBusy();

  // mark damaged / lost, and fit to an asset
  const [markModal, setMarkModal] = useState(null); // { tag, status }
  const [markReason, setMarkReason] = useState("");
  const [marking, runMark] = useBusy();
  const [fitModal, setFitModal] = useState(null); // tag
  const [assetQuery, setAssetQuery] = useState("");
  const debouncedAssetQuery = useDebounce(assetQuery, 400);
  const [assetResults, setAssetResults] = useState([]);
  const [searchingAssets, setSearchingAssets] = useState(false);
  const [fitting, runFit] = useBusy();

  const [tagType, setTagType] = useState("temp");
  const [createAsBatch, setCreateAsBatch] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [epcCode, setEpcCode] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, runSubmit] = useBusy();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getAssetTags({
      search: debouncedSearch.trim() || undefined,
      tagType: filters.tagType || undefined,
      status: filters.status || undefined,
      centerId: filters.centerId || undefined,
      categoryL1: filters.categoryL1 || undefined,
      batch: debouncedBatch.trim() || undefined,
    })
      .then((res) => {
        if (!cancelled) setTags(res?.data || []);
      })
      .catch((error) => {
        if (!cancelled && !handleAuthError(error)) setLoadError(errText(error, "The tags could not be loaded."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.tagType, filters.status, filters.centerId, filters.categoryL1, debouncedBatch, refreshFlag]);

  useEffect(() => {
    getAssetCategories({ level: 1, status: "active" })
      .then((res) => setLevel1(res?.data || []))
      .catch(() => {});
  }, []);

  // assets that can still take a tag
  useEffect(() => {
    if (!fitModal) return undefined;
    const q = debouncedAssetQuery.trim();
    if (q.length < 2) {
      setAssetResults([]);
      return undefined;
    }
    let cancelled = false;
    setSearchingAssets(true);
    getFixedAssets({ search: q, lifecycleStatus: "active" })
      .then((res) => {
        if (!cancelled) setAssetResults((res?.data || []).filter((a) => !a.tag && a.status !== "written_off").slice(0, 20));
      })
      .catch(() => {
        if (!cancelled) setAssetResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchingAssets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedAssetQuery, fitModal]);

  const handleCreateOne = () =>
    runCreateOne(async () => {
      if (!one.tagCode.trim()) return toast.error("Enter the tag number");
      try {
        const res = await createSingleAssetTag({
          tagCode: one.tagCode.trim(),
          tagType: one.tagType,
          epcCode: one.epcCode.trim() || undefined,
          centerId: one.centerId || undefined,
          categoryL1: one.categoryL1 || undefined,
          batchId: one.batchId.trim() || undefined,
          notes: one.notes.trim() || undefined,
        });
        toast.success(res?.message || "Tag created successfully");
        setOne(EMPTY_ONE);
        setRefreshFlag((f) => f + 1);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
      }
    });

  const handleMark = () =>
    runMark(async () => {
      try {
        const res = await markAssetTagStatus(markModal.tag._id, { status: markModal.status, reason: markReason.trim() || undefined });
        toast.success(res?.message || `Tag marked ${markModal.status}`);
        setMarkModal(null);
        setMarkReason("");
        setRefreshFlag((f) => f + 1);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
        setRefreshFlag((f) => f + 1);
      }
    });

  const handleFit = (asset) =>
    runFit(async () => {
      try {
        const res = await fitAssetTag(fitModal._id, { assetId: asset._id });
        toast.success(res?.message || "Tag fitted");
        setFitModal(null);
        setAssetQuery("");
        setAssetResults([]);
        setRefreshFlag((f) => f + 1);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
        setRefreshFlag((f) => f + 1);
      }
    });

  const handleSubmit = () =>
    runSubmit(async () => {
      if (tagType === "fixed" && !createAsBatch && !epcCode.trim()) {
        return toast.error("Enter an EPC code for a FIXED (RFID) tag");
      }
      if (createAsBatch) {
        const n = Number(batchCount);
        if (!Number.isInteger(n) || n < 1 || n > 1000) {
          return toast.error("Batch count must be a whole number from 1 to 1000");
        }
      }
      try {
        const res = await createAssetTags({
          tagType,
          epcCode: tagType === "fixed" && !createAsBatch ? epcCode.trim() : undefined,
          category: category.trim() || undefined,
          batchCount: createAsBatch ? Number(batchCount) : 1,
          notes,
        });
        toast.success(res?.message || "Tag(s) created successfully");
        setEpcCode("");
        setCategory("");
        setNotes("");
        setRefreshFlag((f) => f + 1);
      } catch (error) {
        if (!handleAuthError(error)) toast.error(errText(error));
      }
    });

  const columns = [
    { name: "Tag Code", selector: (row) => row.tagCode, sortable: true, width: "160px" },
    {
      name: "Type",
      width: "90px",
      cell: (row) => (
        <span className="text-uppercase small fw-semibold">
          {row.tagType === "fixed" ? "FIXED" : "TEMP"}
        </span>
      ),
    },
    {
      name: "EPC Code",
      wrap: true,
      minWidth: "130px",
      cell: (row) => <span className="uom-cell-muted small">{chipText(row.epcCode)}</span>,
    },
    {
      name: "Category",
      wrap: true,
      minWidth: "130px",
      cell: (row) => <span className="uom-cell-muted">{row.categoryL1?.name || row.category || "Any category"}</span>,
    },
    {
      name: "Center",
      wrap: true,
      minWidth: "130px",
      cell: (row) => <span className="uom-cell-muted">{row.centerId?.title || DASH}</span>,
    },
    { name: "Status", width: "120px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Fitted to",
      minWidth: "150px",
      cell: (row) => (
        <span className="uom-cell-muted small" style={{ fontFamily: "monospace" }}>
          {row.linkedAssetId?.assetTag || DASH}
        </span>
      ),
    },
    {
      name: "Batch",
      wrap: true,
      minWidth: "130px",
      cell: (row) => <span className="uom-cell-muted small">{row.batchId || "—"}</span>,
    },
    {
      name: "Created",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
    {
      name: "",
      right: true,
      minWidth: "260px",
      cell: (row) =>
        canCreate ? (
          <div className="d-flex flex-wrap gap-1 justify-content-end">
            {row.tagType === "fixed" && row.status === "available" && !row.linkedAssetId && (
              <Button size="sm" color="primary" outline onClick={() => { setAssetQuery(""); setAssetResults([]); setFitModal(row); }}>
                Fit to asset
              </Button>
            )}
            {CAN_MARK.includes(row.status) && !row.linkedAssetId && (
              <>
                <Button size="sm" color="danger" outline onClick={() => { setMarkReason(""); setMarkModal({ tag: row, status: "damaged" }); }}>
                  Damaged
                </Button>
                <Button size="sm" color="secondary" outline onClick={() => { setMarkReason(""); setMarkModal({ tag: row, status: "lost" }); }}>
                  Lost
                </Button>
              </>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Asset Tags</h4>
          <p>TEMP tags feed GRN putaway · FIXED tags are permanent RFID</p>
        </div>
      </div>

      {canCreate && (
        <div className="uom-table-card p-4 mb-4">
          <h6 className="fw-semibold mb-3">Tag Configuration</h6>

          <Label>
            Tag Type <span className="text-danger">*</span>
          </Label>
          <div className="d-flex gap-2 mb-3">
            <Button
              color={tagType === "temp" ? "primary" : "light"}
              onClick={() => setTagType("temp")}
              style={{ flex: 1 }}
            >
              <div className="fw-semibold">TEMP</div>
              <div className="small" style={{ opacity: 0.8 }}>
                QR · putaway ready
              </div>
            </Button>
            <Button
              color={tagType === "fixed" ? "primary" : "light"}
              onClick={() => setTagType("fixed")}
              style={{ flex: 1 }}
            >
              <div className="fw-semibold">FIXED</div>
              <div className="small" style={{ opacity: 0.8 }}>
                RFID · requires EPC
              </div>
            </Button>
          </div>

          {tagType === "fixed" && !createAsBatch && (
            <>
              <Label>EPC Code <span className="text-danger">*</span></Label>
              <Input
                className="mb-3"
                value={epcCode}
                onChange={(e) => setEpcCode(e.target.value)}
                placeholder="24-digit hex"
              />
            </>
          )}

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={createAsBatch}
              onChange={(e) => setCreateAsBatch(e.target.checked)}
              id="batchSwitch"
            />
            <label className="form-check-label" htmlFor="batchSwitch">
              Create as numbered batch (auto-increment series, max 1,000)
            </label>
            {tagType === "fixed" && createAsBatch && (
              <div className="text-muted small">Batch tags get a placeholder chip number until the hardware is scanned.</div>
            )}
          </div>

          {createAsBatch && (
            <Row>
              <Col md={4} className="mb-3">
                <Label>Batch Count</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={batchCount}
                  onChange={(e) => setBatchCount(e.target.value)}
                />
              </Col>
            </Row>
          )}

          <Label>Category (optional — reserves this tag for a category)</Label>
          <Input
            className="mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Leave blank to keep usable for any category"
          />

          <Label>Notes</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for this batch..."
          />

          <div className="text-muted small mb-3">
            TEMP tags are scanned during GRN putaway. After approval they move to Used and link to
            the putaway record automatically.
          </div>

          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : createAsBatch ? "Create Batch" : "Create Tag"}
          </Button>
        </div>
      )}

      {canCreate && (
        <div className="uom-table-card p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-semibold mb-1">Add one tag with its printed number</h6>
              <div className="text-muted small">For a tag that already has a number printed on it.</div>
            </div>
            <Button color="light" onClick={() => setShowOne((v) => !v)}>
              {showOne ? "Hide" : "Show"}
            </Button>
          </div>
          {showOne && (
            <div className="mt-3">
              <Row>
                <Col md={3} className="mb-3">
                  <Label className="small">Tag number <span className="text-danger">*</span></Label>
                  <Input value={one.tagCode} onChange={(e) => setOne((o) => ({ ...o, tagCode: e.target.value }))} placeholder="e.g. BT0012345" />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Tag type <span className="text-danger">*</span></Label>
                  <Input type="select" value={one.tagType} onChange={(e) => setOne((o) => ({ ...o, tagType: e.target.value }))}>
                    <option value="fixed">FIXED</option>
                    <option value="temp">TEMP</option>
                  </Input>
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Chip number (optional)</Label>
                  <Input value={one.epcCode} onChange={(e) => setOne((o) => ({ ...o, epcCode: e.target.value }))} />
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Batch (optional)</Label>
                  <Input value={one.batchId} onChange={(e) => setOne((o) => ({ ...o, batchId: e.target.value }))} />
                </Col>
              </Row>
              <Row>
                <Col md={3} className="mb-3">
                  <Label className="small">Center (optional)</Label>
                  <Input type="select" value={one.centerId} onChange={(e) => setOne((o) => ({ ...o, centerId: e.target.value }))}>
                    <option value="">Not set</option>
                    {centers.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </Input>
                </Col>
                <Col md={3} className="mb-3">
                  <Label className="small">Category level 1 (optional)</Label>
                  <Input type="select" value={one.categoryL1} onChange={(e) => setOne((o) => ({ ...o, categoryL1: e.target.value }))}>
                    <option value="">Not set</option>
                    {level1.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Input>
                </Col>
                <Col md={6} className="mb-3">
                  <Label className="small">Notes</Label>
                  <Input value={one.notes} onChange={(e) => setOne((o) => ({ ...o, notes: e.target.value }))} />
                </Col>
              </Row>
              <Button color="primary" onClick={handleCreateOne} disabled={creatingOne}>
                {creatingOne ? "Creating..." : "Create Tag"}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="uom-search-wrap" style={{ maxWidth: 260 }}>
          <i className="bx bx-search"></i>
          <Input placeholder="Search tag or chip number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input type="select" style={{ width: 130 }} value={filters.tagType} onChange={setFilter("tagType")}>
          <option value="">All types</option>
          <option value="fixed">FIXED</option>
          <option value="temp">TEMP</option>
        </Input>
        <Input type="select" style={{ width: 150 }} value={filters.status} onChange={setFilter("status")}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 170 }} value={filters.centerId} onChange={setFilter("centerId")}>
          <option value="">All centers</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </Input>
        <Input type="select" style={{ width: 170 }} value={filters.categoryL1} onChange={setFilter("categoryL1")}>
          <option value="">All categories</option>
          {level1.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Input>
        <Input style={{ width: 150 }} placeholder="Batch" value={filters.batch} onChange={setFilter("batch")} />
        {filtersOn && (
          <Button
            color="light"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setSearch("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {loadError && (
        <div className="p-3 mb-3 d-flex align-items-center justify-content-between" style={{ background: "#fef3f2", border: "1px solid #fecdca", borderRadius: 10 }}>
          <span className="text-danger">{loadError}</span>
          <Button size="sm" color="light" onClick={() => setRefreshFlag((f) => f + 1)}>Try again</Button>
        </div>
      )}

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={tags}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={
            <div className="uom-empty-state">{filtersOn ? "No tags match these filters" : "No tags created yet"}</div>
          }
        />
      </div>

      {/* Mark damaged / lost */}
      <Modal isOpen={!!markModal} toggle={() => !marking && setMarkModal(null)} centered>
        <ModalBody className="p-4">
          {markModal && (
            <>
              <h5 className="mb-1">Mark tag as {markModal.status}</h5>
              <p className="text-muted small mb-3">Tag {markModal.tag.tagCode}. A damaged or lost tag can no longer be fitted to an asset.</p>
              <Label className="small">Reason (optional)</Label>
              <Input type="textarea" rows={2} className="mb-3" value={markReason} onChange={(e) => setMarkReason(e.target.value)} />
              <div className="d-flex justify-content-end gap-2">
                <Button color="light" disabled={marking} onClick={() => setMarkModal(null)}>Cancel</Button>
                <Button color="danger" disabled={marking} onClick={handleMark}>
                  {marking ? "Saving..." : `Mark ${markModal.status}`}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>

      {/* Fit to an asset */}
      <Modal isOpen={!!fitModal} toggle={() => !fitting && setFitModal(null)} centered>
        <ModalBody className="p-4">
          {fitModal && (
            <>
              <h5 className="mb-1">Fit tag {fitModal.tagCode} to an asset</h5>
              <p className="text-muted small mb-3">Only active assets that do not have a tag yet are listed.</p>
              <Input
                className="mb-3"
                placeholder="Search asset by name, asset number or serial..."
                value={assetQuery}
                onChange={(e) => setAssetQuery(e.target.value)}
              />
              <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #f1f3f5", borderRadius: 8 }}>
                {assetQuery.trim().length < 2 ? (
                  <div className="text-muted small p-3">Type at least 2 letters.</div>
                ) : searchingAssets ? (
                  <div className="text-muted small p-3">Searching...</div>
                ) : assetResults.length === 0 ? (
                  <div className="text-muted small p-3">No asset without a tag matches.</div>
                ) : (
                  assetResults.map((a) => (
                    <div key={a._id} className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>{a.assetName}</div>
                        <div className="text-muted" style={{ fontSize: 12, fontFamily: "monospace" }}>{a.assetTag}</div>
                      </div>
                      <Button size="sm" color="primary" disabled={fitting} onClick={() => handleFit(a)}>Fit</Button>
                    </div>
                  ))
                )}
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button color="light" disabled={fitting} onClick={() => setFitModal(null)}>Close</Button>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AssetTag;