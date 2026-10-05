import React, { useEffect, useRef, useState } from "react";
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

import { getPosStatus, postPosRefund } from "../../helpers/backend_helper";

const POLL_INTERVAL_MS = 3000;

/**
 * Sends money back for one approved POS sale.
 *
 * A reversal is a real Pine Labs transaction — it goes to the terminal with
 * its own reference and has to be watched to completion, exactly like a
 * charge. So this polls the same status endpoint rather than assuming the
 * request succeeded.
 */
const RefundModal = ({ isOpen, toggle, transaction, onDone }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reversal, setReversal] = useState(null);
  const [warning, setWarning] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const mountedRef = useRef(true);
  const pollRef = useRef(null);

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  // Fresh state each time the modal opens on a different payment.
  useEffect(() => {
    if (!isOpen) return;
    setAmount(transaction ? String(transaction.amount) : "");
    setReason("");
    setReversal(null);
    setWarning(null);
    setError(null);
    setSending(false);
  }, [isOpen, transaction]);

  // Follow the reversal to completion.
  useEffect(() => {
    if (!reversal?._id || reversal.settled) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return undefined;
    }

    const tick = async () => {
      try {
        const response = await getPosStatus(reversal._id);
        if (!mountedRef.current) return;
        setReversal(response.payload);
        if (response.payload.settled) onDone?.();
      } catch (err) {
        if (mountedRef.current)
          setError(err?.message || "Could not read the refund status.");
      }
    };

    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [reversal, onDone]);

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      const response = await postPosRefund(transaction._id, {
        amount: Number(amount),
        reason,
      });
      if (!mountedRef.current) return;
      setReversal(response.payload);
      setWarning(response.billWarning || null);
    } catch (err) {
      if (mountedRef.current)
        setError(err?.message || "Could not start the refund.");
    } finally {
      if (mountedRef.current) setSending(false);
    }
  };

  const status = reversal?.status;
  const inFlight = !!reversal && !reversal.settled;

  return (
    <Modal
      isOpen={isOpen}
      toggle={inFlight ? undefined : toggle}
      backdrop={inFlight ? "static" : true}
      centered
    >
      <ModalHeader toggle={inFlight ? undefined : toggle}>
        Refund POS payment
      </ModalHeader>

      <ModalBody>
        {transaction && (
          <dl className="row fs-12 mb-3">
            <dt className="col-5 text-muted fw-normal">Original payment</dt>
            <dd className="col-7">₹{transaction.amount}</dd>
            <dt className="col-5 text-muted fw-normal">Reference</dt>
            <dd className="col-7">{transaction.transactionNumber}</dd>
            {transaction.result?.rrn && (
              <>
                <dt className="col-5 text-muted fw-normal">RRN</dt>
                <dd className="col-7">{transaction.result.rrn}</dd>
              </>
            )}
            {transaction.terminal?.label && (
              <>
                <dt className="col-5 text-muted fw-normal">Terminal</dt>
                <dd className="col-7">{transaction.terminal.label}</dd>
              </>
            )}
          </dl>
        )}

        {!reversal && (
          <>
            <div className="mb-3">
              <Label htmlFor="refundAmount" className="text-muted fs-12">
                Amount to refund
              </Label>
              <Input
                id="refundAmount"
                type="number"
                bsSize="sm"
                value={amount}
                max={transaction?.amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="text-muted fs-11 mt-1">
                Defaults to the full amount. A smaller value is a part refund.
              </div>
            </div>

            <div className="mb-2">
              <Label htmlFor="refundReason" className="text-muted fs-12">
                Reason
              </Label>
              <Input
                id="refundReason"
                type="textarea"
                bsSize="sm"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Recorded against the refund for audit"
              />
            </div>

            <Alert color="warning" className="fs-12 mb-0">
              The customer&apos;s card or UPI must be presented at the terminal
              to complete this refund.
            </Alert>
          </>
        )}

        {reversal && (
          <>
            <div className="border rounded p-3 mb-3 text-center bg-light">
              <div className="text-muted fs-11 mb-1">
                Reference to enter on the machine
              </div>
              <div className="fs-2 fw-bold">
                {reversal.plutusTransactionReferenceId}
              </div>
              <div className="text-muted fs-11 mt-1">
                {reversal.reversalKind === "VOID" ? "Void" : "Refund"} of ₹
                {reversal.amount}
              </div>
            </div>

            <Alert
              color={
                status === "APPROVED"
                  ? "success"
                  : status === "UNKNOWN"
                    ? "danger"
                    : inFlight
                      ? "info"
                      : "warning"
              }
              className="mb-0"
            >
              <div className="d-flex align-items-center gap-2">
                {inFlight && <Spinner size="sm" />}
                <strong>
                  {status === "APPROVED"
                    ? "Refund completed"
                    : status === "UNKNOWN"
                      ? "Outcome unknown — do not retry"
                      : inFlight
                        ? "Waiting for the terminal"
                        : `Refund ${String(status || "").toLowerCase()}`}
                </strong>
              </div>
              {reversal.responseMessage && (
                <div className="fs-12 mt-1">{reversal.responseMessage}</div>
              )}
            </Alert>
          </>
        )}

        {warning && (
          <Alert color="warning" className="fs-12 mt-3 mb-0">
            {warning}
          </Alert>
        )}

        {error && (
          <Alert color="danger" className="fs-12 mt-3 mb-0">
            {error}
          </Alert>
        )}
      </ModalBody>

      <ModalFooter>
        {!reversal && (
          <>
            <Button color="light" size="sm" onClick={toggle}>
              Cancel
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={submit}
              disabled={sending || !(Number(amount) > 0)}
            >
              {sending ? "Sending…" : "Send refund to terminal"}
            </Button>
          </>
        )}
        {reversal && !inFlight && (
          <Button color="primary" size="sm" onClick={toggle}>
            Done
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

RefundModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  transaction: PropTypes.object,
  onDone: PropTypes.func,
};

export default RefundModal;
