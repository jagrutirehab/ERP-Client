import React, { useEffect, useMemo, useState } from "react";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import Basic404 from "../AuthenticationInner/Errors/Basic404";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Spinner,
  Alert,
  Input,
  InputGroup,
  InputGroupText,
  Row,
  Col,
  Badge,
} from "reactstrap";
import {
  getDoctorDirectory,
  getDoctorVisitHistory,
} from "../../helpers/backend_helper";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const DoctorVisits = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission, loading: permissionLoading } = usePermissions(token);
  const handleAuthError = useAuthError();
  const [searchParams, setSearchParams] = useSearchParams();

  // Left panel — doctor directory
  const [doctors, setDoctors] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Right panel — visit history for selected doctor
  const [visits, setVisits] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [expandedVisitId, setExpandedVisitId] = useState(null);

  useEffect(() => {
    document.title = "Doctor Visits | Jagruti Rehab";
  }, []);

  // Load the full doctor directory once on mount
  useEffect(() => {
    setListLoading(true);
    getDoctorDirectory({})
      .then((res) => {
        const data = res?.data?.payload || res?.payload || res?.data || [];
        setDoctors(data);
      })
      .catch((err) => {
        if (!handleAuthError(err)) {
          setListError(
            err?.response?.data?.message || "Failed to load doctors",
          );
        }
      })
      .finally(() => setListLoading(false));
  }, []);

  // If the URL already has ?doctor=&clinic= (e.g. shared link or refresh),
  // auto-select that doctor once the directory has loaded — mirrors /patient/:id behaviour
  useEffect(() => {
    if (doctors.length === 0) return;
    const urlName = searchParams.get("doctor");
    const urlClinic = searchParams.get("clinic");
    if (!urlName || !urlClinic) return;

    const match = doctors.find(
      (d) => d.name === urlName && d.clinicName === urlClinic,
    );
    if (match) {
      setSelectedDoctor(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  // Fetch visit history whenever the selected doctor changes
  useEffect(() => {
    if (!selectedDoctor) return;
    setDetailLoading(true);
    setDetailError(null);
    setExpandedVisitId(null); // collapse any open entry when switching doctors
    getDoctorVisitHistory({
      name: selectedDoctor.name,
      clinicName: selectedDoctor.clinicName,
    })
      .then((res) => {
        const data = res?.data?.payload || res?.payload || res?.data || [];
        setVisits(data);
      })
      .catch((err) => {
        if (!handleAuthError(err)) {
          setDetailError(
            err?.response?.data?.message || "Failed to load visit history",
          );
        }
      })
      .finally(() => setDetailLoading(false));
  }, [selectedDoctor]);

  // Clicking a doctor in the directory — select it and push name/clinic into the URL
  const handleSelectDoctor = (d) => {
    setSelectedDoctor(d);
    setSearchParams({ doctor: d.name, clinic: d.clinicName });
  };

  const toggleExpand = (id) => {
    setExpandedVisitId((prev) => (prev === id ? null : id));
  };

  const filteredDoctors = useMemo(
    () =>
      doctors.filter(
        (d) =>
          !search.trim() ||
          d.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
          d.clinicName?.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [doctors, search],
  );

  const sortedVisits = useMemo(
    () =>
      [...visits].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)),
    [visits],
  );

  const doctorInfo = visits[0]?.doctor;
  const totalVisits = visits.length;
  const matched = visits.filter((v) => v.gps?.matchedClinic).length;
  const mismatch = totalVisits - matched;
  const verifiedRate =
    totalVisits > 0 ? Math.round((matched / totalVisits) * 100) : 0;
  const uniqueAgents = [
    ...new Set(visits.map((v) => v.agent?.name).filter(Boolean)),
  ];

  const displayName = selectedDoctor
    ? /^dr\.?\s/i.test(selectedDoctor.name)
      ? selectedDoctor.name
      : `Dr. ${selectedDoctor.name}`
    : "";

  if (permissionLoading) {
    return (
      <div
        className="page-content d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  const canView = hasPermission("MARKETING", "VIEW_DOCTOR_VISITS", "READ");
  if (!canView) {
    return <Basic404 />;
  }

  return (
    <div
      className="page-content"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        paddingTop: "70px",
      }}
    >
      <style>
        {`
          .dv-layout-grid {
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 1.5rem;
            align-items: start;
          }

          @media (max-width: 991px) {
            .dv-layout-grid {
              grid-template-columns: 1fr;
            }
          }

          .dv-sidebar-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }

          .dv-list-panel {
            max-height: calc(100vh - 210px);
            overflow-y: auto;
          }

          .dv-item-card {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 3px solid transparent;
            background-color: #ffffff;
          }
          .dv-item-card:hover { 
            background-color: #f8fafc !important; 
          }
          .dv-item-card.active {
            background-color: #eff6ff !important;
            border-left-color: #2563eb !important;
          }

          .dv-avatar {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            flex-shrink: 0;
            border: 1px solid #e2e8f0;
          }
          .dv-avatar.lg { 
            background: #dbeafe; 
            color: #1e40af; 
            border-color: #bfdbfe;
          }

          .dv-history-card {
            transition: all 0.2s ease-in-out;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
            overflow: hidden;
          }
          .dv-history-card:hover { 
            border-color: #cbd5e1;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          .dv-history-card.expanded { 
            border-color: #3b82f6;
            box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.08);
          }

          .dv-history-header { 
            cursor: pointer; 
            user-select: none;
          }

          .dv-expand-arrow {
            transition: transform 0.2s ease-in-out;
            font-size: 20px;
            color: #94a3b8;
            flex-shrink: 0;
          }
          .dv-expand-arrow.open { 
            transform: rotate(90deg); 
            color: #2563eb; 
          }

          .dv-stat-card {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .dv-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }

          .dv-notes-box {
            word-break: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            line-height: 1.5;
          }

          .img-zoom { 
            transition: transform 0.2s ease, box-shadow 0.2s ease; 
            cursor: pointer;
          }
          .img-zoom:hover { 
            transform: scale(1.06); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .dv-list-panel::-webkit-scrollbar { width: 5px; }
          .dv-list-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .dv-list-panel::-webkit-scrollbar-track { background: #f8fafc; }
        `}
      </style>

      <div className="px-4 py-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h4
              className="fw-bold mb-1"
              style={{ color: "#0f172a", letterSpacing: "-0.02em" }}
            >
              Doctor Field Visits
            </h4>
            {/* <p className="text-muted mb-0 fs-13">
              Field representative visit records and doctor engagement history
            </p> */}
          </div>
          {/* <span
            className="d-inline-flex align-items-center gap-2 px-3 py-2 fs-13 fw-semibold shadow-sm"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              color: "#334155",
            }}
          >
            <i className="bx bx-clinic text-primary fs-16" />
            {doctors.length} Doctors Registered
          </span> */}
        </div>

        <div className="dv-layout-grid">
          {/* LEFT: Directory */}
          <div className="dv-sidebar-card">
            <div
              className="p-3 border-bottom"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span
                  className="text-uppercase fw-bold text-muted"
                  style={{ letterSpacing: "0.05em", fontSize: "11px" }}
                >
                  Directory
                </span>
                <Badge
                  color="light"
                  className="px-2 py-1 border text-secondary"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {filteredDoctors.length}
                </Badge>
              </div>
              <InputGroup size="sm" className="shadow-sm rounded-2">
                <InputGroupText
                  style={{
                    background: "#fff",
                    borderColor: "#cbd5e1",
                    borderRight: "none",
                  }}
                >
                  <i className="bx bx-search text-muted fs-15" />
                </InputGroupText>
                <Input
                  placeholder="Search doctor or clinic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    borderColor: "#cbd5e1",
                    borderLeft: "none",
                    boxShadow: "none",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </div>

            <div className="dv-list-panel">
              {listLoading && (
                <div className="text-center py-5">
                  <Spinner size="sm" color="primary" />
                  <span className="d-block text-muted fs-12 mt-2">
                    Loading directory…
                  </span>
                </div>
              )}
              {listError && (
                <Alert color="danger" className="m-3 fs-12 border-0 shadow-sm">
                  {listError}
                </Alert>
              )}
              {!listLoading && !listError && filteredDoctors.length === 0 && (
                <div className="text-center text-muted py-5 px-3 fs-13">
                  No doctors match your search
                </div>
              )}
              {!listLoading &&
                !listError &&
                filteredDoctors.map((d, idx) => {
                  const isActive =
                    selectedDoctor?.name === d.name &&
                    selectedDoctor?.clinicName === d.clinicName;
                  return (
                    <div
                      key={idx}
                      className={`dv-item-card p-3 ${isActive ? "active" : ""}`}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSelectDoctor(d)}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="dv-avatar rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, fontSize: 13 }}
                        >
                          {getInitials(d.name) || "?"}
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div
                            className="fw-semibold fs-14 text-truncate"
                            style={{ color: isActive ? "#2563eb" : "#0f172a" }}
                          >
                            {/^dr\.?\s/i.test(d.name)
                              ? d.name
                              : `Dr. ${d.name}`}
                          </div>
                          <div className="text-muted fs-12 text-truncate mt-1">
                            {d.clinicName}
                          </div>
                          <div className="d-flex align-items-center justify-content-between mt-2">
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#64748b",
                              }}
                            >
                              {d.totalVisits} visits
                            </span>
                            <span
                              className="text-muted"
                              style={{ fontSize: 11 }}
                            >
                              {d.lastVisitDate
                                ? new Date(d.lastVisitDate).toLocaleDateString(
                                    "en-IN",
                                    { day: "2-digit", month: "short" },
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <div
                          className="rounded-circle flex-shrink-0 mt-1 shadow-sm"
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor:
                              d.mismatchCount > 0 ? "#ef4444" : "#22c55e",
                          }}
                          title={
                            d.mismatchCount > 0
                              ? "Location mismatch present"
                              : "All visits verified"
                          }
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* RIGHT: Detail panel */}
          <div>
            {/* {!selectedDoctor && (
              <Card
                className="border-0 shadow-sm d-flex align-items-center justify-content-center p-5 bg-white"
                style={{ borderRadius: 12, minHeight: 320 }}
              >
                <div className="text-center">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 72,
                      height: 72,
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    <i className="bx bx-user-pin" style={{ fontSize: 36 }} />
                  </div>
                  <h5 className="fw-bold text-dark mb-1">No Doctor Selected</h5>
                  <p
                    className="fs-13 text-muted"
                    style={{ maxWidth: 340, margin: "0 auto" }}
                  >
                    Select a doctor from the directory to view visit history,
                    location verifications, and agent records.
                  </p>
                </div>
              </Card>
            )} */}

            {selectedDoctor && (
              <>
                {detailLoading && (
                  <Card
                    className="border-0 shadow-sm d-flex align-items-center justify-content-center bg-white"
                    style={{ borderRadius: 12, minHeight: 320 }}
                  >
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <span className="d-block text-muted fs-13 mt-2">
                        Loading doctor visit history…
                      </span>
                    </div>
                  </Card>
                )}

                {detailError && (
                  <Alert
                    color="danger"
                    className="border-0 shadow-sm rounded-3"
                  >
                    {detailError}
                  </Alert>
                )}

                {!detailLoading && !detailError && (
                  <>
                    {/* Doctor Profile */}
                    <Card
                      className="border-0 shadow-sm p-3 mb-3 bg-white"
                      style={{ borderRadius: 12 }}
                    >
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div
                          className="dv-avatar lg rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: 56, height: 56, fontSize: 20 }}
                        >
                          {getInitials(selectedDoctor.name) || "?"}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h5 className="mb-0 fw-bold text-dark">
                              {displayName}
                            </h5>
                            {doctorInfo?.specialisation && (
                              <Badge
                                color="light"
                                className="text-primary border fs-12 px-2 py-1 rounded-2"
                              >
                                {doctorInfo.specialisation}
                              </Badge>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-4 mt-2 flex-wrap fs-13 text-muted">
                            <span>
                              <i className="bx bx-building-house me-1 text-primary" />
                              {selectedDoctor.clinicName}
                            </span>
                            {doctorInfo?.contactNumber && (
                              <span>
                                <i className="bx bx-phone me-1 text-success" />
                                {doctorInfo.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Stats */}
                    <Row className="g-3 mb-4">
                      <Col xs={6} md={3}>
                        <div className="dv-stat-card p-3 rounded-3">
                          <div className="text-muted fs-12 mb-1 fw-medium">
                            Total Visits
                          </div>
                          <div className="fw-bold fs-20 text-dark">
                            {totalVisits}
                          </div>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="dv-stat-card p-3 rounded-3">
                          <div className="text-muted fs-12 mb-1 fw-medium">
                            GPS Verified
                          </div>
                          <div className="fw-bold fs-20 text-success">
                            {verifiedRate}%
                          </div>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="dv-stat-card p-3 rounded-3">
                          <div className="text-muted fs-12 mb-1 fw-medium">
                            Mismatches
                          </div>
                          <div className="fw-bold fs-20 text-danger">
                            {mismatch}
                          </div>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="dv-stat-card p-3 rounded-3">
                          <div className="text-muted fs-12 mb-1 fw-medium">
                            Field Agents
                          </div>
                          <div className="fw-bold fs-20 text-primary">
                            {uniqueAgents.length}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Visit list — click a row to expand inline, accordion style */}
                    <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                      <span
                        className="text-uppercase fw-bold text-muted"
                        style={{ letterSpacing: "0.05em", fontSize: "11px" }}
                      >
                        Visit History ({sortedVisits.length})
                      </span>
                      <span className="text-muted fs-12">
                        Most recent first
                      </span>
                    </div>

                    {sortedVisits.length === 0 ? (
                      <Card
                        className="border-0 shadow-sm text-center text-muted py-5 bg-white"
                        style={{ borderRadius: 12 }}
                      >
                        No visit history recorded yet
                      </Card>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {sortedVisits.map((v, idx) => {
                          const isExpanded = expandedVisitId === v._id;
                          return (
                            <div
                              key={v._id}
                              className={`dv-history-card bg-white rounded-3 ${
                                isExpanded ? "expanded" : ""
                              }`}
                            >
                              {/* Header row — always visible, click to expand/collapse */}
                              <div
                                className="dv-history-header p-3"
                                onClick={() => toggleExpand(v._id)}
                              >
                                <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                                  <div className="d-flex align-items-center gap-3">
                                    <i
                                      className={`bx bx-chevron-right dv-expand-arrow ${
                                        isExpanded ? "open" : ""
                                      }`}
                                    />
                                    <div
                                      className="dv-avatar rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                      style={{
                                        width: 36,
                                        height: 36,
                                        fontSize: 12,
                                      }}
                                    >
                                      {getInitials(v.agent?.name) || "?"}
                                    </div>
                                    <div>
                                      <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="fw-semibold text-dark fs-14">
                                          {v.agent?.name || "Unknown Agent"}
                                        </span>
                                        {idx === 0 && (
                                          <Badge
                                            color="primary"
                                            className="fs-11 px-2 py-1"
                                            style={{ fontWeight: 600 }}
                                          >
                                            Latest
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-muted fs-12">
                                        {formatDate(v.visitDate)} ·{" "}
                                        {formatTime(v.checkInTime)}
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    className="px-2.5 py-1 rounded-2 fw-semibold fs-11 flex-shrink-0"
                                    style={{
                                      backgroundColor: v.gps?.matchedClinic
                                        ? "#f0fdf4"
                                        : "#fef2f2",
                                      color: v.gps?.matchedClinic
                                        ? "#166534"
                                        : "#991b1b",
                                      border: `1px solid ${
                                        v.gps?.matchedClinic
                                          ? "#bbf7d0"
                                          : "#fecaca"
                                      }`,
                                    }}
                                  >
                                    {v.gps?.matchedClinic
                                      ? "Verified"
                                      : "Mismatch"}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded inline detail */}
                              {isExpanded && (
                                <div
                                  className="px-3 pb-3"
                                  style={{ borderTop: "1px solid #f1f5f9" }}
                                >
                                  <div className="mt-3">
                                    <span
                                      className="text-uppercase fw-bold text-muted d-block mb-2"
                                      style={{
                                        letterSpacing: "0.05em",
                                        fontSize: "11px",
                                      }}
                                    >
                                      Location Comparison
                                    </span>
                                    <Row className="g-2">
                                      <Col xs={12} md={6}>
                                        <div
                                          className="p-3 border rounded-3 h-100 bg-light-subtle"
                                          style={{ borderColor: "#e2e8f0" }}
                                        >
                                          <div
                                            className="text-muted fw-bold text-uppercase mb-1"
                                            style={{
                                              fontSize: "11px",
                                              letterSpacing: "0.02em",
                                            }}
                                          >
                                            Registered Clinic
                                          </div>
                                          <div className="fw-medium text-dark fs-13 mb-2">
                                            {v.doctor?.clinicLocation?.lat?.toFixed(
                                              5,
                                            ) || "N/A"}
                                            ,{" "}
                                            {v.doctor?.clinicLocation?.lng?.toFixed(
                                              5,
                                            ) || "N/A"}
                                          </div>
                                          {v.doctor?.clinicLocation?.lat && (
                                            <a
                                              href={mapsLink(
                                                v.doctor.clinicLocation.lat,
                                                v.doctor.clinicLocation.lng,
                                              )}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="btn btn-sm btn-outline-secondary fs-12 shadow-sm"
                                            >
                                              View on Maps
                                            </a>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div
                                          className="p-3 border rounded-3 h-100"
                                          style={{
                                            backgroundColor: v.gps
                                              ?.matchedClinic
                                              ? "#f0fdf4"
                                              : "#fef2f2",
                                            borderColor: v.gps?.matchedClinic
                                              ? "#bbf7d0"
                                              : "#fecaca",
                                          }}
                                        >
                                          <div
                                            className="text-muted fw-bold text-uppercase mb-1"
                                            style={{
                                              fontSize: "11px",
                                              letterSpacing: "0.02em",
                                            }}
                                          >
                                            Recorded Check-in
                                          </div>
                                          <div className="fw-medium text-dark fs-13 mb-2">
                                            {v.gps?.lat?.toFixed(5) || "N/A"},{" "}
                                            {v.gps?.lng?.toFixed(5) || "N/A"}
                                          </div>
                                          {v.gps?.lat && (
                                            <a
                                              href={mapsLink(
                                                v.gps.lat,
                                                v.gps.lng,
                                              )}
                                              target="_blank"
                                              rel="noreferrer"
                                              className={`btn btn-sm fs-12 shadow-sm ${
                                                v.gps?.matchedClinic
                                                  ? "btn-outline-success"
                                                  : "btn-outline-danger"
                                              }`}
                                            >
                                              Open Location
                                            </a>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>

                                  <div className="mt-3">
                                    <span
                                      className="text-uppercase fw-bold text-muted d-block mb-2"
                                      style={{
                                        letterSpacing: "0.05em",
                                        fontSize: "11px",
                                      }}
                                    >
                                      Discussion Notes
                                    </span>
                                    <div
                                      className="dv-notes-box p-3 rounded-3 border fs-13 text-dark mb-2"
                                      style={{
                                        background: "#f8fafc",
                                        borderColor: "#e2e8f0",
                                      }}
                                    >
                                      {v.visitNotes || (
                                        <span className="text-muted fst-italic">
                                          No notes added.
                                        </span>
                                      )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span
                                        className="px-2 py-1 fs-12 rounded border"
                                        style={{
                                          background: "#f1f5f9",
                                          color: "#334155",
                                          borderColor: "#cbd5e1",
                                        }}
                                      >
                                        Fee Discussed:{" "}
                                        {v.commissionDiscussed ? "Yes" : "No"}
                                      </span>
                                      {v.commissionDiscussed &&
                                        v.commissionPercentage != null && (
                                          <span className="px-2 py-1 fs-12 rounded text-white bg-primary">
                                            Commission: {v.commissionPercentage}
                                            %
                                          </span>
                                        )}
                                      <span
                                        className="px-2 py-1 rounded fs-11"
                                        style={{
                                          background: "#f8fafc",
                                          border: "1px solid #e2e8f0",
                                          color: "#475569",
                                        }}
                                      >
                                        {v.visitType === "FIRST_VISIT"
                                          ? "First Visit"
                                          : "Repeat Visit"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <span
                                      className="text-uppercase fw-bold text-muted d-block mb-2"
                                      style={{
                                        letterSpacing: "0.05em",
                                        fontSize: "11px",
                                      }}
                                    >
                                      Photo Verification
                                    </span>
                                    {v.selfieProof?.url ||
                                    v.clinicPhoto?.url ? (
                                      <div className="d-flex gap-3 flex-wrap">
                                        {v.selfieProof?.url && (
                                          <div className="text-center">
                                            <img
                                              src={v.selfieProof.url}
                                              alt="Selfie Proof"
                                              className="rounded-3 border img-zoom shadow-sm"
                                              style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                              }}
                                            />
                                            <span className="d-block text-muted fs-11 mt-1">
                                              Selfie
                                            </span>
                                          </div>
                                        )}
                                        {v.clinicPhoto?.url && (
                                          <div className="text-center">
                                            <img
                                              src={v.clinicPhoto.url}
                                              alt="Clinic Photo"
                                              className="rounded-3 border img-zoom shadow-sm"
                                              style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                              }}
                                            />
                                            <span className="d-block text-muted fs-11 mt-1">
                                              Clinic Photo
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div
                                        className="p-3 text-center rounded-3 border text-muted fs-13 fst-italic"
                                        style={{
                                          background: "#f8fafc",
                                          borderColor: "#e2e8f0",
                                        }}
                                      >
                                        No photo proof submitted for this visit.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="text-center text-muted fs-12 py-3">
                          <i className="bx bx-check-circle me-1" />
                          End of visit history
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVisits;
