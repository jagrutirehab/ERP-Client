import React from "react";
import { Spinner } from "reactstrap";

// Short chip label — the year only earns its space when it isn't the current one.
const chipLabel = (date) => {
  const d = new Date(date);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    ...(sameYear ? {} : { year: "2-digit" }),
  });
};

const fullLabel = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const dayHint = (entry) => {
  const parts = [
    `${entry.recordedSlots} of ${entry.totalSlots} locations`,
    entry.pending ? `${entry.pending} pending` : null,
    entry.verified ? `${entry.verified} verified` : null,
    entry.rejected ? `${entry.rejected} rejected` : null,
  ].filter(Boolean);
  return `${fullLabel(entry.auditDate)} — ${parts.join(" · ")}`;
};

const isToday = (date) => {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

/**
 * The single date control for the Verification tab: one chip per day that has an
 * audit, newest first, plus "All dates". Always visible — no toggle to discover
 * and nothing else competing to filter by date.
 */
const AuditDateStrip = ({ entries, loading, activeDate, onSelectDate, onSelectAll }) => {
  const chipBase = {
    fontSize: 12,
    borderRadius: 999,
    whiteSpace: "nowrap",
    lineHeight: 1.2,
  };

  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <span
        className="text-muted flex-shrink-0 fw-semibold"
        style={{ fontSize: 12 }}
      >
        Audit day
      </span>

      {loading ? (
        <span className="d-inline-flex align-items-center gap-2 text-muted small">
          <Spinner size="sm" color="primary" /> Loading dates...
        </span>
      ) : (
        <div
          className="d-flex align-items-center gap-2 flex-grow-1"
          style={{ overflowX: "auto", paddingBottom: 2 }}
        >
          <button
            type="button"
            onClick={onSelectAll}
            className={`btn btn-sm px-3 flex-shrink-0 ${
              activeDate ? "btn-outline-secondary" : "btn-primary"
            }`}
            style={chipBase}
            title="Show every audit date"
          >
            All dates
          </button>

          {entries.length === 0 ? (
            <span className="text-muted small ms-1">
              No audits recorded for this center yet.
            </span>
          ) : (
            entries.map((entry) => {
              const active = activeDate === entry.auditDate;
              const hasPending = entry.pending > 0;

              return (
                <button
                  key={entry._id}
                  type="button"
                  onClick={() => onSelectDate(entry)}
                  title={dayHint(entry)}
                  className={`btn btn-sm px-3 flex-shrink-0 d-inline-flex align-items-center gap-2 ${
                    active ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  style={chipBase}
                >
                  <span>
                    {chipLabel(entry.auditDate)}
                    {isToday(entry.auditDate) && (
                      <span
                        className={active ? "" : "text-muted"}
                        style={{ fontSize: 10 }}
                      >
                        {" "}
                        · Today
                      </span>
                    )}
                  </span>

                  {/* Outstanding count is the only number worth showing on the
                      chip; a fully reviewed day just gets a tick. */}
                  {hasPending ? (
                    <span
                      className="badge rounded-pill"
                      style={{
                        fontSize: 10,
                        background: active ? "rgba(255,255,255,.25)" : "#fff3bf",
                        color: active ? "#fff" : "#8a6d00",
                      }}
                    >
                      {entry.pending}
                    </span>
                  ) : (
                    <i
                      className="ri-check-line"
                      style={{
                        fontSize: 13,
                        color: active ? "#fff" : "#40c057",
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AuditDateStrip;
