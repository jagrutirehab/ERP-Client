import React, { forwardRef, Fragment } from "react";

const RehabilitationGuidelinesPrint = forwardRef((props, ref) => {
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
            Comprehensive Rehabilitation Guidelines
          </h2>
        </div>

        {/* 1. Enquiry Taking */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">1. Enquiry Taking</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Patient details recorded.</li>
            <li>Diagnosis / provisional complaint noted.</li>
            <li>Source of enquiry documented.</li>
            <li>Bed availability checked.</li>
            <li>Charges explained.</li>
            <li>Documents required informed.</li>
            <li>Follow-up scheduled if not admitted.</li>
          </ul>
        </div>

        {/* 2. Clinical Work */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">2. Clinical Work</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Psychiatric and medical assessments completed.</li>
            <li>Baseline nursing charting (Vitals, ADL, Weight, Risk).</li>
            <li>Risk assessment: Suicide / Violence / Fall / Withdrawal.</li>
            <li>Consent form signed.</li>
            <li>Daily vitals &amp; progress notes maintained.</li>
            <li>Incident reports filed (if any).</li>
          </ul>
        </div>

        {/* 3. Hygiene */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">3. Hygiene</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Daily ward cleaning (floors, toilets, linen).</li>
            <li>Patient hygiene: bath, grooming, clothes, nails.</li>
            <li>Staff hygiene maintained with uniforms, gloves, masks.</li>
          </ul>
        </div>

        {/* 4. Rehabilitation Activities */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            4. Rehabilitation Activities
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Daily structured schedule with yoga, group therapy, occupational
              therapy, recreation.
            </li>
            <li>Weekly progress notes documented.</li>
            <li>Family involvement once per month.</li>
          </ul>
        </div>

        {/* 5. Alcohol De-addiction */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">5. Alcohol De-addiction</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Withdrawal protocol with CIWA-Ar scoring, benzodiazepine taper,
              thiamine supplementation.
            </li>
            <li>
              Maintenance: Naltrexone, Acamprosate, Disulfiram with LFT
              monitoring.
            </li>
            <li>
              45-day lecture plan covering addiction, coping, relapse
              prevention, family involvement.
            </li>
            <li>
              6-month post-discharge follow-up with psychiatrist, counselor,
              family.
            </li>
          </ul>
        </div>

        {/* 6. Drug De-addiction */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">6. Drug De-addiction</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Withdrawal protocol (Opioids, Cannabis, Benzodiazepines).</li>
            <li>
              Maintenance with Buprenorphine-naloxone, Methadone, Naltrexone.
            </li>
            <li>
              90-day lecture plan: lifestyle, vocational, relapse prevention,
              mindfulness.
            </li>
            <li>6-month structured follow-up.</li>
          </ul>
        </div>

        {/* 7. Schizophrenia & Mania */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            7. Schizophrenia &amp; Mania
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Acute phase: Antipsychotics, mood stabilizers, benzodiazepines,
              ECT (if required).
            </li>
            <li>Maintenance: LAIs, Lithium/Valproate, family education.</li>
            <li>
              90-day in-house plan: psychoeducation, social skills training,
              cognitive rehab.
            </li>
            <li>6-month follow-up with psychiatrist &amp; counselors.</li>
          </ul>
        </div>

        {/* 8. Depression & Neurotics */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            8. Depression &amp; Neurotics
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Acute phase: SSRIs/SNRIs, sleep management, ECT if resistant.
            </li>
            <li>Maintenance: Continue meds for 6–12 months.</li>
            <li>
              Admission duration 30–90 days with CBT, group therapy, activity
              scheduling.
            </li>
            <li>
              6-month follow-up with psychiatrist &amp; suicide risk monitoring.
            </li>
          </ul>
        </div>

        {/* 9. Dementia */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">9. Dementia</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acute phase: reversible causes excluded, agitation managed.</li>
            <li>Maintenance: Donepezil, Rivastigmine, Memantine.</li>
            <li>
              Long-term admission with 24/7 caregiver, ADL charting, fall
              prevention.
            </li>
            <li>
              Trial discharge with caregiver training and feedback monitoring.
            </li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default RehabilitationGuidelinesPrint;
