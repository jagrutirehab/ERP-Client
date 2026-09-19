import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Label, Input, Button } from "reactstrap";
import { connect } from "react-redux";
import {
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";
import PaymentModeEvidence from "./PaymentModeEvidence";

const Payment = ({
  paymentModes,
  setPaymentModes,
  paymentAccounts,
  existingTransactionProof,
}) => {
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

  const addEvidenceFiles = (idx, newFiles) => {
    const newPaymentModes = [...paymentModes];
    const existingFiles = newPaymentModes[idx].evidenceFiles || [];
    newPaymentModes[idx] = {
      ...newPaymentModes[idx],
      evidenceFiles: [...existingFiles, ...newFiles],
    };
    setPaymentModes(newPaymentModes);
  };

  const removeEvidenceFile = (idx, fileIdx) => {
    const newPaymentModes = [...paymentModes];
    const existingFiles = newPaymentModes[idx].evidenceFiles || [];
    newPaymentModes[idx] = {
      ...newPaymentModes[idx],
      evidenceFiles: existingFiles.filter((_, i) => i !== fileIdx),
    };
    setPaymentModes(newPaymentModes);
  };

  return (
    <React.Fragment>
      <div>
        {(paymentModes || []).map((item, idx) => {
          return (
            <Col xs={12} key={idx} className="mb-3">
              <Row className="flex-wrap flex-sm-nowrap align-items-end g-3">
                <Col xs="auto">
                  <Label>
                    Amount
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    id={idx}
                    className="w-100"
                    style={{ maxWidth: "110px", minWidth: "70px" }}
                    size={"1"}
                    name="amount"
                    value={item.amount || ""}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
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
                </Col>
                {item.paymentMode === CARD && (
                  <Col xs="auto" className="card-number">
                    <Label className="invisible">Card Number</Label>
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
                      style={{ maxWidth: "110px", minWidth: "70px" }}
                      required
                    />
                  </Col>
                )}
                {item.paymentMode === CHEQUE && (
                  <>
                    <Col xs="auto" className="bank-name">
                      <Label className="invisible">Bank Name</Label>
                      <Input
                        id={idx}
                        bsSize="sm"
                        type="text"
                        name="bankName"
                        value={item.bankName || ""}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        style={{ maxWidth: "110px", minWidth: "70px" }}
                        required
                      />
                    </Col>
                    <Col xs="auto" className="cheque-no">
                      <Label className="invisible">Cheque No</Label>
                      <Input
                        id={idx}
                        bsSize="sm"
                        type="text"
                        name="chequeNumber"
                        value={item.chequeNumber || ""}
                        onChange={handleChange}
                        placeholder="Cheque No"
                        style={{ maxWidth: "110px", minWidth: "70px" }}
                        required
                      />
                    </Col>
                  </>
                )}

                {item.paymentMode === UPI && (
                  <Col xs="auto">
                    <Label>
                      Transaction Id
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={idx}
                      bsSize="sm"
                      size={"1"}
                      name="transactionId"
                      value={item.transactionId || ""}
                      onChange={handleChange}
                      type="text"
                      style={{ maxWidth: "110px", minWidth: "70px" }}
                      required
                    />
                  </Col>
                )}

                {item.paymentMode !== CASH && (
                  <Col xs="auto">
                    <Label>
                      Bank Accounts
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={idx}
                      bsSize="sm"
                      size={"1"}
                      name="bankAccount"
                      value={item.bankAccount || ""}
                      onChange={handleChange}
                      type="select"
                      style={{ maxWidth: "160px" }}
                      required
                    >
                      <option value={""} selected defaultValue={""}>
                        No Bank Account Selected
                      </option>
                      {(paymentAccounts || [])
                        .filter((acc) => {
                          const isCardOrUpi =
                            item.paymentMode === "CARD" ||
                            item.paymentMode === "UPI";
                          if (isCardOrUpi) {
                            // Show all accounts (including pinelabs)
                            return true;
                          } else {
                            // For BANK, CHEQUE, etc. — exclude pinelabs
                            return acc.name !== "pinelabs";
                          }
                        })
                        .map((acc) => (
                          <option key={acc._id} value={acc.name}>
                            {acc.name}
                          </option>
                        ))}
                    </Input>
                  </Col>
                )}

                {item.paymentMode !== CASH && (
                  <Col xs="auto" style={{ flex: "0 0 auto" }}>
                    <div className="d-flex align-items-center">
                      <PaymentModeEvidence
                        inputId={`depositPaymentEvidence-${idx}`}
                        files={item.evidenceFiles}
                        existingUrls={(existingTransactionProof || [])
                          .filter((proof) => proof.mode === item.paymentMode)
                          .map((proof) => proof.url)}
                        onAddFiles={(newFiles) =>
                          addEvidenceFiles(idx, newFiles)
                        }
                        onRemoveFile={(fileIdx) =>
                          removeEvidenceFile(idx, fileIdx)
                        }
                        labelClassName="w-100"
                      />
                    </div>
                  </Col>
                )}

                <Col xs="auto" style={{ flex: "0 0 auto" }}>
                  <Label className="invisible">Remove</Label>
                  <div className="d-flex align-items-center">
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
  existingTransactionProof: PropTypes.array,
};

const mapStateToProps = (state) => ({
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(Payment);
