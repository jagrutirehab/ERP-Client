import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Row, Col, Input } from "reactstrap";
import { connect } from "react-redux";
import {
  DRAFT_INVOICE,
  INVOICE,
  IPD,
  OPD,
  REFUND,
} from "../../../../Components/constants/patient";
import PaymentMode from "./paymentMode";
import RenderWhen from "../../../../Components/Common/RenderWhen";

const InvoiceFooter = (props) => {
  const isEdit = props.isEdit;
  console.log("isEdit from footer", isEdit);
  const isDraft = props.isDraft === "draft";
  console.log("Draffft", isDraft);

  console.log("props", props);
  const isLatest = props.isLatest;
  console.log("isLatest", isLatest);

  const itemDiscount = Number(props.itemDiscount) || 0;

  const remainingAmount =
    Number(props.totalCost || 0) - Number(itemDiscount || 0);

  const wDiscount =
    props.wholeDiscount.unit === "%"
      ? (parseFloat(props.wholeDiscount.value || 0) / 100) * remainingAmount
      : parseFloat(props.wholeDiscount.value || 0);

  let initialValue = null;
  if (props.validation.values.bill === DRAFT_INVOICE)
    initialValue =
      props.payable !== undefined && props.payable !== null
        ? props.payable
        : "";
  else if (props.type === IPD) {
    initialValue =
      props.validation.values.bill === INVOICE ? props.payable : props.refund;
  } else {
    initialValue =
      props.payable !== undefined && props.payable !== null
        ? props.payable
        : "";
  }

  const [amountInput, setAmountInput] = useState(String(initialValue || ""));
  const [error, setError] = useState("");

  useEffect(() => {
    if (props.validation?.values?.bill === REFUND) {
      const refundVal = String(props.refund || "");
      setAmountInput(refundVal);
      props.validation.setFieldValue("refund", refundVal);
    } else {
      const payableVal =
        props.payable !== undefined && props.payable !== null
          ? String(props.payable)
          : "";
      setAmountInput(payableVal);
      props.validation.setFieldValue("refund", payableVal);
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.validation?.values?.bill, props.refund, props.payable]);

  const handleAmountChange = (e) => {
    const val = e.target.value;

    if (val === "") {
      setAmountInput("");
      setError("");
      props.validation.setFieldValue("refund", "");
      return;
    }

    if (!/^\d{0,7}(\.\d{0,2})?$/.test(val)) return;

    const num = parseFloat(val);

    if (num > props.refund) {
      const refundStr = String(props.refund);
      setAmountInput(refundStr);
      props.validation.setFieldValue("refund", refundStr);
      setError("Amount exceeds refund limit");
    } else {
      setAmountInput(val);
      props.validation.setFieldValue("refund", val);
      setError("");
    }
  };

  console.log("props", props);
  console.log("itemDiscount", typeof itemDiscount);

  const safeWhole = Number(props.wholeDiscount?.value) || 0;
  const safeItemDiscount = Number(props.itemDiscount) || 0;

  const editDisplayValue = Math.max(0, safeWhole - safeItemDiscount);

  return (
    <React.Fragment>
      <Row className="d-flex justify-content-center mt-3 gap-4">
        <Col xs={6} lg={2} className="text-center">
          <div>
            <h6 className="text-muted d-flex justify-content-center align-items-center text-primary">
              <i className="ri-git-commit-line font-size-16"></i> TOTAL COST (₹)
            </h6>
            <p>{props.totalCost || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={2} className="text-center">
          <div className="ms-4">
            <h6
              style={{ whiteSpace: "nowrap" }}
              className="text-muted d-flex justify-content-center align-items-center text-primary pe-5 pe-lg-0"
            >
              <i className="ri-git-commit-line font-size-16"></i> ADDITIONAL
              DISCOUNT (₹)
            </h6>
            <p className="pe-5 pe-lg-0">{wDiscount?.toFixed(2) || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={2} className="text-center">
          <div className="ms-4">
            <h6
              style={{ whiteSpace: "nowrap" }}
              className="text-muted d-flex justify-content-center align-items-center text-primary pe-5 pe-lg-0"
            >
              <i className="ri-git-commit-line font-size-16"></i> ITEM DISCOUNT
              (₹)
            </h6>
            <p className="pe-5 pe-lg-0">{itemDiscount?.toFixed(2) || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={2} className="text-center">
          <div className="ms-0 ms-lg-4">
            <h6 className="text-muted d-flex justify-content-center align-items-center text-primary">
              <i className="ri-git-commit-line font-size-16"></i> TOTAL ADVANCE
              (₹)
            </h6>
            <p>{props.advance || "0.00"}</p>
          </div>
        </Col>
        <Col xs={6} lg={2} className="text-center">
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
        <Row className="align-items-start">
          <Col xs={12} lg={8}>
            <Row className="g-4">
              <Col xs={12} lg={3}>
                <div className="mt-4 mb-4 m-lg-0">
                  <h6 className="text-muted mt-2 mb-3 fs-10">
                    Additional Discount (₹)
                  </h6>
                  <div className="input-group" style={{ width: "150px" }}>
                    <Input
                      bsSize="sm"
                      size={1}
                      type="number"
                      name="wholeDiscount"
                      value={props.wholeDiscount?.value ?? ""}
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
                    {wDiscount > props.totalCost - itemDiscount ? (
                      <span className="text-danger font-size-10">
                        should be less than remaining cost
                      </span>
                    ) : (
                      <span>₹{wDiscount?.toFixed(2) || "0.00"}</span>
                    )}
                  </p>
                </div>
              </Col>

              <Col xs={12} lg={4}>
                <div className="mt-4 mb-4 m-lg-0">
                  <h6 className="text-muted mt-2 mb-3 fs-10">
                    Items Discount (₹)
                  </h6>

                  <div className="input-group" style={{ width: "150px" }}>
                    <Input
                      bsSize="sm"
                      type="number"
                      value={itemDiscount || ""}
                      disabled
                      style={{ height: "27px", width: "100%" }}
                      className="form-control bg-light"
                    />
                  </div>

                  <p className="mb-0 mt-1">
                    ₹{itemDiscount?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </Col>

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
            </Row>
          </Col>

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
                  // disabled={
                  //   props.totalAdvance < props.totalCost - props.totalDiscount
                  // }
                >
                  <option value={INVOICE}>Payable</option>
                  {isLatest !== false && (
                    <option value={REFUND}>Refund</option>
                  )}
                </Input>
              </div>
              {error && (
                <div className="text-danger font-size-12 mt-1">{error}</div>
              )}
              <Input
                bsSize="sm"
                type="text"
                value={amountInput}
                style={{ height: "30px" }}
                className="mt-2"
                onChange={handleAmountChange}
                disabled={
                  props.validation?.values?.bill !== REFUND ||
                  !props.refund ||
                  Number.isNaN(props.refund)
                }
              />
              {props.validation?.values?.bill === REFUND && (
                <div className="font-size-10 mt-1">
                  <span className="text-muted">
                    Refund limit: ₹{props.refund.toFixed(2)}
                  </span>
                </div>
              )}
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
