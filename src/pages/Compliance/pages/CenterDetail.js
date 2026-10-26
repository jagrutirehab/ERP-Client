import React, { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, Card, CardHeader, CardBody, Button, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Plus, FileText, Eye, Check } from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import RenewalBadge from "../components/RenewalBadge";
import RefreshButton from "../../../Components/Common/RefreshButton";
import PreviewFile from "../../../Components/Common/PreviewFile";
import VersionDetailModal from "../components/VersionDetailModal";
import ComplianceSummaryCards from "../components/ComplianceSummaryCards";
import {
  getComplianceRecords,
  getComplianceRecordById,
  getComplianceSummary,
  markComplianceInRenewal,
} from "../../../helpers/backend_helper";
import { fetchComplianceCategories } from "../../../store/features/compliance/complianceSlice";
import { STATUS_KEY } from "./Register";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const PAGE_SIZE = 20;

const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatSize = (bytes) =>
  !bytes ? "" : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
const personLabel = (u) => u?.name || u?.email || "—";
const isAborted = (error) => error?.code === "ERR_CANCELED";

// Percent of the licence's validity term that has already elapsed, for the progress bar.
const validityProgress = (record) => {
  if (record.noExpiry || !record.issueDate || !record.expiryDate || record.daysLeft == null) return null;
  const termDays = Math.round((new Date(record.expiryDate) - new Date(record.issueDate)) / 86400000);
  if (!termDays) return null;
  const percentUsed = Math.min(100, Math.max(0, Math.round(((termDays - record.daysLeft) / termDays) * 100)));
  return { percentUsed };
};

const CenterDetail = () => {
  const { centreId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);

  const user = useSelector((state) => state.User);
  const centerList = useSelector((state) => state.Center.data);
  const { categories } = useSelector((state) => state.Compliance);

  const centre =
    centerList?.find((c) => c._id === centreId) ||
    centerList?.find((c) => user?.centerAccess?.includes(c._id)) ||
    centerList?.[0];

  const centreOptions = useMemo(
    () =>
      centerList
        ?.filter((c) => user?.centerAccess?.includes(c._id))
        ?.map((c) => ({ value: c._id, label: centreLabel(c) })) || [],
    [centerList, user?.centerAccess],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "ALL", label: "All categories" },
      ...categories.filter((c) => c.active).map((c) => ({ value: c._id, label: c.name })),
    ],
    [categories],
  );

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [markingRenewal, setMarkingRenewal] = useState(false);

  const openPreview = (doc) => {
    setPreviewFile(doc);
    setPreviewOpen(true);
  };

  const handleMarkInRenewal = async () => {
    if (!selected?._id) return;
    setMarkingRenewal(true);
    try {
      const res = await markComplianceInRenewal(selected._id);
      // Merge rather than replace — this endpoint doesn't recompute
      // version history, so keep whatever `selected` already had for that.
      setSelected((prev) => ({ ...prev, ...res?.data }));
      toast.success(res?.message || "Marked as applied for renewal.");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to mark as applied for renewal");
      }
    } finally {
      setMarkingRenewal(false);
    }
  };

  const requestRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    dispatch(fetchComplianceCategories({}));
  }, [dispatch]);

  const loadRecords = async (pageToLoad, { reset = false } = {}) => {
    if (!centre?._id) return;
    requestRef.current?.abort?.();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const res = await getComplianceRecords(
        {
          center: centre._id,
          category: categoryFilter === "ALL" ? undefined : categoryFilter,
          page: pageToLoad,
          limit: PAGE_SIZE,
        },
        { signal: controller.signal },
      );
      const data = res?.data || [];
      setRecords((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(pageToLoad * PAGE_SIZE < (res?.pagination?.total || 0));
      setPage(pageToLoad);
      if (reset) setSelectedId(data[0]?._id || null);
    } catch (error) {
      if (isAborted(error)) return;
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load compliances");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!centre?._id) return;
    setHasMore(true);
    loadRecords(1, { reset: true });
    return () => requestRef.current?.abort?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centre?._id, categoryFilter]);

  const loadSummary = async () => {
    if (!centre?._id) return;
    setSummaryLoading(true);
    try {
      const res = await getComplianceSummary({ center: centre._id });
      setSummary(res?.data || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load summary");
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centre?._id]);

  const handleReload = async () => {
    setHasMore(true);
    loadRecords(1, { reset: true });
    loadSummary();
    if (selectedId) {
      setSelectedLoading(true);
      try {
        const res = await getComplianceRecordById(selectedId);
        setSelected(res?.data || null);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Failed to load details");
        }
      } finally {
        setSelectedLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setSelectedLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setSelectedLoading(true);
      try {
        const res = await getComplianceRecordById(selectedId);
        if (!cancelled) setSelected(res?.data || null);
      } catch (error) {
        if (!cancelled && !handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Failed to load details");
        }
      } finally {
        if (!cancelled) setSelectedLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      loadRecords(page + 1);
    }
  };

  if (!centre) {
    return <div className="p-3 p-lg-4 text-muted">No centre available.</div>;
  }

  const primaryDoc = selected?.documents?.find((d) => d.role === "PRIMARY_CERTIFICATE") || selected?.documents?.[0];
  const progress = selected ? validityProgress(selected) : null;

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">{centreLabel(centre)} centre</h5>
          <p className="text-muted mb-0 fs-13">
            Licences, NOCs and registrations tracked at this centre.
          </p>
        </div>
        <RefreshButton onRefresh={handleReload} loading={loading} />
      </div>

      <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 mb-3">
        <div style={{ minWidth: 220 }}>
          <Select
            classNamePrefix="react-select"
            options={centreOptions}
            value={centreOptions.find((o) => o.value === centre._id)}
            onChange={(option) => option && navigate(`/compliance/centres/${option.value}`)}
          />
        </div>
        <div className="d-flex gap-2">
          {/* <Button color="light" className="border flex-fill flex-sm-grow-0" size="sm">
            <Download size={14} className="me-1" /> Download all (ZIP)
          </Button> */}
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="CENTRES" permission="create">
            <Button
              color="success"
              className="text-white flex-fill flex-sm-grow-0"
              size="sm"
              onClick={() => navigate(`/compliance/upload?centre=${centre._id}`)}
            >
              <Plus size={14} className="me-1" /> Add item
            </Button>
          </CheckPermission>
        </div>
      </div>

      <ComplianceSummaryCards summary={summary} loading={summaryLoading} />

      <Row className="g-3">
        <Col lg={5}>
          <Card className="shadow-sm mb-0 border-0">
            <CardHeader className="bg-white">
              <Select
                classNamePrefix="react-select"
                options={categoryOptions}
                value={categoryOptions.find((o) => o.value === categoryFilter)}
                onChange={(option) => setCategoryFilter(option?.value || "ALL")}
                placeholder="Filter by category"
              />
            </CardHeader>
            <CardBody
              className="p-0"
              ref={listRef}
              onScroll={handleScroll}
              style={{ maxHeight: "calc(100vh - 430px)", minHeight: 300, overflowY: "auto" }}
            >
              {records.map((record) => {
                const isSelected = record._id === selectedId;
                return (
                  <button
                    key={record._id}
                    type="button"
                    onClick={() => setSelectedId(record._id)}
                    className="d-flex align-items-center gap-3 w-100 text-start border-0 border-bottom px-3 py-3"
                    style={{ background: isSelected ? "#F3FAF6" : "#fff" }}
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
                      style={{ width: 40, height: 40, background: "#EAF1FB", color: "#1F4E8C", fontSize: 16 }}
                    >
                      {(record.complianceType?.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <span className="fw-medium text-capitalize text-truncate">
                          {record.complianceType?.name || "—"}
                        </span>
                        <span className="text-muted flex-shrink-0" style={{ fontSize: 11 }}>
                          {record.noExpiry ? "No expiry" : formatDate(record.expiryDate)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center gap-2 mt-1">
                        <span className="text-muted text-truncate" style={{ fontSize: 12 }}>
                          {record.category?.name ? `${record.category.name} · ` : ""}
                          {record.licenceNumber || "No licence no."}
                        </span>
                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          <StatusBadge statusKey={STATUS_KEY[record.status]} />
                          <RenewalBadge inRenewal={record.inRenewal} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {!loading && !records.length && (
                <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                  No compliances match this filter.
                </div>
              )}

              {loading && (
                <div className="text-center text-muted py-3">
                  <Spinner size="sm" className="me-2" /> Loading...
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="shadow-sm mb-0 border-0">
            <CardBody>
              {selectedLoading || (selectedId && !selected) ? (
                <div className="text-center text-muted py-5">
                  <Spinner size="sm" className="me-2" /> Loading...
                </div>
              ) : !selected ? (
                <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                  No compliances match this filter.
                </div>
              ) : (
                <>
                  {selected.category?.name && (
                    <span
                      className="d-inline-flex align-items-center gap-1 text-uppercase mb-2 px-2 py-1 rounded"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        background: "#EAF1FB",
                        color: "#1F4E8C",
                      }}
                    >
                      <FileText size={13} />
                      {selected.category.name}
                    </span>
                  )}
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <h4 className="mb-0 text-capitalize">{selected.complianceType?.name}</h4>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge statusKey={STATUS_KEY[selected.status]} />
                      <RenewalBadge inRenewal={selected.inRenewal} />
                    </div>
                  </div>

                  <Row className="g-3 mb-3 mt-1">
                    <Col sm={6}>
                      <div className="text-muted small">Licence / reg. no.</div>
                      <div className="fw-medium" style={{ fontFamily: "monospace" }}>
                        {selected.licenceNumber || "—"}
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Issuing authority</div>
                      <div className="fw-medium text-capitalize">{selected.issuingAuthority || "—"}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Valid till</div>
                      <div className="fw-medium">
                        {selected.noExpiry
                          ? "No expiry"
                          : selected.expiryDate
                          ? `${formatDate(selected.expiryDate)} · ${
                              selected.daysLeft < 0 ? `${Math.abs(selected.daysLeft)}d overdue` : `${selected.daysLeft}d left`
                            }`
                          : "—"}
                      </div>
                      {progress && (
                        <div className="mt-1">
                          <div className="progress" style={{ height: 4, background: "#EDEFEC" }}>
                            <div
                              className="progress-bar"
                              style={{ width: `${progress.percentUsed}%`, background: "#1D5A41" }}
                            />
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                            {progress.percentUsed}% of validity used
                          </div>
                        </div>
                      )}
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Issued on</div>
                      <div className="fw-medium">{formatDate(selected.issueDate)}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Owner</div>
                      <div className="fw-medium">{selected.responsibleOwner || "—"}</div>
                    </Col>
                    {!selected.noExpiry && (
                      <Col sm={6}>
                        <div className="text-muted small">Renewal lead time</div>
                        <div className="fw-medium">{selected.renewalLeadDays} days</div>
                      </Col>
                    )}
                  </Row>

                  <CheckPermission accessRolePermission={roles?.permissions} subAccess="CENTRES" permission="edit">
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <Button
                        color="success"
                        className="text-white"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/compliance/upload?centre=${centre._id}&type=${selected.complianceType?._id || ""}`,
                            {
                              state: {
                                prefill: {
                                  licenceNumber: selected.licenceNumber,
                                  issuingAuthority: selected.issuingAuthority,
                                  owner: selected.responsibleOwner,
                                  escalateTo: selected.escalateTo,
                                },
                              },
                            },
                          )
                        }
                      >
                        {selected.status === "DOC_MISSING" ? "Upload document" : "Upload renewed document"}
                      </Button>
                      {!selected.noExpiry && selected.status !== "DOC_MISSING" && !selected.inRenewal && (
                        <Button
                          color="light"
                          size="sm"
                          className="border"
                          disabled={markingRenewal}
                          onClick={handleMarkInRenewal}
                        >
                          {markingRenewal ? "Marking..." : "Mark as applied for renewal"}
                        </Button>
                      )}
                    </div>
                  </CheckPermission>

                  {primaryDoc && (
                    <div className="mb-4">
                      <h6 className="mb-2">Current document</h6>
                      <div
                        className="d-flex align-items-center gap-3 rounded p-2"
                        style={{ background: "#F8F9FA", border: "1px solid #E9ECEF" }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                          style={{ width: 36, height: 36, background: "#E6EEF8", color: "#1F4E8C" }}
                        >
                          <FileText size={16} />
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-medium text-truncate">{primaryDoc.originalName || primaryDoc.name}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {[formatSize(primaryDoc.size), `v${selected.currentVersion || 1}`, `verified by ${personLabel(selected.lastApprovedBy)}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </div>
                        <Button
                          type="button"
                          color="light"
                          className="border p-2"
                          size="sm"
                          title="Preview"
                          onClick={() =>
                            openPreview({
                              url: primaryDoc.url,
                              type: primaryDoc.type,
                              originalName: primaryDoc.originalName || primaryDoc.name,
                            })
                          }
                        >
                          <Eye size={14} />
                        </Button>
                        <Button tag="a" href={primaryDoc.url} download color="light" className="border p-2" size="sm">
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selected.complianceType?.checklistSteps?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-2">Renewal checklist</h6>
                      <div className="d-flex flex-column gap-2">
                        {selected.complianceType.checklistSteps.map((step) => {
                          const done = (selected.checklistCompleted || []).includes(step.text);
                          return (
                            <div key={step.text} className="d-flex align-items-center gap-2">
                              <span
                                className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                                style={{
                                  width: 18,
                                  height: 18,
                                  border: `1px solid ${done ? "#1D5A41" : "#C9CFCB"}`,
                                  background: done ? "#1D5A41" : "transparent",
                                }}
                              >
                                {done && <Check size={12} color="#fff" />}
                              </span>
                              <span className={done ? "" : "text-muted"} style={{ fontSize: 13 }}>
                                {step.text}
                              </span>
                              {step.mandatory && <span className="text-danger fw-semibold">*</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* {selected.expiryDate && !selected.noExpiry && (
                    <div className="mb-4">
                      <h6 className="mb-2">Reminder schedule</h6>
                      <Row className="g-2">
                        {[90, 60, 30, 7].map((d) => {
                          const date = new Date(new Date(selected.expiryDate).getTime() - d * 86400000);
                          const sent = date <= new Date();
                          return (
                            <Col xs={6} sm={3} key={d}>
                              <div className="border rounded p-2 h-100">
                                <div className="fw-semibold" style={{ fontSize: 13 }}>
                                  {d} days
                                </div>
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {formatDate(date)}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: sent ? "#1D5A41" : "#9AA39E" }}>
                                  {sent ? "Sent" : "Scheduled"}
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  )} */}

                  {selected.versions?.length > 0 && (
                    <div>
                      <h6 className="mb-2">Version history</h6>
                      <div className="d-flex flex-column gap-2">
                        <button
                          type="button"
                          className="d-flex justify-content-between align-items-center rounded p-2 border-0 text-start w-100"
                          style={{ background: "#E4F1EA", border: "1px solid #CFE6DA" }}
                          onClick={() =>
                            setViewingVersion({
                              version: selected.currentVersion || 1,
                              isCurrent: true,
                              licenceNumber: selected.licenceNumber,
                              issuingAuthority: selected.issuingAuthority,
                              issueDate: selected.issueDate,
                              expiryDate: selected.expiryDate,
                              noExpiry: selected.noExpiry,
                              documents: selected.documents,
                              checklistCompleted: selected.checklistCompleted || [],
                              approvedBy: selected.lastApprovedBy,
                              approvedAt: selected.lastApprovedAt,
                              submission: selected.lastApprovedSubmission,
                            })
                          }
                        >
                          <span style={{ fontSize: 13 }}>
                            v{selected.currentVersion || 1} ·{" "}
                            {selected.noExpiry ? "Lifetime" : `${formatDate(selected.issueDate)} → ${formatDate(selected.expiryDate)}`}
                            <span className="text-muted"> · {selected.licenceNumber || "—"}</span>
                          </span>
                          <span
                            className="px-2 py-1 rounded"
                            style={{ fontSize: 11, fontWeight: 600, background: "#1D5A41", color: "#fff" }}
                          >
                            Current
                          </span>
                        </button>
                        {selected.versions.map((v) => (
                          <button
                            type="button"
                            key={v.version}
                            className="d-flex justify-content-between align-items-center rounded p-2 border-0 text-start w-100"
                            style={{ background: "#F8F9FA", border: "1px solid #E9ECEF" }}
                            onClick={() => setViewingVersion({ ...v, isCurrent: false })}
                          >
                            <span style={{ fontSize: 13 }}>
                              v{v.version} ·{" "}
                              {v.noExpiry ? "Lifetime" : `${formatDate(v.issueDate)} → ${formatDate(v.expiryDate)}`}
                              <span className="text-muted"> · {v.licenceNumber || "—"}</span>
                            </span>
                            <span className="px-2 py-1 rounded" style={{ fontSize: 11, fontWeight: 600, background: "#E9ECEF", color: "#66706C" }}>
                              Superseded
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <PreviewFile
        title={previewFile?.originalName || "Compliance document"}
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => setPreviewOpen(false)}
        allowDownload
      />

      <VersionDetailModal
        isOpen={!!viewingVersion}
        toggle={() => setViewingVersion(null)}
        version={viewingVersion}
        checklistSteps={selected?.complianceType?.checklistSteps}
      />
    </div>
  );
};

export default CenterDetail;
