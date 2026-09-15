export function shouldPromptForPharmacy({
  nextStatus,
  needsRemoval,
  pharmacyDeductionEnabled,
}) {
  if (!pharmacyDeductionEnabled) return false;
  if (needsRemoval) return false;
  return nextStatus === "completed";
}
