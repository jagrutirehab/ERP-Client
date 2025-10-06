import React, { forwardRef, Fragment } from "react";

const EnquiryTakingPrint = forwardRef((props, ref) => {
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
          <h2 className="text-2xl font-semibold">Enquiry Taking Checklist</h2>
        </div>

        {/* Section A */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">A. Initial Contact</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Greet politely and introduce the centre.</li>
            <li>Maintain a calm, empathetic, non-judgmental tone.</li>
            <li>Ensure confidentiality during the conversation.</li>
          </ul>
        </div>

        {/* Section B */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">B. Patient Information</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Age / Gender</li>
            <li>Contact number &amp; Email</li>
            <li>Address / Location</li>
          </ul>
        </div>

        {/* Section C */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">C. Clinical Details</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Presenting problem (addiction / psychiatric illness / dementia /
              other)
            </li>
            <li>Duration of illness / complaints</li>
            <li>Current medications / past treatment history</li>
            <li>
              Any emergencies (seizures, suicidal thoughts, aggression,
              confusion)?
            </li>
          </ul>
        </div>

        {/* Section D */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">D. Referral Source</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Doctor / Hospital referral</li>
            <li>Online (Website / Social Media)</li>
            <li>Word of mouth / Past patient</li>
          </ul>
        </div>

        {/* Section E */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">
            E. Admission Requirement
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Urgency (Emergency / Planned)</li>
            <li>
              Type of admission preferred (Short-term / Long-term / OPD / Day
              care)
            </li>
            <li>Bed availability checked</li>
          </ul>
        </div>

        {/* Section F */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">
            F. Information Provided to Family
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Services and facilities explained</li>
            <li>Admission process explained (documents, consent, deposit)</li>
            <li>Charges and packages briefly informed</li>
            <li>Family role / involvement discussed</li>
            <li>Contact person shared for further queries</li>
          </ul>
        </div>

        {/* Section G */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">G. Documentation</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enquiry entered in Register / Software</li>
            <li>Unique Enquiry ID generated (if applicable)</li>
            <li>Categorized: Hot / Warm / Cold lead</li>
            <li>Follow-up reminder set</li>
          </ul>
        </div>

        {/* Section H */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">H. Follow-Up</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hot lead: Call back within 24 hrs</li>
            <li>Warm lead: Call back in 3–5 days</li>
            <li>Cold lead: SMS / WhatsApp reminder weekly</li>
            <li>Follow-up notes updated in software</li>
          </ul>
        </div>

        {/* Section I */}
        <div>
          <h3 className="text-1.2xl font-bold mb-2">I. Escalation</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>If emergency → Informed Duty Doctor immediately</li>
            <li>Guided family for immediate admission / emergency services</li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default EnquiryTakingPrint;
