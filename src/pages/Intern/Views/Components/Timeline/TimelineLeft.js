import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";

const TimelineLeft = ({ data }) => {


  return (
    <React.Fragment>
      <div className="timeline-item left">
        <i className="icon bx bx-book-add"></i>
        <div className="date fs-13 mb-5">
          <div>
            <h6 className="display-5 text-primary fs-12 mb-0">
              {data.author?.name} ({data.author?.role})
            </h6>
          </div>
          <div>{format(new Date(data.createdAt), "dd MMMM yyyy hh:mm a")}</div>
        </div>
        <div className="content">
          <h4 className="fs-12">
            {data?.create
              ? `${data?.create?.id?.prefix}${data?.create?.id?.patientId}-${data?.create?.id?.value}`
              : `${data?.edit?.id?.prefix}${data?.edit?.id?.patientId}-${data?.edit?.id?.value}` ||
                ""}
          </h4>
          <h5 className="fs-14">{data.description}</h5>
          {/* <p className="text-muted">
            Powerful, clean & modern responsive bootstrap 5 admin template. The
            maximum file size for uploads in this demo :
          </p> */}
        </div>
      </div>
    </React.Fragment>
  );
};

TimelineLeft.propTypes = {};

export default TimelineLeft;
