import { CASH } from "../../../../Components/constants/patient";

/**
 * Payment evidence is mandatory on every non-CASH payment row.
 *
 * Shared by the Deposit, Advance Payment and OPD Invoice forms so the three
 * cannot drift apart. Kept out of the form files because `paymentModes` is held
 * in local useState, not Formik values — a Yup schema on the form cannot see it,
 * so the check has to be callable from both the submit handler and the render.
 */

/**
 * The payment mode of a row, whichever key it is stored under.
 *
 * The two row components disagree: Components/Payment.js (Deposit, Advance
 * Payment, Due Payment) stores the mode as `paymentMode`; Components/paymentMode.js
 * (OPD Invoice) stores it as `type`. Reading both is what lets one helper serve
 * every form — do not "tidy" this into a single key without renaming the field in
 * whichever component you drop, and the persisted bills that already use it.
 */
export const modeOf = (row) => row?.paymentMode ?? row?.type ?? null;

/**
 * Rows that still need evidence, as [{ idx, mode }].
 *
 * A row is satisfied by EITHER a newly-picked file (`evidenceFiles`) OR evidence
 * already stored against that mode on the bill being edited. The second half is
 * load-bearing: without it, opening any historic bill and changing an unrelated
 * field would demand a re-upload of proof that is already on file.
 *
 * CASH is skipped because neither row component renders an upload control for it
 * — requiring it would make cash rows unsubmittable with no way to comply.
 */
export const rowsMissingEvidence = (paymentModes, existingTransactionProof) => {
  const existing = Array.isArray(existingTransactionProof)
    ? existingTransactionProof
    : [];

  return (Array.isArray(paymentModes) ? paymentModes : []).reduce(
    (missing, row, idx) => {
      const mode = modeOf(row);
      // An unset mode is an incomplete row, not a missing-evidence row — the
      // existing "select a payment mode" validation owns that case.
      if (!mode || mode === CASH) return missing;

      const hasNewFile = (row?.evidenceFiles || []).length > 0;
      const hasStoredProof = existing.some(
        (proof) => proof?.mode === mode && proof?.url,
      );

      if (!hasNewFile && !hasStoredProof) missing.push({ idx, mode });
      return missing;
    },
    [],
  );
};

/** One-line message naming the modes still missing evidence, or null when none. */
export const evidenceErrorMessage = (missing) => {
  if (!missing?.length) return null;
  const modes = [...new Set(missing.map((m) => m.mode))].join(", ");
  return `Payment evidence is required. Please attach a file for: ${modes}.`;
};
