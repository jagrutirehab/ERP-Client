import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Label,
  Button,
  Spinner,
  Alert,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import {
  exportDoctorDirectory,
  getDoctorDirectory,
} from "../../helpers/backend_helper";

const getInitials = (name) => {
  const safeName = name || "";
  return (
    safeName
      .replace(/^dr\.?\s+/i, "")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR"
  );
};

const AVATAR_COLORS = [
  "#3577f1",
  "#0ab39c",
  "#f7b84b",
  "#f06548",
  "#299cdb",
  "#7d5fff",
];
const getAvatarColor = (name) => {
  const safeName = name || "?";
  return AVATAR_COLORS[safeName.charCodeAt(0) % AVATAR_COLORS.length || 0];
};

const toISO = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toISO(first), to: toISO(now) };
};

const DATE_PRESETS = {
  today: () => {
    const now = new Date();
    return { from: toISO(now), to: toISO(now) };
  },
  last7: () => {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 6);
    return { from: toISO(past), to: toISO(now) };
  },
  thisMonth: () => getDefaultMonthRange(),
  lastMonth: () => {
    const now = new Date();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: toISO(firstOfLastMonth), to: toISO(lastOfLastMonth) };
  },
};

const DoctorDirectoryExport = () => {
  const handleAuthError = useAuthError();
  const [dateRange, setDateRange] = useState(getDefaultMonthRange());
  const [activePreset, setActivePreset] = useState("thisMonth");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");

  //   useEffect(() => {
  //     document.title = "Doctor Directory Export | Jagruti Rehab";
  //   }, []);

  const fetchDoctors = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDoctorDirectory({ ...range });
      const data = res?.data?.payload || res?.payload || res?.data || [];
      setDoctors(data);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err?.response?.data?.message || "Failed to load doctors");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyRange = () => {
    setActivePreset(null);
    fetchDoctors(dateRange);
  };

  const applyPreset = (presetKey) => {
    const range = DATE_PRESETS[presetKey]();
    setDateRange(range);
    setActivePreset(presetKey);
    fetchDoctors(range);
  };

  const handleExportDirectory = async () => {
    setIsExporting(true);
    try {
      const res = await exportDoctorDirectory({ ...dateRange });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Doctor-Directory-${dateRange.from}-to-${dateRange.to}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Doctor report exported successfully");
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Failed to export report");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.clinicName?.toLowerCase().includes(q) ||
      d.specialisation?.toLowerCase().includes(q)
    );
  });

  const totalVisits = doctors.reduce((sum, d) => sum + (d.totalVisits || 0), 0);
  const totalMismatch = doctors.reduce(
    (sum, d) => sum + (d.mismatchCount || 0),
    0,
  );

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          {/* ---- Header ---- */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
            <div>
              <h4 className="mb-0 fw-semibold">Doctor Report</h4>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted fs-13">
                Today,{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={handleExportDirectory}
                disabled={isExporting}
                style={{
                  backgroundColor: "#1e90ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 450,
                }}
              >
                {isExporting ? (
                  <Spinner size="sm" style={{ color: "#fff" }} />
                ) : (
                  <i
                    className="ri-file-excel-2-line"
                    style={{ fontSize: 16 }}
                  />
                )}
                Export Excel
              </button>
            </div>
          </div>

          {/* ---- Filters (date range + search) ---- */}
          <Card className="border-0 shadow-sm mb-3">
            <CardBody className="p-3 p-lg-4">
              <div className="mb-3">
                <span className="fw-semibold text-dark fs-14">
                  <i className="bx bx-filter-alt me-1 text-muted" /> Filters
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {[
                  { key: "today", label: "Today" },
                  { key: "last7", label: "Last 7 Days" },
                  { key: "thisMonth", label: "This Month" },
                  { key: "lastMonth", label: "Last Month" },
                ].map((p) => (
                  <Button
                    key={p.key}
                    size="sm"
                    color={activePreset === p.key ? "primary" : "light"}
                    className="fw-medium"
                    onClick={() => applyPreset(p.key)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Row className="g-3 align-items-end mb-3">
                <Col xs={6} md={3}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    From
                  </Label>
                  <Input
                    type="date"
                    size="sm"
                    value={dateRange.from}
                    onChange={(e) => {
                      setDateRange((r) => ({ ...r, from: e.target.value }));
                      setActivePreset(null);
                    }}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    To
                  </Label>
                  <Input
                    type="date"
                    size="sm"
                    value={dateRange.to}
                    onChange={(e) => {
                      setDateRange((r) => ({ ...r, to: e.target.value }));
                      setActivePreset(null);
                    }}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <Button
                    color="primary"
                    size="sm"
                    className="w-100"
                    onClick={applyRange}
                  >
                    <i className="bx bx-filter-alt me-1" /> Apply Date Range
                  </Button>
                </Col>
              </Row>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Search doctor / clinic / specialisation
                  </Label>
                  <Input
                    size="sm"
                    placeholder="Type to filter the list below…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>

          {loading && (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          )}
          {error && <Alert color="danger">{error}</Alert>}

          {!loading && !error && (
            <>
              {/* ---- Summary stat cards ---- */}
              <div className="mb-2">
                <span className="fw-semibold text-dark fs-14">
                  {search.trim()
                    ? `Showing ${filteredDoctors.length} of ${doctors.length} doctors`
                    : `Summary — ${doctors.length} doctor${doctors.length === 1 ? "" : "s"} in this date range`}
                </span>
              </div>
              <Row className="g-3 mb-1">
                <Col xs={6} md={4}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#eef2ff" }}
                  >
                    <div className="text-muted fs-13">Doctors</div>
                    <div
                      className="fs-3 fw-semibold"
                      style={{ color: "#3577f1" }}
                    >
                      {doctors.length}
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={4}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#f8f9fb" }}
                  >
                    <div className="text-muted fs-13">Total Visits</div>
                    <div className="fs-3 fw-semibold">{totalVisits}</div>
                  </div>
                </Col>
                <Col xs={6} md={4}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#fde8e4" }}
                  >
                    <div className="text-muted fs-13">Mismatches</div>
                    <div className="fs-3 fw-semibold text-danger">
                      {totalMismatch}
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      GPS did not match
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="mb-4" />

              {/* ---- Doctor list ---- */}
              <div className="mb-2">
                <span className="fw-semibold text-dark fs-14">
                  Doctor directory
                </span>
              </div>

              {filteredDoctors.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardBody className="text-center text-muted py-5">
                    <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                    {search.trim()
                      ? "No doctors match this search"
                      : "No doctor visits recorded in this date range"}
                  </CardBody>
                </Card>
              ) : (
                filteredDoctors.map((d, idx) => {
                  const hasMismatch = d.mismatchCount > 0;
                  const displayName = /^dr\.?\s/i.test(d.name || "")
                    ? d.name
                    : `Dr. ${d.name || "-"}`;
                  return (
                    <Card
                      key={idx}
                      className="border-0 shadow-sm mb-3"
                      style={{
                        borderLeft: `3px solid ${hasMismatch ? "#f06548" : "#0ab39c"}`,
                      }}
                    >
                      <CardBody className="p-3 p-lg-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                              style={{
                                width: 44,
                                height: 44,
                                fontSize: 15,
                                background: getAvatarColor(d.name),
                              }}
                            >
                              {getInitials(d.name)}
                            </div>
                            <div>
                              <div className="fw-semibold fs-15">
                                {displayName}
                              </div>
                              <div className="text-muted fs-13">
                                <i
                                  className="bx bx-hospital me-1"
                                  style={{ fontSize: 12 }}
                                />
                                {d.clinicName}
                                {d.specialisation && (
                                  <>
                                    {" · "}
                                    {d.specialisation}
                                  </>
                                )}
                              </div>
                              {d.contactNumber && (
                                <div className="text-muted fs-12">
                                  <i
                                    className="bx bx-phone me-1"
                                    style={{ fontSize: 11 }}
                                  />
                                  {d.contactNumber}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4 flex-wrap">
                            <div className="text-center">
                              <div className="text-muted fs-12">
                                Total Visits
                              </div>
                              <div className="fw-semibold fs-16">
                                {d.totalVisits}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Verified</div>
                              <div className="fw-semibold fs-16 text-success">
                                {d.matchedCount || 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Mismatches</div>
                              <div
                                className={`fw-semibold fs-16 ${hasMismatch ? "text-danger" : "text-muted"}`}
                              >
                                {d.mismatchCount || 0}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Last Visit</div>
                              <div className="fw-semibold fs-14">
                                {d.lastVisitDate
                                  ? new Date(
                                      d.lastVisitDate,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </div>
                            </div>
                            {hasMismatch && (
                              <Badge
                                pill
                                className="fw-semibold px-3 py-2"
                                style={{ background: "#f06548", color: "#fff" }}
                              >
                                <i className="bx bx-error-circle me-1" />
                                Mismatch
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDirectoryExport;
