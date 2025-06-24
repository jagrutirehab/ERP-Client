import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Label, Input, Button } from "reactstrap";

//redux
import { connect, useDispatch } from "react-redux";
import {
  BANK,
  CARD,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";

const Payment = ({ paymentModes, setPaymentModes, paymentAccounts }) => {
  const dispatch = useDispatch();

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
        {(paymentModes || []).map((item, idx) => {
          return (
            <Col xs={12} key={idx}>
              <Row>
                <Col md={2}>
                  <div className="mb-3">
                    <Label>
                      Amount
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      bsSize="sm"
                      id={idx}
                      className="w-100"
                      size={"1"}
                      name="amount"
                      value={item.amount || ""}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }}}
                      onChange={(e) => {
                        const event = {
                          target: {
                            value: parseInt(e.target.value),
                            name: e.target.name,
                            id: e.target.id,
                          },
                        };
                        handleChange(event);
                      }}
                      type="number"
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </Col>
                {item.paymentMode === CARD && (
                  <Col md={2} className="padding-top-2 card-number">
                    <Input
                      id={idx}
                      bsSize="sm"
                      type="text"
                      name="cardNumber"
                      maxLength={4}
                      pattern={"[0-9]{4}"}
                      value={item.cardNumber || ""}
                      onChange={handleChange}
                      placeholder="Last 4 Digit"
                      required
                    />
                  </Col>
                )}
                {item.paymentMode === CHEQUE && (
                  <>
                    <Col md={2} className="padding-top-2 bank-name">
                      <Input
                        id={idx}
                        bsSize="sm"
                        type="text"
                        name="bankName"
                        value={item.bankName || ""}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        required
                      />
                    </Col>
                    <Col md={2} className="padding-top-2 cheque-no">
                      <Input
                        id={idx}
                        bsSize="sm"
                        type="text"
                        name="chequeNumber"
                        value={item.chequeNumber || ""}
                        onChange={handleChange}
                        placeholder="Cheque No"
                        required
                      />
                    </Col>
                  </>
                )}
                {item.paymentMode === BANK && (
                  <Col xs={12} md={4}>
                    <Label>Bank Accounts</Label>
                    <Input
                      id={idx}
                      bsSize="sm"
                      size={"1"}
                      name="bankAccount"
                      value={item.bankAccount || ""}
                      onChange={handleChange}
                      type="select"
                      required
                    >
                      <option>No Bank Account Selected</option>
                      {(paymentAccounts || []).map((item) => (
                        <option key={item._id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </Input>
                  </Col>
                )}

                {item.paymentMode === UPI && (
                  <Col xs={12} md={4}>
                    <Label>Transaction Id</Label>
                    <Input
                      id={idx}
                      bsSize="sm"
                      size={"1"}
                      name="transactionId"
                      value={item.transactionId || ""}
                      onChange={handleChange}
                      type="text"
                      required
                    />
                  </Col>
                )}

                <Col>
                  <div className="d-flex align-items-center h-100 pt-3">
                    <Button
                      onClick={() => deleteForm(idx)}
                      size="sm"
                      outline
                      color="danger"
                    >
                      <i className="ri-close-circle-line font-size-20"></i>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          );
        })}
      </div>
    </React.Fragment>
  );
};

Payment.propTypes = {
  paymentModes: PropTypes.array,
  setPaymentModes: PropTypes.func,
};

const mapStateToProps = (state) => ({
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(Payment);
