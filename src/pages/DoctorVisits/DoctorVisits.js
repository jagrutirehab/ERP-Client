import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import Basic404 from "../AuthenticationInner/Errors/Basic404";
import { toast } from "react-toastify";
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
  Modal,
  ModalHeader,
  ModalBody,
  UncontrolledTooltip,
} from "reactstrap";
import {
  getDoctorDirectory,
  getDoctorVisitHistory,
  exportDoctorDirectory,
  exportDoctorVisitHistory,
} from "../../helpers/backend_helper";

const getInitials = (name = "") =>
  name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "DR";

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
        hour12: true,
      })
    : "—";

const DoctorVisits = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission, loading: permissionLoading } = usePermissions(token);
  const handleAuthError = useAuthError();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [visits, setVisits] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingHistory, setIsExportingHistory] = useState(false);

  const [activeImage, setActiveImage] = useState(null);

  // Ref to the detail column — used to auto-scroll into view on mobile
  // when a doctor is picked, so users don't have to manually scroll past
  // a long (1000+) directory list every time.
  const detailRef = useRef(null);

  useEffect(() => {
    document.title = "Doctor Visits | Jagruti Rehab";
  }, []);

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
            err?.response?.data?.message || "Failed to load doctor directory",
          );
        }
      })
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (doctors.length === 0) return;
    const urlName = searchParams.get("doctor");
    const urlClinic = searchParams.get("clinic");
    if (!urlName || !urlClinic) return;
    const match = doctors.find(
      (d) => d.name === urlName && d.clinicName === urlClinic,
    );
    if (match) setSelectedDoctor(match);
  }, [doctors, searchParams]);

  useEffect(() => {
    if (!selectedDoctor) return;
    setDetailLoading(true);
    setDetailError(null);
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

  // Auto-scroll to the detail column on mobile/tablet stacked layouts,
  // so picking a doctor from a very long list doesn't leave the user
  // stuck having to manually scroll past the rest of the directory.
  useEffect(() => {
    if (!selectedDoctor) return;
    if (window.innerWidth > 1024) return; // desktop side-by-side layout — no need
    const timer = setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [selectedDoctor]);

  const handleSelectDoctor = (d) => {
    setSelectedDoctor(d);
    setSearchParams({ doctor: d.name, clinic: d.clinicName });
  };

  const handleExportDirectory = async () => {
    setIsExporting(true);
    try {
      const res = await exportDoctorDirectory();
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Doctor-Directory-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Failed to export report");
      }
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportHistory = async () => {
    if (!selectedDoctor) return;
    setIsExportingHistory(true);
    try {
      const res = await exportDoctorVisitHistory({
        name: selectedDoctor.name,
        clinicName: selectedDoctor.clinicName,
      });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const safeName = (selectedDoctor.name || "doctor").replace(
        /[^a-z0-9]/gi,
        "_",
      );
      link.download = `Visit-History-${safeName}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (!handleAuthError(err)) {
        toast.error(err?.response?.data?.message || "Failed to export report");
      }
    } finally {
      setIsExportingHistory(false);
    }
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
      <div className="page-content d-flex justify-content-center align-items-center min-vh-100">
        <Spinner
          color="primary"
          style={{ width: "2.5rem", height: "2.5rem" }}
        />
      </div>
    );
  }

  const canView = hasPermission("MARKETING", "VIEW_DOCTOR_VISITS", "READ");
  if (!canView) {
    return <Basic404 />;
  }

  return (
    <div className="page-content bg-light-subtle">
      <style>
        {`
          .dv-container {
            max-width: 1440px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 130px);
            min-height: 620px;
          }

          .dv-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
            background: #ffffff;
            overflow: hidden;
          }

          .dv-layout-grid {
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            gap: 1.25rem;
            align-items: stretch;
            flex: 1;
            min-height: 0;
          }

          @media (max-width: 1024px) {
            .dv-layout-grid { grid-template-columns: 1fr; height: auto; }
            .dv-container { height: auto; min-height: 0; }
            .dv-detail-col { height: auto; }
            .dv-log-card { flex: none; }
            .dv-timeline-scroll { flex: none; min-height: 320px; max-height: 480px; }
          }

          /* LEFT column */
          .dv-directory-col {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            overflow: hidden;
          }

          .dv-list-panel {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
          }

          .dv-item-card {
            border-left: 3px solid transparent;
            transition: background-color 0.15s ease, border-color 0.15s ease;
          }
          .dv-item-card:hover { background-color: #f8fafc; }
          .dv-item-card.active {
            background-color: #f0f7ff;
            border-left-color: #0284c7;
          }

          .dv-avatar {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            letter-spacing: 0.5px;
            border: 1px solid #e2e8f0;
            flex-shrink: 0;
          }
          .dv-avatar.active-avatar {
            background: #e0f2fe;
            color: #0369a1;
            border-color: #bae6fd;
          }

          .dv-kpi-card {
            border: 1px solid #f1f5f9;
            border-radius: 8px;
            background: #ffffff;
            padding: 0.65rem 0.85rem;
          }

          .dv-notes-box {
            word-break: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            line-height: 1.6;
            color: #334155;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          /* RIGHT column */
          .dv-detail-col {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            gap: 0.85rem;
          }

          .dv-empty-spacer {
            flex-grow: 1;
          }

          .dv-profile-card {
            flex-shrink: 0;
            padding: 1rem 1.25rem !important;
          }

          .dv-log-card {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            padding: 1.25rem !important;
          }

          .dv-log-header {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.75rem;
            margin-bottom: 0.85rem;
            flex-shrink: 0;
          }

          .dv-timeline-scroll {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
            padding: 1.25rem 1.25rem 1.25rem 2.5rem;
          }

          .dv-list-panel::-webkit-scrollbar,
          .dv-timeline-scroll::-webkit-scrollbar { width: 7px; }
          .dv-list-panel::-webkit-scrollbar-thumb,
          .dv-timeline-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .dv-list-panel::-webkit-scrollbar-track { background: transparent; }
          .dv-timeline-scroll::-webkit-scrollbar-track {
            background: #eef2f6;
            border-radius: 4px;
          }

          .dv-timeline { position: relative; }
          .dv-timeline::before {
            content: "";
            position: absolute;
            left: -21px;
            top: 16px;
            bottom: 16px;
            width: 2px;
            background: #dbe2ea;
          }

          .dv-timeline-item { position: relative; margin-bottom: 1.5rem; }
          .dv-timeline-item:last-child { margin-bottom: 0; }

          .dv-timeline-dot {
            position: absolute;
            left: -26px;
            top: 22px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 2px solid #f8fafc;
            box-shadow: 0 0 0 2px #cbd5e1;
            z-index: 2;
          }
          .dv-timeline-dot.verified { background: #10b981; box-shadow: 0 0 0 2px #a7f3d0; }
          .dv-timeline-dot.mismatch { background: #ef4444; box-shadow: 0 0 0 2px #fecaca; }

          .dv-visit-entry {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
            padding: 1.25rem;
            overflow-wrap: break-word;
            word-break: break-word;
            min-width: 0;
          }

          .dv-section-label {
            text-transform: uppercase;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.05em;
            font-size: 11px;
            display: block;
            margin-bottom: 0.6rem;
          }

          .dv-subbox {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
            min-width: 0;
          }

          .dv-img-thumbnail {
            width: 92px;
            height: 92px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            cursor: pointer;
          }
          .dv-img-thumbnail:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }

          /* ===== MOBILE-ONLY FIXES (desktop above is untouched) ===== */
          @media (max-width: 767px) {
            .dv-container {
              height: auto;
              min-height: 0;
              overflow-x: hidden;
            }

            .dv-layout-grid {
              height: auto;
            }

            .dv-directory-col {
              height: auto;
              max-height: 55vh;
              overflow-y: auto;
              scroll-margin-top: 12px;
            }

            .dv-list-panel {
              overflow: visible;
              flex: none;
            }

            .dv-empty-spacer {
              flex-grow: 0;
              height: 0;
              min-height: 0;
            }

            .dv-detail-col {
              height: auto;
              scroll-margin-top: 12px;
            }

            .dv-log-card {
              flex: none;
            }

            .dv-timeline-scroll {
              flex: none;
              max-height: 65vh;
              padding: 1rem 0.75rem 1rem 1.5rem;
            }

            .dv-timeline::before {
              left: -13px;
            }

            .dv-timeline-dot {
              left: -18px;
              width: 11px;
              height: 11px;
            }

            .dv-visit-entry {
              padding: 1rem;
            }

            .dv-profile-card {
              padding: 0.85rem 1rem !important;
            }

            .dv-log-card {
              padding: 1rem !important;
            }
          }
        `}
      </style>

      <div className="dv-container">
        {/* Header Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 flex-shrink-0">
          <h4
            className="fw-bold mb-0 text-dark"
            style={{ letterSpacing: "-0.02em" }}
          >
            Doctor Field Visits
          </h4>
          {/* <button
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
              <i className="ri-file-excel-2-line" style={{ fontSize: 16 }} />
            )}
            Export Excel
          </button> */}
        </div>

        {/* Main Workspace Layout — both columns share exactly the same height */}
        <div className="dv-layout-grid">
          {/* LEFT: Directory Sidebar */}
          <div className="dv-card dv-directory-col">
            <div className="p-3 border-bottom bg-white flex-shrink-0">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="dv-section-label mb-0">Directory</span>
                <Badge color="light" className="text-dark border font-mono">
                  {filteredDoctors.length}
                </Badge>
              </div>
              <InputGroup size="sm" className="border-0">
                <InputGroupText className="bg-light border-end-0 text-muted pe-1">
                  <i className="bx bx-search fs-16" />
                </InputGroupText>
                <Input
                  className="bg-light border-start-0 ps-1 fs-13 shadow-none"
                  placeholder="Search doctor or clinic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </div>

            <div className="dv-list-panel">
              {listLoading && (
                <div className="text-center py-5">
                  <Spinner size="sm" color="secondary" />
                  <span className="d-block text-muted fs-12 mt-2">
                    Loading doctors...
                  </span>
                </div>
              )}

              {listError && (
                <Alert color="danger" className="m-3 fs-12 py-2">
                  {listError}
                </Alert>
              )}

              {!listLoading && !listError && filteredDoctors.length === 0 && (
                <div className="text-center py-5 px-3">
                  <i className="bx bx-user-x fs-32 text-muted mb-2 d-block" />
                  <span className="text-muted fs-13">
                    No matching records found
                  </span>
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
                      className={`dv-item-card p-3 border-bottom cursor-pointer ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectDoctor(d)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`dv-avatar rounded-circle d-flex align-items-center justify-content-center fs-12 ${
                            isActive ? "active-avatar" : ""
                          }`}
                          style={{ width: 40, height: 40 }}
                        >
                          {getInitials(d.name)}
                        </div>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center justify-content-between gap-1">
                            <h6
                              className={`mb-0 fs-14 text-truncate ${
                                isActive
                                  ? "fw-bold text-primary"
                                  : "fw-semibold text-dark"
                              }`}
                            >
                              {/^dr\.?\s/i.test(d.name)
                                ? d.name
                                : `Dr. ${d.name}`}
                            </h6>
                            <span
                              className={`rounded-circle flex-shrink-0 ${
                                d.mismatchCount > 0 ? "bg-danger" : "bg-success"
                              }`}
                              style={{ width: 6, height: 6 }}
                              id={`status-dot-${idx}`}
                            />
                            <UncontrolledTooltip target={`status-dot-${idx}`}>
                              {d.mismatchCount > 0
                                ? `${d.mismatchCount} Location Mismatch(es)`
                                : "All visits GPS verified"}
                            </UncontrolledTooltip>
                          </div>

                          <div className="text-muted fs-12 text-truncate mt-1">
                            {d.clinicName}
                          </div>

                          <div className="d-flex align-items-center justify-content-between mt-2 pt-1">
                            <span className="badge bg-light text-secondary border font-mono fw-normal fs-11">
                              {d.totalVisits}{" "}
                              {d.totalVisits === 1 ? "visit" : "visits"}
                            </span>
                            <span className="text-muted fs-11">
                              {d.lastVisitDate
                                ? new Date(d.lastVisitDate).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    },
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* RIGHT: Detail View Workspace */}
          <div className="dv-detail-col" ref={detailRef}>
            {!selectedDoctor ? (
              <div className="dv-empty-spacer" />
            ) : (
              <>
                {detailLoading && (
                  <div className="dv-card p-5 text-center flex-grow-1 d-flex align-items-center justify-content-center">
                    <div>
                      <Spinner color="primary" />
                      <span className="d-block text-muted fs-13 mt-3">
                        Fetching history records...
                      </span>
                    </div>
                  </div>
                )}

                {detailError && <Alert color="danger">{detailError}</Alert>}

                {!detailLoading && !detailError && (
                  <>
                    {/* Header Details & Key Metrics — compact, doesn't scroll */}
                    <div className="dv-card dv-profile-card">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-2 mb-2 border-bottom">
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h5 className="mb-0 fw-bold text-dark">
                              {displayName}
                            </h5>
                            {doctorInfo?.specialisation && (
                              <Badge
                                color="primary-subtle"
                                className="text-primary border fs-11"
                              >
                                {doctorInfo.specialisation}
                              </Badge>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-3 flex-wrap fs-13 text-muted mt-1">
                            <span>
                              <i className="bx bx-building me-1 text-secondary" />
                              {selectedDoctor.clinicName}
                            </span>
                            {doctorInfo?.contactNumber && (
                              <span>
                                <i className="bx bx-phone me-1 text-secondary" />
                                {doctorInfo.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="btn d-flex align-items-center gap-2 flex-shrink-0"
                          onClick={handleExportHistory}
                          disabled={isExportingHistory}
                          style={{
                            backgroundColor: "#1e90ff",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 450,
                          }}
                        >
                          {isExportingHistory ? (
                            <Spinner size="sm" style={{ color: "#fff" }} />
                          ) : (
                            <i
                              className="ri-file-excel-2-line"
                              style={{ fontSize: 15 }}
                            />
                          )}
                          Export History
                        </button>
                      </div>

                      <Row className="g-2">
                        <Col xs={6} md={3}>
                          <div className="dv-kpi-card">
                            <span className="dv-section-label mb-1">
                              Total Visits
                            </span>
                            <div className="fw-bold fs-18 text-dark font-mono">
                              {totalVisits}
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="dv-kpi-card">
                            <span className="dv-section-label mb-1">
                              GPS Verified
                            </span>
                            <div className="fw-bold fs-18 text-success font-mono">
                              {verifiedRate}%
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="dv-kpi-card">
                            <span className="dv-section-label mb-1">
                              Mismatches
                            </span>
                            <div className="fw-bold fs-18 text-danger font-mono">
                              {mismatch}
                            </div>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="dv-kpi-card">
                            <span className="dv-section-label mb-1">
                              Field Agents
                            </span>
                            <div className="fw-bold fs-18 text-primary font-mono">
                              {uniqueAgents.length}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Timeline Log Section — gets nearly all remaining height */}
                    <div className="dv-card dv-log-card">
                      <div className="d-flex align-items-center justify-content-between dv-log-header">
                        <span className="dv-section-label mb-0">
                          Visit History Log
                        </span>
                        <span className="text-muted fs-12 font-mono">
                          {sortedVisits.length} Recorded
                        </span>
                      </div>

                      {sortedVisits.length === 0 ? (
                        <div className="text-center py-5 text-muted fs-13">
                          No visit history found for this doctor.
                        </div>
                      ) : (
                        <div className="dv-timeline-scroll">
                          <div className="dv-timeline">
                            {sortedVisits.map((v, idx) => (
                              <div
                                className="dv-timeline-item"
                                key={v._id || idx}
                              >
                                <span
                                  className={`dv-timeline-dot ${v.gps?.matchedClinic ? "verified" : "mismatch"}`}
                                />
                                <div className="dv-visit-entry">
                                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-3 mb-3 border-bottom">
                                    <div>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="fw-bold text-dark fs-15">
                                          {v.agent?.name || "Unknown Agent"}
                                        </span>
                                        {idx === 0 && (
                                          <Badge color="dark" className="fs-11">
                                            Latest
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-muted fs-13 mt-1">
                                        {formatDate(v.visitDate)} &bull;{" "}
                                        {formatTime(v.checkInTime)}
                                      </div>
                                    </div>
                                    <Badge
                                      color={
                                        v.gps?.matchedClinic
                                          ? "success-subtle"
                                          : "danger-subtle"
                                      }
                                      className={`text-${
                                        v.gps?.matchedClinic
                                          ? "success"
                                          : "danger"
                                      } border fs-12 px-2 py-1`}
                                    >
                                      {v.gps?.matchedClinic
                                        ? "Location Match"
                                        : "Location Mismatch"}
                                    </Badge>
                                  </div>

                                  <div className="mb-3">
                                    <span className="dv-section-label">
                                      Location Verification
                                    </span>
                                    <Row className="g-2">
                                      <Col xs={12} md={6}>
                                        <div className="dv-subbox p-3 h-100">
                                          <div className="text-muted fs-12 fw-medium mb-1">
                                            REGISTERED CLINIC
                                          </div>
                                          <div className="fw-semibold text-dark fs-13 font-mono mb-2">
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
                                              className="text-primary text-decoration-none fs-13 d-inline-flex align-items-center gap-1"
                                            >
                                              <span>View Map</span>
                                              <i className="bx bx-external-link fs-13" />
                                            </a>
                                          )}
                                        </div>
                                      </Col>
                                      <Col xs={12} md={6}>
                                        <div className="dv-subbox p-3 h-100">
                                          <div className="text-muted fs-12 fw-medium mb-1">
                                            CHECK-IN LOCATION
                                          </div>
                                          <div className="fw-semibold text-dark fs-13 font-mono mb-2">
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
                                              className="text-primary text-decoration-none fs-13 d-inline-flex align-items-center gap-1"
                                            >
                                              <span>View Map</span>
                                              <i className="bx bx-external-link fs-13" />
                                            </a>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>

                                  <div className="mb-3">
                                    <span className="dv-section-label">
                                      Discussion Notes
                                    </span>
                                    <div className="dv-notes-box p-3 rounded fs-14 mb-2">
                                      {v.visitNotes || (
                                        <span className="text-muted fst-italic">
                                          No notes entered for this visit.
                                        </span>
                                      )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span className="badge bg-white text-dark border font-mono fs-12">
                                        Fee Discussed:{" "}
                                        {v.commissionDiscussed ? "Yes" : "No"}
                                      </span>
                                      {v.commissionDiscussed &&
                                        v.commissionPercentage != null && (
                                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fs-12">
                                            Commission: {v.commissionPercentage}
                                            %
                                          </span>
                                        )}
                                      <span className="badge bg-light text-secondary border fs-12">
                                        {v.visitType === "FIRST_VISIT"
                                          ? "First Visit"
                                          : "Repeat Visit"}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="dv-section-label">
                                      Proof Images
                                    </span>
                                    {v.selfieProof?.url ||
                                    v.clinicPhoto?.url ? (
                                      <div className="d-flex gap-3 flex-wrap">
                                        {v.selfieProof?.url && (
                                          <div>
                                            <img
                                              src={v.selfieProof.url}
                                              alt="Selfie Proof"
                                              className="dv-img-thumbnail"
                                              onClick={() =>
                                                setActiveImage(
                                                  v.selfieProof.url,
                                                )
                                              }
                                            />
                                            <span className="d-block text-muted fs-12 text-center mt-1">
                                              Selfie Proof
                                            </span>
                                          </div>
                                        )}
                                        {v.clinicPhoto?.url && (
                                          <div>
                                            <img
                                              src={v.clinicPhoto.url}
                                              alt="Clinic Photo"
                                              className="dv-img-thumbnail"
                                              onClick={() =>
                                                setActiveImage(
                                                  v.clinicPhoto.url,
                                                )
                                              }
                                            />
                                            <span className="d-block text-muted fs-12 text-center mt-1">
                                              Clinic Photo
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-muted fs-13 fst-italic">
                                        No image proof uploaded for this visit.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Photo Verification */}
      <Modal
        isOpen={!!activeImage}
        toggle={() => setActiveImage(null)}
        centered
        size="md"
      >
        <ModalHeader
          toggle={() => setActiveImage(null)}
          className="border-0 pb-0"
        >
          Photo Proof Preview
        </ModalHeader>
        <ModalBody className="text-center p-4">
          {activeImage && (
            <img
              src={activeImage}
              alt="Verification Proof Preview"
              className="img-fluid rounded border shadow-sm"
              style={{ maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DoctorVisits;
