import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, CardHeader, Badge, Button, Spinner,
  ButtonGroup, Row, Col,
} from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { getAllSopAlerts, markSopAlertRead } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";

const SEVERITY_COLOR = {
  LOW: "secondary",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

const timeAgo = (date) => {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Alerts = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [alerts, setAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSopAlerts();
      setAlerts(res?.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === "unread") return alerts.filter((a) => !a.isRead);
    if (filter === "read") return alerts.filter((a) => a.isRead);
    return alerts;
  }, [alerts, filter]);

  const selected = useMemo(
    () => alerts.find((a) => a._id === selectedId) || null,
    [alerts, selectedId]
  );

  const handleSelect = async (alert) => {
    setSelectedId(alert._id);
    if (!alert.isRead) {
      // optimistic — flip locally first, then call backend
      setAlerts((prev) => prev.map((a) => (a._id === alert._id ? { ...a, isRead: true } : a)));
      try { await markSopAlertRead(alert._id); }
      catch { /* best-effort */ }
    }
  };

  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="display-6 fw-bold text-primary mb-1">SOP ALERTS</h1>
          <p className="text-muted mb-0">
            {unreadCount > 0
              ? <>You have <strong>{unreadCount}</strong> unread alert{unreadCount === 1 ? "" : "s"}.</>
              : "You're all caught up."}
          </p>
        </div>
        <Button color="secondary" outline size="sm" onClick={load} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Refresh"}
        </Button>
      </div>

      <div className="mb-3">
        <ButtonGroup size="sm">
          <Button
            color={filter === "all" ? "primary" : "secondary"}
            outline={filter !== "all"}
            onClick={() => setFilter("all")}
          >
            All ({alerts.length})
          </Button>
          <Button
            color={filter === "unread" ? "primary" : "secondary"}
            outline={filter !== "unread"}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            color={filter === "read" ? "primary" : "secondary"}
            outline={filter !== "read"}
            onClick={() => setFilter("read")}
          >
            Read ({alerts.length - unreadCount})
          </Button>
        </ButtonGroup>
      </div>

      <Row>
        {/* LIST */}
        <Col md={5}>
          <Card>
            <CardHeader className="fw-semibold py-2">Inbox</CardHeader>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {loading && filtered.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <Spinner size="sm" /> <span className="ms-2">Loading...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No alerts to show.
                </div>
              ) : (
                filtered.map((a) => {
                  const isActive = a._id === selectedId;
                  return (
                    <div
                      key={a._id}
                      onClick={() => handleSelect(a)}
                      style={{
                        cursor: "pointer",
                        padding: "12px 14px",
                        borderLeft: `4px solid ${a.isRead ? "transparent" : "#dc3545"}`,
                        background: isActive ? "rgba(13,110,253,0.08)" : "transparent",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <Badge color={SEVERITY_COLOR[a.severity] || "secondary"} pill>
                          {a.severity}
                        </Badge>
                        <small className="text-muted">{timeAgo(a.createdAt)}</small>
                      </div>
                      <div className={`mb-1 ${a.isRead ? "text-muted" : "fw-semibold"}`}>
                        {a.message?.length > 90 ? `${a.message.slice(0, 90)}...` : a.message}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {a.patient?.name || "Unknown patient"}
                          {a.rule?.ruleName && <> · {a.rule.ruleName}</>}
                        </small>
                        {!a.isRead && <Badge color="danger" pill>NEW</Badge>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </Col>

        {/* DETAIL */}
        <Col md={7}>
          {selected ? (
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Alert Detail</span>
                <Badge color={SEVERITY_COLOR[selected.severity] || "secondary"} pill>
                  {selected.severity}
                </Badge>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <small className="text-muted d-block">Message</small>
                  <div className="fs-15">{selected.message}</div>
                </div>

                <Row className="mb-3">
                  <Col xs={6}>
                    <small className="text-muted d-block">Rule</small>
                    <div>{selected.rule?.ruleName || "—"}</div>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted d-block">Protocol</small>
                    <div>{selected.rule?.protocol || "—"}</div>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col xs={6}>
                    <small className="text-muted d-block">Patient</small>
                    <div>
                      {selected.patient?.name || "—"}
                      {selected.patient?.age && <span className="text-muted"> · {selected.patient.age}y</span>}
                      {selected.patient?.gender && <span className="text-muted"> · {selected.patient.gender}</span>}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted d-block">Fired</small>
                    <div>
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"}
                    </div>
                  </Col>
                </Row>

                {selected.actionGuidance && (
                  <div className="mb-3">
                    <small className="text-muted d-block">Action Guidance</small>
                    <div>{selected.actionGuidance}</div>
                  </div>
                )}

                {selected.referenceSection && (
                  <div className="mb-3">
                    <small className="text-muted d-block">Reference</small>
                    <div>{selected.referenceSection}</div>
                  </div>
                )}

                {(selected.routing?.notifyRoles?.length > 0 ||
                  selected.routing?.notifySpecificUsers?.length > 0) && (
                  <div className="mb-3">
                    <small className="text-muted d-block">Routed to</small>
                    {selected.routing?.notifyRoles?.map((r) => (
                      <Badge key={r} color="info" pill className="me-1">{r}</Badge>
                    ))}
                    {selected.routing?.notifySpecificUsers?.length > 0 && (
                      <Badge color="secondary" pill>
                        {selected.routing.notifySpecificUsers.length} specific user(s)
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-muted">
                  <small>Alert ID: {selected._id}</small>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center text-muted py-5">
                Select an alert from the list to see its full detail.
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </CardBody>
  );
};

export default Alerts;
