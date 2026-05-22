import {
  Badge,
  Button,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Spinner,
} from "reactstrap";
import { SEVERITY_COLOR, SEVERITY_HEX } from "../alerts/alertConstants";
import { fmtDate } from "./ruleUtils";

const SEV_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const sectionLabel = (icon, text) => (
  <small
    className="text-muted text-uppercase fw-semibold d-block mb-1"
    style={{ letterSpacing: 0.5 }}
  >
    {icon && <i className={`${icon} me-1`} />}
    {text}
  </small>
);

const deriveWorstSeverity = (rule) => {
  const sevs = (rule.targetBlocks || []).map((b) => b.severity).filter(Boolean);
  if (!sevs.length) return null;
  return sevs.reduce((a, b) => (SEV_RANK[b] > SEV_RANK[a] ? b : a));
};

const RulePreviewOffcanvas = ({
  isOpen,
  onClose,
  rule,
  loading,
  onEdit,
  onDelete,
}) => {
  const worst = rule ? deriveWorstSeverity(rule) : null;

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={onClose}
      direction="end"
      style={{ width: 540 }}
    >
      <OffcanvasHeader toggle={onClose} className="border-bottom">
        <span className="fw-semibold">Rule Preview</span>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0">
        {!rule ? (
          <div className="text-center text-muted py-5">No rule selected.</div>
        ) : (
          <>
            <div
              style={{
                background: SEVERITY_HEX[worst] || "#6c757d",
                height: 6,
              }}
            />

            <div className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <div className="d-flex gap-1 flex-wrap align-items-center">
                  {worst && (
                    <Badge color={SEVERITY_COLOR[worst] || "secondary"} pill>
                      {worst}
                    </Badge>
                  )}
                  {rule.isActive ? (
                    <Badge color="success" pill>
                      ACTIVE
                    </Badge>
                  ) : (
                    <Badge color="dark" pill>
                      INACTIVE
                    </Badge>
                  )}
                  {rule.version && (
                    <Badge color="secondary" pill>
                      v{rule.version}
                    </Badge>
                  )}
                </div>
                <small className="text-muted">{fmtDate(rule.createdAt)}</small>
              </div>

              <h4 className="fw-bold mb-2">{rule.ruleName}</h4>
              {rule.protocol && (
                <p className="text-muted mb-3">
                  <i className="bx bx-bookmark me-1" />
                  {rule.protocol}
                </p>
              )}
              {loading && (
                <div className="text-muted small mb-2">
                  <Spinner size="sm" /> loading detail…
                </div>
              )}

              {/* Satisfying Criteria */}
              {rule.satisfyingCriteria?.conditions?.length > 0 && (
                <div className="mb-3 p-3 border rounded">
                  {sectionLabel(
                    "bx bx-filter-alt",
                    "Satisfying Criteria (global filter)",
                  )}
                  {rule.satisfyingCriteria.conditions.map((c, i) => (
                    <div key={i} className="small mb-1">
                      <code>
                        {c.model}.{c.field}
                      </code>{" "}
                      {c.operator}{" "}
                      {c.value?.length ? (
                        <code>{JSON.stringify(c.value)}</code>
                      ) : (
                        ""
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Target Blocks — each block now shows its full alert recipe */}
              <div className="mb-3">
                {sectionLabel(
                  "bx bx-target-lock",
                  `Target Blocks (${rule.targetBlocks?.length || 0})`,
                )}
                {rule.targetBlocks?.map((b, bi) => (
                  <div
                    key={bi}
                    className="mb-3 p-3 border rounded"
                    style={{
                      borderLeft: `4px solid ${SEVERITY_HEX[b.severity] || "#6c757d"}`,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="fw-semibold">
                        Block {bi + 1}
                        {b.name && (
                          <span className="text-muted fw-normal ms-2">
                            — {b.name}
                          </span>
                        )}
                      </div>
                      {b.severity && (
                        <Badge
                          color={SEVERITY_COLOR[b.severity] || "secondary"}
                          pill
                        >
                          {b.severity}
                        </Badge>
                      )}
                    </div>

                    {b.alertTemplate && (
                      <div className="small text-muted mb-2">
                        <i className="bx bx-message-detail me-1" />
                        {b.alertTemplate}
                      </div>
                    )}

                    {/* Conditions */}
                    <div className="mb-2">
                      {b.conditions?.map((c, ci) => (
                        <div key={ci} className="small">
                          <Badge color="info" pill className="me-1">
                            {c.triggerType || "IMMEDIATE"}
                          </Badge>
                          <code>
                            {c.model}.{c.field}
                          </code>{" "}
                          {c.operator}{" "}
                          {c.value?.length ? (
                            <code>{JSON.stringify(c.value)}</code>
                          ) : (
                            ""
                          )}
                          {c.deadlineHours ? (
                            <span className="text-muted ms-1">
                              · {c.deadlineHours}h
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Per-block routing */}
                    <div className="small mb-2">
                      <strong className="text-muted">
                        <i className="bx bx-broadcast me-1" />
                        Routed to:
                      </strong>{" "}
                      {b.routing?.notifyRoles?.map((r) => (
                        <Badge key={r} color="info" pill className="me-1">
                          {r}
                        </Badge>
                      ))}
                      {b._specificUsersDetailed?.map((u) => (
                        <Badge
                          key={u.value}
                          color="secondary"
                          pill
                          className="me-1"
                        >
                          {u.label}
                        </Badge>
                      ))}
                      {!b.routing?.notifyRoles?.length &&
                        !b._specificUsersDetailed?.length && (
                          <span className="text-muted">—</span>
                        )}
                    </div>

                    {/* Per-block action guidance */}
                    {b.actionGuidance && (
                      <div
                        className="small p-2 rounded mb-1"
                        style={{
                          background: "rgba(255,193,7,0.1)",
                          borderLeft: "3px solid #ffc107",
                        }}
                      >
                        <strong className="text-muted">
                          <i className="bx bx-check-shield me-1" />
                          Action:
                        </strong>{" "}
                        {b.actionGuidance}
                      </div>
                    )}

                    {b.referenceSection && (
                      <div className="small text-muted">
                        <i className="bx bx-bookmark me-1" />
                        Ref: {b.referenceSection}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Suggested Medicines — read-only summary */}
              {rule.suggestedMedicines?.length > 0 && (
                <div className="mb-3">
                  {sectionLabel(
                    "bx bx-capsule",
                    `Suggested Medicines (${rule.suggestedMedicines.length})`,
                  )}
                  {rule.suggestedMedicines.map((m, mi) => {
                    const snap = m.medicineSnapshot || {};
                    const name =
                      [snap.type, snap.name, snap.strength, snap.unit]
                        .filter(Boolean)
                        .join(" ") || "(Medicine)";
                    const d = m.dosageAndFrequency || {};
                    const dose = [
                      d.morning || "0",
                      d.afternoon || "0",
                      d.evening || "0",
                    ]
                      .join("-")
                      .concat(d.unit ? ` ${d.unit}` : "");
                    const days =
                      Array.isArray(m.applicableDays) && m.applicableDays.length
                        ? m.applicableDays.map((n) => `Day ${n}`).join(", ")
                        : "Throughout admission";
                    return (
                      <div key={mi} className="mb-2 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-start mb-1 flex-wrap gap-1">
                          <div className="fw-semibold">
                            {mi + 1}. {name}
                          </div>
                          <div className="d-flex gap-1 flex-wrap">
                            {m.category && (
                              <Badge color="secondary" pill>
                                {m.category}
                              </Badge>
                            )}
                            {m.priority && m.priority !== "ROUTINE" && (
                              <Badge color="warning" pill>
                                {m.priority}
                              </Badge>
                            )}
                            {m.intake && (
                              <Badge color="info" pill>
                                {m.intake === "BEFORE_FOOD"
                                  ? "Before Food"
                                  : "After Food"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="small">
                          <strong className="text-muted">Dose:</strong> {dose}
                          {" · "}
                          <strong className="text-muted">Days:</strong> {days}
                        </div>
                        {m.instructions && (
                          <div className="small text-muted mt-1">
                            <i className="bx bx-info-circle me-1" />
                            {m.instructions}
                          </div>
                        )}
                        {m.rationale && (
                          <div className="small text-muted mt-1 fst-italic">
                            {m.rationale}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                <Button color="primary" onClick={() => onEdit(rule)}>
                  <i className="bx bx-edit me-1" />
                  Edit
                </Button>
                <Button color="danger" outline onClick={() => onDelete(rule)}>
                  <i className="bx bx-trash me-1" />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default RulePreviewOffcanvas;
