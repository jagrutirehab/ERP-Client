import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Row,
  Col,
  Spinner,
  Alert,
  Modal,
  ModalBody,
  Button,
} from "reactstrap";
import { getDoctorVisitHistory } from "../../../helpers/backend_helper";

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = ["#3577f1", "#0ab39c", "#f7b84b", "#f06548", "#299cdb", "#7d5fff"];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length || 0];

const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

const StatCard = ({ label, value, bg, color, icon }) => (
  <div
    className="rounded-3 p-3 h-100 d-flex align-items-center gap-2"
    style={{ background: bg }}
  >
    <div
      className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
      style={{ width: 36, height: 36, background: "rgba(255,255,255,0.6)" }}
    >
      <i className={`bx ${icon}`} style={{ color, fontSize: 18 }} />
    </div>
    <div>
      <div className="text-muted fs-12 fw-medium">{label}</div>
      <div className="fs-3 fw-bold" style={{ color, lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  </div>
);

const DoctorProfile = () => {
  const [searchParams] = useSearchParams();
  // ensure query params are strings (searchParams.get returns null when missing)
  const name = searchParams.get("name") || "";
  const clinicName = searchParams.get("clinicName") || "";

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    if (!name || !clinicName) return;
    setLoading(true);
    getDoctorVisitHistory({ name, clinicName })
      .then((res) => {
        const data = res?.data?.payload || res?.payload || res?.data || [];
        setVisits(data);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load doctor history"))
      .finally(() => setLoading(false));
  }, [name, clinicName]);

  const doctorInfo = visits[0]?.doctor;
  const totalVisits = visits.length;
  const matched = visits.filter((v) => v.gps?.matchedClinic).length;
  const mismatch = totalVisits - matched;
  const verifiedRate = totalVisits > 0 ? Math.round((matched / totalVisits) * 100) : 0;

  const uniqueAgents = [...new Set(visits.map((v) => v.agent?.name).filter(Boolean))];

  const displayName =
    doctorInfo?.name && /^dr\.?\s/i.test(doctorInfo.name)
      ? doctorInfo.name
      : `Dr. ${doctorInfo?.name || name}`;

  return (
    <div className="p-3 p-lg-4 bg-white" style={{ overflowX: "hidden" }}>
      <style>
        {`
          .visit-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
          .visit-card:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important; }
        `}
      </style>

      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          <Link
            to="/marketing/doctors"
            className="text-decoration-none fs-13 mb-3 d-inline-flex align-items-center gap-1 text-muted fw-medium"
          >
            <i className="bx bx-arrow-back" /> Back to Doctor Visits
          </Link>

          {loading && (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          )}
          {error && (
            <Alert color="danger" className="border-0 shadow-sm">
              <i className="bx bx-error-circle me-1" /> {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              {/* Profile header */}
              <Card
                className="border-0 shadow-sm mb-3"
                style={{
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #f5f8ff 0%, #ffffff 60%)",
                }}
              >
                <CardBody className="p-4 d-flex align-items-center gap-3 flex-wrap">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                    style={{
                      width: 68,
                      height: 68,
                      fontSize: 24,
                      background: getAvatarColor(name),
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    {getInitials(name) || "?"}
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">{displayName}</h4>
                    <div className="text-muted fs-14 d-flex align-items-center gap-1 flex-wrap">
                      <i className="bx bx-hospital fs-15" />
                      {clinicName}
                      {doctorInfo?.specialisation && (
                        <>
                          <span className="mx-1">·</span>
                          {doctorInfo.specialisation}
                        </>
                      )}
                    </div>
                    {doctorInfo?.contactNumber && (
                      <div className="text-muted fs-13 mt-1">
                        <i className="bx bx-phone me-1" /> {doctorInfo.contactNumber}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Stats */}
              <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                  <StatCard
                    label="Total Visits"
                    value={totalVisits}
                    bg="#f8f9fb"
                    color="#495057"
                    icon="bx-calendar-check"
                  />
                </Col>
                <Col xs={6} md={3}>
                  <StatCard
                    label="Verified"
                    value={`${verifiedRate}%`}
                    bg="#e6f7f4"
                    color="#0ab39c"
                    icon="bx-shield-quarter"
                  />
                </Col>
                <Col xs={6} md={3}>
                  <StatCard
                    label="Mismatches"
                    value={mismatch}
                    bg="#fde8e4"
                    color="#f06548"
                    icon="bx-error-circle"
                  />
                </Col>
                <Col xs={6} md={3}>
                  <StatCard
                    label="Agents Visited"
                    value={uniqueAgents.length}
                    bg="#eef2ff"
                    color="#3577f1"
                    icon="bx-group"
                  />
                </Col>
              </Row>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-semibold fs-14">Complete Visit History</span>
                <span className="text-muted fs-12">{visits.length} record(s)</span>
              </div>

              {visits.length === 0 ? (
                <Card className="border-0 shadow-sm" style={{ borderRadius: 14 }}>
                  <CardBody className="text-center text-muted py-5">
                    <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                    No visits found for this doctor
                  </CardBody>
                </Card>
              ) : (
                visits.map((v) => (
                  <Card
                    key={v._id}
                    className="border-0 shadow-sm mb-2 visit-card"
                    style={{ borderRadius: 12 }}
                  >
                    <CardBody className="p-3">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div className="d-flex align-items-start gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                            style={{
                              width: 34,
                              height: 34,
                              fontSize: 12,
                              background: getAvatarColor(v.agent?.name || "A"),
                            }}
                          >
                            {getInitials(v.agent?.name) || "?"}
                          </div>
                          <div>
                            <div className="fw-semibold fs-14">{v.agent?.name}</div>
                            <div className="text-muted fs-13">{v.agent?.email}</div>
                            <div className="text-muted fs-12 mt-1 d-flex align-items-center gap-1 flex-wrap">
                              <i className="bx bx-calendar" />
                              {new Date(v.visitDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                              <span className="mx-1">·</span>
                              <i className="bx bx-time-five" />
                              {new Date(v.checkInTime).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              <span className="mx-1">·</span>
                              <span
                                className="badge rounded-pill fw-medium"
                                style={{ background: "#eef2ff", color: "#3577f1", fontSize: 11 }}
                              >
                                {v.visitType === "FIRST_VISIT" ? "First Visit" : "Repeat Visit"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge rounded-pill fw-medium px-2 py-1"
                            style={{
                              background: v.gps?.matchedClinic ? "#e6f7f4" : "#fde8e4",
                              color: v.gps?.matchedClinic ? "#0ab39c" : "#f06548",
                            }}
                          >
                            <i
                              className={`bx ${v.gps?.matchedClinic ? "bx-check-shield" : "bx-error"} me-1`}
                            />
                            {v.gps?.matchedClinic ? "Verified" : "Mismatch"}
                          </span>
                          <Button
                            size="sm"
                            color="light"
                            className="border-0 shadow-sm"
                            onClick={() => setSelectedVisit(v)}
                          >
                            <i className="bx bx-show" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </>
          )}
        </Col>
      </Row>

      <Modal isOpen={!!selectedVisit} toggle={() => setSelectedVisit(null)} centered size="lg">
        <div
          style={{
            background: "linear-gradient(135deg, #3577f1 0%, #5a8bf5 100%)",
            padding: "20px 24px",
            borderRadius: "0.5rem 0.5rem 0 0",
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="text-white fw-semibold mb-0">
              <i className="bx bx-clipboard me-2" />
              Visit Details
            </h5>
            <button
              onClick={() => setSelectedVisit(null)}
              className="btn-close btn-close-white"
              style={{ opacity: 0.9 }}
            />
          </div>
        </div>
        <ModalBody className="p-4" style={{ background: "#f8f9fb" }}>
          {selectedVisit && (
            <div>
              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      fontSize: 13,
                      background: getAvatarColor(selectedVisit.agent?.name || "A"),
                    }}
                  >
                    {getInitials(selectedVisit.agent?.name) || "?"}
                  </div>
                  <div>
                    <div className="fw-semibold fs-15">{selectedVisit.agent?.name}</div>
                    <div className="text-muted fs-13">{selectedVisit.agent?.email}</div>
                  </div>
                </div>
                <div className="text-muted fs-12 mt-2">
                  <i className="bx bx-calendar me-1" />
                  {new Date(selectedVisit.visitDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {" · "}
                  <i className="bx bx-time-five me-1" />
                  {new Date(selectedVisit.checkInTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-map-pin text-primary me-1" /> Location Check
                </div>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <div className="rounded-3 p-2" style={{ background: "#f8f9fb" }}>
                      <div className="text-muted fs-11 fw-semibold mb-1">FIRST VISIT LOCATION</div>
                      <div className="fs-13">
                        {selectedVisit.doctor?.clinicLocation?.lat?.toFixed(5)},{" "}
                        {selectedVisit.doctor?.clinicLocation?.lng?.toFixed(5)}
                      </div>
                      {selectedVisit.doctor?.clinicLocation?.lat && (
                        <a
                          href={mapsLink(
                            selectedVisit.doctor.clinicLocation.lat,
                            selectedVisit.doctor.clinicLocation.lng,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="fs-12 d-inline-flex align-items-center gap-1"
                        >
                          <i className="bx bx-link-external" /> Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div
                      className="rounded-3 p-2"
                      style={{ background: selectedVisit.gps?.matchedClinic ? "#e6f7f4" : "#fde8e4" }}
                    >
                      <div className="text-muted fs-11 fw-semibold mb-1">THIS VISIT'S LOCATION</div>
                      <div className="fs-13">
                        {selectedVisit.gps?.lat?.toFixed(5)}, {selectedVisit.gps?.lng?.toFixed(5)}
                      </div>
                      {selectedVisit.gps?.lat && (
                        <a
                          href={mapsLink(selectedVisit.gps.lat, selectedVisit.gps.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="fs-12 d-inline-flex align-items-center gap-1"
                        >
                          <i className="bx bx-link-external" /> Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-message-detail text-primary me-1" /> Discussion
                </div>
                <div className="fs-13 mb-2" style={{ wordBreak: "break-word" }}>
                  {selectedVisit.visitNotes || (
                    <span className="text-muted fst-italic">No notes added</span>
                  )}
                </div>
                <span
                  className="badge rounded-pill fw-medium"
                  style={{ background: "#eef2ff", color: "#3577f1" }}
                >
                  Professional Fee: {selectedVisit.commissionDiscussed ? "Yes" : "No"}
                  {selectedVisit.commissionDiscussed &&
                    selectedVisit.commissionPercentage != null &&
                    ` — Visit Charges: ${selectedVisit.commissionPercentage}%`}
                </span>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-camera text-primary me-1" /> Photo Proof
                </div>
                {selectedVisit.selfieProof?.url || selectedVisit.clinicPhoto?.url ? (
                  <div className="d-flex gap-3 flex-wrap">
                    {selectedVisit.selfieProof?.url && (
                      <div>
                        <img
                          src={selectedVisit.selfieProof.url}
                          alt="Selfie"
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 12,
                            objectFit: "cover",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                          }}
                        />
                        <div className="text-muted fs-11 text-center mt-1">Selfie</div>
                      </div>
                    )}
                    {selectedVisit.clinicPhoto?.url && (
                      <div>
                        <img
                          src={selectedVisit.clinicPhoto.url}
                          alt="Clinic"
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 12,
                            objectFit: "cover",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                          }}
                        />
                        <div className="text-muted fs-11 text-center mt-1">Clinic</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted fs-13 fst-italic">No photos uploaded</div>
                )}
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DoctorProfile;