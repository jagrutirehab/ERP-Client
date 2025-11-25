import React, { forwardRef, Fragment } from "react";

const HygieneMaintenancePrint = forwardRef((props, ref) => {
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
            Hygiene &amp; Maintenance Checklist
          </h2>
        </div>

        {/* Section A */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            A. Patient Personal Hygiene (Daily)
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ensure patient bath/shower taken</li>
            <li>Grooming done (hair, nails, shaving if required)</li>
            <li>Clothes changed and washed</li>
            <li>Oral hygiene maintained (brushing, mouthwash if prescribed)</li>
          </ul>
        </div>

        {/* Section B */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            B. Ward Cleanliness &amp; Disinfection
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Floors mopped morning &amp; evening</li>
            <li>Toilets cleaned 3 times daily</li>
            <li>
              High-touch surfaces disinfected (doorknobs, railings, switches)
            </li>
            <li>Dustbins emptied &amp; cleaned</li>
          </ul>
        </div>

        {/* Section C */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            C. Laundry &amp; Linen Management
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Bed linen changed twice weekly or if soiled</li>
            <li>Towels/personal linen washed daily</li>
            <li>Separate collection bags for infected linen</li>
            <li>Linen inventory maintained</li>
          </ul>
        </div>

        {/* Section D */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            D. Biomedical Waste Disposal
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Segregation as per color-coded bins</li>
            <li>Sharp disposal in puncture-proof container</li>
            <li>Daily waste collection &amp; disposal recorded</li>
            <li>Compliance with biomedical waste rules</li>
          </ul>
        </div>

        {/* Section E */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            E. Facility Upkeep &amp; Safety
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Water supply checked daily</li>
            <li>Electricity backup (generator/inverter) tested weekly</li>
            <li>Fire extinguishers inspected monthly</li>
            <li>Pest control services scheduled monthly</li>
            <li>
              Equipment maintenance log updated (AC, lifts, medical devices)
            </li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default HygieneMaintenancePrint;
