import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button, Spinner } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { ChevronsRight } from "lucide-react";
import ComplianceSummaryCards from "../components/ComplianceSummaryCards";
import RefreshButton from "../../../Components/Common/RefreshButton";
import {
  getComplianceSummary,
  getComplianceMatrix,
  exportComplianceOverview,
} from "../../../helpers/backend_helper";
import { STATUS_KEY } from "./Register";
import { CENTRES, STATUS, formatDate } from "../data";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const MATRIX_PAGE_SIZE = 100;
const MATRIX_TYPE_PAGE_SIZE = 10;

const Overview = () => {
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);
  const user = useSelector((state) => state.User);

  const centreOptions = useCenterOptions();

  const [centreFilter, setCentreFilter] = useState("ALL");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [matrix, setMatrix] = useState(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixMoreLoading, setMatrixMoreLoading] = useState(false);
  const [exporting, setExporting] = useState(false);


  const centerParam =
    centreFilter === "ALL"
      ? (user?.centerAccess || []).map((c) => c?._id || c).join(",")
      : centreFilter;

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await getComplianceSummary({ center: centerParam });
      setSummary(res?.data || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load summary");
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadMatrix = async () => {
    setMatrixLoading(true);
    try {
      const res = await getComplianceMatrix({
        center: centerParam,
        page: 1,
        limit: MATRIX_PAGE_SIZE,
        typePage: 1,
        typeLimit: MATRIX_TYPE_PAGE_SIZE,
      });
      setMatrix(res?.data || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load compliance matrix");
      }
    } finally {
      setMatrixLoading(false);
    }
  };

  // Refresh without losing how much the user already drilled into: same
  // centre filter, and the same number of type columns already loaded (even
  // if that spans several "Load more" clicks) — a plain loadMatrix() would
  // silently collapse back to the first 10 columns.
  const refreshMatrix = async () => {
    const loadedTypeCount = matrix?.types?.length || MATRIX_TYPE_PAGE_SIZE;
    setMatrixLoading(true);
    try {
      const res = await getComplianceMatrix({
        center: centerParam,
        page: 1,
        limit: MATRIX_PAGE_SIZE,
        typePage: 1,
        typeLimit: loadedTypeCount,
      });
      setMatrix(res?.data || null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load compliance matrix");
      }
    } finally {
      setMatrixLoading(false);
    }
  };

  const refreshAll = () => {
    loadSummary();
    refreshMatrix();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportComplianceOverview({ center: centerParam });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Compliance_Overview_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Something went wrong while generating the Excel file");
      }
    } finally {
      setExporting(false);
    }
  };

  const loadMoreTypes = async () => {
    const loadedTypeCount = matrix?.types?.length || 0;
    const nextTypePage = Math.floor(loadedTypeCount / MATRIX_TYPE_PAGE_SIZE) + 1;
    setMatrixMoreLoading(true);
    try {
      const res = await getComplianceMatrix({
        center: centerParam,
        page: 1,
        limit: MATRIX_PAGE_SIZE,
        typePage: nextTypePage,
        typeLimit: MATRIX_TYPE_PAGE_SIZE,
      });
      const more = res?.data;
      if (more) {
        setMatrix((prev) => ({
          ...prev,
          types: [...prev.types, ...more.types],
          typePagination: more.typePagination,
          centres: prev.centres.map((c) => {
            const match = more.centres.find((mc) => mc.centerId === c.centerId);
            return match ? { ...c, cells: { ...c.cells, ...match.cells } } : c;
          }),
        }));
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load more compliance types");
      }
    } finally {
      setMatrixMoreLoading(false);
    }
  };

  // If the centre access list changes (e.g. access revoked for the one
  // currently selected), fall back to "ALL" instead of filtering on a centre
  // the user can no longer see.
  useEffect(() => {
    if (centreFilter !== "ALL" && !user?.centerAccess?.includes(centreFilter)) {
      setCentreFilter("ALL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.centerAccess]);

  // the filter (and the user's centre access) drives both the summary cards
  // and the matrix together
  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreFilter, user?.centerAccess]);

  useEffect(() => {
    loadMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreFilter, user?.centerAccess]);

  return (
    <div className="p-3 p-lg-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1 fw-semibold">Overview</h5>
            <p className="text-muted mb-0 fs-13">
              Registrations, NOCs, licences and their documents across all{" "}
              {matrix ? matrix.pagination?.total ?? matrix.centres.length : CENTRES.length} centres.
            </p>
          </div>
          <div className="d-flex flex-wrap justify-content-end gap-2 ms-sm-auto align-items-center">
            <RefreshButton onRefresh={refreshAll} loading={summaryLoading || matrixLoading} />
            <div className="flex-shrink-0" style={{ minWidth: 180 }}>
              <Select
                classNamePrefix="react-select"
                options={centreOptions}
                value={centreOptions.find((o) => o.value === centreFilter) || centreOptions[0]}
                onChange={(option) => setCentreFilter(option?.value || "ALL")}
              />
            </div>
            <Button
              color="light"
              className="border flex-shrink-0"
              size="sm"
              disabled={exporting}
              onClick={handleExport}
            >
              {exporting ? "Exporting…" : "Export"}
            </Button>
            <CheckPermission accessRolePermission={roles?.permissions} subAccess="CENTRES" permission="edit">
              <Button
                color="success"
                className="text-white flex-shrink-0"
                size="sm"
                onClick={() => navigate("/compliance/upload")}
              >
                Add item
              </Button>
            </CheckPermission>
          </div>
        </div>

        <ComplianceSummaryCards summary={summary} loading={summaryLoading} />

        {/* Centre x compliance matrix */}
        <Card className="shadow-sm mb-3 border-0">
          <CardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="mb-0">Centre × compliance matrix</h5>
              <span className="text-muted" style={{ fontSize: 13 }}>
                Tap a centre to open its full register.
              </span>
            </div>
          </CardHeader>
          <CardBody className="position-relative">
            {matrixLoading && matrix && (
              <div
                className="position-absolute d-flex align-items-center justify-content-center"
                style={{ inset: 0, background: "rgba(255,255,255,0.6)", zIndex: 2 }}
              >
                <Spinner size="sm" color="primary" />
              </div>
            )}
            {matrixLoading && !matrix ? (
              <div className="text-center text-muted py-5">
                <Spinner size="sm" color="primary" />
              </div>
            ) : !matrix?.centres?.length ? (
              <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                No centres in scope yet.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table
                    className="table table-borderless table-sm mb-0"
                    style={{
                      minWidth:
                        180 +
                        matrix.types.length * 130 +
                        90 +
                        (matrix.typePagination?.page < matrix.typePagination?.totalPages ? 90 : 0),
                    }}
                  >
                    <thead>
                      <tr className="text-muted" style={{ fontSize: 12 }}>
                        <th
                          className="bg-white"
                          style={{
                            width: 180,
                            minWidth: 180,
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                          }}
                        >
                          Centre
                        </th>
                        {matrix.types.map((t) => (
                          <th key={t._id} style={{ minWidth: 130 }} title={t.name}>
                            {capitalizeWords(t.shortName || t.name)}
                          </th>
                        ))}
                        {matrix.typePagination &&
                          matrix.typePagination.page < matrix.typePagination.totalPages && (
                            <th className="text-center" style={{ width: 90, minWidth: 90, maxWidth: 90 }} />
                          )}
                        <th className="text-end pe-3" style={{ minWidth: 90 }}>
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.centres.map((centre, idx) => (
                        <tr key={centre.centerId}>
                          <td
                            className="bg-white"
                            style={{ position: "sticky", left: 0, zIndex: 1 }}
                          >
                            <Link
                              to={`/compliance/centres/${centre.centerId}`}
                              className="text-decoration-none"
                            >
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 170 }}>
                                {capitalizeWords(centre.name)}
                              </div>
                            </Link>
                          </td>
                          {matrix.types.map((t) => {
                            const cell = centre.cells[t._id];
                            if (!cell) {
                              return (
                                <td key={t._id}>
                                  <div
                                    className="rounded p-2 text-center text-muted"
                                    style={{ minHeight: 44, fontSize: 12, background: "#F5F6F3" }}
                                  >
                                    Not applicable
                                  </div>
                                </td>
                              );
                            }
                            const s = STATUS[STATUS_KEY[cell.status]];
                            return (
                              <td key={t._id}>
                                <div
                                  className="rounded p-2"
                                  style={{
                                    background: s.bg,
                                    color: s.fg,
                                    border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
                                    minHeight: 44,
                                  }}
                                >
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                                  <div style={{ fontSize: 11, fontFamily: "monospace" }}>
                                    {cell.noExpiry
                                      ? "Lifetime"
                                      : cell.expiryDate
                                      ? formatDate(new Date(cell.expiryDate))
                                      : "No file"}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                          {idx === 0 &&
                            matrix.typePagination &&
                            matrix.typePagination.page < matrix.typePagination.totalPages &&
                            (() => {
                              const remaining = Math.min(
                                MATRIX_TYPE_PAGE_SIZE,
                                matrix.typePagination.total - matrix.types.length,
                              );
                              return (
                                <td
                                  rowSpan={matrix.centres.length}
                                  className="text-center align-middle"
                                  style={{ width: 90, minWidth: 90, maxWidth: 90 }}
                                >
                                  <button
                                    type="button"
                                    className="load-more-types-btn"
                                    disabled={matrixMoreLoading}
                                    onClick={loadMoreTypes}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      display: "inline-flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "6px 4px",
                                      cursor: matrixMoreLoading ? "default" : "pointer",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: matrixMoreLoading ? "#E9ECEF" : "#E8EEF9",
                                        color: "#1F4E8C",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {matrixMoreLoading ? (
                                        <Spinner size="sm" style={{ width: 14, height: 14 }} color="primary" />
                                      ) : (
                                        <ChevronsRight size={15} />
                                      )}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: matrixMoreLoading ? "#adb5bd" : "#1F4E8C",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {matrixMoreLoading ? "Loading…" : `Load ${remaining} more`}
                                    </span>
                                  </button>
                                </td>
                              );
                            })()}
                          <td className="text-end fw-semibold align-middle pe-3">{centre.score}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Still mock-data driven (upcoming/actionNeeded come from ../data,
            not a live endpoint) — commented out until that's wired up.
        <Row className="g-3 mb-3">
          <Col lg={7}>
            <Card className="shadow-sm h-100 mb-0 border-0">
              <CardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-baseline gap-2">
                <h5 className="mb-0">Renewals due · next 90 days</h5>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Reminders handled by SOP module
                </span>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column">
                  {upcoming.map((u) => (
                    <div
                      key={u.id}
                      className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 border-top"
                    >
                      <div className="d-flex flex-column">
                        <span className="text-dark fw-medium">{u.categoryName}</span>
                        <span className="text-muted" style={{ fontSize: 13 }}>
                          {u.centreName} · {u.authority} · Owner: {u.owner}
                        </span>
                      </div>
                      <StatusBadge statusKey={u.statusKey === "due30" ? "due30" : "due90"} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm h-100 mb-0 border-0">
              <CardHeader className="bg-white">
                <h5 className="mb-0">Action needed</h5>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column gap-2">
                  {actionNeeded.map((a) => (
                    <div
                      key={a.id}
                      className="border rounded p-2"
                      style={{ borderLeft: `3px solid ${STATUS[a.statusKey].fg}` }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 14 }}>
                            {a.categoryName}
                          </div>
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            {a.centreName}
                            {a.daysLeft != null ? ` · ${Math.abs(a.daysLeft)} days overdue` : ""}
                          </div>
                        </div>
                        <StatusBadge statusKey={a.statusKey} />
                      </div>
                      <div className="d-flex gap-2">
                        <Button color="success" className="text-white" size="sm" onClick={() => goToUpload(a)}>
                          {actionCta(a)}
                        </Button>
                        <Button color="light" size="sm" className="border">
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        */}
      </div>
  );
};

export default Overview;
