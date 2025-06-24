import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";

const Deposit = ({ data }) => {
  return (
    <React.Fragment>
      <div>
        <Row>
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <p className="fs-xs-14 fs-md-18">Deposit</p>
              <p className="font-size-25 text-primary">{data?.totalAmount}</p>
            </div>
            <div className="d-flex justify-content-center gap-4 text-center border shadow-lg p-1 mb-3">
              <h6 className="text-primary m-0 fs-xs-11 fs-md-14">
                Converted Amount: {data?.convertedAmount ?? 0}
              </h6>
              <h6 className="text-primary m-0 fs-xs-11 fs-md-14">
                Remaining Amount: {data?.remainingAmount ?? 0}
              </h6>
            </div>
            <div className="bg-primary" style={{ height: "1px" }} />
            <p className="display-6 fs-xs-14 fs-md-18 mt-2 mb-0 text-center underline">
              Payment Modes
            </p>
            <div className="p-2">
              {(data?.paymentModes || []).map((item) => {
                return (
                  <div
                    className="d-flex align-items-center justify-content-between border-bottom-1 pt-1"
                    key={item._id}
                  >
                    <div className="d-flex align-items-center">
                      <div className="text-center me-2">
                        <p className="text-muted fs-xs-14 fs-md-18 mb-0">
                          {item.paymentMode}
                        </p>
                      </div>
                      {item.paymentMode === "CHEQUE" && (
                        <div className="d-flex">
                          <div className="text-center ms-3">
                            <p className="text-muted fs-xs-11 fs-md-14 pb-0 mb-0">
                              {item.bankName}
                            </p>
                          </div>
                          <div className="text-center ms-3">
                            <p className="text-muted fs-xs-11 fs-md-14 pb-0 mb-0">
                              {item.chequeNo}
                            </p>
                          </div>
                        </div>
                      )}
                      {item.paymentMode === "UPI" && (
                        <div className="text-center">
                          <p className="text-muted fs-xs-11 fs-md-14 pb-0 mb-0">
                            {item.transactionId}
                          </p>
                        </div>
                      )}
                      {item.paymentMode === "BANK" && (
                        <div className="text-center">
                          <p className="text-muted fs-xs-11 fs-md-14 pb-0 mb-0">
                            {item.bankAccount}
                          </p>
                        </div>
                      )}
                      {item.paymentMode === "CARD" && (
                        <div className="text-center ms-3">
                          <p className="text-muted fs-xs-11 fs-md-14 pb-0 mb-0">
                            {item.cardNumber}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-muted font-size-16 pb-0 mb-0">
                        {item.amount}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

Deposit.propTypes = {
  data: PropTypes.object,
};

export default Deposit;
