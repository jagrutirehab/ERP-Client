import { Badge } from "reactstrap";
import { SEVERITY_COLOR, SEVERITY_HEX, PHASE_META } from "./alertConstants";
import { timeAgo } from "./alertUtils";

const AlertRow = ({ alert, onClick }) => {
  const phase = PHASE_META[alert.phase] || PHASE_META.IMMEDIATE;
  const sevHex = SEVERITY_HEX[alert.severity] || "#6c757d";
  const baseBg = !alert.isRead ? "rgba(220,53,69,0.04)" : "transparent";

  return (
    <div
      onClick={() => onClick(alert)}
      style={{
        cursor: "pointer",
        padding: "14px 16px 14px 22px",
        position: "relative",
        background: baseBg,
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13,110,253,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      {/* Severity color bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: sevHex,
      }} />

      <div className="d-flex justify-content-between align-items-start gap-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex gap-1 align-items-center mb-1 flex-wrap">
            <Badge color={SEVERITY_COLOR[alert.severity]} pill>{alert.severity}</Badge>
            <Badge color={phase.color} pill className="d-inline-flex align-items-center">
              <i className={`${phase.icon} me-1`} />{phase.label}
            </Badge>
            {!alert.isRead && (
              <Badge color="danger" pill className="ms-1">NEW</Badge>
            )}
          </div>
          <div
            className={`mb-1 ${alert.isRead ? "text-muted" : "fw-semibold"}`}
            style={{ lineHeight: 1.35 }}
          >
            {alert.message}
          </div>
          <small className="text-muted">
            <i className="bx bx-user-circle me-1" />
            {alert.patient?.name || "Unknown patient"}
            {alert.rule?.ruleName && (
              <>
                <span className="mx-2">·</span>
                <i className="bx bx-list-check me-1" />
                {alert.rule.ruleName}
              </>
            )}
          </small>
        </div>
        <div className="d-flex flex-column align-items-end gap-1" style={{ minWidth: 80 }}>
          <small className="text-muted">{timeAgo(alert.createdAt)}</small>
          <i className="bx bx-chevron-right text-muted" />
        </div>
      </div>
    </div>
  );
};

export default AlertRow;
