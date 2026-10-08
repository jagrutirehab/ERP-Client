import React from "react";
import PropTypes from "prop-types";
import { Badge, Button, Label } from "reactstrap";
import { format, isValid } from "date-fns";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import {
  PSYCH_TEST_STATUS,
  PSYCH_TEST_NA_REASONS,
} from "../../../../Components/constants/sopConstants";

/**
 * Psychological tests applicability for one admission.
 *
 * Marking it Not Applicable stops the DELAYED "test not recorded" reminders for
 * every clinical-test scale on this admission. It never stops a SCORE alert — a
 * test recorded anyway still alerts on its result.
 *
 * Presentational and stateless, like BaselinePackageControl beside it: the
 * buttons only ask IPD.js to open PsychologicalTestsStatusModal, which collects
 * the reason and submits.
 */

const fmtDateTime = (d) => {
  const dt = d ? new Date(d) : null;
  return dt && isValid(dt) ? format(dt, "dd MMM yyyy, hh:mm a") : "";
};

const reasonLabel = (code) =>
  PSYCH_TEST_NA_REASONS.find((r) => r.value === code)?.label || "";

const PsychologicalTestsControl = ({ addmission, onRequestChange }) => {
  // Status is derived from the HISTORY, not the `psychologicalTestStatus`
  // virtual. state.Chart.data is upserted by spread, so a lean payload from
  // another screen can refresh the history while a stale virtual lingers.
  const history = addmission?.psychologicalTestHistory || [];
  const current =
    history.find((e) => e?.revokedAt == null) || history[history.length - 1];
  const status = current?.status || PSYCH_TEST_STATUS.APPLICABLE;
  const isNA = status === PSYCH_TEST_STATUS.NOT_APPLICABLE;
  const isDischarged = !!addmission?.dischargeDate;

  // Nothing to show on a closed stay that was never marked Not Applicable —
  // every admission predating this feature would otherwise grow a dead row.
  if (isDischarged && !isNA) return null;

  return (
    <div className="d-flex align-items-center flex-wrap gap-2 w-100">
      <Label className="mb-0 text-nowrap">Psychological Tests:</Label>

      <RenderWhen isTrue={!isNA && !isDischarged}>
        <Button
          size="sm"
          color="secondary"
          outline
          onClick={() =>
            onRequestChange(addmission._id, PSYCH_TEST_STATUS.NOT_APPLICABLE)
          }
        >
          Not Applicable
        </Button>
      </RenderWhen>

      {/* Who, when and why — shown as text rather than a tooltip. */}
      <RenderWhen isTrue={isNA}>
        <Badge color="secondary" className="d-inline-flex align-items-center">
          <i className="bx bx-minus-circle me-1" />
          Not Applicable
        </Badge>
        <small className="text-muted">
          by {current?.authorName || "—"} · {fmtDateTime(current?.recordedAt)}
        </small>
        <RenderWhen isTrue={!isDischarged}>
          <Button
            size="sm"
            color="link"
            className="p-0 text-decoration-none"
            onClick={() =>
              onRequestChange(addmission._id, PSYCH_TEST_STATUS.APPLICABLE)
            }
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
    </div>
  );
};

PsychologicalTestsControl.propTypes = {
  addmission: PropTypes.object.isRequired,
  onRequestChange: PropTypes.func.isRequired,
};

export default PsychologicalTestsControl;
