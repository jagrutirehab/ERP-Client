import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";

const TimelineRight = ({ data, children }) => {
  return (
    <React.Fragment>
      <div className="timeline-item right">
        <i className="icon ri-money-dollar-box-line"></i>
        <div className="date fs-13 mb-5">
          <div>
            <h6 className="display-5 text-primary fs-12 mb-0">
              {data.author?.name} ({data.author?.role})
            </h6>
          </div>
          <div>{format(new Date(data.createdAt), "dd MMMM yyyy hh:mm a")}</div>
        </div>
        <div className="content">
          <h5 className="fs-14">
            <h4 className="fs-12">
              {data?.create
                ? `${data?.create?.id?.prefix}${data?.create?.id?.patientId}-${data?.create?.id?.value}`
                : `${data?.edit?.id?.prefix}${data?.edit?.id?.patientId}-${data?.edit?.id?.value}` ||
                  ""}
            </h4>
            {children}
            {data.description}{" "}
            {/* <span className="badge bg-soft-success text-success fs-10 align-middle ms-1">
              Completed
            </span> */}
          </h5>
          {/* <p className="text-muted mb-2">
            It is important for us that we receive email notifications when a
            ticket is created as our IT staff are mobile and will not always be
            looking at the dashboard for new tickets.
          </p> */}
        </div>
      </div>
    </React.Fragment>
  );
};

TimelineRight.propTypes = {};

export default TimelineRight;
