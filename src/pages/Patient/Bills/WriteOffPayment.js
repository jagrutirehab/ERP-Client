import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { clearLogs } from "../../../store/features/report/dbLogSlice";

const WriteOffPayment = ({ data }) => {

  console.log("data from write", data);

  return (
    <React.Fragment>
      <div>
        <Row>
          <Col xs={12}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center">
              <p className="fs-xs-14 fs-md-18">
                Write Off
              </p>
              <p className="font-size-25 text-danger">
                {data?.amount ?? 0}
              </p>
            </div>

            {/* Adjusted Section */}
            <div className="text-center border shadow-lg p-2 mb-3">
              <h6 className="text-danger m-0 fs-xs-11 fs-md-14">
                Write Off Amount: {data?.amount ?? 0}
              </h6>

              <h6 className="mt-2 text-dark m-0 fs-xs-11 fs-md-14">
                 Reason: <span className="fw-light text-muted">{data?.reason ?? "-"}</span>
              </h6>
            </div>


            <div className="bg-danger" style={{ height: "1px" }} />

            {/* Optional Note Section (future ready) */}
            {data?.note && (
              <>
                <p className="display-6 fs-xs-14 fs-md-18 mt-2 mb-0 text-center underline">
                  Note
                </p>
                <div className="p-2 text-center">
                  <p className="text-muted fs-xs-11 fs-md-14">
                    {data.note}
                  </p>
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

WriteOffPayment.propTypes = {
  data: PropTypes.object,
};

export default WriteOffPayment;