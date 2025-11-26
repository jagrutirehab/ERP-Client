import React, { forwardRef, Fragment } from "react";

const AccountingChecklistPrint = forwardRef((props, ref) => {
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
          <h2 className="text-2xl font-semibold">Accounting Checklist</h2>
        </div>

        {/* Section A */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">A. Advance Payment</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Collect advance payment at admission as per package/bed type
            </li>
            <li>Enter details in software billing module</li>
            <li>Generate receipt with patient details and payment mode</li>
            <li>Link advance to deposit account in software</li>
          </ul>
        </div>

        {/* Section B */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">B. Deposit</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Collect and record security deposit (if applicable)</li>
            <li>Inform family about refund/adjustment policy</li>
            <li>Record deposit in software under 'Deposit Ledger'</li>
            <li>Adjust deposit amount in final bill before discharge</li>
          </ul>
        </div>

        {/* Section C */}
        <div className="mb-6">
          <h3 className="text-1.2xl font-bold mb-2">
            C. Clearance of Payment before Discharge
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Generate final bill 48 hours before discharge</li>
            <li>
              Verify inclusion of all charges (room, doctor, nursing, meds,
              diet, misc.)
            </li>
            <li>Ensure all dues cleared before giving discharge summary</li>
            <li>Generate final receipt and get family acknowledgment</li>
          </ul>
        </div>

        {/* Section D */}
        <div>
          <h3 className="text-1.2xl font-bold mb-2">
            D. Billing According to Insurance Requirements
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Collect and upload insurance card & ID at admission</li>
            <li>Confirm coverage with insurance desk/TPA</li>
            <li>Use ICD-10 coding in discharge summary</li>
            <li>
              Provide itemized bill (room, doctor, nursing, pharmacy,
              diagnostics)
            </li>
            <li>
              Get family’s signature on final bill before insurance submission
            </li>
            <li>Keep scanned copies of prescriptions, reports, invoices</li>
            <li>Submit insurance claim within stipulated time</li>
          </ul>
        </div>
      </div>
    </Fragment>
  );
});

export default AccountingChecklistPrint;
