// "Referred By" display text: `label` for non-doctor sources (Walk In,
// Jagruti Staff - NAME (CODE), ...), `doctorName` for doctor referrals.
export default function referredByName(referredBy) {
  return referredBy?.label || referredBy?.doctorName;
}
