import React, { useState } from "react";
import Select from "react-select";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import RoutingCard from "../RoutingCard";
import {
  SEVERITY_OPTIONS,
  BASELINE_TIER_KEYS,
} from "../../../../Components/constants/sopConstants";
import { SEVERITY_COLOR } from "../../../Alerts/components/alertConstants";

/**
 * One escalation tier.
 *
 * Collapsed by default: four expanded RoutingCards stacked is an unusably tall
 * form, and the header carries enough (key, hours, severity, recipient count) to
 * scan the whole ladder at a glance.
 */
const EscalationTierRow = ({
  tier,
  idx,
  onChange,
  onRemove,
  canRemove,
  disabled,
  error,
}) => {
  const [open, setOpen] = useState(false);

  const set = (field, value) => onChange(idx, field, value);

  const keyOptions = BASELINE_TIER_KEYS.map((k) => ({ value: k, label: k }));

  const recipientCount =
    (tier.selectedRoles?.length || 0) +
    (tier.selectedUsers?.length || 0) +
    (tier.notifyAdmissionDoctor ? 1 : 0) +
    (tier.notifyAdmissionPsychologist ? 1 : 0);

  return (
    <Card className={`mb-2 ${error ? "border-danger" : ""}`}>
      <CardHeader
        className="d-flex justify-content-between align-items-center bg-light py-2"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <i className={`bx ${open ? "bx-chevron-down" : "bx-chevron-right"}`} />
          <span className="fw-bold">{tier.key || `Tier ${idx + 1}`}</span>
          <span className="text-muted">· {tier.hours || "?"}h</span>
          <Badge color={SEVERITY_COLOR[tier.severity?.value] || "secondary"}>
            {tier.severity?.value || "—"}
          </Badge>
          <small className="text-muted">
            {recipientCount
              ? `${recipientCount} recipient(s)`
              : "no recipients yet"}
          </small>
          {error && (
            <Badge color="danger" pill>
              {error}
            </Badge>
          )}
        </div>
        {canRemove && (
          <Button
            size="sm"
            color="danger"
            outline
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
          >
            Remove
          </Button>
        )}
      </CardHeader>

      <Collapse isOpen={open}>
        <CardBody>
          <Row>
            <Col md={3}>
              <FormGroup>
                <Label>
                  Tier <span className="text-danger">*</span>
                </Label>
                <Select
                  options={keyOptions}
                  value={keyOptions.find((o) => o.value === tier.key) || null}
                  onChange={(o) => set("key", o?.value || "")}
                  isDisabled={disabled}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>
                  Hours after admission <span className="text-danger">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={tier.hours}
                  onChange={(e) =>
                    set("hours", e.target.value.replace(/[^\d]/g, ""))
                  }
                  disabled={disabled}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>
                  Severity <span className="text-danger">*</span>
                </Label>
                <Select
                  options={SEVERITY_OPTIONS}
                  value={tier.severity}
                  onChange={(v) => set("severity", v)}
                  isDisabled={disabled}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Reference Section</Label>
                <Input
                  value={tier.referenceSection || ""}
                  onChange={(e) => set("referenceSection", e.target.value)}
                  disabled={disabled}
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>
              Alert Message <span className="text-danger">*</span>
            </Label>
            <Input
              type="textarea"
              rows="2"
              placeholder="Baseline package not completed within {hours}h for {patient.name}"
              value={tier.message || ""}
              onChange={(e) => set("message", e.target.value)}
              disabled={disabled}
            />
            <small className="text-muted">
              Supports <code>{"{patient.name}"}</code>,{" "}
              <code>{"{hours}"}</code> and <code>{"{dueAt}"}</code>. When
              escalation applies, a note is appended — your text is never
              replaced.
            </small>
          </FormGroup>

          <FormGroup>
            <Label>Action Guidance</Label>
            <Input
              type="textarea"
              rows="2"
              value={tier.actionGuidance || ""}
              onChange={(e) => set("actionGuidance", e.target.value)}
              disabled={disabled}
            />
          </FormGroup>

          {/* Reused verbatim — a tier's routing state is byte-identical to a
              target block's, because emptyBaselineTier spreads emptyRouting. */}
          <RoutingCard
            title={`Tier ${tier.key || idx + 1} — Who Gets Notified`}
            selectedRoles={tier.selectedRoles || []}
            onRoleToggle={(roleName) => {
              const cur = tier.selectedRoles || [];
              set(
                "selectedRoles",
                cur.includes(roleName)
                  ? cur.filter((r) => r !== roleName)
                  : [...cur, roleName],
              );
            }}
            selectedUsers={tier.selectedUsers || []}
            onUsersChange={(sel) => set("selectedUsers", sel || [])}
            notifyAdmissionDoctor={tier.notifyAdmissionDoctor}
            notifyAdmissionPsychologist={tier.notifyAdmissionPsychologist}
            onSpecialRoutingToggle={(field, checked) => set(field, checked)}
            idPrefix={`bip-tier-${idx}`}
            isSubmitting={disabled}
          />
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default EscalationTierRow;
