/**
 * Grievance Officer details — published under SPDI Rule 5(9).
 *
 * Rule 5(9) of the Information Technology (Reasonable Security Practices and
 * Procedures and Sensitive Personal Data or Information) Rules, 2011 requires
 * a body corporate to DESIGNATE a Grievance Officer and PUBLISH their name and
 * contact details on its website, and to redress grievances within one month
 * of receipt.
 *
 * Publishing is the statutory act. An unnamed officer is the same as no
 * officer, so every TODO below must be filled before this page goes live.
 *
 * Keep the same details on the public marketing site — the Rule says "its
 * website", and a patient looking for this will go to jagrutirehab.org first,
 * not to the staff dashboard.
 */

export const GRIEVANCE_OFFICER = {
  // TODO(ops): the designated officer's full name.
  name: "",
  // TODO(ops): their role, e.g. "Chief Operating Officer".
  designation: "",
  // TODO(ops): a monitored mailbox. Prefer a role address (grievance@...) over
  // a personal one so the obligation survives the person changing jobs.
  email: "",
  // TODO(ops): a reachable number during stated hours.
  phone: "",
  // TODO(ops): full registered postal address, including PIN code.
  address: "",
  // Working hours shown to the public. Adjust if these are not accurate.
  hours: "Monday to Saturday, 10:00 - 18:00 IST",
};

/**
 * The statutory redress window. Rule 5(9) says "within one month from the date
 * of receipt of grievance" — this is a ceiling, not a target.
 */
export const REDRESS_DAYS = 30;

/**
 * True once the officer has actually been designated. The page uses this to
 * show an honest fallback rather than a card with blank fields, which would be
 * worse than no page at all.
 */
export const isOfficerPublished = () =>
  Boolean(
    GRIEVANCE_OFFICER.name &&
      GRIEVANCE_OFFICER.email &&
      GRIEVANCE_OFFICER.designation,
  );
