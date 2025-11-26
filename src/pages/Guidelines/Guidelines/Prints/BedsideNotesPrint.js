import React, { forwardRef, Fragment } from "react";

const BedsideNotesPrint = forwardRef((props, ref) => {
  return (
    <Fragment>
      <div
        ref={ref}
        className={`${props.classnames} px-6 py-10 absolute -z-10`}
      >
        {/* Header */}
        <div className={`${props.heading} mb-4`}>
          <h1 className={`text-3xl m-auto text-center font-extrabold mb-5`}>
            Jagruti Rehabilitation Centre
          </h1>
          <h2 className="text-2xl font-semibold">
            Bedside Notes Template – For Counselors &amp; Nurses
          </h2>
        </div>

        {/* Section 1 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">1. Basic Details</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Patient Name / ID: ___________________________</li>
            <li>Date &amp; Time: ___________________________</li>
            <li>Unit / Bed No.: ___________________________</li>
            <li>Staff Name &amp; Role: ___________________________</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            2. Mental &amp; Physical Status
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Mood / Affect, Speech / Interaction, Sleep / Appetite, Physical
              Complaints, Medications taken ✔ / ■
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">3. Behavioral Observations</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Cooperative / Resistant / Aggressive / Quiet | Group participation
              | Interaction with peers | Self-care &amp; hygiene | Orientation
              to time/place/person
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            4. Counseling / Communication Notes (For Counselors)
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Topic discussed, Patient’s response, Emotional tone, Techniques
              used, Plan for next session
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            5. Nursing Care Notes (For Nurses)
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Vitals, Intake-Output, ADL assistance, Safety precautions, Wound
              care, Shift handover remarks
            </li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">6. Plan / Follow-Up</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Continue same plan / Modify medication / Refer to psychiatrist /
              Encourage participation / Family counseling planned (Yes / No)
            </li>
          </ul>
        </div>

        {/* Benefits Section */}
        <div>
          <h3 className="text-xl font-bold mb-2">Benefits of This Format</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Continuity of Care – smooth handover between shifts &amp; staff
            </li>
            <li>
              Early Detection – track changes in mood, sleep, aggression early
            </li>
            <li>
              Improved Documentation – easy for doctors to review progress
            </li>
            <li>Therapeutic Engagement – more meaningful time with patient</li>
            <li>Legal &amp; Audit Value – standardized, complete record</li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default BedsideNotesPrint;
