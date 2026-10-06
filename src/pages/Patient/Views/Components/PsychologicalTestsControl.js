import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Badge, Button, FormGroup, Input, Label } from "reactstrap";
import { format, isValid } from "date-fns";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import {
  PSYCH_TEST_STATUS,
  PSYCH_TEST_NA_REASONS,
  PSYCH_TEST_REASON_MAX,
} from "../../../../Components/constants/sopConstants";

/**
 * Psychological tests applicability for one admission.
 *
 * Marking it Not Applicable stops the DELAYED "test not recorded" reminders for
 * every clinical-test scale on this admission. It never stops a SCORE alert — a
 * test recorded anyway still alerts on its result.
 *
 * Presentational: no store access. IPD.js owns the dispatch and passes an async
 * `onSubmit` that resolves true/false, so this component can show a submitting
 * state and keep the panel open on failure without knowing about Redux.
 *
 * Inline rather than a modal (unlike the Baseline Lab control beside it): the
 * reason appears directly below the button, and Submit appears only once a
 * reason is chosen.
 */

const fmtDateTime = (d) => {
  const dt = d ? new Date(d) : null;
  return dt && isValid(dt) ? format(dt, "dd MMM yyyy, hh:mm a") : "";
};

const reasonLabel = (code) =>
  PSYCH_TEST_NA_REASONS.find((r) => r.value === code)?.label || "";

const PsychologicalTestsControl = ({ addmission, onSubmit }) => {
  // mode: "idle" | "choosing" (picking a Not Applicable reason) | "reopening"
  const [mode, setMode] = useState("idle");
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Status is derived from the HISTORY, not the `psychologicalTestStatus`
  // virtual. state.Chart.data is upserted by spread, so a lean payload from
  // another screen can refresh the history while a stale virtual lingers.
  const history = addmission?.psychologicalTestHistory || [];
  const current =
    history.find((e) => e?.revokedAt == null) || history[history.length - 1];
  const status = current?.status || PSYCH_TEST_STATUS.APPLICABLE;
  const isNA = status === PSYCH_TEST_STATUS.NOT_APPLICABLE;
  const isDischarged = !!addmission?.dischargeDate;

  const reset = () => {
    setMode("idle");
    setReasonCode("");
    setReason("");
  };

  // Someone else's change can land while a panel is open (another user, another
  // tab). Close it rather than let a stale form submit against the new status.
  useEffect(() => {
    setMode("idle");
    setReasonCode("");
    setReason("");
  }, [status]);

  // Nothing to show on a closed stay that was never marked Not Applicable —
  // every admission predating this feature would otherwise grow a dead row.
  if (isDischarged && !isNA) return null;

  // Ids must be unique per admission: one card renders per admission, so a
  // shared id would bind every card's label to the first card's input.
  const idBase = `psych-tests-${addmission._id}`;

  const submit = async (body) => {
    setSubmitting(true);
    try {
      const ok = await onSubmit(addmission._id, body);
      if (ok) reset();
      // On failure keep the panel and the selection, so the user can retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center flex-wrap gap-2 w-100">
      <Label className="mb-0 text-nowrap">Psychological Tests:</Label>

      {/* ── Applicable ─────────────────────────────────────────────────── */}
      <RenderWhen isTrue={!isNA && !isDischarged}>
        <Button
          size="sm"
          color="secondary"
          outline={mode !== "choosing"}
          active={mode === "choosing"}
          disabled={submitting}
          onClick={() => (mode === "choosing" ? reset() : setMode("choosing"))}
        >
          Not Applicable
        </Button>
      </RenderWhen>

      {/* ── Not Applicable: who, when, why ─────────────────────────────── */}
      <RenderWhen isTrue={isNA}>
        <Badge color="secondary" className="d-inline-flex align-items-center">
          <i className="bx bx-minus-circle me-1" />
          Not Applicable
        </Badge>
        <small className="text-muted">
          by {current?.authorName || "—"} · {fmtDateTime(current?.recordedAt)}
        </small>
        <RenderWhen isTrue={!isDischarged && mode === "idle"}>
          <Button
            size="sm"
            color="link"
            className="p-0 text-decoration-none"
            onClick={() => setMode("reopening")}
          >
            Reopen
          </Button>
        </RenderWhen>
        <div className="w-100">
          <small className="text-muted">
            Reason: {reasonLabel(current?.reasonCode) || "—"}
          </small>
        </div>
      </RenderWhen>

      {/* ── Choosing a reason (inline, below the button) ───────────────── */}
      <RenderWhen isTrue={mode === "choosing" && !isNA}>
        <div className="w-100 border rounded p-2">
          <div className="mb-1">
            Reason <span className="text-danger">*</span>
          </div>
          {PSYCH_TEST_NA_REASONS.map((r) => (
            <FormGroup check key={r.value} className="mb-1">
              <Input
                type="radio"
                id={`${idBase}-${r.value}`}
                name={`${idBase}-reason`}
                value={r.value}
                checked={reasonCode === r.value}
                disabled={submitting}
                onChange={() => setReasonCode(r.value)}
              />
              <Label check htmlFor={`${idBase}-${r.value}`}>
                {r.label}
              </Label>
            </FormGroup>
          ))}
          <p className="text-muted mb-2 mt-1" style={{ fontSize: "0.8rem" }}>
            Stops missed-test reminders for all clinical scales on this
            admission, including CIWA-Ar, COWS, C-SSRS, Morse, Ramsay and GCS.
            Score alerts still fire when a test is recorded.
          </p>
          <div className="d-flex gap-2 justify-content-end">
            <Button
              size="sm"
              color="light"
              disabled={submitting}
              onClick={reset}
            >
              Cancel
            </Button>
            {/* Rendered only once a reason is chosen — it APPEARS, rather
                than sitting there disabled. */}
            <RenderWhen isTrue={!!reasonCode}>
              <Button
                size="sm"
                color="secondary"
                disabled={submitting}
                onClick={() =>
                  submit({
                    status: PSYCH_TEST_STATUS.NOT_APPLICABLE,
                    reasonCode,
                  })
                }
              >
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </RenderWhen>
          </div>
        </div>
      </RenderWhen>

      {/* ── Reopening ──────────────────────────────────────────────────── */}
      <RenderWhen isTrue={mode === "reopening" && isNA && !isDischarged}>
        <div className="w-100 border rounded p-2">
          <Label htmlFor={`${idBase}-reopen`} className="mb-1">
            Reason for reopening <span className="text-danger">*</span>
          </Label>
          <Input
            id={`${idBase}-reopen`}
            type="textarea"
            rows="2"
            maxLength={PSYCH_TEST_REASON_MAX}
            value={reason}
            disabled={submitting}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do psychological tests apply again?"
          />
          <p className="text-muted mb-2 mt-1" style={{ fontSize: "0.8rem" }}>
            Missed-test reminders resume from the next scheduled check. If no
            test is recorded in the current window, one reminder per rule may
            be raised then.
          </p>
          <div className="d-flex gap-2 justify-content-end">
            <Button
              size="sm"
              color="light"
              disabled={submitting}
              onClick={reset}
            >
              Cancel
            </Button>
            <RenderWhen isTrue={reason.trim().length > 0}>
              <Button
                size="sm"
                color="warning"
                disabled={submitting}
                onClick={() =>
                  submit({
                    status: PSYCH_TEST_STATUS.APPLICABLE,
                    reason: reason.trim(),
                  })
                }
              >
                {submitting ? "Saving..." : "Submit"}
              </Button>
            </RenderWhen>
          </div>
        </div>
      </RenderWhen>
    </div>
  );
};

PsychologicalTestsControl.propTypes = {
  addmission: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default PsychologicalTestsControl;
