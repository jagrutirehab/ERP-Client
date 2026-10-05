import { useEffect, useState } from "react";
import { CARD, CASH, UPI } from "../../../../Components/constants/patient";
import { getPosTerminal } from "../../../../helpers/backend_helper";

/** Tenders a Pine Labs terminal can collect. */
export const POS_MODES = [CARD, UPI];

/** Pine Labs refuses anything under 1 rupee. */
export const POS_MIN_AMOUNT = 1;

/**
 * A centre's POS state.
 *
 * Shared by the payment rows and by the forms around them: the rows need it to
 * offer the charge, the forms need it to decide whether a bill may be saved.
 * Keeping one fetch means the two can never disagree about whether POS applies.
 */
export const usePosTerminal = (centerId) => {
  const [posTerminal, setPosTerminal] = useState(null);

  useEffect(() => {
    if (!centerId) {
      setPosTerminal(null);
      return undefined;
    }
    let cancelled = false;
    getPosTerminal(centerId)
      .then((response) => {
        if (!cancelled) setPosTerminal(response.payload);
      })
      .catch((err) => {
        // A centre without a terminal is normal — fall back to manual entry.
        // Keep the reason though: without it the button simply never appears
        // and nobody can tell why.
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

  return {
    posTerminal,
    posAvailable: !!posTerminal?.available,
    posEnabled: !!posTerminal?.enabled,
    posReason: posTerminal && !posTerminal.available ? posTerminal.reason : null,
  };
};

/**
 * Whether this bill may be saved or abandoned.
 *
 * Two rules, both about not letting the paperwork and the money disagree:
 *
 *  - A card or UPI row on a centre with a working terminal must carry an
 *    approved charge. Otherwise a cashier can type a reference by hand and
 *    record a payment the terminal never took.
 *
 *  - Once a charge IS approved the form cannot be abandoned, because the money
 *    is already gone and cancelling would leave nothing recording it.
 *
 * `tenderKey` differs by form: OPD receipt rows name the tender `type`,
 * deposit and advance-payment rows name it `paymentMode`.
 */
export const evaluatePosGuards = (
  paymentModes,
  { posAvailable, tenderKey = "paymentMode", readOnly = false } = {},
) => {
  const rows = paymentModes || [];
  const paidOnPos = rows.some((row) => row.posTransaction);

  // Recovery forms are billing a charge that already happened; there is
  // nothing left to charge and the row is locked anyway.
  const uncharged =
    posAvailable && !readOnly
      ? rows.filter(
          (row) =>
            POS_MODES.includes(row[tenderKey]) &&
            !row.posTransaction &&
            Number(row.amount) > 0,
        )
      : [];

  const modes = [...new Set(uncharged.map((row) => row[tenderKey]))];

  return {
    paidOnPos,
    blockSave: uncharged.length > 0,
    saveReason: uncharged.length
      ? `Charge the ${modes.join(" and ")} amount on the POS terminal before saving — nothing has been collected yet.`
      : null,
    blockCancel: paidOnPos,
    cancelReason: paidOnPos
      ? "The terminal has already taken this payment. Save the bill — cancelling now would leave the money unrecorded."
      : null,
  };
};

/**
 * Whether every payment row that needs proof has it.
 *
 * Cash leaves no trail worth attaching; everything else — card, UPI, cheque,
 * bank transfer — is only auditable if the slip or screenshot is on the bill,
 * so the save is held until one is there.
 *
 * A row already collected on a Pine Labs terminal is exempt: its RRN and
 * approval code come from the acquirer, which is stronger proof than a
 * photograph of a screen.
 */
export const evaluateEvidenceGuard = (
  paymentModes,
  { tenderKey = "paymentMode", existingTransactionProof = [], readOnly = false } = {},
) => {
  if (readOnly) return { blockSave: false, saveReason: null, missingFor: [] };

  const hasExisting = (mode) =>
    (existingTransactionProof || []).some((proof) => proof?.mode === mode);

  const missing = (paymentModes || []).filter((row) => {
    const mode = row[tenderKey];
    if (!mode || mode === CASH) return false;
    if (row.posTransaction) return false;
    if ((row.evidenceFiles || []).length > 0) return false;
    return !hasExisting(mode);
  });

  const modes = [...new Set(missing.map((row) => row[tenderKey]))];

  return {
    blockSave: missing.length > 0,
    saveReason: missing.length
      ? `Attach the evidence screenshot for the ${modes.join(" and ")} payment before saving.`
      : null,
    missingFor: modes,
  };
};

/** Does this one row still need its evidence attached? */
export const needsEvidence = (row, tenderKey, existingTransactionProof) => {
  const mode = row?.[tenderKey];
  if (!mode || mode === CASH) return false;
  if (row.posTransaction) return false;
  if ((row.evidenceFiles || []).length > 0) return false;
  return !(existingTransactionProof || []).some((p) => p?.mode === mode);
};

export default {
  usePosTerminal,
  evaluatePosGuards,
  evaluateEvidenceGuard,
  needsEvidence,
  POS_MODES,
  POS_MIN_AMOUNT,
};
