import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Spinner,
  Alert,
  Input,
  Label,
  Button,
  Modal,
  ModalBody,
} from "reactstrap";
import { getVisitLogs } from "../../../helpers/backend_helper";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
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

const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

const toISO = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  thisMonth: () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toISO(first), to: toISO(now) };
  },
};

const AgentProfile = () => {
  const handleAuthError = useAuthError();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(DATE_PRESETS.thisMonth());
  const [activePreset, setActivePreset] = useState("thisMonth");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

  const microUser = localStorage.getItem("micrologin");
  const currentUserId = microUser ? JSON.parse(microUser)?.user?._id : null;

  const fetchVisits = (range) => {
    if (!currentUserId) {
      setError("Could not identify logged-in user");
      setLoading(false);
      return;
    }
    setLoading(true);
    getVisitLogs({
      agent: currentUserId,
      from: range?.from,
      to: range?.to,
      limit: 100,
    })
      .then((res) => {
        const data =
          res?.data?.payload || res?.payload || res?.data?.data || [];
        setVisits(data);
      })
      .catch((err) => {
        if (!handleAuthError(err)) {
          setError(
            err?.response?.data?.message || "Failed to load your visits",
          );
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

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
    const map = new Map();
    visits.forEach((v) => {
      const key = `${v.doctor?.name}__${v.doctor?.clinicName}`;
      if (v.doctor?.name && !map.has(key)) {
        map.set(key, { label: v.doctor.name, sub: v.doctor.clinicName });
      }
    });
    return [...map.values()];
  }, [visits]);

  const filteredSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, suggestionPool]);

  const applyPreset = (key) => {
    const range = DATE_PRESETS[key]();
    setDateRange(range);
    setActivePreset(key);
    fetchVisits(range);
  };

  const applyRange = () => {
    setActivePreset(null);
    fetchVisits(dateRange);
  };

  const filteredVisits = visits.filter(
    (v) =>
      !search.trim() ||
      v.doctor?.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
      v.doctor?.clinicName?.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const agentInfo = visits[0]?.agent;
  const totalVisits = filteredVisits.length;
  const matched = filteredVisits.filter((v) => v.gps?.matchedClinic).length;
  const mismatch = totalVisits - matched;
  const verifiedRate =
    totalVisits > 0 ? Math.round((matched / totalVisits) * 100) : 0;
  const interest = { HOT: 0, WARM: 0, COLD: 0 };
  filteredVisits.forEach((v) => {
    if (v.interestLevel) interest[v.interestLevel]++;
  });

  return (
    <div className="p-3 p-lg-4" style={{ overflowX: "hidden" }}>
      <Row className="justify-content-center">
        <Col xs={12} xl={10} style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "rgba(53,119,241,0.1)",
              }}
            >
              <i className="bx bx-id-card fs-3 text-primary" />
            </div>
            <div className="ms-3">
              <h4 className="mb-0 fw-semibold">My Visit History</h4>
              <p className="text-muted mb-0 fs-13">
                Your own visit records and performance
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-sm mb-3">
            <CardBody className="p-3 p-lg-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {[
                  { key: "today", label: "Today" },
                  { key: "last7", label: "Last 7 Days" },
                  { key: "thisMonth", label: "This Month" },
                ].map((p) => (
                  <Button
                    key={p.key}
                    size="sm"
                    color={activePreset === p.key ? "primary" : "light"}
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
                    <i className="bx bx-filter-alt me-1" /> Apply
                  </Button>
                </Col>
              </Row>
              <Label
                className="fw-semibold text-dark mb-1"
                style={{ fontSize: "13px" }}
              >
                Search Doctor / Clinic
              </Label>
              <div className="position-relative" ref={searchWrapperRef}>
                <Input
                  size="sm"
                  placeholder="Type a name…"
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
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {filteredSuggestions.map((s, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 border-bottom"
                        style={{ cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearch(s.label);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="fw-medium fs-14">{s.label}</div>
                        <div className="text-muted fs-12">{s.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              {/* Profile card */}
              <Card className="border-0 shadow-sm mb-3">
                <CardBody className="p-4 d-flex align-items-center gap-3 flex-wrap">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-semibold text-white flex-shrink-0"
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 22,
                      background: getAvatarColor(agentInfo?.name),
                    }}
                  >
                    {getInitials(agentInfo?.name) || "?"}
                  </div>
                  <div>
                    <h4 className="mb-0 fw-semibold">
                      {agentInfo?.name || "You"}
                    </h4>
                    <div className="text-muted fs-14">{agentInfo?.email}</div>
                  </div>
                </CardBody>
              </Card>

              {/* Stats */}
              <Row className="g-3 mb-4">
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#f8f9fb" }}
                  >
                    <div className="text-muted fs-13">Total Visits</div>
                    <div className="fs-3 fw-semibold">{totalVisits}</div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#e6f7f4" }}
                  >
                    <div className="text-muted fs-13">Verified</div>
                    <div className="fs-3 fw-semibold text-success">
                      {verifiedRate}%
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
                      {mismatch}
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div
                    className="rounded-3 p-3"
                    style={{ background: "#fef4e4" }}
                  >
                    <div className="text-muted fs-13">Hot Leads</div>
                    <div
                      className="fs-3 fw-semibold"
                      style={{ color: "#f06548" }}
                    >
                      {interest.HOT}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* All my visits */}
              <div className="mb-2">
                <span className="fw-semibold fs-14">All My Visits</span>
              </div>
              {filteredVisits.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardBody className="text-center text-muted py-5">
                    <i className="bx bx-search-alt fs-1 d-block mb-2 opacity-50" />
                    No visits found for this filter
                  </CardBody>
                </Card>
              ) : (
                filteredVisits.map((v) => (
                  <Card key={v._id} className="border-0 shadow-sm mb-2">
                    <CardBody className="p-3">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <div className="fw-semibold fs-14">
                            {v.doctor?.name}
                          </div>
                          <div className="text-muted fs-13">
                            {v.doctor?.clinicName}
                          </div>
                          <div className="text-muted fs-12 mt-1">
                            {new Date(v.visitDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {" · "}
                            {new Date(v.checkInTime).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge rounded-pill fw-medium"
                            style={{
                              background: v.gps?.matchedClinic
                                ? "#e6f7f4"
                                : "#fde8e4",
                              color: v.gps?.matchedClinic
                                ? "#0ab39c"
                                : "#f06548",
                            }}
                          >
                            {v.gps?.matchedClinic ? "Verified" : "Mismatch"}
                          </span>
                          <Button
                            size="sm"
                            color="light"
                            onClick={() => setSelectedVisit(v)}
                          >
                            <i className="bx bx-show" />
                          </Button>
                        </div>
                      </div>
                      {!v.gps?.matchedClinic && (
                        <div
                          className="rounded-2 px-2 py-1 mt-2 fs-12"
                          style={{ background: "#fef4e4", color: "#c99a06" }}
                        >
                          <i className="bx bx-info-circle me-1" />
                          Your GPS didn't match the clinic location on this
                          visit — double-check location access next time.
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedVisit}
        toggle={() => setSelectedVisit(null)}
        centered
        size="lg"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #3577f1 0%, #5a8bf5 100%)",
            padding: "20px 24px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="text-white fw-semibold mb-0">Visit Details</h5>
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
                <div className="text-muted fs-12 mb-1">
                  {new Date(selectedVisit.visitDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                  {" · "}
                  {new Date(selectedVisit.checkInTime).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>
                <div className="fw-semibold fs-15">
                  {selectedVisit.doctor?.name}
                </div>
                <div className="text-muted fs-13">
                  {selectedVisit.doctor?.clinicName}
                </div>
                <div className="text-muted fs-13">
                  {selectedVisit.doctor?.specialisation}
                </div>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-map-pin text-primary me-1" /> Location
                  Check
                </div>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <div
                      className="rounded-3 p-2"
                      style={{ background: "#f8f9fb" }}
                    >
                      <div className="text-muted fs-11 fw-semibold mb-1">
                        FIRST VISIT LOCATION
                      </div>
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
                          className="fs-12"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div
                      className="rounded-3 p-2"
                      style={{
                        background: selectedVisit.gps?.matchedClinic
                          ? "#e6f7f4"
                          : "#fde8e4",
                      }}
                    >
                      <div className="text-muted fs-11 fw-semibold mb-1">
                        THIS VISIT'S LOCATION
                      </div>
                      <div className="fs-13">
                        {selectedVisit.gps?.lat?.toFixed(5)},{" "}
                        {selectedVisit.gps?.lng?.toFixed(5)}
                      </div>
                      {selectedVisit.gps?.lat && (
                        <a
                          href={mapsLink(
                            selectedVisit.gps.lat,
                            selectedVisit.gps.lng,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="fs-12"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-gift text-primary me-1" /> Collateral
                </div>
                <div className="fs-13">
                  Given:{" "}
                  <strong>
                    {selectedVisit.collateral?.given ? "Yes" : "No"}
                  </strong>
                </div>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-message-detail text-primary me-1" />{" "}
                  Discussion
                </div>
                <div className="fs-13 mb-2" style={{ wordBreak: "break-word" }}>
                  {selectedVisit.visitNotes}
                </div>
                <span
                  className="badge rounded-pill fw-medium"
                  style={{ background: "#eef2ff", color: "#3577f1" }}
                >
                  Professional Fee:{" "}
                  {selectedVisit.commissionDiscussed ? "Yes" : "No"}
                  {selectedVisit.commissionDiscussed &&
                    selectedVisit.commissionPercentage != null &&
                    ` — Visit Charges: ${selectedVisit.commissionPercentage}%`}
                </span>
              </div>

              <div className="bg-white rounded-3 shadow-sm p-3">
                <div className="fw-semibold fs-14 mb-2">
                  <i className="bx bx-camera text-primary me-1" /> Photo Proof
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  {selectedVisit.selfieProof?.url && (
                    <img
                      src={selectedVisit.selfieProof.url}
                      alt="Selfie"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {selectedVisit.clinicPhoto?.url && (
                    <img
                      src={selectedVisit.clinicPhoto.url}
                      alt="Clinic"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
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

export default AgentProfile;
