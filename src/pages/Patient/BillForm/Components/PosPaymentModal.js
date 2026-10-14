import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";

import {
  getPosStatus,
  postPosCancel,
  postPosInitiate,
} from "../../../../helpers/backend_helper";

// How often to ask the server for the terminal outcome. The server is the only
// party that talks to Pine Labs; this just keeps the cashier's screen current.
const POLL_INTERVAL_MS = 3000;

// Remembering the counter a cashier last used saves them re-picking it all
// day. Scoped per centre so a shared login at two sites doesn't cross over.
const lastTerminalKey = (centerId) => `posLastTerminal:${centerId}`;

const readLastTerminal = (centerId) => {
  try {
    return window.localStorage.getItem(lastTerminalKey(centerId));
  } catch {
    return null;
  }
};

const rememberTerminal = (centerId, terminalId) => {
  try {
    window.localStorage.setItem(lastTerminalKey(centerId), terminalId);
  } catch {
    // Private browsing / blocked storage — the picker just won't pre-fill.
  }
};

const STATUS_COPY = {
  PENDING: {
    color: "info",
    title: "Reaching the terminal",
    detail: "Waiting for Pine Labs to accept the charge.",
  },
  UNKNOWN: {
    color: "danger",
    title: "Outcome unknown — do not re-charge yet",
    detail:
      "We could not confirm this with Pine Labs. The customer may have been charged. Check the Pine Labs dashboard before trying again.",
  },
  INITIATED: {
    color: "info",
    title: "Waiting for the terminal",
    detail:
      "Enter the reference below on the POS machine, then hand it to the patient.",
  },
  APPROVED: {
    color: "success",
    title: "Payment approved",
    detail: "The tender details have been filled in for you.",
  },
  FAILED: {
    color: "danger",
    title: "Payment declined",
    detail: "Nothing was charged. You can try again or collect another way.",
  },
  CANCELLED: {
    color: "warning",
    title: "Payment cancelled",
    detail: "The charge was withdrawn from the terminal.",
  },
  TIMEOUT: {
    color: "warning",
    title: "Payment timed out",
    detail:
      "The terminal did not complete in time. Check the machine before retrying.",
  },
};

/**
 * Drives one card/UPI charge on the centre's Pine Labs terminal.
 *
 * The bill is never written from here — on approval the caller receives the
 * POS transaction and folds its verified RRN / approval code into the payment
 * row, and the bill is saved as usual when the cashier submits the form.
 */
const PosPaymentModal = ({
  isOpen,
  toggle,
  amount,
  paymentMode,
  bankAccount,
  context,
  terminals,
  defaultTerminalId,
  surchargePercent: surchargePercentProp,
  onApproved,
}) => {
  const [posTransaction, setPosTransaction] = useState(null);
  const [error, setError] = useState(null);
  // Guidance rather than failure — e.g. the terminal already has the charge.
  const [notice, setNotice] = useState(null);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Re-renders once a second so the waiting state shows progress. A bare
  // spinner gives no clue whether the charge is seconds old or about to be
  // auto-cancelled, which reads as "stuck".
  const [now, setNow] = useState(() => Date.now());

  const machines = terminals || [];
  const [cardType, setCardType] = useState("CREDIT");
  const hasCardChoice =
    paymentMode === "CARD" && (surchargePercentProp || 0) > 0;
  // With several machines or a card choice, the cashier confirms before anything
  // is sent.
  const mustChoose = machines.length > 1 || hasCardChoice;

  const [terminalId, setTerminalId] = useState(
    () =>
      readLastTerminal(context.center) ||
      defaultTerminalId ||
      machines[0]?.terminalId ||
      "",
  );

  // Guards against React 18 double-invoking the start effect, and against a
  // poll landing after the modal has closed.
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const start = useCallback(
    async (chosenTerminalId) => {
      setStarting(true);
      setError(null);
      try {
        const response = await postPosInitiate({
          center: context.center,
          patient: context.patient,
          addmission: context.addmission,
          purpose: context.purpose || "DEPOSIT",
          // Remembered on the charge so a payment that never got billed
          // reopens the right form, against the right invoice.
          billType: context.billType,
          paymentAgainstBillNo: context.paymentAgainstBillNo,
          // The account the cashier picked, so a recovered charge is filed
          // against it rather than the Pine Labs default.
          bankAccount: bankAccount || undefined,
          appointment: context.appointment,
          invoiceSnapshot: context.invoiceSnapshot,
          amount,
          paymentMode,
          cardType: paymentMode === "CARD" ? cardType : undefined,
          terminalId: chosenTerminalId || undefined,
        });
        if (!mountedRef.current) return;
        setPosTransaction(response.payload);
        if (chosenTerminalId) rememberTerminal(context.center, chosenTerminalId);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err?.message || "Could not reach the POS terminal.");
      } finally {
        if (mountedRef.current) setStarting(false);
      }
    },
    [amount, paymentMode, cardType, bankAccount, context],
  );

  // Kick off the charge once per open — unless the cashier still has a counter
  // to pick.
  useEffect(() => {
    if (!isOpen || startedRef.current || mustChoose) return;
    startedRef.current = true;
    start(terminalId);
  }, [isOpen, mustChoose, start, terminalId]);

  // Keep the picker in step if the terminal list arrives after the first render.
  useEffect(() => {
    if (terminalId || !machines.length) return;
    setTerminalId(defaultTerminalId || machines[0].terminalId);
  }, [terminalId, machines, defaultTerminalId]);

  // Reset when the modal closes so the next open starts a fresh charge.
  useEffect(() => {
    if (isOpen) return;
    startedRef.current = false;
    stopPolling();
    setPosTransaction(null);
    setError(null);
    setNotice(null);
    setCancelling(false);
  }, [isOpen, stopPolling]);

  useEffect(
    () => () => {
      mountedRef.current = false;
      stopPolling();
    },
    [stopPolling],
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [isOpen]);

  // Poll while the charge is live.
  useEffect(() => {
    const id = posTransaction?._id;
    if (!id || posTransaction.settled) {
      stopPolling();
      return undefined;
    }

    const tick = async () => {
      try {
        const response = await getPosStatus(id);
        if (!mountedRef.current) return;
        setPosTransaction(response.payload);
      } catch (err) {
        // A single failed poll is usually a blip; keep the interval alive and
        // surface the message rather than abandoning a live transaction.
        if (mountedRef.current)
          setError(err?.message || "Could not read the payment status.");
      }
    };

    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return stopPolling;
  }, [posTransaction, stopPolling]);

  // Hand an approved charge back to the form exactly once.
  const approvedRef = useRef(false);
  useEffect(() => {
    if (posTransaction?.status !== "APPROVED" || approvedRef.current) return;
    approvedRef.current = true;
    onApproved(posTransaction);
  }, [posTransaction, onApproved]);

  useEffect(() => {
    if (!isOpen) approvedRef.current = false;
  }, [isOpen]);

  const cancel = async () => {
    if (!posTransaction?._id) {
      toggle();
      return;
    }
    setCancelling(true);
    setError(null);
    setNotice(null);
    try {
      const response = await postPosCancel(posTransaction._id);
      if (!mountedRef.current) return;
      setPosTransaction(response.payload);
      // A refused cancel is normal once the terminal has the charge. It is
      // not an error the cashier can fix here, so it reads as guidance and
      // polling carries on underneath.
      if (response.cancelled === false && response.message)
        setNotice(response.message);
    } catch (err) {
      if (mountedRef.current)
        setError(err?.message || "Could not cancel the payment.");
    } finally {
      if (mountedRef.current) setCancelling(false);
    }
  };

  const retry = () => {
    setPosTransaction(null);
    setError(null);
    approvedRef.current = false;
    // With several counters, go back to the picker rather than assuming the
    // retry belongs on the same machine.
    if (mustChoose) startedRef.current = false;
    else start(terminalId);
  };

  const status = posTransaction?.status;
  const settled = !!posTransaction?.settled;
  const pending = !!posTransaction && !settled;
  const copy = STATUS_COPY[status];
  // The terminal owns the charge now. Nothing more can be done from here, so
  // stop holding the cashier in the modal — the reconciler settles it whether
  // this window is open or not.
  const cancelRefused = !!notice && pending;
  const locked = pending && !cancelRefused;
  // The cashier still has a counter to confirm before anything is sent.
  const awaitingChoice = mustChoose && !posTransaction && !starting;

  const waitedSeconds = posTransaction?.createdAt
    ? Math.max(0, Math.floor((now - new Date(posTransaction.createdAt)) / 1000))
    : 0;
  const expiresInSeconds = posTransaction?.expiresAt
    ? Math.max(0, Math.floor((new Date(posTransaction.expiresAt) - now) / 1000))
    : null;
  const mmss = (total) =>
    `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

  return (
    <Modal
      isOpen={isOpen}
      // Don't let a stray backdrop click walk away from a live charge.
      backdrop={locked ? "static" : true}
      keyboard={!locked}
      toggle={locked ? undefined : toggle}
      centered
    >
      <ModalHeader toggle={locked ? undefined : toggle}>
        Charge on POS terminal
      </ModalHeader>

      <ModalBody>
        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <span className="text-muted">Amount</span>
          <span className="fs-4 fw-semibold">
            {posTransaction && posTransaction.surchargeAmount > 0
              ? `₹${posTransaction.amount}`
              : (paymentMode === "CARD" && cardType === "CREDIT" && (surchargePercentProp || 0) > 0 && !posTransaction
                  ? `₹${Math.round((amount + (amount * (surchargePercentProp || 0)) / 100) * 100) / 100}`
                  : `₹${amount}`)}
          </span>
        </div>
        {/* Surcharge breakdown: show preview before charge or actual after */}
        {(() => {
          const hasSurcharge = posTransaction
            ? posTransaction.surchargeAmount > 0
            : paymentMode === "CARD" && cardType === "CREDIT" && (surchargePercentProp || 0) > 0;
          if (!hasSurcharge) return null;
          const base = posTransaction ? posTransaction.baseAmount : amount;
          const rawPct = posTransaction
            ? posTransaction.surchargePercent
            : surchargePercentProp;
          const pct = parseFloat(Number(rawPct || 0).toFixed(2));
          const sc = posTransaction
            ? posTransaction.surchargeAmount
            : Math.round(amount * (surchargePercentProp || 0)) / 100;
          return (
            <div className="bg-warning bg-opacity-10 border border-warning rounded p-2 mb-3 fs-12">
              <div className="d-flex justify-content-between">
                <span>Base amount</span>
                <span>₹{base}</span>
              </div>
              <div className="d-flex justify-content-between text-warning">
                <span>Credit card surcharge ({pct}%)</span>
                <span>+ ₹{sc}</span>
              </div>
              <hr className="my-1" />
              <div className="d-flex justify-content-between fw-semibold">
                <span>Total to charge</span>
                <span>₹{Math.round((base + sc) * 100) / 100}</span>
              </div>
            </div>
          );
        })()}

        {paymentMode === "CARD" && (
          <div className="mb-3">
            <Label className="text-muted fs-12 mb-1 d-block">Card Type</Label>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${
                  (posTransaction?.cardType || cardType) === "CREDIT"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                disabled={Boolean(posTransaction || starting)}
                onClick={() => setCardType("CREDIT")}
              >
                <i className="ri-bank-card-line me-1"></i> Credit Card
                {(surchargePercentProp || 0) > 0 && (
                  <span className="badge bg-warning text-dark ms-1">
                    +{parseFloat(Number(surchargePercentProp).toFixed(2))}%
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  (posTransaction?.cardType || cardType) === "DEBIT"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                disabled={Boolean(posTransaction || starting)}
                onClick={() => setCardType("DEBIT")}
              >
                <i className="ri-bank-card-2-line me-1"></i> Debit Card
                <span className="badge bg-light text-muted ms-1">0%</span>
              </button>
            </div>
            {cardType === "DEBIT" && !posTransaction && (
              <div className="text-muted fs-11 mt-1">
                <i className="ri-information-line me-1"></i>
                No surcharge is applied to debit card payments.
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-baseline mb-3">
          <span className="text-muted">Mode</span>
          <span className="fw-semibold">
            {paymentMode}
            {posTransaction?.cardType && (
              <span className="text-muted fs-12 ms-1">
                ({posTransaction.cardType === "CREDIT" ? "Credit" : "Debit"})
              </span>
            )}
          </span>
        </div>

        {awaitingChoice && (
          <div className="mb-2">
            <Label htmlFor="posTerminalPicker" className="text-muted fs-12">
              Which machine?
            </Label>
            <Input
              id="posTerminalPicker"
              type="select"
              bsSize="sm"
              value={terminalId}
              onChange={(event) => setTerminalId(event.target.value)}
            >
              {machines.map((machine) => (
                <option key={machine.terminalId} value={machine.terminalId}>
                  {machine.label}
                  {machine.isDefault ? " (default)" : ""}
                </option>
              ))}
            </Input>
            <div className="text-muted fs-11 mt-1">
              The charge goes only to the counter you pick here.
            </div>
          </div>
        )}

        {starting && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner size="sm" /> Sending the charge to the terminal…
          </div>
        )}

        {posTransaction && (
          <>
            <div className="border rounded p-3 mb-3 text-center bg-light">
              <div className="text-muted fs-11 mb-1">
                Reference to enter on the machine
              </div>
              <div className="fs-2 fw-bold letter-spacing-1">
                {posTransaction.plutusTransactionReferenceId}
              </div>
              {posTransaction.terminal?.label && (
                <div className="text-muted fs-11 mt-1">
                  {posTransaction.terminal.label}
                </div>
              )}
            </div>

            {copy && (
              <Alert color={copy.color} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  {pending && <Spinner size="sm" />}
                  <strong>{copy.title}</strong>
                </div>
                <div className="fs-12 mt-1">
                  {posTransaction.responseMessage || copy.detail}
                </div>
                {pending && (
                  <div className="fs-11 mt-2">
                    Waiting {mmss(waitedSeconds)}
                    {expiresInSeconds !== null && (
                      <>
                        {" · "}
                        {expiresInSeconds > 0
                          ? `auto-cancels in ${mmss(expiresInSeconds)}`
                          : "auto-cancel window passed — settling"}
                      </>
                    )}
                  </div>
                )}
              </Alert>
            )}

            {status === "APPROVED" && posTransaction.result && (
              <dl className="row mb-0 fs-12">
                {posTransaction.result.rrn && (
                  <>
                    <dt className="col-5 text-muted fw-normal">RRN</dt>
                    <dd className="col-7">{posTransaction.result.rrn}</dd>
                  </>
                )}
                {posTransaction.result.approvalCode && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Approval code</dt>
                    <dd className="col-7">
                      {posTransaction.result.approvalCode}
                    </dd>
                  </>
                )}
                {posTransaction.cardType && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Card Category</dt>
                    <dd className="col-7">
                      {posTransaction.cardType === "CREDIT"
                        ? "Credit Card"
                        : "Debit Card"}
                    </dd>
                  </>
                )}
                {posTransaction.result.cardNumber && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Card</dt>
                    <dd className="col-7">{posTransaction.result.cardNumber}</dd>
                  </>
                )}
                {posTransaction.result.cardType && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Card Type</dt>
                    <dd className="col-7">{posTransaction.result.cardType}</dd>
                  </>
                )}
                {posTransaction.result.upiPayerVpa && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Paid from</dt>
                    <dd className="col-7">
                      {posTransaction.result.upiPayerVpa}
                    </dd>
                  </>
                )}
                {posTransaction.result.tid && (
                  <>
                    <dt className="col-5 text-muted fw-normal">Terminal</dt>
                    <dd className="col-7">{posTransaction.result.tid}</dd>
                  </>
                )}
              </dl>
            )}
          </>
        )}

        {notice && (
          <Alert color="warning" className="mb-0 mt-3 fs-12">
            {notice}
          </Alert>
        )}

        {error && (
          <Alert color="danger" className="mb-0 mt-3 fs-12">
            {error}
          </Alert>
        )}
      </ModalBody>

      <ModalFooter>
        {awaitingChoice && (
          <Button
            color="primary"
            size="sm"
            disabled={!terminalId}
            onClick={() => {
              startedRef.current = true;
              start(terminalId);
            }}
          >
            Send to terminal
          </Button>
        )}

        {/* Once the terminal has refused the cancel, offering it again just
            invites futile retries. */}
        {pending && !cancelRefused && (
          <Button
            color="danger"
            outline
            size="sm"
            onClick={cancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel payment"}
          </Button>
        )}

        {/* No retry on UNKNOWN — the customer may already have been charged,
            and a second swipe would take the money twice. */}
        {settled && status !== "APPROVED" && status !== "UNKNOWN" && (
          <Button color="secondary" outline size="sm" onClick={retry}>
            Try again
          </Button>
        )}

        {((!posTransaction || settled) && !starting) || cancelRefused ? (
          <Button color="primary" size="sm" onClick={toggle}>
            {status === "APPROVED" ? "Done" : "Close"}
          </Button>
        ) : null}
      </ModalFooter>
    </Modal>
  );
};

PosPaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  amount: PropTypes.number.isRequired,
  paymentMode: PropTypes.oneOf(["CARD", "UPI"]).isRequired,
  bankAccount: PropTypes.string,
  context: PropTypes.shape({
    center: PropTypes.string.isRequired,
    patient: PropTypes.string,
    addmission: PropTypes.string,
    purpose: PropTypes.string,
    billType: PropTypes.string,
    paymentAgainstBillNo: PropTypes.string,
    appointment: PropTypes.string,
    invoiceSnapshot: PropTypes.object,
  }).isRequired,
  // The centre's POS machines. One starts the charge immediately; several
  // make the cashier pick a counter first.
  terminals: PropTypes.arrayOf(
    PropTypes.shape({
      terminalId: PropTypes.string,
      label: PropTypes.string,
      isDefault: PropTypes.bool,
    }),
  ),
  defaultTerminalId: PropTypes.string,
  // Credit card surcharge rate configured on the centre (e.g. 2 for 2%).
  // Shown as a preview before the charge is sent; the server computes the
  // actual surcharge, so this is advisory only.
  surchargePercent: PropTypes.number,
  onApproved: PropTypes.func.isRequired,
};

export default PosPaymentModal;
