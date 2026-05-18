import { Badge, Button } from "reactstrap";
import { SEVERITY_COLOR, SEVERITY_HEX } from "../alerts/alertConstants";
import { fmtDate, ruleSummary } from "./ruleUtils";

const SEV_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const deriveSeverity = (rule) => {
  const sevs = (rule.targetBlocks || []).map((b) => b.severity).filter(Boolean);
  if (!sevs.length) return { worst: "LOW", uniqueCount: 0 };
  const worst = sevs.reduce((a, b) => (SEV_RANK[b] > SEV_RANK[a] ? b : a));
  return { worst, uniqueCount: new Set(sevs).size };
};

const RuleRow = ({ rule, onPreview, onToggleActive, onEdit, onDelete }) => {
  const { worst, uniqueCount } = deriveSeverity(rule);
  const sevHex = SEVERITY_HEX[worst] || "#6c757d";
  const baseBg = !rule.isActive ? "rgba(108,117,125,0.04)" : "transparent";

  return (
    <div
      style={{
        padding: "14px 16px 14px 22px",
        position: "relative",
        borderBottom: "1px solid #f0f0f0",
        transition: "background 0.15s ease",
        background: baseBg,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13,110,253,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = baseBg)}
    >
      {/* Severity color bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: sevHex, opacity: rule.isActive ? 1 : 0.35,
      }} />

      <div className="d-flex justify-content-between align-items-center gap-3">
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onPreview(rule)}>
          <div className="d-flex gap-1 align-items-center mb-1 flex-wrap">
            <Badge color={SEVERITY_COLOR[worst]} pill>{worst}</Badge>
            {uniqueCount > 1 && (
              <Badge color="light" className="text-dark border" pill>
                mixed severities
              </Badge>
            )}
            {!rule.isActive && <Badge color="dark" pill>INACTIVE</Badge>}
            {rule.targetBlocks?.length > 1 && (
              <Badge color="secondary" pill>{rule.targetBlocks.length} blocks</Badge>
            )}
          </div>
          <div className={`fw-semibold ${!rule.isActive ? "text-muted" : ""}`} style={{ lineHeight: 1.3 }}>
            {rule.ruleName}
          </div>
          <small className="text-muted">
            <i className="bx bx-target-lock me-1" />
            {ruleSummary(rule)}
            {rule.protocol && (
              <>
                <span className="mx-2">·</span>
                <i className="bx bx-bookmark me-1" />{rule.protocol}
              </>
            )}
            <span className="mx-2">·</span>
            <i className="bx bx-time me-1" />{fmtDate(rule.createdAt)}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div
            className="form-check form-switch m-0"
            title={rule.isActive ? "Active — click to disable" : "Inactive — click to enable"}
          >
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={!!rule.isActive}
              onChange={(e) => onToggleActive(rule, e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </div>

          <Button color="secondary" outline size="sm" onClick={() => onPreview(rule)} title="Preview">
            <i className="bx bx-show" />
          </Button>
          <Button color="primary" outline size="sm" onClick={() => onEdit(rule)} title="Edit">
            <i className="bx bx-edit" />
          </Button>
          <Button color="danger" outline size="sm" onClick={() => onDelete(rule)} title="Delete">
            <i className="bx bx-trash" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RuleRow;
