import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";

// Read-only view of an auto-generated round-note chart. The content is a
// snapshot of a Round Note row — it is edited only from the Round Notes screen.
const RoundNoteChart = ({ data }) => {
  const staffNames = (data?.roundTakenBy || [])
    .map((m) => m?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <React.Fragment>
      <div>
        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
          {data?.roundSession && (
            <span className="badge bg-soft-primary text-primary">
              {data.roundSession} Round
            </span>
          )}
          {data?.floor && (
            <span className="badge bg-soft-info text-info">{data.floor}</span>
          )}
          {data?.roundDate && (
            <small className="text-muted">
              {format(new Date(data.roundDate), "dd MMM yyyy")}
            </small>
          )}
        </div>

        {data?.note && (
          <p
            className="fs-xs-9 fs-md-12 mb-1"
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
          >
            {data.note}
          </p>
        )}

        {staffNames && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14 mb-0">Round Taken By:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{staffNames}</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

RoundNoteChart.propTypes = {
  data: PropTypes.object,
};

export default RoundNoteChart;
