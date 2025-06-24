import React from "react";
import { div, Col, Input, Label, Button, FormFeedback } from "reactstrap";
import {
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";

const PaymentMode = ({
  paymentModes,
  setPaymentModes,
  payable,
  validation,
}) => {
  const addPaymentMode = (e) => {
    const value = e.target.value;
    const isIncluded = paymentModes.find((mode) => mode.type === value);

    if (isIncluded) return;

    const newPaymentModes = [
      ...paymentModes,
      {
        amount: 0,
        type: value,
      },
    ];
    setPaymentModes(newPaymentModes);
  };

  const handleChange = (e) => {
    const idx = e.target.id;
    const prop = e.target.name;
    const value = e.target.value;

    const newPaymentModes = [...paymentModes];
    newPaymentModes[idx] = { ...newPaymentModes[idx], [prop]: value };
    setPaymentModes(newPaymentModes);
  };

  const deleteForm = (idx) => {
    const newPaymentModes = [...paymentModes];
    newPaymentModes.splice(idx, 1);
    setPaymentModes(newPaymentModes);
  };

  return (
    <React.Fragment>
      <div>
        <div>
          <div>
            <div style={{ paddingBottom: "1rem" }}>
              <Label className="text-muted fs-10">
                Payment Mode <span className="text-danger">*</span>
              </Label>
              <Input
                // bsSize="sm"
                className="w-50 pt-1 pb-1 fs-10"
                size={"1"}
                name="modeOfPayment"
                style={{ height: "31px" }}
                // value={paymentModes?.type || ""}
                onChange={addPaymentMode}
                type="select"
              >
                <option style={{ display: "none" }} selected value=""></option>
                <option value={CASH}>Cash</option>
                <option value={CARD}>Card</option>
                <option value={CHEQUE}>Cheque</option>
                <option value={UPI}>UPI</option>
              </Input>
            </div>
          </div>
          {(paymentModes || []).map((val, idx) => (
            <div className="d-flex align-items-end mb-2 w-100" key={idx}>
              <div className="me-2" style={{ width: "100px" }}>
                <Label className="text-muted fs-10">
                  Cash Amount
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  bsSize="sm"
                  id={idx}
                  className="w-100"
                  required
                  size={"1"}
                  name="amount"
                  style={{ width: "50px" }}
                  value={val.amount || ""}
                  onChange={handleChange}
                  type="number"
                />
              </div>

              {val?.type === CARD && (
                <Col className="me-2" md={4} lg={4}>
                  <div className="">
                    <Label className="text-muted fs-10">Card Number</Label>
                    <Input
                      bsSize="sm"
                      className="w-100 fs-10"
                      id={idx}
                      required
                      name="cardNumber"
                      style={{ height: "30px" }}
                      value={val.cardNumber || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </div>
                </Col>
              )}

              {val?.type === CHEQUE && (
                <>
                  <Col className="me-2" md={4} lg={4}>
                    <div>
                      <Label className="text-muted fs-10">Bank Name</Label>
                      <Input
                        bsSize="sm"
                        className="w-100 fs-10"
                        id={idx}
                        required
                        name="bankName"
                        style={{ height: "30px" }}
                        value={val.bankName || ""}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>
                  </Col>

                  <Col className="me-2" md={4} lg={4}>
                    <div>
                      <Label className="text-muted fs-10">Cheque Number</Label>
                      <Input
                        bsSize="sm"
                        className="w-100 fs-10"
                        id={idx}
                        required
                        name="chequeNumber"
                        style={{ height: "30px" }}
                        value={val.chequeNumber || ""}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>
                  </Col>
                </>
              )}

              {val?.type === UPI && (
                <Col className="me-2" md={4} lg={4}>
                  <div>
                    <Label className="text-muted fs-10">Transaction id</Label>
                    <Input
                      bsSize="sm"
                      className="w-100 fs-10"
                      id={idx}
                      required
                      name="transactionId"
                      style={{ height: "30px" }}
                      value={val.transactionId || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </div>
                </Col>
              )}

              <Col>
                <div className="d-flex align-items-center h-100">
                  <Button
                    onClick={() => deleteForm(idx)}
                    size="sm"
                    outline
                    color="danger"
                    className="p-1 py-0"
                  >
                    <i className="ri-close-circle-line fs-9"></i>
                  </Button>
                </div>
              </Col>
            </div>
          ))}
          {validation.touched.paymentModes && validation.errors.paymentModes ? (
            <FormFeedback type="invalid" className="d-block">
              {validation.errors.paymentModes}
            </FormFeedback>
          ) : null}
        </div>
      </div>
    </React.Fragment>
  );
};

export default PaymentMode;
