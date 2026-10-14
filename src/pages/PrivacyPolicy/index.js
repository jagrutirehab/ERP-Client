/**
 * Public privacy policy — SPDI Rule 4.
 *
 * Static content, no API call. The earlier version fetched this from the
 * backend, which was over-built for a page whose job is to be readable: it
 * added a network round trip, a loading state, and a failure mode where the
 * policy is unreachable because the API is down. A published privacy policy
 * should render even then.
 *
 * The versioned, hashed copy in the database is still used — but only for
 * ACKNOWLEDGEMENTS, where the point is proving which exact text someone
 * accepted. Displaying the policy and proving acceptance of it are different
 * jobs, and only the second one needs a hash.
 *
 * KEEP IN SYNC: docs/policies/privacy-policy.md on the server is the source for
 * the acknowledgement record. When that changes, update POLICY_VERSION and this
 * text together.
 */

import { Link } from "react-router-dom";
import { Card, CardBody, Container, Table } from "reactstrap";

import { REDRESS_DAYS } from "../Grievance/grievanceOfficer";
import { useGrievanceOfficer } from "../Grievance/useGrievanceOfficer";

export const POLICY_VERSION = 1;
export const POLICY_EFFECTIVE_FROM = "2026-10-13";

const H = ({ children }) => <h4 className="mt-5 mb-3">{children}</h4>;

const PrivacyPolicyPage = () => {
  const { officer } = useGrievanceOfficer();

  return (
  <div className="page-content" style={{ paddingTop: "40px" }}>
    <Container style={{ maxWidth: "860px" }}>
      <h1 className="mb-1">Privacy Policy</h1>
      <p className="text-muted">Jagruti Rehabilitation Centre</p>

      <p>
        This policy explains what personal information we collect about you, why
        we collect it, who we share it with, how long we keep it, and what you
        can ask us to do about it. It is published under Rule 4 of the
        Information Technology (Reasonable Security Practices and Procedures and
        Sensitive Personal Data or Information) Rules, 2011.
      </p>
      <p>
        We have written it in plain language on purpose. If anything here is
        unclear, the Grievance Officer named in section 10 will explain it.
      </p>

      <H>1. A note on why this matters to us</H>
      <p>
        We provide psychiatric care, de-addiction treatment and rehabilitation.
        For the people we treat, the single most sensitive fact is often not a
        diagnosis &mdash; it is simply that they came to us at all. Someone may
        be comfortable telling their employer they were unwell, and not at all
        comfortable telling them where they were treated.
      </p>
      <p>
        We therefore treat the fact of your contact with us as confidential in
        itself, not only the clinical details within it. Everything below
        follows from that.
      </p>

      <H>2. Who we are</H>
      <p>
        Jagruti Rehabilitation Centre operates psychiatric and de-addiction
        facilities across India.
      </p>
      <ul>
        <li>
          <strong>Registered entity:</strong> [to be completed]
        </li>
        <li>
          <strong>Registered office:</strong> [to be completed]
        </li>
        <li>
          <strong>Website:</strong> https://www.jagrutirehab.org
        </li>
      </ul>
      <p>
        This policy covers our website, our online booking and enquiry services,
        and the clinical record systems used at our centres.
      </p>

      <H>3. What we collect</H>

      <h6 className="mt-4">When you browse or enquire</h6>
      <ul>
        <li>Your name, phone number and email address</li>
        <li>
          The reason for your enquiry, including any mental-health concerns you
          choose to tell us about
        </li>
        <li>
          Standard web server records: IP address, browser type, pages visited,
          and the date and time, kept for security and troubleshooting
        </li>
      </ul>
      <p>
        If you tick a condition such as anxiety, depression or substance use on
        an enquiry form, that is health information about you, and section 4
        applies to it in full. <strong>You do not have to tick anything to
        contact us.</strong>
      </p>

      <h6 className="mt-4">When you become a patient</h6>
      <p>
        <strong>Identity and contact.</strong> Name, date of birth, age, gender,
        address, phone, email, nationality, marital status, religion, languages
        spoken, education, occupation and socioeconomic details. Photographs
        taken at admission.
      </p>
      <p>
        <strong>Government identifiers.</strong> Aadhaar number and card copy,
        or passport number and copy for foreign nationals.{" "}
        <strong>
          Your Aadhaar number is encrypted before it is stored, and is never
          displayed in full anywhere in our systems
        </strong>{" "}
        &mdash; staff see only the last four digits.
      </p>
      <p>
        <strong>Health information.</strong> This is the most sensitive category
        we hold:
      </p>
      <ul>
        <li>Diagnoses, recorded using the ICD-10 international classification</li>
        <li>Clinical notes, progress notes and mental-state examinations</li>
        <li>Psychological and diagnostic assessments</li>
        <li>Prescriptions and records of medication given</li>
        <li>Laboratory reports and investigation results</li>
        <li>Vital signs, and intake and output records</li>
        <li>
          Capacity assessments and admission documentation under the Mental
          Healthcare Act, 2017
        </li>
        <li>
          Counselling session notes, and where sessions are recorded, the
          recording
        </li>
        <li>Discharge summaries</li>
      </ul>
      <p>
        <strong>Family and representatives.</strong> Details of your guardian,
        nominated representative or the person accompanying you, so we can
        involve them as the law and your wishes allow.
      </p>
      <p>
        <strong>Financial.</strong> Billing, payments, deposits and insurance
        details. Card payments are handled by our payment provider &mdash; we
        never see or store your full card number.
      </p>
      <p>
        <strong>Safety monitoring.</strong> Our inpatient facilities use CCTV in
        shared and clinical areas for patient safety, including detecting falls
        and prolonged absence. Cameras are not placed inside bathrooms or
        changing areas.
      </p>

      <h6 className="mt-4">When you call us</h6>
      <p>
        Enquiry and feedback calls may be recorded for quality and training. You
        are told at the start of a recorded call.
      </p>

      <H>4. Sensitive personal data</H>
      <p>
        Health information, mental-health conditions, Aadhaar numbers, biometric
        data and financial information are{" "}
        <strong>sensitive personal data or information</strong> under Rule 3 of
        the SPDI Rules.
      </p>
      <p>
        We collect it only where it is necessary for your care or required by
        law, we collect it with your consent, and you may withdraw that consent
        at any time &mdash; though if you withdraw consent for information we
        need to treat you safely, we may not be able to continue treatment. We
        will tell you plainly if that is the case rather than continuing without
        a proper basis.
      </p>

      <H>5. Why we use it</H>
      <Table bordered size="sm" responsive>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Providing clinical care and treatment</td>
            <td>The service you came to us for</td>
          </tr>
          <tr>
            <td>Records required by the Mental Healthcare Act, 2017</td>
            <td>Legal obligation</td>
          </tr>
          <tr>
            <td>Medical records retention under medical council regulations</td>
            <td>Legal obligation</td>
          </tr>
          <tr>
            <td>Billing, payment and insurance claims</td>
            <td>Necessary for our agreement with you</td>
          </tr>
          <tr>
            <td>Patient safety monitoring</td>
            <td>Protecting your and others&rsquo; safety</td>
          </tr>
          <tr>
            <td>Responding to enquiries and grievances</td>
            <td>Necessary to answer you</td>
          </tr>
          <tr>
            <td>Clinical audit and quality improvement</td>
            <td>Carried out on de-identified data</td>
          </tr>
        </tbody>
      </Table>
      <p>
        <strong>
          We do not sell your personal information. We do not use health
          information for advertising. We do not share health information with
          advertising networks.
        </strong>
      </p>

      <H>6. Who we share it with</H>
      <p>
        <strong>Inside the organisation.</strong> Access is restricted by role
        and by centre. Clinical staff see the records of patients at their own
        centre, and administrative staff see only what their work requires.
        Every staff member has an individual account &mdash; accounts are never
        shared &mdash; and access is logged.
      </p>
      <Table bordered size="sm" responsive>
        <thead>
          <tr>
            <th>Provider</th>
            <th>What they handle</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Amazon Web Services</td>
            <td>Document and image storage, email delivery</td>
            <td>Mumbai, India</td>
          </tr>
          <tr>
            <td>Razorpay</td>
            <td>Card and UPI payment processing</td>
            <td>India</td>
          </tr>
          <tr>
            <td>Google (Gemini)</td>
            <td>Reading text from uploaded lab reports and assessment forms</td>
            <td>Outside India &mdash; see section 7</td>
          </tr>
          <tr>
            <td>Cloudflare</td>
            <td>Video consultation sessions</td>
            <td>Outside India &mdash; see section 7</td>
          </tr>
          <tr>
            <td>HubSpot</td>
            <td>Enquiry and contact management</td>
            <td>Outside India &mdash; see section 7</td>
          </tr>
        </tbody>
      </Table>
      <p>
        Each processes data on our instructions, under a written agreement
        requiring protection at least equal to our own.
      </p>
      <p>
        <strong>Where the law requires.</strong> The Mental Health Review Board,
        where the Mental Healthcare Act, 2017 requires us to notify them about
        an admission; and courts, police or regulators where we are legally
        compelled.
      </p>
      <p>
        <strong>What we will not do.</strong> We will not disclose your
        information to your employer, to family members beyond your nominated
        representative, to insurers other than for a claim you have asked us to
        make, or to media &mdash; without your consent.
      </p>

      <H>7. Information that leaves India</H>
      <p>
        Some processing currently happens outside India, as marked above. This
        matters, so we are specific about it:
      </p>
      <ul>
        <li>
          <strong>Document reading.</strong> Lab reports and assessment forms
          are processed by an AI service to extract structured information such
          as test values. The extracted summary deliberately excludes patient,
          doctor and hospital names.
        </li>
        <li>
          <strong>Video consultations.</strong> Telepsychiatry sessions run on
          international video infrastructure.
        </li>
        <li>
          <strong>Enquiries.</strong> Website enquiry details are managed in an
          international CRM.
        </li>
      </ul>
      <p>
        <strong>No automated system makes a decision about your treatment.</strong>{" "}
        Anything produced by software is a draft for a clinician to review, and a
        named clinician is accountable for every clinical decision about your
        care.
      </p>

      <H>8. How long we keep it</H>
      <p>
        Medical records are kept for at least 3 years from the start of
        treatment, as medical council regulations require, and longer for
        psychiatric records. Security and access logs are kept for 180 days, as
        the CERT-In Directions, 2022 require. Billing records are kept as tax law
        requires. When a retention period ends, records are securely deleted or
        anonymised.
      </p>

      <H>9. Your rights</H>
      <p>You can ask us to:</p>
      <ul>
        <li>
          <strong>Show you</strong> the personal information we hold about you
        </li>
        <li>
          <strong>Correct</strong> anything inaccurate or incomplete
        </li>
        <li>
          <strong>Give you a copy of your medical records.</strong> Section 25 of
          the Mental Healthcare Act, 2017 gives you this right, and medical
          council regulations require us to provide records within 72 hours of
          your request
        </li>
        <li>
          <strong>Withdraw your consent</strong> to processing that relies on it
        </li>
      </ul>
      <p>
        There is no charge for these requests. If you are unable to make a
        request yourself, your nominated representative may make it for you.
      </p>

      <H>10. Grievance Officer</H>
      <Card className="mb-3">
        <CardBody>
          {officer?.name ? (
            <>
              <div>
                <strong>{officer?.name}</strong>
                {officer?.designation
                  ? `, ${officer?.designation}`
                  : ""}
              </div>
              {officer?.email && (
                <div>
                  <a href={`mailto:${officer?.email}`}>
                    {officer?.email}
                  </a>
                </div>
              )}
              {officer?.phone && <div>{officer?.phone}</div>}
              {officer?.address && (
                <div className="text-muted">{officer?.address}</div>
              )}
            </>
          ) : (
            <span className="text-muted">
              Our Grievance Officer&rsquo;s details are being updated. Please use
              the grievance form in the meantime &mdash; it is monitored and you
              will receive a receipt number.
            </span>
          )}
        </CardBody>
      </Card>
      <p>
        <strong>We will respond within {REDRESS_DAYS} days</strong> of receiving
        your grievance. Submit one at{" "}
        <Link to="/grievance">Grievance Redressal</Link>, where you will be given
        a receipt number so you can follow it up.
      </p>

      <H>11. How we protect your information</H>
      <ul>
        <li>
          Aadhaar and passport numbers are encrypted before storage and never
          shown in full
        </li>
        <li>Information in transit is encrypted</li>
        <li>Access is restricted by role and by centre, and is logged</li>
        <li>
          Staff accounts are individual; passwords are stored only as
          irreversible hashes
        </li>
        <li>Security and access logs are kept for 180 days</li>
        <li>
          We maintain a documented Information Security Policy that our staff
          acknowledge and are bound by
        </li>
      </ul>
      <p>
        No system is completely secure. If a breach affects your information, we
        will tell you and notify the authorities as required by law.
      </p>

      <H>12. Children</H>
      <p>
        Where a patient is under 18, we involve their parent or legal guardian as
        the Mental Healthcare Act, 2017 requires, and obtain consent from them.
        We do not knowingly collect information from children through our
        website.
      </p>

      <H>13. Changes to this policy</H>
      <p>
        When this policy changes we publish a new version rather than editing the
        old one. We record which version you were shown and when you accepted it,
        together with a cryptographic fingerprint of the exact text &mdash; so if
        there is ever a question about what you agreed to, we can show you
        precisely that text. Previous versions are available on request.
      </p>

      <hr className="mt-5" />
      <p className="text-muted fs-13 mb-5">
        Version {POLICY_VERSION} &middot; effective from{" "}
        {new Date(POLICY_EFFECTIVE_FROM).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . To raise a concern, visit{" "}
        <Link to="/grievance">Grievance Redressal</Link>.
      </p>
    </Container>
  </div>
);
};

export default PrivacyPolicyPage;
