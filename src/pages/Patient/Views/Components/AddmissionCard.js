import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { connect } from "react-redux";
import RenderWhen from "../../../../Components/Common/RenderWhen";

// ✅ Helper to format ISO date string in UTC to "DD Month YYYY"
const formatDate = (isoDateStr) => {
  if (!isoDateStr) return "N/A";
  const date = new Date(isoDateStr);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
};

const AddmissionCard = ({ data, children }) => {
  return (
    <React.Fragment>
      <Col xs={12}>
        <div className="d-flex flex-wrap justify-content-between position-relative px-3 bg-light timeline-date border border-dark py-2">
          <div>
            <div className="d-flex align-items-center">
              <span>Addmission Date:</span>
              <h6 className="display-6 fs-6 mb-0 ms-2">
                {data?.addmissionDate && !isNaN(new Date(data.addmissionDate))
                  ? formatDate(data.addmissionDate)
                  : "N/A"}
              </h6>
            </div>
            {data.dischargeDate && (
              <div className="d-flex align-items-center">
                <span>Discharge Date:</span>
                <h6 className="display-6 fs-6 mb-0 ms-2">
                  {formatDate(data.dischargeDate)}
                </h6>
              </div>
            )}
          </div>

          <RenderWhen isTrue={data.addmissionDate && data.dischargeDate}>
            <div className="position-absolute patient-addmission-complete badge bg-light rounded-pill px-1">
              <i className="ri-checkbox-circle-line text-success fs-5"></i>
            </div>
          </RenderWhen>

          <div className="position-absolute patient-addmission-center px-1">
            <span
              id="patient-center"
              className="badge badge-soft-success fs-12 text-danger rounded p-1"
            >
              {data.center?.title || ""}
            </span>
          </div>
          {children}
        </div>
      </Col>
    </React.Fragment>
  );
};

AddmissionCard.propTypes = {
  data: PropTypes.object,
};

const mapStateToProps = (state) => ({
  // loading: state.Bill.billLoading,
});

export default connect(mapStateToProps)(AddmissionCard);
