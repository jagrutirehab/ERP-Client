import {
  Badge,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
  Col,
} from "reactstrap";
import { SEVERITY_COLOR, SEVERITY_HEX, PHASE_META } from "./alertConstants";
import { timeAgo } from "./alertUtils";

const sectionLabel = (icon, text) => (
  <small
    className="text-muted text-uppercase fw-semibold d-block mb-1"
    style={{ letterSpacing: 0.5 }}
  >
    {icon && <i className={`${icon} me-1`} />}
    {text}
  </small>
);

const AlertDetailOffcanvas = ({ isOpen, onClose, alert }) => {
  const phase = alert
    ? PHASE_META[alert.phase] || PHASE_META.IMMEDIATE
    : PHASE_META.IMMEDIATE;

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={onClose}
      direction="end"
      style={{ width: 520 }}
    >
      <OffcanvasHeader toggle={onClose} className="border-bottom">
        <span className="fw-semibold">Alert Detail</span>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0">
        {alert ? (
          <>
            {/* Top severity strip */}
            <div
              style={{
                background: SEVERITY_HEX[alert.severity] || "#6c757d",
                height: 6,
              }}
            />

            <div className="p-4">
              {/* Badges + timestamp */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-1 flex-wrap">
                  <Badge
                    color={SEVERITY_COLOR[alert.severity] || "secondary"}
                    pill
                  >
                    {alert.severity}
                  </Badge>
                  <Badge
                    color={phase.color}
                    pill
                    className="d-inline-flex align-items-center"
                  >
                    <i className={`${phase.icon} me-1`} />
                    {phase.label}
                  </Badge>
                </div>
                <small className="text-muted text-end">
                  {timeAgo(alert.createdAt)}
                  <br />
                  <span className="text-muted">
                    {alert.createdAt &&
                      new Date(alert.createdAt).toLocaleString()}
                  </span>
                </small>
              </div>

              {/* Message */}
              <div className="mb-4">
                {sectionLabel(null, "Message")}
                <div className="fs-15" style={{ lineHeight: 1.5 }}>
                  {alert.message}
                </div>
              </div>

              {/* Patient */}
              <div className="mb-3 p-3 border rounded">
                {sectionLabel("bx bx-user", "Patient")}
                <div className="fw-medium">{alert.patient?.name || "—"}</div>
                {(alert.patient?.age || alert.patient?.gender) && (
                  <small className="text-muted">
                    {alert.patient?.age && <>{alert.patient.age} years</>}
                    {alert.patient?.age && alert.patient?.gender && " · "}
                    {alert.patient?.gender}
                  </small>
                )}
              </div>

              {/* SOP + Protocol */}
              <Row className="mb-2">
                <Col xs={6}>
                  {sectionLabel("bx bx-list-check", "SOP")}
                  <div>{alert.rule?.ruleName || "—"}</div>
                </Col>
                <Col xs={6}>
                  {sectionLabel(null, "Protocol")}
                  <div>{alert.rule?.protocol || "—"}</div>
                </Col>
              </Row>
              {/* Specific rule (block name) that fired */}
              <Row className="mb-3">
                <Col xs={alert.window?.label ? 6 : 12}>
                  {sectionLabel("bx bx-target-lock", "Rule")}
                  <div>{alert.blockName || "—"}</div>
                </Col>
                {alert.window?.label && (
                  <Col xs={6}>
                    {sectionLabel("bx bx-calendar", "Window / period")}
                    <div>{alert.window.label}</div>
                  </Col>
                )}
              </Row>

              {/* Action Guidance */}
              {alert.actionGuidance && (
                <div
                  className="mb-3 p-3 rounded"
                  style={{
                    background: "rgba(255, 193, 7, 0.1)",
                    borderLeft: "4px solid #ffc107",
                  }}
                >
                  {sectionLabel("bx bx-check-shield", "Action Guidance")}
                  <div className="fw-medium">{alert.actionGuidance}</div>
                </div>
              )}

              {/* Reference */}
              {alert.referenceSection && (
                <div className="mb-3">
                  {sectionLabel("bx bx-bookmark", "Reference")}
                  <div>{alert.referenceSection}</div>
                </div>
              )}

              {/* Routing */}
              {(alert.routing?.notifyRoles?.length > 0 ||
                alert.routing?.notifySpecificUsers?.length > 0) && (
                <div className="mb-3">
                  {sectionLabel("bx bx-send", "Routed To")}
                  <div className="d-flex gap-1 flex-wrap">
                    {alert.routing?.notifyRoles?.map((r) => (
                      <Badge key={r} color="info" pill>
                        {r}
                      </Badge>
                    ))}
                    {alert.routing?.notifySpecificUsers?.length > 0 && (
                      <Badge color="secondary" pill>
                        {alert.routing.notifySpecificUsers.length} specific
                        user(s)
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bx bx-message-rounded-detail display-4 d-block mb-2" />
            No alert selected.
          </div>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default AlertDetailOffcanvas;
