/**
 * Government identifiers (Aadhaar, passport) are stored in the server's PII
 * vault and only ever sent back MASKED — a 12-digit Aadhaar arrives as
 * `XXXXXXXX3001`, an 8-character passport as `XXXXZ123`.
 *
 * The server already treats a posted mask as "no change", so an edit form can
 * safely send one straight back and the real number is left alone. What it
 * cannot do is pass a format check: `XXXXXXXX3001` is not twelve digits, so
 * `.matches(/^[0-9]{12}$/)` rejects a record the user never even touched and
 * the form becomes unsavable.
 *
 * So the client has to recognise a mask too, and skip the format rule for it.
 * The pattern below is deliberately identical to `isMasked()` in
 * ERP-Server/src/utils/piiVault.js — if one changes, change both.
 */
export const isMaskedIdentifier = (value) =>
  /^X{4,}/i.test(String(value ?? "").trim());

/**
 * True when the value is a real, freshly-typed identifier rather than a blank
 * or a mask echoed back from the server — i.e. the only case worth format
 * checking.
 */
export const isEnteredIdentifier = (value) => {
  const raw = String(value ?? "").trim();
  return raw.length > 0 && !isMaskedIdentifier(raw);
};

export default { isMaskedIdentifier, isEnteredIdentifier };
