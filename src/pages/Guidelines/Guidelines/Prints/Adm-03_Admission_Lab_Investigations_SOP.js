import React, { forwardRef, Fragment } from "react";

const tableCellStyle = { border: "1px solid #6c757d", padding: "6px 10px", verticalAlign: "top" };
const tableHeadStyle = { ...tableCellStyle, background: "#f1f3f5", fontWeight: "bold" };
const warnStyle = {
  background: "#fff5f5",
  borderLeft: "4px solid #dc3545",
  padding: "10px 12px",
  margin: "12px 0",
};

const Adm03LabInvestigationsSOP = forwardRef((props, ref) => {
  return (
    <Fragment>
      <div ref={ref} className={`${props.classnames} px-6 py-10 absolute -z-10`}>
        <div className={`${props.heading} mb-4`}>
          <h1 className="text-3xl m-auto text-center font-extrabold mb-2">
            JAGRUTII REHAB CENTRE PVT. LTD.
          </h1>
          <p className="text-center mb-3">
            Clinical Excellence Framework — Standard Operating Procedure
          </p>
          <h2 className="text-2xl font-semibold text-center mb-1">
            Admission Laboratory Investigations SOP
          </h2>
          <p className="text-center text-muted">
            Adm-03 | Version 1.0 | Effective: 01 June 2026
          </p>
        </div>

        <table className="w-100 mb-4" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
          <tbody>
            <tr>
              <td style={tableHeadStyle}>Doc ID</td><td style={tableCellStyle}>Adm-03</td>
              <td style={tableHeadStyle}>Version</td><td style={tableCellStyle}>1.0</td>
            </tr>
            <tr>
              <td style={tableHeadStyle}>Effective Date</td><td style={tableCellStyle}>01 June 2026</td>
              <td style={tableHeadStyle}>Review Date</td><td style={tableCellStyle}>31 May 2027</td>
            </tr>
            <tr>
              <td style={tableHeadStyle}>Author</td><td style={tableCellStyle}>Medical Team</td>
              <td style={tableHeadStyle}>Approved By</td><td style={tableCellStyle}>Medical Director</td>
            </tr>
            <tr>
              <td style={tableHeadStyle}>Department</td><td style={tableCellStyle} colSpan="3">Clinical / Nursing / Laboratory</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>1. Purpose</h3>
          <p>
            This SOP establishes a standardised protocol for admission laboratory investigations at Jagrutii
            Rehab Centre, ensuring safe, evidence-based, and comprehensive baseline assessment for all patients
            across Psychiatry, Geriatric (above 50 years), and De-addiction programmes.
          </p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>2. Scope</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All newly admitted patients at Jagrutii Rehab Centre</li>
            <li>Applies to: Psychiatry patients (all ages ≤50 years), Elderly patients (&gt;50 years), De-addiction patients</li>
            <li>Responsible staff: Admitting physician, Nursing staff, Laboratory technician</li>
          </ul>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>3. Psychiatry Patients (Age ≤ 50 Years) — Admission Labs</h3>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>3.1 Routine Panel</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Investigation</th><th style={tableHeadStyle}>Purpose / Rationale</th><th style={tableHeadStyle}>Priority</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Complete Blood Count (CBC)</td><td style={tableCellStyle}>Detect anaemia, infection, thrombocytopenia</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Blood Glucose (Fasting &amp; Random)</td><td style={tableCellStyle}>Diabetes screening; baseline for antipsychotics</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Urine Routine &amp; Microscopy</td><td style={tableCellStyle}>UTI, renal pathology</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Thyroid Function Test (TSH)</td><td style={tableCellStyle}>Thyroid-induced mood/psychosis</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>HIV, HBsAg, HCV (with consent)</td><td style={tableCellStyle}>Infection screening; stigma-sensitive</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>ECG (12-lead)</td><td style={tableCellStyle}>QTc prolongation (antipsychotics/antidepressants)</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Liver Function Tests (LFT)</td><td style={tableCellStyle}>Hepatotoxicity risk assessment</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Renal Function Tests (RFT / KFT)</td><td style={tableCellStyle}>Renal clearance for drug dosing</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Serum Electrolytes (Na, K, Cl)</td><td style={tableCellStyle}>Correct electrolyte imbalances</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Lipid Profile</td><td style={tableCellStyle}>Metabolic baseline for antipsychotics</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Serum Calcium &amp; Phosphorus</td><td style={tableCellStyle}>Metabolic/psychiatric overlap</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>VDRL / RPR (Syphilis)</td><td style={tableCellStyle}>Neurosyphilis presenting as psychosis</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Serum B12 &amp; Folate</td><td style={tableCellStyle}>Deficiency causing psychiatric symptoms</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Serum Prolactin (if on antipsychotics)</td><td style={tableCellStyle}>Antipsychotic-induced hyperprolactinaemia</td><td style={tableCellStyle}>Selective</td></tr>
              <tr><td style={tableCellStyle}>Urine Drug Screen (UDS)</td><td style={tableCellStyle}>Substance-induced psychiatric symptoms</td><td style={tableCellStyle}>Selective</td></tr>
              <tr><td style={tableCellStyle}>Chest X-Ray (PA view)</td><td style={tableCellStyle}>Pulmonary baseline, TB screening</td><td style={tableCellStyle}>Selective</td></tr>
            </tbody>
          </table>
          <p className="text-muted mt-2"><em>⚠ UDS and VDRL to be done selectively based on clinical history and presentation.</em></p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>4. Elderly Patients (Age &gt; 50 Years) — Admission Labs</h3>
          <p><em>All investigations in Section 3 apply, PLUS the following additional tests mandatory for elderly patients:</em></p>
          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>4.1 Additional / Enhanced Panel for Elderly</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Investigation</th><th style={tableHeadStyle}>Rationale (Elderly Specific)</th><th style={tableHeadStyle}>Priority</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>HbA1c</td><td style={tableCellStyle}>Long-term glycaemic control; undiagnosed T2DM</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>KFT, Electrolytes</td><td style={tableCellStyle}>Gout risk; renal burden</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Serum Magnesium</td><td style={tableCellStyle}>Arrhythmia, neuromuscular symptoms</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>LFT, Coagulation Profile (PT/INR, aPTT)</td><td style={tableCellStyle}>Bleeding risk; polypharmacy anticoagulants</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Serum Vitamin D (25-OH)</td><td style={tableCellStyle}>Deficiency in elderly; fracture/cognitive risk</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Serum Albumin</td><td style={tableCellStyle}>Nutritional status; drug protein binding</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Falls Risk Assessment (TUG Test)</td><td style={tableCellStyle}>Mobility, polypharmacy risk</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Mini-Mental State Exam (MMSE / MoCA)</td><td style={tableCellStyle}>Cognitive baseline screening</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Bone Profile (ALP, Ca, Ph)</td><td style={tableCellStyle}>Osteoporosis/Paget's disease screen</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Echocardiogram (2D Echo)</td><td style={tableCellStyle}>Cardiac function before psychotropics</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>PSA (Males &gt;50)</td><td style={tableCellStyle}>Prostate pathology; anticholinergic drugs</td><td style={tableCellStyle}>Selective</td></tr>
              <tr><td style={tableCellStyle}>Brain CT / MRI (if cognitive decline)</td><td style={tableCellStyle}>Dementia, vascular lesions, space-occupying lesions</td><td style={tableCellStyle}>Selective</td></tr>
              <tr><td style={tableCellStyle}>Ophthalmology / Hearing referral</td><td style={tableCellStyle}>Sensory deficits masking psychiatric symptoms</td><td style={tableCellStyle}>Recommended</td></tr>
            </tbody>
          </table>
          <p className="text-muted mt-2"><em>⚠ For patients on multiple medications, renal and hepatic panels should be repeated at Day 7 and Day 30.</em></p>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>5. De-addiction Patients — Admission Labs</h3>
          <p>De-addiction admissions require targeted investigations based on the primary substance(s) of abuse. All routine psychiatric labs (Section 3) apply plus the following substance-specific additions:</p>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.1 Universal De-addiction Panel (All Substances)</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Investigation</th><th style={tableHeadStyle}>Rationale</th><th style={tableHeadStyle}>Priority</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Urine Drug Screen (UDS) — Multi-panel</td><td style={tableCellStyle}>Confirm substance(s); poly-drug use detection</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>LFT + GGT + ALP</td><td style={tableCellStyle}>Alcohol-induced hepatic damage</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Serum B12, Folate, Thiamine (B1)</td><td style={tableCellStyle}>Wernicke's prevention; deficiency in alcohol use</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>RFT / Creatinine / eGFR</td><td style={tableCellStyle}>Renal compromise (opioids, NSAIDs misuse)</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Prothrombin Time / INR</td><td style={tableCellStyle}>Hepatic synthetic function in alcohol dependence</td><td style={tableCellStyle}>Mandatory</td></tr>
              <tr><td style={tableCellStyle}>Blood Alcohol Level (BAL)</td><td style={tableCellStyle}>Quantify alcohol level on admission</td><td style={tableCellStyle}>Selective</td></tr>
              <tr><td style={tableCellStyle}>Chest X-Ray (PA view)</td><td style={tableCellStyle}>TB, aspiration pneumonia</td><td style={tableCellStyle}>Recommended</td></tr>
              <tr><td style={tableCellStyle}>Serum Amylase &amp; Lipase</td><td style={tableCellStyle}>Pancreatitis (alcohol, opioids)</td><td style={tableCellStyle}>Recommended</td></tr>
            </tbody>
          </table>

          <h4 className="font-semibold mt-3 mb-1" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>5.2 Substance-Specific Additional Tests</h4>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Substance</th><th style={tableHeadStyle}>Additional Investigations</th><th style={tableHeadStyle}>Rationale</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Alcohol</td><td style={tableCellStyle}>SGOT:SGPT ratio, Serum GGT, Ammonia, Bilirubin, Ultrasound Abdomen</td><td style={tableCellStyle}>Cirrhosis, hepatic encephalopathy, portal hypertension</td></tr>
              <tr><td style={tableCellStyle}>Opioids (Heroin / Prescription)</td><td style={tableCellStyle}>Serum CK (CPK), Myoglobin, Urine myoglobin, Methadone level if applicable</td><td style={tableCellStyle}>Rhabdomyolysis, nephrotoxicity, opioid level monitoring</td></tr>
              <tr><td style={tableCellStyle}>Stimulants (Cocaine / Amphetamines)</td><td style={tableCellStyle}>Cardiac enzymes (Troponin, CK-MB), 2D Echo, BP monitoring chart</td><td style={tableCellStyle}>Stimulant cardiomyopathy, MI, hypertensive emergency</td></tr>
              <tr><td style={tableCellStyle}>Cannabis</td><td style={tableCellStyle}>Serum Testosterone (males), Serum Prolactin, Neuropsychological assessment</td><td style={tableCellStyle}>HPPD, psychosis risk, hormonal disruption</td></tr>
              <tr><td style={tableCellStyle}>Benzodiazepines / Sedatives</td><td style={tableCellStyle}>EEG (if seizure history), Serum drug levels if available</td><td style={tableCellStyle}>Withdrawal seizure risk, polysubstance CNS depression</td></tr>
              <tr><td style={tableCellStyle}>Tobacco / Nicotine</td><td style={tableCellStyle}>Spirometry (PFT), Chest X-Ray, Cotinine levels (selective)</td><td style={tableCellStyle}>COPD, lung function baseline</td></tr>
              <tr><td style={tableCellStyle}>Inhalants / Solvents</td><td style={tableCellStyle}>Serum Lead, Urine heavy metals, ABG, Nerve conduction study</td><td style={tableCellStyle}>Neurotoxicity, renal tubular acidosis, peripheral neuropathy</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>6. Repeat Lab Monitoring Schedule</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Patient Category</th><th style={tableHeadStyle}>Repeat Interval</th><th style={tableHeadStyle}>Tests Repeated</th><th style={tableHeadStyle}>Trigger for Urgent Repeat</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>All admissions</td><td style={tableCellStyle}>Day 7</td><td style={tableCellStyle}>CBC, RFT, LFT, Electrolytes</td><td style={tableCellStyle}>If required, medication changes, adverse effects</td></tr>
              <tr><td style={tableCellStyle}>All admissions</td><td style={tableCellStyle}>Day 30</td><td style={tableCellStyle}>Full metabolic panel</td><td style={tableCellStyle}>Clinical deterioration</td></tr>
              <tr><td style={tableCellStyle}>Elderly (&gt;50 yrs)</td><td style={tableCellStyle}>Day 7 &amp; Day 14</td><td style={tableCellStyle}>RFT, Electrolytes, Coag profile</td><td style={tableCellStyle}>Falls, confusion, dehydration</td></tr>
              <tr><td style={tableCellStyle}>De-addiction — Alcohol</td><td style={tableCellStyle}>Daily (Days 1–5)</td><td style={tableCellStyle}>BAL, Electrolytes, Thiamine, LFT</td><td style={tableCellStyle}>Withdrawal seizure, delirium tremens</td></tr>
              <tr><td style={tableCellStyle}>De-addiction — Opioids</td><td style={tableCellStyle}>Day 3, Day 7</td><td style={tableCellStyle}>CBC, RFT, LFT, CK</td><td style={tableCellStyle}>Signs of rhabdomyolysis</td></tr>
              <tr><td style={tableCellStyle}>On antipsychotics</td><td style={tableCellStyle}>Monthly</td><td style={tableCellStyle}>Prolactin, Lipids, Blood Glucose</td><td style={tableCellStyle}>Weight gain, galactorrhoea, EPS</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>7. Responsibilities</h3>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Role</th><th style={tableHeadStyle}>Responsibility</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Psychiatrist</td><td style={tableCellStyle}>Order all mandatory labs within 2 hours of admission; review results within 24 hours</td></tr>
              <tr><td style={tableCellStyle}>Nursing Staff</td><td style={tableCellStyle}>Collect samples correctly labelled; ensure fasting status where required; document in EMR</td></tr>
              <tr><td style={tableCellStyle}>Laboratory Technician</td><td style={tableCellStyle}>Process samples; flag critical values immediately to the treating physician</td></tr>
              <tr><td style={tableCellStyle}>Medical Director</td><td style={tableCellStyle}>Review high-risk results (HIV, severely deranged values); update SOP annually</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>8. Critical Lab Values — Immediate Action Required</h3>
          <div style={warnStyle}>
            ⚠ Any critical value must be verbally communicated to the treating physician within 15 minutes of result.
          </div>
          <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            <thead>
              <tr><th style={tableHeadStyle}>Parameter</th><th style={tableHeadStyle}>Critical Threshold</th><th style={tableHeadStyle}>Immediate Action</th></tr>
            </thead>
            <tbody>
              <tr><td style={tableCellStyle}>Blood Glucose</td><td style={tableCellStyle}>&lt;50 or &gt;500 mg/dL</td><td style={tableCellStyle}>IV glucose / Insulin protocol; notify physician stat</td></tr>
              <tr><td style={tableCellStyle}>Serum Potassium</td><td style={tableCellStyle}>&lt;2.5 or &gt;6.5 mEq/L</td><td style={tableCellStyle}>IV correction; cardiac monitoring</td></tr>
              <tr><td style={tableCellStyle}>Serum Sodium</td><td style={tableCellStyle}>&lt;120 or &gt;160 mEq/L</td><td style={tableCellStyle}>Fluid management; neurology consult</td></tr>
              <tr><td style={tableCellStyle}>Haemoglobin</td><td style={tableCellStyle}>&lt;7 g/dL</td><td style={tableCellStyle}>Transfusion assessment; iron studies</td></tr>
              <tr><td style={tableCellStyle}>INR</td><td style={tableCellStyle}>&gt;3.0 (not on anticoagulants)</td><td style={tableCellStyle}>Hepatology review; hold hepatotoxic drugs</td></tr>
              <tr><td style={tableCellStyle}>Creatinine</td><td style={tableCellStyle}>&gt;3.0 mg/dL</td><td style={tableCellStyle}>Nephrology consult; review drug doses</td></tr>
              <tr><td style={tableCellStyle}>ALT / AST</td><td style={tableCellStyle}>&gt;5x Upper Normal Limit</td><td style={tableCellStyle}>Hold hepatotoxic medications; hepatology review</td></tr>
              <tr><td style={tableCellStyle}>Blood Alcohol Level</td><td style={tableCellStyle}>&gt;300 mg/dL</td><td style={tableCellStyle}>ICU monitoring; aspiration precautions</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6" style={{ marginBottom: "2rem" }}>
          <h3 className="text-1.2xl font-bold mb-2" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>9. Documentation &amp; Compliance</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All investigations must be ordered and documented in the patient's Electronic Medical Record (EMR) / Case Sheet at the time of admission.</li>
            <li>Lab results must be filed in the patient's record and reviewed/signed by the treating physician.</li>
            <li>Consent for HIV, HBsAg, HCV testing must be obtained and documented separately as per NACO guidelines.</li>
            <li>Any deferred or refused investigations to be documented with reason and patient/guardian signature.</li>
            <li>Monthly audit of admission lab compliance to be reviewed at the Clinical Quality Committee meeting.</li>
          </ul>
        </div>

        <p className="text-muted text-center" style={{ fontSize: "0.85rem" }}>
          Jagrutii Rehab Centre Pvt. Ltd. | Adm-03 Admission Labs SOP | Version 1.0 | Confidential — Internal Use Only
        </p>
      </div>
    </Fragment>
  );
});

export default Adm03LabInvestigationsSOP;
