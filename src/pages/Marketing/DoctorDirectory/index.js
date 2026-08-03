import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Table,
  Alert,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Button,
} from "reactstrap";
import { getDoctorDirectory } from "../../../helpers/backend_helper";

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

const StatPill = ({ icon, label, value, bg, color }) => (
  <div
    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
    style={{ background: bg, minWidth: 150 }}
  >
    <div
      className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
      style={{ width: 34, height: 34, background: "rgba(255,255,255,0.65)" }}
    >
      <i className={`bx ${icon} fs-5`} style={{ color }} />
    </div>
    <div>
      <div className="fs-11 text-muted fw-semibold text-uppercase" style={{ letterSpacing: 0.3 }}>
        {label}
      </div>
      <div className="fs-16 fw-bold" style={{ color, lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  </div>
);

const RowSkeleton = () => (
  <tr>
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className={i === 0 ? "ps-4" : i === 5 ? "pe-4" : undefined}>
        <div
          className="rounded-2"
          style={{
            height: 14,
            width: i === 0 ? "70%" : "50%",
            background: "linear-gradient(90deg,#f1f3f7 25%,#e9ecf2 37%,#f1f3f7 63%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite",
          }}
        />
      </td>
    ))}
  </tr>
);

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getDoctorDirectory({})
      .then((res) => {
        const data = res?.data?.payload || res?.payload || res?.data || [];
        setDoctors(data);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Failed to load doctors"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      doctors.filter(
        (d) =>
          !search.trim() ||
          d.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
          d.clinicName?.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [doctors, search],
  );

  const totalDoctors = doctors.length;
  const totalVisits = doctors.reduce((sum, d) => sum + (d.totalVisits || 0), 0);
  const totalMismatches = doctors.reduce((sum, d) => sum + (d.mismatchCount || 0), 0);

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <style>
        {`
          @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
          .doctor-row { transition: background-color 0.15s ease; }
          .doctor-row:hover { background-color: #f8f9fb; }
          .stat-strip::-webkit-scrollbar { display: none; }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg, #3577f1 0%, #5a8bf5 100%)",
                  boxShadow: "0 6px 16px rgba(53,119,241,0.3)",
                }}
              >
                <i className="bx bx-user-voice fs-3 text-white" />
              </div>
              <div className="ms-3">
                <h4 className="mb-0 fw-bold">Doctor Visits</h4>
                {/* <p className="text-muted mb-0 fs-13">
                  Every doctor visited so far, and their full visit history
                </p> */}
              </div>
            </div>

            {!loading && !error && (
              <div className="d-flex gap-2 stat-strip" style={{ overflowX: "auto" }}>
                <StatPill
                  icon="bx-group"
                  label="Doctors"
                  value={totalDoctors}
                  bg="#eef2ff"
                  color="#3577f1"
                />
                <StatPill
                  icon="bx-calendar-check"
                  label="Total Visits"
                  value={totalVisits}
                  bg="#e6f7f4"
                  color="#0ab39c"
                />
                <StatPill
                  icon="bx-error-circle"
                  label="Mismatches"
                  value={totalMismatches}
                  bg="#fde8e4"
                  color="#f06548"
                />
              </div>
            )}
          </div>

          {/* Search */}
          <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
            <CardBody className="p-3 p-lg-4">
              <InputGroup>
                <InputGroupText
                  style={{ background: "#fff", border: "1px solid #e5e8ef", borderRight: "none" }}
                >
                  <i className="bx bx-search text-muted" />
                </InputGroupText>
                <Input
                  placeholder="Search by doctor name or clinic…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "1px solid #e5e8ef", borderLeft: "none" }}
                />
              </InputGroup>
            </CardBody>
          </Card>

          {error && (
            <Alert color="danger" className="border-0 shadow-sm">
              <i className="bx bx-error-circle me-1" /> {error}
            </Alert>
          )}

          {!error && (
            <Card className="border-0 shadow-sm" style={{ minWidth: 0, borderRadius: 14 }}>
              <CardBody className="p-0" style={{ minWidth: 0, overflow: "hidden" }}>
                <div className="table-responsive" style={{ overflowX: "auto" }}>
                  <Table
                    className="mb-0 align-middle"
                    style={{ minWidth: "800px" }}
                  >
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="text-muted fw-semibold fs-13 py-3 ps-4">
                          Doctor
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Clinic
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Total Visits
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Last Visit
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3">
                          Mismatches
                        </th>
                        <th className="text-muted fw-semibold fs-13 py-3 pe-4 text-end">
                          Profile
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-5">
                            <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                            No doctors found
                          </td>
                        </tr>
                      ) : (
                        filtered.map((d, idx) => (
                          <tr key={idx} className="doctor-row">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                                  style={{
                                    width: 38,
                                    height: 38,
                                    fontSize: 13,
                                    background: getAvatarColor(d.name),
                                    boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                                  }}
                                >
                                  {getInitials(d.name) || "?"}
                                </div>
                                <div>
                                  <Link
                                    to={`/marketing/doctors/profile?name=${encodeURIComponent(
                                      d.name,
                                    )}&clinicName=${encodeURIComponent(d.clinicName)}`}
                                    className="fw-semibold fs-14 text-dark text-decoration-none"
                                  >
                                    {/^dr\.?\s/i.test(d.name)
                                      ? d.name
                                      : `Dr. ${d.name}`}
                                  </Link>
                                  <div className="text-muted" style={{ fontSize: "12px" }}>
                                    {d.specialisation}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="fs-14">{d.clinicName}</td>
                            <td className="fw-semibold fs-14">{d.totalVisits}</td>
                            <td className="text-muted fs-13">
                              {d.lastVisitDate
                                ? new Date(d.lastVisitDate).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td>
                              {d.mismatchCount > 0 ? (
                                <span
                                  className="badge rounded-pill fw-medium px-2 py-1"
                                  style={{ background: "#fde8e4", color: "#f06548" }}
                                >
                                  {d.mismatchCount}
                                </span>
                              ) : (
                                <span
                                  className="badge rounded-pill fw-medium px-2 py-1"
                                  style={{ background: "#e6f7f4", color: "#0ab39c" }}
                                >
                                  0
                                </span>
                              )}
                            </td>
                            <td className="pe-4 text-end">
                              <Link
                                to={`/marketing/doctors/profile?name=${encodeURIComponent(
                                  d.name,
                                )}&clinicName=${encodeURIComponent(d.clinicName)}`}
                              >
                                <Button size="sm" color="light" className="border-0 shadow-sm">
                                  <i className="bx bx-show" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDirectory;