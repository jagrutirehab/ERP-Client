import React from "react";
import { Col, Input, Label, Button, FormFeedback, Badge } from "reactstrap";
import {
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import PaymentModeEvidence from "./PaymentModeEvidence";
import PosPaymentModal from "./PosPaymentModal";
import { getPosTerminal } from "../../../../helpers/backend_helper";
import { needsEvidence } from "./billGuards";

// Tenders a Pine Labs terminal can collect. These rows key the tender on
// `type`, unlike the deposit / advance-payment rows which use `paymentMode`.
const POS_MODES = [CARD, UPI];

// Pine Labs refuses anything under 1 rupee.
const POS_MIN_AMOUNT = 1;

const lastFourDigits = (maskedCard) =>
  String(maskedCard || "").replace(/\D/g, "").slice(-4);

// Terminal money settles into the Pine Labs account, never the centre's own.
const findPineLabsAccount = (paymentAccounts) =>
  (paymentAccounts || []).find((acc) =>
    String(acc.name || "").toLowerCase().includes("pinelab"),
  );

const PaymentMode = ({
  paymentModes,
  setPaymentModes,
  validation,
  paymentAccounts,
  existingTransactionProof,
  posContext,
  readOnly,
  chargeBlockedReason,
  payable,
}) => {
  const [posRowIdx, setPosRowIdx] = React.useState(null);
  const [posTerminal, setPosTerminal] = React.useState(null);

  const centerId = posContext?.center;

  React.useEffect(() => {
    if (!centerId) {
      setPosTerminal(null);
      return;
    }
    let cancelled = false;
    getPosTerminal(centerId)
      .then((response) => {
        if (!cancelled) setPosTerminal(response.payload);
      })
      .catch((err) => {
        if (!cancelled)
          setPosTerminal({
            available: false,
            reason:
              err?.message ||
              "Could not reach the POS service. Is the server running the latest build?",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [centerId]);

  const posAvailable = !!posTerminal?.available;
  const posEnabled = !!posTerminal?.enabled;
  const posUnavailableReason =
    posContext && posTerminal && !posAvailable ? posTerminal.reason : null;

  // Check whether the total tendered amount matches the payable amount.
  // When it doesn't, "Charge on POS" must be blocked so the terminal never
  // collects an amount that the bill cannot reconcile.
  const tenderedTotal = (paymentModes || []).reduce(
    (sum, mode) => sum + (Number(mode.amount) || 0),
    0,
  );
  const payableNum = Number(payable) || 0;
  const amountMismatch =
    payableNum > 0 && tenderedTotal !== payableNum;
  const mismatchReason = amountMismatch
    ? `Payment total (₹${tenderedTotal}) must equal Payable (₹${payableNum})`
    : null;

  const pineLabsAccount = findPineLabsAccount(paymentAccounts);

  // Default card and UPI rows to the Pine Labs account where the centre has
  // POS on. Only fills a row that has none yet, so a deliberate choice sticks.
  React.useEffect(() => {
    if (!posEnabled || !pineLabsAccount) return;
    const needsDefault = (paymentModes || []).some(
      (mode) => POS_MODES.includes(mode.type) && !mode.bankAccount,
    );
    if (!needsDefault) return;
    setPaymentModes(
      (paymentModes || []).map((mode) =>
        POS_MODES.includes(mode.type) && !mode.bankAccount
          ? { ...mode, bankAccount: pineLabsAccount.name }
          : mode,
      ),
    );
  }, [posEnabled, pineLabsAccount, paymentModes, setPaymentModes]);

  // Fold the terminal's own response into the row and lock those fields.
  const applyPosApproval = (idx, posTransaction) => {
    const result = posTransaction.result || {};
    const next = [...paymentModes];
    next[idx] = {
      ...next[idx],
      amount: posTransaction.amount,
      transactionId: result.rrn || result.transactionId || "",
      cardNumber: lastFourDigits(result.cardNumber) || next[idx].cardNumber || "",
      bankAccount: next[idx].bankAccount || pineLabsAccount?.name || "",
      posTransaction: posTransaction._id,
      posApprovalCode: result.approvalCode,
      posReferenceId: posTransaction.plutusTransactionReferenceId,
      posPayerVpa: result.upiPayerVpa,
    };
    setPaymentModes(next);
  };

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
          {posUnavailableReason && (
            <div className="text-muted fs-11 mb-2">
              <i className="ri-information-line me-1"></i>
              Charge on POS unavailable: {posUnavailableReason}
            </div>
          )}
          <div>
            <div
              style={{ paddingBottom: "1rem" }}
              className={readOnly ? "d-none" : ""}
            >
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
                  disabled={readOnly}
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
                    // Filled from the terminal response — not editable.
                    disabled={readOnly || !!val.posTransaction}
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
                    // Filled with the terminal RRN / UTR — not editable.
                    disabled={readOnly || !!val.posTransaction}
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
                    // Sent with the charge, so it is fixed once the terminal
                    // approves — a later change would not reach a recovery.
                    disabled={readOnly || !!val.posTransaction}
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
                      required={needsEvidence(
                        val,
                        "type",
                        existingTransactionProof,
                      )}
                    />
                  </div>
                </Col>
              )}

              {!readOnly && posAvailable && POS_MODES.includes(val.type) && (
                <Col xs="auto" className="me-2">
                  <div className="d-flex align-items-center h-100 gap-2">
                    {val.posTransaction ? (
                      // No detach: the money is taken, so the row must be
                      // saved as it stands.
                      <Badge color="success" className="fs-11">
                        <i className="ri-bank-card-line me-1"></i>
                        Paid on POS
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        outline
                        color="primary"
                        type="button"
                        className="text-nowrap"
                        // Blocked while the tender exceeds what is owed —
                        // money must not reach the terminal that the bill
                        // could never be saved against.
                        disabled={
                          !!chargeBlockedReason ||
                          !!mismatchReason ||
                          !(Number(val.amount) >= POS_MIN_AMOUNT)
                        }
                        title={
                          chargeBlockedReason
                            ? chargeBlockedReason
                            : mismatchReason
                              ? mismatchReason
                              : Number(val.amount) >= POS_MIN_AMOUNT
                                ? "Send this amount to the POS terminal"
                                : `POS payments must be at least ₹${POS_MIN_AMOUNT}`
                        }
                        onClick={() => setPosRowIdx(idx)}
                      >
                        <i className="ri-bank-card-line me-1"></i>
                        Charge on POS
                      </Button>
                    )}
                  </div>
                </Col>
              )}

              {!readOnly && (
              <Col xs="auto">
                <div className="d-flex align-items-center h-100">
                  <Button
                    onClick={() => deleteForm(idx)}
                    size="sm"
                    outline
                    color="danger"
                    className="p-1 py-0"
                    // Removing a row the terminal already charged would
                    // leave that money off the bill.
                    disabled={!!val.posTransaction}
                    title={
                      val.posTransaction
                        ? "Paid on POS — this row cannot be removed"
                        : undefined
                    }
                  >
                    <i className="ri-close-circle-line fs-9"></i>
                  </Button>
                </div>
              </Col>
              )}
            </div>
          ))}
          {amountMismatch && (
            <div className="text-danger fs-11 mt-1">
              <i className="ri-error-warning-line me-1"></i>
              {mismatchReason}
            </div>
          )}
          {validation.touched.paymentModes && validation.errors.paymentModes ? (
            <FormFeedback type="invalid" className="d-block">
              {validation.errors.paymentModes}
            </FormFeedback>
          ) : null}
        </div>
      </div>

      {posRowIdx !== null && paymentModes[posRowIdx] && (
        <PosPaymentModal
          isOpen
          toggle={() => setPosRowIdx(null)}
          amount={Number(paymentModes[posRowIdx].amount)}
          paymentMode={paymentModes[posRowIdx].type}
          bankAccount={paymentModes[posRowIdx].bankAccount}
          context={posContext}
          terminals={posTerminal?.terminals}
          defaultTerminalId={posTerminal?.defaultTerminalId}
          onApproved={(posTransaction) =>
            applyPosApproval(posRowIdx, posTransaction)
          }
        />
      )}
    </React.Fragment>
  );
};

PaymentMode.propTypes = {
  paymentModes: PropTypes.array,
  setPaymentModes: PropTypes.func,
  existingTransactionProof: PropTypes.array,
  // Locks every row — used when billing a charge that already happened.
  readOnly: PropTypes.bool,
  // Set to stop a charge being sent at all, with the reason shown on hover.
  chargeBlockedReason: PropTypes.string,
  // Total payable amount — "Charge on POS" is disabled when the tendered
  // amount doesn't equal this value.
  payable: PropTypes.number,
  // Supply to enable "Charge on POS" on card/UPI rows.
  posContext: PropTypes.shape({
    center: PropTypes.string,
    patient: PropTypes.string,
    addmission: PropTypes.string,
    purpose: PropTypes.string,
    billType: PropTypes.string,
    paymentAgainstBillNo: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(PaymentMode);
