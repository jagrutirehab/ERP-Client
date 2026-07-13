import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Card,
  CardBody,
  Table,
  Spinner,
  Alert,
  Row,
  Col,
  Input,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { getVisitLogs } from "../../../helpers/backend_helper";

const INTEREST_STYLE = {
  HOT: { bg: "#fde8e4", color: "#f06548" },
  WARM: { bg: "#fef4e4", color: "#f7b84b" },
  COLD: { bg: "#e3f2fc", color: "#299cdb" },
};

const AVATAR_COLORS = [
  "#3577f1",
  "#0ab39c",
  "#f7b84b",
  "#f06548",
  "#299cdb",
  "#7d5fff",
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length || 0];

const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

// Haversine formula — same logic as backend, used here just for display
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const formatDistance = (meters) => {
  if (meters == null) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const DEFAULT_FILTERS = {
  visitType: "",
  interestLevel: "",
  gpsMatch: "",
  from: "",
  to: "",
};

const VisitLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [sortByDistanceDesc, setSortByDistanceDesc] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  const fetchLogs = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeFilters.visitType) params.visitType = activeFilters.visitType;
      if (activeFilters.interestLevel)
        params.interestLevel = activeFilters.interestLevel;
      if (activeFilters.from) params.from = activeFilters.from;
      if (activeFilters.to) params.to = activeFilters.to;

      const res = await getVisitLogs(params);
      const data = res?.payload || res?.data?.payload || res?.data?.data || [];
      setLogs(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load visit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(DEFAULT_FILTERS);
  }, [fetchLogs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestionPool = useMemo(() => {
    const agentMap = new Map();
    const doctorMap = new Map();

    logs.forEach((log) => {
      if (log.agent?.name && !agentMap.has(log.agent.name)) {
        agentMap.set(log.agent.name, {
          type: "Agent",
          label: log.agent.name,
          sub: log.agent.email,
        });
      }
      if (log.doctor?.name) {
        const key = `${log.doctor.name}__${log.doctor.clinicName}`;
        if (!doctorMap.has(key)) {
          doctorMap.set(key, {
            type: "Doctor",
            label: log.doctor.name,
            sub: log.doctor.clinicName,
          });
        }
      }
    });

    return [...agentMap.values(), ...doctorMap.values()];
  }, [logs]);

  const filteredSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, suggestionPool]);

  const handleFilterChange = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const applyFilters = () => fetchLogs(filters);
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    fetchLogs(DEFAULT_FILTERS);
  };

  const logsWithDistance = useMemo(() => {
    return logs.map((log) => {
      let distance = null;
      if (
        log.visitType === "REPEAT_VISIT" &&
        log.gps?.lat != null &&
        log.doctor?.clinicLocation?.lat != null
      ) {
        distance = getDistanceInMeters(
          log.gps.lat,
          log.gps.lng,
          log.doctor.clinicLocation.lat,
          log.doctor.clinicLocation.lng,
        );
      }
      return { ...log, _distance: distance };
    });
  }, [logs]);

  const mismatchCountByAgent = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      if (log.gps?.matchedClinic === false && log.agent?._id) {
        counts[log.agent._id] = (counts[log.agent._id] || 0) + 1;
      }
    });
    return counts;
  }, [logs]);

  let visibleLogs = logsWithDistance.filter((log) => {
    if (filters.gpsMatch === "verified" && log.gps?.matchedClinic !== true)
      return false;
    if (filters.gpsMatch === "mismatch" && log.gps?.matchedClinic !== false)
      return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack =
        `${log.agent?.name || ""} ${log.doctor?.name || ""} ${log.doctor?.clinicName || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (sortByDistanceDesc) {
    visibleLogs = [...visibleLogs].sort(
      (a, b) => (b._distance || 0) - (a._distance || 0),
    );
  }

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== "") || search.trim();

  const RepeatOffenderBadge = ({ count }) =>
    count >= 2 ? (
      <span
        className="badge rounded-pill fw-semibold"
        style={{ background: "#fde8e4", color: "#f06548", fontSize: "10px" }}
        title={`${count} GPS mismatches found`}
      >
        <i className="bx bx-error-circle me-1" />
        {count}x flagged
      </span>
    ) : null;

  const GpsStatus = ({ matched }) =>
    matched ? (
      <span className="d-inline-flex align-items-center gap-1 text-success fw-medium fs-13">
        <i className="bx bx-check-circle" /> Verified
      </span>
    ) : (
      <span className="d-inline-flex align-items-center gap-1 text-danger fw-medium fs-13">
        <i className="bx bx-error-circle" /> Mismatch
      </span>
    );

  const InterestBadge = ({ level }) => {
    const s = INTEREST_STYLE[level] || {};
    return (
      <span
        className="badge rounded-pill fw-semibold px-2"
        style={{ background: s.bg, color: s.color }}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="page-content">
      <Row className="justify-content-center">
        <Col xs={12} xl={11}>
          {/*Header*/}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(53,119,241,0.1)",
                }}
              >
                <i className="bx bx-list-ul fs-3 text-primary" />
              </div>
              <div className="ms-3">
                <h4 className="mb-0 fw-semibold">All Visit Logs</h4>
                <p className="text-muted mb-0 fs-13">
                  Field visits recorded by your marketing team
                </p>
              </div>
            </div>
          </div>

          {/*Filters*/}
          <Card className="border-0 shadow-sm mb-3">
            <CardBody className="p-3 p-lg-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-semibold text-dark fs-14">
                  <i className="bx bx-filter-alt me-1 text-muted" /> Filters
                </span>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    color="link"
                    className="text-decoration-none p-0"
                    onClick={resetFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={3}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Search
                  </Label>
                  <div className="position-relative" ref={searchWrapperRef}>
                    <Input
                      size="sm"
                      placeholder="Agent or doctor name…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div
                        className="border rounded-3 mt-1 shadow-sm"
                        style={{
                          background: "#fff",
                          position: "absolute",
                          zIndex: 20,
                          width: "100%",
                          maxHeight: 260,
                          overflowY: "auto",
                        }}
                      >
                        {filteredSuggestions.map((s, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSearch(s.label);
                              setShowSuggestions(false);
                            }}
                          >
                            <div>
                              <div className="fw-medium fs-14">{s.label}</div>
                              <div className="text-muted fs-12">{s.sub}</div>
                            </div>
                            <span
                              className="badge rounded-pill fw-medium fs-11"
                              style={{
                                background:
                                  s.type === "Agent" ? "#eef2ff" : "#e6f7f4",
                                color:
                                  s.type === "Agent" ? "#3577f1" : "#0ab39c",
                              }}
                            >
                              {s.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Col>
                <Col xs={6} md={2}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    GPS Match
                  </Label>
                  <Input
                    type="select"
                    size="sm"
                    value={filters.gpsMatch}
                    onChange={(e) =>
                      handleFilterChange("gpsMatch", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="verified">Verified only</option>
                    <option value="mismatch">Mismatch only</option>
                  </Input>
                </Col>
                <Col xs={6} md={2}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Visit Type
                  </Label>
                  <Input
                    type="select"
                    size="sm"
                    value={filters.visitType}
                    onChange={(e) =>
                      handleFilterChange("visitType", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="FIRST_VISIT">First Visit</option>
                    <option value="REPEAT_VISIT">Repeat Visit</option>
                  </Input>
                </Col>
                <Col xs={6} md={2}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Interest
                  </Label>
                  <Input
                    type="select"
                    size="sm"
                    value={filters.interestLevel}
                    onChange={(e) =>
                      handleFilterChange("interestLevel", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="HOT">Hot</option>
                    <option value="WARM">Warm</option>
                    <option value="COLD">Cold</option>
                  </Input>
                </Col>
                <Col xs={6} md={3}>
                  <Button
                    color="primary"
                    className="w-100"
                    size="sm"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
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

          {!loading && !error && visibleLogs.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center text-muted py-5">
                <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                No visit logs match these filters
              </CardBody>
            </Card>
          )}

          {/*MOBILE: card list*/}
          {!loading && !error && visibleLogs.length > 0 && (
            <div className="d-md-none">
              {visibleLogs.map((log) => {
                const matched = log.gps?.matchedClinic;
                const agentMismatches =
                  mismatchCountByAgent[log.agent?._id] || 0;
                return (
                  <Card
                    key={log._id}
                    className="border-0 shadow-sm mb-2"
                    style={{
                      borderLeft: `4px solid ${matched ? "#0ab39c" : "#f06548"}`,
                    }}
                  >
                    <CardBody className="p-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            fontSize: 13,
                            background: getAvatarColor(log.agent?.name),
                          }}
                        >
                          {getInitials(log.agent?.name) || "?"}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold fs-14 d-flex align-items-center gap-1 flex-wrap">
                            {log.agent?.name || "Unknown"}
                            <RepeatOffenderBadge count={agentMismatches} />
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                          >
                            {new Date(log.visitDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                        <GpsStatus matched={matched} />
                      </div>

                      <div className="fw-semibold fs-14">
                        {log.doctor?.name}
                      </div>
                      <div className="text-muted fs-13 mb-2">
                        {log.doctor?.clinicName}
                      </div>

                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <span
                          className="badge rounded-pill fw-medium"
                          style={{
                            background:
                              log.visitType === "FIRST_VISIT"
                                ? "#eef2ff"
                                : "#f3f0ff",
                            color:
                              log.visitType === "FIRST_VISIT"
                                ? "#3577f1"
                                : "#7d5fff",
                          }}
                        >
                          {log.visitType === "FIRST_VISIT"
                            ? "First Visit"
                            : "Repeat Visit"}
                        </span>
                        <InterestBadge level={log.interestLevel} />
                        {log._distance != null && (
                          <span
                            className={`badge rounded-pill fw-medium ${matched ? "text-success" : "text-danger"}`}
                            style={{
                              background: matched ? "#e6f7f4" : "#fde8e4",
                            }}
                          >
                            {formatDistance(log._distance)} away
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        color="light"
                        className="w-100"
                        onClick={() => setSelectedLog(log)}
                      >
                        <i className="bx bx-show me-1" /> View Details
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/*DESKTOP: table*/}
          {!loading && !error && visibleLogs.length > 0 && (
            <Card className="border-0 shadow-sm d-none d-md-block">
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0 align-middle">
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="text-muted fw-semibold fs-13 py-3 ps-4">
                          Agent
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Doctor / Clinic
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Date
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Visit Type
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          GPS
                        </th>
                        <th
                          className="text-muted fw-semibold fs-13 py-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSortByDistanceDesc((s) => !s)}
                          title="Sort by distance from clinic"
                        >
                          Distance{" "}
                          <i
                            className={`bx ${sortByDistanceDesc ? "bx-sort-down" : "bx-sort"}`}
                          />
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Interest
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3 pe-4 text-end">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLogs.map((log) => {
                        const matched = log.gps?.matchedClinic;
                        const agentMismatches =
                          mismatchCountByAgent[log.agent?._id] || 0;
                        return (
                          <tr
                            key={log._id}
                            style={{
                              borderLeft: `3px solid ${matched ? "#0ab39c" : "#f06548"}`,
                            }}
                          >
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                                  style={{
                                    width: 36,
                                    height: 36,
                                    fontSize: 13,
                                    background: getAvatarColor(log.agent?.name),
                                  }}
                                >
                                  {getInitials(log.agent?.name) || "?"}
                                </div>
                                <div>
                                  <div className="fw-semibold fs-14 d-flex align-items-center gap-1">
                                    {log.agent?.name || "Unknown"}
                                    <RepeatOffenderBadge
                                      count={agentMismatches}
                                    />
                                  </div>
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {log.agent?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold fs-14">
                                {log.doctor?.name}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "12px" }}
                              >
                                {log.doctor?.clinicName}
                              </div>
                            </td>
                            <td className="text-muted fs-14">
                              {new Date(log.visitDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td>
                              <span
                                className="badge rounded-pill fw-medium"
                                style={{
                                  background:
                                    log.visitType === "FIRST_VISIT"
                                      ? "#eef2ff"
                                      : "#f3f0ff",
                                  color:
                                    log.visitType === "FIRST_VISIT"
                                      ? "#3577f1"
                                      : "#7d5fff",
                                }}
                              >
                                {log.visitType === "FIRST_VISIT"
                                  ? "First"
                                  : "Repeat"}
                              </span>
                            </td>
                            <td>
                              <GpsStatus matched={matched} />
                            </td>
                            <td>
                              {log._distance != null ? (
                                <span
                                  className={`fw-semibold fs-13 ${matched ? "text-success" : "text-danger"}`}
                                >
                                  {formatDistance(log._distance)}
                                </span>
                              ) : (
                                <span className="text-muted fs-13">—</span>
                              )}
                            </td>
                            <td>
                              <InterestBadge level={log.interestLevel} />
                            </td>
                            <td className="pe-4 text-end">
                              <Button
                                size="sm"
                                color="light"
                                onClick={() => setSelectedLog(log)}
                              >
                                <i className="bx bx-show" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}

          {!loading && !error && visibleLogs.length > 0 && (
            <div className="text-muted mt-2 fs-13 text-end">
              Showing {visibleLogs.length} of {logs.length} visits
            </div>
          )}
        </Col>
      </Row>

      {/*Detail Modal*/}
      <Modal
        isOpen={!!selectedLog}
        toggle={() => setSelectedLog(null)}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setSelectedLog(null)}>
          Visit Details
        </ModalHeader>
        <ModalBody>
          {selectedLog && (
            <div>
              {/* Agent + status */}
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white"
                    style={{
                      width: 44,
                      height: 44,
                      fontSize: 15,
                      background: getAvatarColor(selectedLog.agent?.name),
                    }}
                  >
                    {getInitials(selectedLog.agent?.name) || "?"}
                  </div>
                  <div>
                    <div className="fw-semibold fs-15">
                      {selectedLog.agent?.name}
                    </div>
                    <div className="text-muted fs-13">
                      {selectedLog.agent?.email}
                    </div>
                  </div>
                </div>
                <GpsStatus matched={selectedLog.gps?.matchedClinic} />
              </div>

              {/* Doctor & Clinic */}
              <div className="rounded-3 border p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-user-voice text-primary me-1" /> Doctor &
                  Clinic
                </div>
                <Row className="fs-13">
                  <Col xs={6} className="text-muted mb-1">
                    Doctor Name
                  </Col>
                  <Col xs={6} className="fw-medium mb-1">
                    {selectedLog.doctor?.name}
                  </Col>
                  <Col xs={6} className="text-muted mb-1">
                    Clinic
                  </Col>
                  <Col xs={6} className="fw-medium mb-1">
                    {selectedLog.doctor?.clinicName}
                  </Col>
                  <Col xs={6} className="text-muted mb-1">
                    Contact
                  </Col>
                  <Col xs={6} className="fw-medium mb-1">
                    {selectedLog.doctor?.contactNumber}
                  </Col>
                  <Col xs={6} className="text-muted mb-1">
                    Specialisation
                  </Col>
                  <Col xs={6} className="fw-medium mb-1">
                    {selectedLog.doctor?.specialisation}
                  </Col>
                  <Col xs={6} className="text-muted">
                    Visit Type
                  </Col>
                  <Col xs={6} className="fw-medium">
                    {selectedLog.visitType === "FIRST_VISIT"
                      ? "First Visit"
                      : "Repeat Visit"}
                  </Col>
                </Row>
              </div>

              {/* GPS: First location vs New location */}
              <div className="rounded-3 border p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-map-pin text-primary me-1" /> Location
                  Check
                </div>

                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <div className="text-muted fs-12 mb-1">
                      FIRST VISIT LOCATION (reference)
                    </div>
                    <div
                      className="rounded-3 p-2"
                      style={{ background: "#f8f9fb" }}
                    >
                      <div className="fs-13 fw-medium">
                        {selectedLog.doctor?.clinicLocation?.lat?.toFixed(5)},{" "}
                        {selectedLog.doctor?.clinicLocation?.lng?.toFixed(5)}
                      </div>
                      {selectedLog.doctor?.clinicLocation?.lat && (
                        <a
                          href={mapsLink(
                            selectedLog.doctor.clinicLocation.lat,
                            selectedLog.doctor.clinicLocation.lng,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="fs-12"
                        >
                          <i className="bx bx-link-external me-1" />
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="text-muted fs-12 mb-1">
                      THIS VISIT'S LOCATION
                    </div>
                    <div
                      className="rounded-3 p-2"
                      style={{
                        background: selectedLog.gps?.matchedClinic
                          ? "#e6f7f4"
                          : "#fde8e4",
                      }}
                    >
                      <div className="fs-13 fw-medium">
                        {selectedLog.gps?.lat?.toFixed(5)},{" "}
                        {selectedLog.gps?.lng?.toFixed(5)}
                      </div>
                      {selectedLog.gps?.lat && (
                        <a
                          href={mapsLink(
                            selectedLog.gps.lat,
                            selectedLog.gps.lng,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="fs-12"
                        >
                          <i className="bx bx-link-external me-1" />
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                </Row>

                {selectedLog.visitType === "REPEAT_VISIT" && (
                  <div className="text-center mt-3">
                    <span
                      className={`badge rounded-pill fw-semibold px-3 py-2 fs-13 ${
                        selectedLog.gps?.matchedClinic
                          ? "text-success"
                          : "text-danger"
                      }`}
                      style={{
                        background: selectedLog.gps?.matchedClinic
                          ? "#e6f7f4"
                          : "#fde8e4",
                      }}
                    >
                      {formatDistance(
                        getDistanceInMeters(
                          selectedLog.gps?.lat,
                          selectedLog.gps?.lng,
                          selectedLog.doctor?.clinicLocation?.lat,
                          selectedLog.doctor?.clinicLocation?.lng,
                        ),
                      )}{" "}
                      away from the recorded clinic location
                    </span>
                  </div>
                )}
              </div>

              {/* Discussion */}
              <div className="rounded-3 border p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-message-detail text-primary me-1" />{" "}
                  Discussion
                </div>
                <div className="fs-13 mb-2">{selectedLog.visitNotes}</div>
                <div className="d-flex gap-2 flex-wrap">
                  <InterestBadge level={selectedLog.interestLevel} />
                  {selectedLog.nextFollowUpDate && (
                    <span
                      className="badge rounded-pill fw-medium"
                      style={{ background: "#eef2ff", color: "#3577f1" }}
                    >
                      Follow-up:{" "}
                      {new Date(
                        selectedLog.nextFollowUpDate,
                      ).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="rounded-3 border p-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-camera text-primary me-1" /> Photo Proof
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  {selectedLog.selfieProof?.url && (
                    <div>
                      <div className="text-muted fs-12 mb-1">Selfie</div>
                      <a
                        href={selectedLog.selfieProof.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={selectedLog.selfieProof.url}
                          alt="Selfie"
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                            objectFit: "cover",
                          }}
                        />
                      </a>
                    </div>
                  )}
                  {selectedLog.collateral?.proofPricing?.url && (
                    <div>
                      <div className="text-muted fs-12 mb-1">
                        Pricing Brochure Proof
                      </div>
                      <a
                        href={selectedLog.collateral.proofPricing.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={selectedLog.collateral.proofPricing.url}
                          alt="Pricing proof"
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                            objectFit: "cover",
                          }}
                        />
                      </a>
                    </div>
                  )}
                  {selectedLog.collateral?.proofCentre?.url && (
                    <div>
                      <div className="text-muted fs-12 mb-1">
                        Centre Brochure Proof
                      </div>
                      <a
                        href={selectedLog.collateral.proofCentre.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={selectedLog.collateral.proofCentre.url}
                          alt="Centre proof"
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                            objectFit: "cover",
                          }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VisitLogList;
