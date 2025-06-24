import React, { useState } from "react";
import PropTypes from "prop-types";

const RelativeVisit = ({ data }) => {
  return (
    <React.Fragment>
      <div>
        {data?.nakInfo && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">
              Nak (Nearest Available Kin) Info:-
            </h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.nakInfo}</p>
          </div>
        )}
        {data?.complaints && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Complaints:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.complaints}</p>
          </div>
        )}
        {data?.observations && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Observations:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.observations}</p>
          </div>
        )}
        {data?.diagnosis && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Diagnosis:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.diagnosis}</p>
          </div>
        )}
        {data?.notes && (
          <div className="d-flex">
            <h6 className="fs-xs-10 fs-md-14">Notes:-</h6>
            <p className="fs-xs-9 fs-md-12 mb-0 ms-2">{data.notes}</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

RelativeVisit.propTypes = {
  data: PropTypes.object,
};

export default RelativeVisit;
