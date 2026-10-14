import React from "react";
import { getStatusStyle } from "../../Helpers/adminTrainingHelpers";

export const StatusBadge = ({ status, label }) => {
  const style = getStatusStyle(status);
  return (
    <span
      className="d-inline-block text-nowrap"
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: style.background,
        color: style.color,
      }}
    >
      {label || style.label}
    </span>
  );
};

const StepBar = ({ steps, status }) => {
  const style = getStatusStyle(status);
  return (
    <div className="d-flex align-items-center gap-1 flex-wrap mt-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <span
            className="d-inline-flex align-items-center gap-1"
            style={{ fontSize: 11, color: step.done ? "#15803d" : "#6b7280" }}
          >
            <i
              className={step.done ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"}
              style={{ color: step.done ? "#22c55e" : style.bar }}
            />
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <span style={{ width: 14, height: 2, background: step.done ? "#22c55e" : "#e5e7eb" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const PercentBar = ({ percent, status }) => {
  const style = getStatusStyle(status);
  return (
    <div className="d-flex align-items-center gap-2 mt-2" style={{ maxWidth: 260 }}>
      <div className="progress flex-grow-1" style={{ height: 6 }}>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${percent}%`, background: style.bar }}
        />
      </div>
      <span className="text-muted fw-semibold" style={{ fontSize: 11, minWidth: 32 }}>
        {percent}%
      </span>
    </div>
  );
};

const StageStatus = ({ row }) => (
  <div>
    <StatusBadge status={row.status} label={row.label} />
    {row.stage && (
      <div className="mt-1" style={{ fontSize: 13, color: "#374151", lineHeight: 1.35 }}>
        {row.stage}
      </div>
    )}
    {row.status !== "not_started" && row.percent !== null && row.percent !== undefined && (
      <PercentBar percent={row.percent} status={row.status} />
    )}
    {row.steps && <StepBar steps={row.steps} status={row.status} />}
  </div>
);

export default StageStatus;
