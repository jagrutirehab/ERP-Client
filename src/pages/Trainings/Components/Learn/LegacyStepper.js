import React from "react";

const StepCircle = ({ done, current, index }) => {
  if (done) {
    return (
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
        style={{ width: 26, height: 26, fontSize: 14 }}
      >
        <i className="ri-check-line" />
      </span>
    );
  }

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold ${
        current ? "border border-primary text-primary bg-primary bg-opacity-10" : "border text-muted bg-light"
      }`}
      style={{ width: 26, height: 26, fontSize: 12 }}
    >
      {index + 1}
    </span>
  );
};

const LegacyStepper = ({ steps, currentKey }) => (
  <div className="d-flex align-items-center flex-wrap gap-2 mb-4">
    {steps.map((step, index) => {
      const current = step.key === currentKey;
      return (
        <React.Fragment key={step.key}>
          <div className="d-flex align-items-center gap-2">
            <StepCircle done={step.done} current={current} index={index} />
            <span
              className={`${step.done ? "text-success fw-semibold" : current ? "text-primary fw-semibold" : "text-muted"}`}
              style={{ fontSize: 13 }}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span
              style={{
                width: 32,
                height: 2,
                background: step.done ? "#22c55e" : "#e5e7eb",
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default LegacyStepper;
