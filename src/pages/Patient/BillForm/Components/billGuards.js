import { useEffect, useState } from "react";
import { CARD, CASH, UPI } from "../../../../Components/constants/patient";
import { getPosTerminal } from "../../../../helpers/backend_helper";
export const POS_MODES = [CARD, UPI];
export const POS_MIN_AMOUNT = 1;
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


export const isPineLabsAccount = (name) => {
  if (!name) return false;
  const raw = typeof name === "object" ? name?.name || "" : name;
  const normalized = String(raw).toLowerCase().replace(/[\s_-]/g, "");
  return normalized.includes("pinelab");
};


export const evaluatePosGuards = (
  paymentModes,
  { posAvailable, tenderKey = "paymentMode", readOnly = false } = {},
) => {
  const rows = paymentModes || [];
  const paidOnPos = rows.some((row) => row.posTransaction);


  const uncharged =
    posAvailable && !readOnly
      ? rows.filter(
        (row) =>
          POS_MODES.includes(row[tenderKey]) &&
          !row.posTransaction &&
          Number(row.amount) > 0 &&
          (!row.bankAccount || isPineLabsAccount(row.bankAccount)),
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
  isPineLabsAccount,
  POS_MODES,
  POS_MIN_AMOUNT,
};
