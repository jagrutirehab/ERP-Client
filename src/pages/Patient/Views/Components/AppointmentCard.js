import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { differenceInMinutes, format } from "date-fns";
import { connect } from "react-redux";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const AppointmentCard = ({ data, children }) => {
  return (
    <React.Fragment>
      <Col xs={12}>
        <div className="d-flex flex-wrap justify-content-between position-relative px-3 bg-light timeline-date border border-dark py-2">
          <div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <span>Appointment On:</span>
                <h6 className="display-6 fs-6 mb-0 ms-2">
                  {data?.startDate &&
                    format(new Date(data.startDate), "dd MMM yyyy")}
                </h6>
              </div>
              <div className="d-flex align-items-center">
                <span>At:</span>
                <h6 className="display-6 fs-6 mb-0 ms-2">
                  {data?.startDate &&
                    format(new Date(data.startDate), "hh:mm a")}
                </h6>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span>For:</span>
              <h6 className="display-6 fs-6 mb-0 ms-2">
                {differenceInMinutes(
                  new Date(data?.endDate),
                  new Date(data?.startDate)
                )}{" "}
                mins
              </h6>
            </div>
          </div>
          <RenderWhen isTrue={data.chart && data.bill}>
            <div className="position-absolute patient-addmission-complete badge bg-light rounded-pill px-1">
              <i className="ri-checkbox-circle-line text-success fs-5"></i>
            </div>
          </RenderWhen>
          {children}
        </div>
      </Col>
    </React.Fragment>
  );
};

AppointmentCard.propTypes = {
  data: PropTypes.object,
};

const mapStateToProps = (state) => ({
  // loading: state.Bill.billLoading,
});

export default connect(mapStateToProps)(AppointmentCard);
