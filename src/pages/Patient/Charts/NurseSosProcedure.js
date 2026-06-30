import React from "react";
import PropTypes from "prop-types";

const NurseSosProcedure = ({ data }) => {
  return (
    <div>
      <div className="mb-2">
        <span className="text-muted" style={{ fontSize: "12px" }}>
          Activity Type
        </span>
        <p className="mb-0 font-size-14 fw-medium">
          {data?.activityType || "—"}
        </p>
      </div>
      {data?.description && (
        <div>
          <span className="text-muted" style={{ fontSize: "12px" }}>
            Description
          </span>
          <p
            className="mb-0 font-size-14"
            style={{ whiteSpace: "pre-line" }}
          >
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
};

NurseSosProcedure.propTypes = {
  data: PropTypes.object,
};

export default NurseSosProcedure;
