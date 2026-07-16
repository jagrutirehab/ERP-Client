import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Collapse,
} from "reactstrap";
import { getAgentVisitReport } from "../../../helpers/backend_helper";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  "#3577f1",
  "#0ab39c",
  "#f7b84b",
  "#f06548",
  "#299cdb",
  "#7d5fff",
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length || 0];

const getDefaultMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: first.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
};

const toISO = (d) => d.toISOString().slice(0, 10);

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

const INTEREST_COLORS = {
  HOT: "#f06548",
  WARM: "#f7b84b",
  COLD: "#299cdb",
};

const AgentReport = () => {
  const [dateRange, setDateRange] = useState(getDefaultMonthRange());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [search, setSearch] = useState("");
  const [mismatchFilter, setMismatchFilter] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activePreset, setActivePreset] = useState(null);
  const searchWrapperRef = useRef(null);

  const fetchReport = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const reportRes = await getAgentVisitReport(range);
      const payload = reportRes?.payload || reportRes?.data?.payload || [];
      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    data.forEach((agentData) => {
      if (agentData.agent?.name && !agentMap.has(agentData.agent.name)) {
        agentMap.set(agentData.agent.name, {
          type: "Agent",
          label: agentData.agent.name,
          sub: agentData.agent.email,
        });
      }
      agentData.doctors.forEach((doc) => {
        const key = `${doc.doctorName}__${doc.clinicName}`;
        if (!doctorMap.has(key)) {
          doctorMap.set(key, {
            type: "Doctor",
            label: doc.doctorName,
            sub: doc.clinicName,
          });
        }
      });
    });

    return [...agentMap.values(), ...doctorMap.values()];
  }, [data]);

  const filteredSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, suggestionPool]);

  const applyRange = () => {
    setActivePreset(null);
    setCurrentPage(1);
    fetchReport(dateRange);
  };

  const applyPreset = (presetKey) => {
    const range = DATE_PRESETS[presetKey]();
    setDateRange(range);
    setActivePreset(presetKey);
    setCurrentPage(1);
    fetchReport(range);
  };

  // Search across agent name/email and any doctor/clinic they've visited
  const filteredData = data.filter((agentData) => {
    if (mismatchFilter === "mismatch" && agentData.mismatchCount === 0)
      return false;
    if (mismatchFilter === "clean" && agentData.mismatchCount > 0) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const agentMatch =
        agentData.agent.name?.toLowerCase().includes(q) ||
        agentData.agent.email?.toLowerCase().includes(q);
      const doctorMatch = agentData.doctors.some(
        (d) =>
          d.doctorName?.toLowerCase().includes(q) ||
          d.clinicName?.toLowerCase().includes(q),
      );
      if (!agentMatch && !doctorMatch) return false;
    }
    return true;
  });

  const totalVisitsAllAgents = filteredData.reduce(
    (sum, a) => sum + a.totalVisits,
    0,
  );
  const totalMatched = filteredData.reduce((sum, a) => sum + a.matchedCount, 0);
  const totalMismatch = filteredData.reduce(
    (sum, a) => sum + a.mismatchCount,
    0,
  );
  const totalAgentsCount = data.length;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          {/* ---- Header ---- */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
            <div>
              <h4 className="mb-0 fw-semibold">Agent Visit Report</h4>
            </div>
            <span className="text-muted fs-13">
              Today,{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>

          {/* ---- Filters (date range + search + mismatch) ---- */}
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
              <Row className="g-3 align-items-end">
                <Col xs={12} md={7}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Search agent or doctor
                  </Label>
                  <div className="position-relative" ref={searchWrapperRef}>
                    <Input
                      size="sm"
                      placeholder="Type a name to narrow down the report…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSuggestions(true);
                        setCurrentPage(1);
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearch(s.label);
                              setShowSuggestions(false);
                              setCurrentPage(1);
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
                <Col xs={12} md={5}>
                  <Label
                    className="fw-semibold text-dark mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Show only
                  </Label>
                  <Input
                    type="select"
                    size="sm"
                    value={mismatchFilter}
                    onChange={(e) => {
                      setMismatchFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All agents</option>
                    <option value="mismatch">Agents with GPS mismatches</option>
                    <option value="clean">Agents with no mismatches</option>
                  </Input>
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
                  {search.trim() || mismatchFilter
                    ? `Showing totals for ${filteredData.length} filtered agent${filteredData.length === 1 ? "" : "s"}`
                    : `Team totals — ${totalAgentsCount} agent${totalAgentsCount === 1 ? "" : "s"} in this date range`}
                </span>
              </div>
              <Row className="g-3 mb-1">
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#eef2ff" }}
                  >
                    <div className="text-muted fs-13">Agents</div>
                    <div
                      className="fs-3 fw-semibold"
                      style={{ color: "#3577f1" }}
                    >
                      {filteredData.length}
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#f8f9fb" }}
                  >
                    <div className="text-muted fs-13">Total Visits</div>
                    <div className="fs-3 fw-semibold">
                      {totalVisitsAllAgents}
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#e6f7f4" }}
                  >
                    <div className="text-muted fs-13">Verified</div>
                    <div className="fs-3 fw-semibold text-success">
                      {totalMatched}
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      GPS matched the clinic
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
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

              <div className="mb-2">
                <span className="fw-semibold text-dark fs-14">
                  Agent-wise visit summary
                </span>
              </div>
              {filteredData.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardBody className="text-center text-muted py-5">
                    <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                    No agents match this search / filter
                  </CardBody>
                </Card>
              ) : (
                paginatedData.map((agentData) => {
                  const isOpen = expandedAgent === agentData.agent._id;
                  const hasMismatch = agentData.mismatchCount > 0;
                  return (
                    <Card
                      key={agentData.agent._id}
                      className="border-0 shadow-sm mb-3"
                      style={{
                        borderLeft: `3px solid ${hasMismatch ? "#f06548" : "#0ab39c"}`,
                      }}
                    >
                      <CardBody className="p-3 p-lg-4">
                        <div
                          className="d-flex align-items-center justify-content-between flex-wrap gap-3"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setExpandedAgent(
                              isOpen ? null : agentData.agent._id,
                            )
                          }
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                              style={{
                                width: 44,
                                height: 44,
                                fontSize: 15,
                                background: getAvatarColor(
                                  agentData.agent.name,
                                ),
                              }}
                            >
                              {getInitials(agentData.agent.name) || "?"}
                            </div>
                            <div>
                              <div className="fw-semibold fs-15">
                                {agentData.agent.name}
                              </div>
                              <div className="text-muted fs-13">
                                {agentData.agent.email}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4 flex-wrap">
                            <div className="text-center">
                              <div className="text-muted fs-12">
                                Total Visits
                              </div>
                              <div className="fw-semibold fs-16">
                                {agentData.totalVisits}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Avg / Day</div>
                              <div className="fw-semibold fs-16">
                                {agentData.avgPerDay.toFixed(1)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Verified</div>
                              <div className="fw-semibold fs-16 text-success">
                                {agentData.verifiedRate}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted fs-12">Mismatches</div>
                              <div
                                className={`fw-semibold fs-16 ${hasMismatch ? "text-danger" : "text-muted"}`}
                              >
                                {agentData.mismatchCount}
                              </div>
                            </div>
                            <div
                              className="d-flex gap-1"
                              title="Doctor interest level breakdown"
                            >
                              {["HOT", "WARM", "COLD"].map((level) =>
                                agentData.interest[level] > 0 ? (
                                  <span
                                    key={level}
                                    className="badge rounded-pill fw-semibold"
                                    style={{
                                      background: `${INTEREST_COLORS[level]}18`,
                                      color: INTEREST_COLORS[level],
                                      fontSize: "11px",
                                    }}
                                    title={`${level.charAt(0) + level.slice(1).toLowerCase()}: ${agentData.interest[level]} doctor${agentData.interest[level] > 1 ? "s" : ""}`}
                                  >
                                    {level.charAt(0) +
                                      level.slice(1).toLowerCase()}{" "}
                                    {agentData.interest[level]}
                                  </span>
                                ) : null,
                              )}
                            </div>
                            <i
                              className={`bx ${isOpen ? "bx-chevron-up" : "bx-chevron-down"} fs-4 text-muted`}
                            />
                          </div>
                        </div>

                        <Collapse isOpen={isOpen}>
                          <div className="mt-3 pt-3 border-top">
                            <div className="text-muted fs-13 fw-semibold mb-2">
                              Doctor-wise visit history
                            </div>
                            {agentData.doctors.map((doc, idx) => (
                              <div
                                key={idx}
                                className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
                                style={{
                                  borderBottom:
                                    idx < agentData.doctors.length - 1
                                      ? "1px solid #f1f1f1"
                                      : "none",
                                }}
                              >
                                <div>
                                  <div className="fw-medium fs-14">
                                    <i
                                      className="bx bx-user-voice text-primary me-1"
                                      style={{ fontSize: "13px" }}
                                    />
                                    Dr. {doc.doctorName}
                                  </div>
                                  <div className="text-muted fs-13">
                                    <i
                                      className="bx bx-hospital me-1"
                                      style={{ fontSize: "12px" }}
                                    />
                                    {doc.clinicName}
                                    {doc.lastVisitDate && (
                                      <>
                                        {" · last visit "}
                                        {new Date(
                                          doc.lastVisitDate,
                                        ).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                        {" · "}
                                        {new Date(
                                          doc.lastVisitDate,
                                        ).toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  {doc.mismatchCount > 0 && (
                                    <span
                                      className="badge rounded-pill fw-semibold"
                                      style={{
                                        background: "#fde8e4",
                                        color: "#f06548",
                                      }}
                                    >
                                      <i className="bx bx-error-circle me-1" />
                                      {doc.mismatchCount} mismatch
                                      {doc.mismatchCount > 1 ? "es" : ""}
                                    </span>
                                  )}
                                  <span
                                    className="badge rounded-pill fw-semibold px-3"
                                    style={{
                                      background: "#eef2ff",
                                      color: "#3577f1",
                                    }}
                                  >
                                    {doc.visitCount} visit
                                    {doc.visitCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Collapse>
                      </CardBody>
                    </Card>
                  );
                })
              )}

              {filteredData.length > 0 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted fs-13">Rows per page</span>
                    <Input
                      type="select"
                      size="sm"
                      style={{ width: "80px" }}
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </Input>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted fs-13">
                      {(safePage - 1) * rowsPerPage + 1}–
                      {Math.min(safePage * rowsPerPage, filteredData.length)} of{" "}
                      {filteredData.length} agents
                    </span>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        color="light"
                        disabled={safePage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        <i className="bx bx-chevron-left" />
                      </Button>
                      <Button
                        size="sm"
                        color="light"
                        disabled={safePage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        <i className="bx bx-chevron-right" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AgentReport;
