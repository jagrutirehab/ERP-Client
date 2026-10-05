import React from "react";
import { Badge, Button, Label, UncontrolledTooltip } from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import { BASELINE_STATUS_META } from "../../../../Components/constants/sopConstants";

/**
 * Baseline investigation package status for one admission.
 *
 * Presentational only — every dispatch stays in IPD.js, matching how the Ramsay
 * toggle beside it works.
 *
 * A badge plus buttons rather than a switch or a select. A switch cannot express
 * three states. A select would look consistent with the Patient Category
 * dropdown, but every transition away from PENDING needs a reason or a confirm,
 * so the select would only ever be a modal trigger that also has to roll its own
 * value back on cancel — and it would imply PENDING is something a user picks,
 * when it is just where every admission starts.
 */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "";

const BaselinePackageControl = ({ addmission, onRequestChange }) => {
  // The virtual is absent on admissions that predate the feature, and on any
  // payload fetched with .lean() — default rather than render "undefined".
  const status = addmission?.baselineInvestigationStatus || "PENDING";
  const meta = BASELINE_STATUS_META[status] || BASELINE_STATUS_META.PENDING;
  const isPending = status === "PENDING";
  const isDischarged = !!addmission?.dischargeDate;

  // A discharged stay that was never touched shouldn't grow a permanent
  // "Pending" scar — every admission predating this feature would show one.
  // Matches the Patient Category read-only variant, which renders only when
  // there is actually a value to show.
  if (isDischarged && isPending) return null;

  const history = addmission?.baselineInvestigationHistory || [];
  const current =
    history.find((e) => e.revokedAt == null) || history[history.length - 1];
  const reasonId = `baseline-reason-${addmission._id}`;

  return (
    <div className="d-flex align-items-center flex-wrap gap-2">
      <Label className="mb-0 text-nowrap">Baseline Lab:</Label>

      <Badge color={meta.color} className="d-inline-flex align-items-center">
        <i className={`${meta.icon} me-1`} />
        {meta.label}
      </Badge>

      <RenderWhen isTrue={!isDischarged && isPending}>
        <Button
          size="sm"
          color="success"
          outline
          onClick={() => onRequestChange(addmission._id, "COMPLETED")}
        >
          Mark Complete
        </Button>
        <Button
          size="sm"
          color="secondary"
          outline
          onClick={() => onRequestChange(addmission._id, "WAIVED")}
        >
          Not Applicable
        </Button>
      </RenderWhen>

      <RenderWhen isTrue={!isPending}>
        <small className="text-muted">
          {fmt(current?.assignedAt)}
          {current?.reason ? (
            <>
              {" "}
              <i
                id={reasonId}
                className="bx bx-info-circle align-middle"
                style={{ cursor: "help" }}
              />
              <UncontrolledTooltip target={reasonId} placement="top">
                {current.reason}
              </UncontrolledTooltip>
            </>
          ) : null}
        </small>
      </RenderWhen>

      <RenderWhen isTrue={!isDischarged && !isPending}>
        <Button
          size="sm"
          color="link"
          className="p-0 text-decoration-none"
          onClick={() => onRequestChange(addmission._id, "PENDING")}
        >
          Reopen
        </Button>
      </RenderWhen>
    </div>
  );
};

export default BaselinePackageControl;
