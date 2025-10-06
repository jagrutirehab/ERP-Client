import React, { forwardRef, Fragment } from "react";

const AdmissionDischargePrint = forwardRef((props, ref) => {
  return (
    <Fragment>
      <div
        ref={ref}
        className={`${props.classnames} px-6 py-10 absolute -z-10`}
      >
        {/* Header */}
        <div className={`${props.heading} mb-4`}>
          <h1 className={`text-3xl m-auto text-center font-extrabold mb-5`}>
            {" "}
            Jagruti Rehabilitation Centre
          </h1>
          <h2 className="text-2xl font-semibold">
            Admissions & Discharge Checklist
          </h2>
        </div>

        {/* Section A */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">A. Admissions Process</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Verify if enquiry is already registered in software</li>
            <li>Convert enquiry to admission in 'New Admission' form</li>
            <li>Fill Personal Details (patient & guardian)</li>
            <li>Upload ID proof (Aadhar / Passport / Voter ID)</li>
            <li>Upload medical records / referral notes</li>
            <li>Enter Diagnosis / Provisional diagnosis</li>
            <li>
              Complete Consent forms (Treatment, Confidentiality, Financial,
              Photography)
            </li>
            <li>Allocate Bed / Ward in software</li>
            <li>Record advance deposit & mode of payment</li>
            <li>Generate Receipt via software</li>
          </ul>
        </div>

        {/* Section B */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">B. During Admission</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Daily progress notes by doctors entered</li>
            <li>Nursing staff update vitals & shift reports</li>
            <li>Counseling / therapy sessions logged</li>
            <li>Incident reports filed digitally</li>
          </ul>
        </div>

        {/* Section C */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">C. Discharge Process</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Inform family 48 hours before planned discharge</li>
            <li>Doctor prepares Final Case Summary</li>
            <li>
              Counselor prepares relapse prevention & discharge counseling
            </li>
            <li>Complete Discharge Form in software</li>
            <li>Upload Discharge Summary (diagnosis, treatment, advice)</li>
            <li>Update Medication chart</li>
            <li>Enter Follow-up schedule (OPD / Teleconsult / Home visit)</li>
            <li>Generate final bill & clear pending payments</li>
            <li>Provide final Receipt to family</li>
          </ul>
        </div>

        {/* Section D */}
        <div>
          <h3 className="text-1.2xl font-bold mb-2">
            D. Post-Discharge Follow-Up
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Ensure software sends automated reminders (SMS / WhatsApp / Email)
            </li>
            <li>Counselor records follow-up calls in system</li>
            <li>Link readmission details to past records (if applicable)</li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default AdmissionDischargePrint;
