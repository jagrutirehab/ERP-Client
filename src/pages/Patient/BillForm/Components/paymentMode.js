import React from "react";
import { Col, Input, Label, Button, FormFeedback } from "reactstrap";
import {
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import PaymentModeEvidence from "./PaymentModeEvidence";

const PaymentMode = ({
  paymentModes,
  setPaymentModes,
  validation,
  paymentAccounts,
  existingTransactionProof,
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
        <div>
          <div>
            <div style={{ paddingBottom: "1rem" }}>
              <Label className="text-muted fs-10">
                Payment Mode <span className="text-danger">*</span>
              </Label>
              <Input
                className="w-50 pt-1 pb-1 fs-10"
                size={"1"}
                name="modeOfPayment"
                style={{ height: "31px" }}
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
            <div
              className="d-flex flex-wrap flex-sm-nowrap align-items-center mb-2 w-100"
              style={{ rowGap: "0.5rem" }}
              key={idx}
            >
              <Col xs="auto" className="me-2">
                <Label
                  className="text-muted fs-10"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Cash Amount
                  <span className="text-danger">*</span>
                </Label>
                <Input
                  bsSize="sm"
                  id={idx}
                  required
                  size={"1"}
                  name="amount"
                  style={{ maxWidth: "90px", minWidth: "60px" }}
                  value={val.amount || ""}
                  onChange={handleChange}
                  type="number"
                />
              </Col>

              {val?.type === CARD && (
                <Col xs="auto" className="me-2">
                  <Label className="text-muted fs-10" style={{ whiteSpace: "nowrap" }}>
                    Card Number
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    id={idx}
                    required
                    name="cardNumber"
                    style={{
                      height: "30px",
                      maxWidth: "90px",
                      minWidth: "60px",
                    }}
                    value={val.cardNumber || ""}
                    onChange={handleChange}
                    type="text"
                  />
                </Col>
              )}

              {val?.type === CHEQUE && (
                <>
                  <Col xs="auto" className="me-2">
                    <Label className="text-muted fs-10" style={{ whiteSpace: "nowrap" }}>
                      Bank Name
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      bsSize="sm"
                      id={idx}
                      required
                      name="bankName"
                      style={{
                        height: "30px",
                        maxWidth: "90px",
                        minWidth: "60px",
                      }}
                      value={val.bankName || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </Col>

                  <Col xs="auto" className="me-2">
                    <Label className="text-muted fs-10" style={{ whiteSpace: "nowrap" }}>
                      Cheque Number
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      bsSize="sm"
                      id={idx}
                      required
                      name="chequeNumber"
                      style={{
                        height: "30px",
                        maxWidth: "90px",
                        minWidth: "60px",
                      }}
                      value={val.chequeNumber || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </Col>
                </>
              )}

              {val?.type === UPI && (
                <Col xs="auto" className="me-2">
                  <Label className="text-muted fs-10" style={{ whiteSpace: "nowrap" }}>
                    Transaction id
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    bsSize="sm"
                    id={idx}
                    required
                    name="transactionId"
                    style={{
                      height: "30px",
                      maxWidth: "90px",
                      minWidth: "60px",
                    }}
                    value={val.transactionId || ""}
                    onChange={handleChange}
                    type="text"
                  />
                </Col>
              )}

              {val.type !== CASH && (
                <Col xs="auto" className="me-2">
                  <Label
                    className="text-muted fs-10"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Bank Accounts
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id={idx}
                    bsSize="sm"
                    size={"1"}
                    name="bankAccount"
                    value={val.bankAccount || ""}
                    onChange={handleChange}
                    type="select"
                    style={{ maxWidth: "130px" }}
                    required
                  >
                    <option value={""} selected defaultValue={""}>
                      No Bank Account Selected
                    </option>
                    {(paymentAccounts || []).map((item) => (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </Col>
              )}

              {val.type !== CASH && (
                <Col xs="auto" className="me-2">
                  <div className="d-flex align-items-center h-100">
                    <PaymentModeEvidence
                      inputId={`invoicePaymentEvidence-${idx}`}
                      files={val.evidenceFiles}
                      existingUrls={(existingTransactionProof || [])
                        .filter((proof) => proof.mode === val.type)
                        .map((proof) => proof.url)}
                      onAddFiles={(newFiles) => addEvidenceFiles(idx, newFiles)}
                      onRemoveFile={(fileIdx) => removeEvidenceFile(idx, fileIdx)}
                      labelClassName="text-muted fs-10"
                    />
                  </div>
                </Col>
              )}

              <Col xs="auto">
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

PaymentMode.propTypes = {
  paymentModes: PropTypes.array,
  setPaymentModes: PropTypes.func,
  existingTransactionProof: PropTypes.array,
};

const mapStateToProps = (state) => ({
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(PaymentMode);
