import React from "react";
import PropTypes from "prop-types";
import TimelineData from "../../../../Patient/Components/TimelineData";
import {
  ADMITTED,
  CREATED,
  DELETED,
  DISCHARGED,
  RESTORED,
  SWITCHED_CENTER,
} from "../../../../../Components/constants/patient";
import RenderWhen from "../../../../../Components/Common/RenderWhen";
import { format } from "date-fns";

const TimelineCenter = ({ data }) => {
  // const className = data?.log?.action === CREATED
  let className;
  let background;
  switch (data?.action) {
    case CREATED:
      className = "text-center bg-white border-light";
      background = "content bg-white";
      break;
    case ADMITTED:
      className = "text-center bg-white border-success";
      background = "content bg-soft-success";
      break;
    case DISCHARGED || SWITCHED_CENTER:
      className = "text-center bg-white border-warning";
      background = "content bg-soft-warning";
      break;
    case DELETED:
      className = "text-center bg-white border-danger";
      background = "content bg-soft-danger";
      break;
    case RESTORED:
      className = "text-center bg-white border-primary";
      background = "content bg-soft-primary";
      break;
    default:
      className = "text-center bg-white border-light";
      background = "content bg-white";
      break;
  }

  return (
    <React.Fragment>
      <div className="timeline-item center">
        {/* <i className="icon bx bx-book-add"></i> */}
        {/* <div className="date fs-13 mb-5">
          <div>
            <h6 className="display-5 text-primary fs-12 mb-0">Addmission</h6>
          </div>
          <div>
            On: {format(new Date(data?.addmissionDate), "dd MMMM yyyy hh:mm a")}
          </div>
        </div> */}
        <TimelineData
          className={className}
          background={background}
          data={data}
          title={`${data?.description}`}
        >
          <RenderWhen isTrue={data?.action === ADMITTED}>
            <div className="mt-2 pt-2 border-top">
              <span className="font-semi-bold">Admitted On: </span>
              {data?.edit?.addmission?.addmissionDate &&
                format(
                  new Date(data.edit.addmission.addmissionDate),
                  "dd MMMM yyyy hh:mm a"
                )}
            </div>
          </RenderWhen>
          <RenderWhen isTrue={data?.action === DISCHARGED}>
            <div className="mt-2 pt-2 border-top">
              <span className="font-semi-bold">Discharged On: </span>
              {data?.edit?.addmission?.dischargeDate &&
                format(
                  new Date(data.edit.addmission.dischargeDate),
                  "dd MMMM yyyy hh:mm a"
                )}
            </div>
          </RenderWhen>
          <RenderWhen isTrue={data?.action === SWITCHED_CENTER}>
            <div className="mt-2 pt-2 border-top">
              <div>
                <span className="font-semi-bold">Current Center: </span>
                <span className="text-primary font-semi-bold fs-14">
                  {data?.centerLog?.current?.title}
                </span>
              </div>
              <div>
                <span className="font-semi-bold">Previous Center: </span>
                <span className="text-primary font-semi-bold fs-14">
                  {data?.centerLog?.previous?.title}
                </span>
              </div>
            </div>
          </RenderWhen>
        </TimelineData>
      </div>
    </React.Fragment>
  );
};

TimelineCenter.propTypes = {
  data: PropTypes.object,
};

export default TimelineCenter;
