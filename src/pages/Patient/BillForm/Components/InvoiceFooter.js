import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Input } from "reactstrap";
import { connect } from "react-redux";
import {
  DRAFT_INVOICE,
  INVOICE,
  PROFORMA_INVOICE,
  IPD,
  OPD,
  REFUND,
} from "../../../../Components/constants/patient";
import PaymentMode from "./paymentMode";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const InvoiceFooter = (props) => {
  const wDiscount =
    props.wholeDiscount.unit === "%"
      ? (parseFloat(props.wholeDiscount.value) / 100) * props.totalCost
      : parseFloat(props.wholeDiscount.value);

  let value = 0;
  if (props.validation.values.bill === DRAFT_INVOICE) value = props.payable;
  else if (props.type === IPD) {
    value =
      props.validation.values.bill === PROFORMA_INVOICE || props.validation.values.bill === INVOICE
        ? props.payable
        : // props.totalAdvance > 0 && props.totalAdvance > props.payable
          //   ? 0
          //   : props.totalAdvance < props.payable
          //   ? props.payable - props.totalAdvance
          //   : props.payable - props.totalAdvance
          props.refund;
  } else {
    value = props.payable;
  }

  // let value = 0;
  // if (props.validation.values.bill === DRAFT_INVOICE) value = props.payable;
  // else if (props.type === IPD) {
  //   value =
  //     props.validation.values.bill === INVOICE
  //       ? props.totalAdvance > 0 && props.totalAdvance > props.payable
  //         ? 0
  //         : props.totalAdvance < props.payable
  //         ? props.payable - props.totalAdvance
  //         : props.payable - props.totalAdvance
  //       : props.refund;
  // } else {
  //   value = props.payable;
  // }

  return (
    <React.Fragment>
      <Row className="d-flex justify-content-end mt-3">
        <Col xs={6} lg={3} className="text-center">
          <div>
            <h6 className="text-muted d-flex justify-content-center align-items-center text-primary">
              <i className="ri-git-commit-line font-size-16"></i> TOTAL COST (₹)
            </h6>
            <p>{props.totalCost || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={3} className="text-center">
          <div className="ms-4">
            <h6
              style={{ whiteSpace: "nowrap" }}
              className="text-muted d-flex justify-content-center align-items-center text-primary pe-5 pe-lg-0"
            >
              <i className="ri-git-commit-line font-size-16"></i> TOTAL DISCOUNT
              (₹)
            </h6>
            <p className="pe-5 pe-lg-0">{wDiscount?.toFixed(2) || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={3} className="text-center">
          <div className="ms-0 ms-lg-4">
            <h6 className="text-muted d-flex justify-content-center align-items-center text-primary">
              <i className="ri-git-commit-line font-size-16"></i> TOTAL ADVANCE
              (₹)
            </h6>
            <p>{props.advance || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={3} className="text-center">
          <div className="ms-4">
            <h6
              style={{ whiteSpace: "nowrap" }}
              className="text-muted d-flex justify-content-center align-items-center text-primary pe-5 pe-lg-0"
            >
              <i className="ri-git-commit-line font-size-16"></i> GRAND TOTAL
              (₹)
            </h6>
            <p className="pe-5 pe-lg-0">{props.grandTotal || "0.00"}</p>
          </div>
        </Col>
      </Row>
      <div className="w-100 bg-primary mt-3 mb-2" style={{ height: "1px" }} />
      <div>
        <Row className="align-items-center justify-content-between">
          <Col xs={12} lg={4}>
            <div className="mt-4 mb-4 m-lg-0">
              <h6 className="text-muted mt-2 mb-3 fs-10">Total Discount (₹)</h6>
              <div className="input-group" style={{ width: "150px" }}>
                <Input
                  bsSize="sm"
                  size={1}
                  type="number"
                  name="wholeDiscount"
                  value={props.wholeDiscount.value || ""}
                  style={{ height: "9px", width: "60px" }}
                  className="form-control"
                  onChange={(e) =>
                    props.setWholeDiscount({
                      unit: props.wholeDiscount.unit,
                      value: parseFloat(e.target.value || 0),
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.which === 38 || e.which === 40) {
                      e.preventDefault();
                    }
                  }}
                />
                <span className="input-group-text p-0 bg-light">
                  <Input
                    bsSize="sm"
                    name="wholeUnit"
                    style={{ height: "27px" }}
                    className="border-0"
                    size={"1"}
                    type="select"
                    value={props.wholeDiscount.unit || ""}
                    onChange={(e) =>
                      props.setWholeDiscount({
                        value: props.wholeDiscount.value,
                        unit: e.target.value,
                      })
                    }
                  >
                    <option>₹</option>
                    <option>%</option>
                  </Input>
                </span>
              </div>
              <p className="mb-0">
                {wDiscount > props.totalCost ? (
                  <span className="text-danger font-size-10">
                    should be less than total cost
                  </span>
                ) : (
                  <span>₹{wDiscount?.toFixed(2) || "0.00"}</span>
                )}
              </p>
            </div>
          </Col>
          {/* <Col xs={12} lg={4}>
            <div className="mt-4 mb-4 m-lg-0">
              <h6 className="text-muted mt-2 mb-3 fs-10">From Deposit (₹)</h6>
              <div className="input-group" style={{ width: "150px" }}>
                <Input
                  bsSize="sm"
                  size={1}
                  type="number"
                  name="fromDeposit"
                  disabled={props.totalDeposit === 0} //props.payable === 0 ||
                  value={props.fromDeposit || ""}
                  style={{ height: "9px", width: "60px" }}
                  className="form-control"
                  onChange={(e) =>
                    props.setFromDeposit(parseFloat(e.target.value || 0))
                  }
                  onKeyDown={(e) => {
                    if (e.which === 38 || e.which === 40) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <p className="mb-0">
                {props.totalDeposit < props.fromDeposit ? (
                  <span className="text-danger font-size-10">
                    should be less than total deposit
                  </span>
                ) : props.fromDeposit > props.grandTotal ? (
                  <span className="text-danger font-size-10">
                    should be less than total payable
                  </span>
                ) : (
                  <span>
                    Remaining: ₹
                    {(props.totalDeposit - props.fromDeposit)?.toFixed(2) ||
                      "0.00"}
                  </span>
                )}
              </p>
            </div>
          </Col> */}
          <RenderWhen isTrue={props.type === OPD}>
            <Col xs={12} lg={4}>
              <PaymentMode
                paymentModes={props.paymentModes}
                setPaymentModes={props.setPaymentModes}
                payable={props.payable}
                validation={props.validation}
              />
            </Col>
          </RenderWhen>
          <Col xs={12} lg={4}>
            <div className="w-50 ms-md-auto">
              <div className="fs-10">
                <Input
                  bsSize="sm"
                  type="select"
                  name="invoiceType"
                  value={props.validation?.values?.bill}
                  onChange={(e) => {
                    const value = e.target.value;
                    props.setInvoiceType(value);
                  }}
                  disabled={
                    props.totalAdvance < props.totalCost - props.totalDiscount
                  }
                >
                  <option value={INVOICE}>Payable</option>
                  <option value={REFUND}>Refund</option>
                </Input>
              </div>
              <Input
                bsSize="sm"
                type="text"
                value={value}
                style={{ height: "30px" }}
                className="mt-2"
              />
            </div>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

InvoiceFooter.propTypes = {
  totalAdvancePayment: PropTypes.number,
  totalInvoicePayment: PropTypes.number,
};

const mapStateToProps = (state) => ({
  totalAdvancePayment: state.Bill.totalAdvancePayment,
  totalInvoicePayment: state.Bill.totalInvoicePayment,
  totalDeposit: state.Bill.totalDeposit,
  totalAdvance: state.Bill.totalAdvance,
  totalRefund: state.Bill.totalRefund,
});

export default connect(mapStateToProps)(InvoiceFooter);
