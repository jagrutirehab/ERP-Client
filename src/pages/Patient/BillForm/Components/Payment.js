import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Label, Input, Button, Badge } from "reactstrap";
import { connect } from "react-redux";
import {
  BANK,
  CARD,
  CASH,
  CHEQUE,
  UPI,
} from "../../../../Components/constants/patient";
import PaymentModeEvidence from "./PaymentModeEvidence";
import PosPaymentModal from "./PosPaymentModal";
import { getPosTerminal } from "../../../../helpers/backend_helper";
import { needsEvidence } from "./billGuards";

// Tenders a Pine Labs terminal can collect.
const POS_MODES = [CARD, UPI];

// Pine Labs refuses anything under ₹1, and their certification requires the
// billing application to stop it rather than let the terminal reject it.
const POS_MIN_AMOUNT = 1;

// Pine Labs returns the PAN masked (e.g. "4111XXXXXXXX1111"); the bill only
// keeps the last four.
const lastFourDigits = (maskedCard) => {
  const digits = String(maskedCard || "").replace(/\D/g, "");
  return digits.slice(-4);
};

// Money taken on a terminal settles into the Pine Labs account, never the
// centre's own bank. Pick that account automatically so the cashier cannot
// file a POS payment against the wrong ledger.
const findPineLabsAccount = (paymentAccounts) =>
  (paymentAccounts || []).find((acc) =>
    String(acc.name || "").toLowerCase().includes("pinelab"),
  );

const Payment = ({
  paymentModes,
  setPaymentModes,
  paymentAccounts,
  existingTransactionProof,
  posContext,
  readOnly,
}) => {
  // Which row, if any, currently has the terminal modal open.
  const [posRowIdx, setPosRowIdx] = useState(null);
  const [posTerminal, setPosTerminal] = useState(null);

  const centerId = posContext?.center;

  useEffect(() => {
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
        // A centre without a terminal is normal — fall back to manual entry
        // rather than blocking the form. Keep the reason though: without it
        // the button simply never appears and nobody can tell why.
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
  // Feature switched on for this centre. Card and UPI then settle to Pine
  // Labs whether or not a machine is usable, so this — not `available` — is
  // what decides the bank account.
  const posEnabled = !!posTerminal?.enabled;
  // Only worth explaining on a form that asked for POS in the first place.
  const posUnavailableReason =
    posContext && posTerminal && !posAvailable ? posTerminal.reason : null;

  const pineLabsAccount = findPineLabsAccount(paymentAccounts);
  // A centre with POS on but no Pine Labs ledger account is misconfigured —
  // say so rather than silently leaving the cashier to guess.
  const missingPineLabsAccount =
    posEnabled && !pineLabsAccount && (paymentAccounts || []).length > 0;

  // Default card and UPI rows to the Pine Labs account where the centre has
  // POS switched on, since that is where terminal money settles. Only fills a
  // row that has no account yet — re-applying it would fight the cashier
  // every time they deliberately picked something else.
  useEffect(() => {
    if (!posEnabled || !pineLabsAccount) return;

    const needsDefault = (paymentModes || []).some(
      (mode) => POS_MODES.includes(mode.paymentMode) && !mode.bankAccount,
    );
    if (!needsDefault) return;

    setPaymentModes(
      (paymentModes || []).map((mode) =>
        POS_MODES.includes(mode.paymentMode) && !mode.bankAccount
          ? { ...mode, bankAccount: pineLabsAccount.name }
          : mode,
      ),
    );
  }, [posEnabled, pineLabsAccount, paymentModes, setPaymentModes]);

  // Fold the terminal's own response into the row, then lock those fields so
  // the receipt can only quote what Pine Labs actually returned.
  const applyPosApproval = (idx, posTransaction) => {
    const result = posTransaction.result || {};
    const newPaymentModes = [...paymentModes];
    newPaymentModes[idx] = {
      ...newPaymentModes[idx],
      amount: posTransaction.amount,
      baseAmount: posTransaction.baseAmount || posTransaction.amount,
      surchargeAmount: posTransaction.surchargeAmount || 0,
      surchargePercent: posTransaction.surchargePercent || 0,
      totalCharged: posTransaction.amount,
      // For a card this is the RRN; for UPI the same field carries the UTR,
      // which is what the customer's bank statement shows.
      transactionId: result.rrn || result.transactionId || "",
      cardNumber:
        lastFourDigits(result.cardNumber) ||
        newPaymentModes[idx].cardNumber ||
        "",
      // Keep whatever the cashier chose; only fall back to the Pine Labs
      // account if the row still has none.
      bankAccount:
        newPaymentModes[idx].bankAccount || pineLabsAccount?.name || "",
      posTransaction: posTransaction._id,
      posApprovalCode: result.approvalCode,
      posReferenceId: posTransaction.plutusTransactionReferenceId,
      posPayerVpa: result.upiPayerVpa,
    };
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
        {posUnavailableReason && (
          <div className="text-muted fs-11 mb-2">
            <i className="ri-information-line me-1"></i>
            Charge on POS unavailable: {posUnavailableReason}
          </div>
        )}
        {missingPineLabsAccount && (
          <div className="text-danger fs-11 mb-2">
            <i className="ri-error-warning-line me-1"></i>
            Pine Labs POS is on for this centre but there is no{" "}
            <strong>pinelabs</strong> payment account. Add one under Setting →
            Billing so card and UPI settle to the right ledger.
          </div>
        )}
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
                    disabled={readOnly || !!item.posTransaction}
                  />
                  {item.surchargeAmount > 0 && (
                    <div className="text-warning fs-11 mt-1" title="Includes credit card surcharge">
                      +{item.surchargeAmount} surcharge
                    </div>
                  )}
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
                      // Filled from the terminal response — not editable.
                      disabled={readOnly || !!item.posTransaction}
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
                      // Filled with the terminal RRN / UTR — not editable.
                      disabled={readOnly || !!item.posTransaction}
                    />
                    {item.posPayerVpa && (
                      <div
                        className="text-muted fs-11 mt-1 text-truncate"
                        style={{ maxWidth: "140px" }}
                        title={item.posPayerVpa}
                      >
                        {item.posPayerVpa}
                      </div>
                    )}
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
                      // Sent with the charge, so it is fixed once the terminal
                      // approves — a later change would not reach a recovery.
                      disabled={readOnly || !!item.posTransaction}
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
                        required={needsEvidence(
                          item,
                          "paymentMode",
                          existingTransactionProof,
                        )}
                      />
                    </div>
                  </Col>
                )}

                {!readOnly && posAvailable && POS_MODES.includes(item.paymentMode) && (
                  <Col xs="auto" style={{ flex: "0 0 auto" }}>
                    <Label className="invisible">POS</Label>
                    <div className="d-flex align-items-center gap-2">
                      {item.posTransaction ? (
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
                          disabled={!(Number(item.amount) >= POS_MIN_AMOUNT)}
                          title={
                            Number(item.amount) >= POS_MIN_AMOUNT
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
                <Col xs="auto" style={{ flex: "0 0 auto" }}>
                  <Label className="invisible">Remove</Label>
                  <div className="d-flex align-items-center">
                    <Button
                      onClick={() => deleteForm(idx)}
                      size="sm"
                      outline
                      color="danger"
                      // Removing a row the terminal already charged would
                      // leave that money off the bill.
                      disabled={!!item.posTransaction}
                      title={
                        item.posTransaction
                          ? "Paid on POS — this row cannot be removed"
                          : undefined
                      }
                    >
                      <i className="ri-close-circle-line font-size-20"></i>
                    </Button>
                  </div>
                </Col>
                )}
              </Row>
            </Col>
          );
        })}
      </div>

      {posRowIdx !== null && paymentModes[posRowIdx] && (
        <PosPaymentModal
          isOpen
          toggle={() => setPosRowIdx(null)}
          amount={Number(paymentModes[posRowIdx].amount)}
          paymentMode={paymentModes[posRowIdx].paymentMode}
          bankAccount={paymentModes[posRowIdx].bankAccount}
          context={posContext}
          terminals={posTerminal?.terminals}
          defaultTerminalId={posTerminal?.defaultTerminalId}
          surchargePercent={posTerminal?.creditCardSurchargePercent}
          onApproved={(posTransaction) =>
            applyPosApproval(posRowIdx, posTransaction)
          }
        />
      )}
    </React.Fragment>
  );
};

Payment.propTypes = {
  paymentModes: PropTypes.array,
  setPaymentModes: PropTypes.func,
  existingTransactionProof: PropTypes.array,
  // Locks every row. Used when the form was opened to bill a POS payment
  // that already happened — the tender must match the terminal exactly.
  readOnly: PropTypes.bool,
  // Supply to enable "Charge on POS" on card/UPI rows. Omitted by forms that
  // only record payments collected elsewhere.
  posContext: PropTypes.shape({
    center: PropTypes.string,
    patient: PropTypes.string,
    addmission: PropTypes.string,
    purpose: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  paymentAccounts: state.Setting.paymentAccounts,
});

export default connect(mapStateToProps)(Payment);
