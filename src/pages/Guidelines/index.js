import React, { useEffect } from "react";
import { Container } from "reactstrap";
import { Route, Routes, useLocation } from "react-router-dom";
import SecondaryLeftSidebar from "../../Components/Common/LeftSidebar";
import GuidelinesDashboard from "./Guidelines";
import AccountingGuidelines from "./Guidelines/AccountingGuidelines";
import AdmissionDischargeGuidelines from "./Guidelines/AdmissionDischargeGuidelines";
import EnquiryGuidelines from "./Guidelines/EnquiryGuidelines";
import HygieneGuidelines from "./Guidelines/HygieneGuidelines";
import RehabiliationGuidelines from "./Guidelines/RehabiliationGuidelines";
import BedsideNotesGuidelines from "./Guidelines/BedsideNotesGuidelines";
import Adm01VoluntaryAdmissionSOPPage from "./Guidelines/Adm-01_Voluntary_Independent_Admission_SOP";
import Adm02RejectionCriteriaSOPPage from "./Guidelines/Adm-02_Admission_Rejection_Criteria_SOP";
import Adm03LabInvestigationsSOPPage from "./Guidelines/Adm-03_Admission_Lab_Investigations_SOP";
import Adm04CapacityAssessmentSOPPage from "./Guidelines/Adm-04_Capacity_Assessment_SOP";
import Adm05EmergencyInvoluntarySOPPage from "./Guidelines/Adm-05_Emergency_Involuntary_Admission_SOP";
import Adm06ClinicalCarePathwaysSOPPage from "./Guidelines/Adm-06_Clinical_Care_Pathways_LOS_Policy";
import Wf01PsychiatristOnDutyWorkflowPage from "./Guidelines/WF-01_Psychiatrist_On_Duty_Workflow";
import Wf02StaffNurseOnDutyWorkflowPage from "./Guidelines/WF-02_Staff_Nurse_On_Duty_Workflow";
import Wf03PsychologistOnDutyWorkflowPage from "./Guidelines/WF-03_Psychologist_On_Duty_Workflow";
import Wf04MswOnDutyWorkflowPage from "./Guidelines/WF-04_MSW_On_Duty_Workflow";
import Wf05PatientAdmissionWorkflowPage from "./Guidelines/WF-05_Patient_Admission_Workflow";
import Wf06PatientDischargeWorkflowPage from "./Guidelines/WF-06_Patient_Discharge_Workflow";
import Wf07MdtMeetingWorkflowPage from "./Guidelines/WF-07_MDT_Meeting_Workflow";
import Wf08NursingInChargeWorkflowPage from "./Guidelines/WF-08_Nursing_InCharge_Shift_Handover_Workflow";
import Cl01SchizophreniaProtocolPage from "./Guidelines/CL-01_Schizophrenia_Spectrum_Disorders";
import Cl02BipolarSpectrumDisordersPage from "./Guidelines/CL-02_Bipolar_Spectrum_Disorders";
import Cl03DepressiveDisordersPage from "./Guidelines/CL-03_Depressive_Disorders";
import Cl04AnxietyDisordersPage from "./Guidelines/CL-04_Anxiety_Disorders";
import Cl05AlcoholUseDisorderWithdrawalPage from "./Guidelines/CL-05_Alcohol_Use_Disorder_Withdrawal";
import Cl06OpioidUseDisorderWithdrawalPage from "./Guidelines/CL-06_Opioid_Use_Disorder_Withdrawal";
import Cl07ADHDPage from "./Guidelines/CL-07_ADHD";
import Cl08AutismSpectrumDisorderPage from "./Guidelines/CL-08_Autism_Spectrum_Disorder";
import Cl09InsomniaDementiaElderlyPage from "./Guidelines/CL-09_Insomnia_Dementia_Elderly";
import Cl10TrichotillomaniaBFRBsPage from "./Guidelines/CL-10_Trichotillomania_BFRBs";
import Cl11AgitationManagementPage from "./Guidelines/CL-11_Agitation_Management";
import JagrutiiAgitationSOPPage from "./Guidelines/Jagrutii_Agitation_SOP";
import JagrutiiElectrolyteEmergencySOPPage from "./Guidelines/Jagrutii_Electrolyte_Emergency_SOP";
import JagrutiiViolentPatientSOPPage from "./Guidelines/Jagrutii_Violent_Patient_SOP";
import Cl12OCDPage from "./Guidelines/CL-12_OCD";
import Cl13PTSDPage from "./Guidelines/CL-13_PTSD";
import Cl14PersonalityDisordersPage from "./Guidelines/CL-14_Personality_Disorders";
import Cl15EatingDisordersPage from "./Guidelines/CL-15_Eating_Disorders";
import Cl16CannabisPolysubstancePage from "./Guidelines/CL-16_Cannabis_Polysubstance";
import Cl17ChildAdolescentPsychiatryPage from "./Guidelines/CL-17_Child_Adolescent_Psychiatry";
import Cl18GeriatricPsychiatryPage from "./Guidelines/CL-18_Geriatric_Psychiatry";
import Cl19IntellectualDisabilityNeurodevelopmentalPage from "./Guidelines/CL-19_Intellectual_Disability_Neurodevelopmental";
import Cl20FirstEpisodePsychosisPage from "./Guidelines/CL-20_First_Episode_Psychosis";
import Se01SuicideRiskPreventionPage from "./Guidelines/SE-01_Suicide_Risk_Prevention_Management";
import Se02ViolenceAggressionManagementPage from "./Guidelines/SE-02_Violence_Aggression_Management";
import Se03RestraintSeclusionGovernancePage from "./Guidelines/SE-03_Restraint_Seclusion_Governance";
import Se04MedicalEmergencyIcuEscalationPage from "./Guidelines/SE-04_Medical_Emergency_ICU_Escalation";
// import Main from "./Main";
// import PatientDetails from "./PatientDetails";

const Guidelines = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <React.Fragment>
      <div className="page-conten overflow-hidden">
        <div className="patient-page">
          <Container fluid>
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 my-n4 mb-n5 p-1">
              <SecondaryLeftSidebar
                title="Guidelines"
                items={[
                  {
                    id: "guidelines-management",
                    label: "Guidelines Management",
                    link: ".",
                    icon: "bx bx-home",
                  },
                  {
                    id: "adm-01-voluntary-admission-sop",
                    label: "Adm-01 — Voluntary Admission SOP",
                    link: "adm-01-voluntary-admission-sop",
                    icon: "bx bx-user-check", // voluntary / consent
                  },
                  {
                    id: "adm-02-rejection-criteria-sop",
                    label: "Adm-02 — Rejection & Referral Criteria SOP",
                    link: "adm-02-rejection-criteria-sop",
                    icon: "bx bx-block", // rejection / refusal
                  },
                  {
                    id: "adm-03-lab-investigations-sop",
                    label: "Adm-03 — Lab Investigations SOP",
                    link: "adm-03-lab-investigations-sop",
                    icon: "bx bx-test-tube", // labs
                  },
                  {
                    id: "adm-04-capacity-assessment-sop",
                    label: "Adm-04 — Capacity Assessment SOP",
                    link: "adm-04-capacity-assessment-sop",
                    icon: "bx bx-brain", // capacity / cognition
                  },
                  {
                    id: "adm-05-emergency-involuntary-sop",
                    label: "Adm-05 — Emergency & Involuntary Admission SOP",
                    link: "adm-05-emergency-involuntary-sop",
                    icon: "bx bx-error", // emergency
                  },
                  {
                    id: "adm-06-clinical-care-pathways-sop",
                    label: "Adm-06 — Clinical Care Pathways & LOS",
                    link: "adm-06-clinical-care-pathways-sop",
                    icon: "bx bx-git-branch", // pathways / branches
                  },
                  {
                    id: "accounting-guidelines",
                    label: "Accounting Guidelines",
                    link: "accounting-guidelines",
                    icon: "bx bx-calculator", // accounting
                  },
                  {
                    id: "admission-discharge-guidelines",
                    label: "Admission Discharge Guidelines",
                    link: "admission-discharge-guidelines",
                    icon: "bx bx-log-in-circle", // admission/discharge
                  },
                  {
                    id: "enquiry-taking-guidelines",
                    label: "Enquiry Taking Guidelines",
                    link: "enquiry-guidelines",
                    icon: "bx bx-question-mark", // enquiry
                  },
                  {
                    id: "hygiene-maintenance-guidelines",
                    label: "Hygiene Maintenance Guidelines",
                    link: "hygiene-guidelines",
                    icon: "bx bx-shield-quarter", // hygiene / protection
                  },
                  {
                    id: "rehabilitation-guidelines",
                    label: "Rehabilitation Guidelines",
                    link: "rehabilitation-guidelines",
                    icon: "bx bx-dumbbell", // rehab / physical strength
                  },
                  {
                    id: "bedside-notes-guidelines",
                    label: "Bedside Notes Guidelines",
                    link: "bedside-notes-guidelines",
                    icon: "bx bx-notepad", // notes
                  },
                  {
                    id: "wf-01-psychiatrist-on-duty-workflow",
                    label: "WF-01 Psychiatrist On-Duty Workflow",
                    link: "wf-01-psychiatrist-on-duty-workflow",
                    icon: "bx bx-user-voice",
                    category: "workflow",
                  },
                  {
                    id: "wf-02-staff-nurse-on-duty-workflow",
                    label: "WF-02 Staff Nurse On-Duty Workflow",
                    link: "wf-02-staff-nurse-on-duty-workflow",
                    icon: "bx bx-plus-medical",
                    category: "workflow",
                  },
                  {
                    id: "wf-03-psychologist-on-duty-workflow",
                    label: "WF-03 Psychologist On-Duty Workflow",
                    link: "wf-03-psychologist-on-duty-workflow",
                    icon: "bx bx-brain",
                    category: "workflow",
                  },
                  {
                    id: "wf-04-msw-on-duty-workflow",
                    label: "WF-04 MSW On-Duty Workflow",
                    link: "wf-04-msw-on-duty-workflow",
                    icon: "bx bx-group",
                    category: "workflow",
                  },
                  {
                    id: "wf-05-patient-admission-workflow",
                    label: "WF-05 Patient Admission Workflow",
                    link: "wf-05-patient-admission-workflow",
                    icon: "bx bx-user-plus",
                    category: "workflow",
                  },
                  {
                    id: "wf-06-patient-discharge-workflow",
                    label: "WF-06 Patient Discharge Workflow",
                    link: "wf-06-patient-discharge-workflow",
                    icon: "bx bx-log-out",
                    category: "workflow",
                  },
                  {
                    id: "wf-07-mdt-meeting-workflow",
                    label: "WF-07 MDT Meeting Workflow",
                    link: "wf-07-mdt-meeting-workflow",
                    icon: "bx bx-conversation",
                    category: "workflow",
                  },
                  {
                    id: "wf-08-nursing-incharge-shift-handover-workflow",
                    label: "WF-08 Nursing In-Charge Shift Handover Workflow",
                    link: "wf-08-nursing-incharge-shift-handover-workflow",
                    icon: "bx bx-transfer",
                    category: "workflow",
                  },
                  {
                    id: "cl-01-schizophrenia-spectrum-disorders",
                    label: "CL-01 Schizophrenia Spectrum Disorders",
                    link: "cl-01-schizophrenia-spectrum-disorders",
                    icon: "bx bx-brain",
                  },
                  {
                    id: "cl-02-bipolar-spectrum-disorders",
                    label: "CL-02 Bipolar Spectrum Disorders",
                    link: "cl-02-bipolar-spectrum-disorders",
                    icon: "bx bx-pulse",
                  },
                  {
                    id: "cl-03-depressive-disorders",
                    label: "CL-03 Depressive Disorders",
                    link: "cl-03-depressive-disorders",
                    icon: "bx bx-sad",
                  },
                  {
                    id: "cl-04-anxiety-disorders",
                    label: "CL-04 Anxiety Disorders",
                    link: "cl-04-anxiety-disorders",
                    icon: "bx bx-heart-circle",
                  },
                  {
                    id: "cl-05-alcohol-use-disorder-withdrawal",
                    label: "CL-05 Alcohol Use Disorder & Withdrawal",
                    link: "cl-05-alcohol-use-disorder-withdrawal",
                    icon: "bx bx-droplet",
                  },
                  {
                    id: "cl-06-opioid-use-disorder-withdrawal",
                    label: "CL-06 Opioid Use Disorder & Withdrawal",
                    link: "cl-06-opioid-use-disorder-withdrawal",
                    icon: "bx bx-capsule",
                  },
                  {
                    id: "cl-07-adhd",
                    label: "CL-07 ADHD",
                    link: "cl-07-adhd",
                    icon: "bx bx-bolt-circle",
                  },
                  {
                    id: "cl-08-autism-spectrum-disorder",
                    label: "CL-08 Autism Spectrum Disorder",
                    link: "cl-08-autism-spectrum-disorder",
                    icon: "bx bx-infinite",
                  },
                  {
                    id: "cl-09-insomnia-dementia-elderly",
                    label: "CL-09 Insomnia & Behavioural Symptoms in Elderly / Dementia",
                    link: "cl-09-insomnia-dementia-elderly",
                    icon: "bx bx-moon",
                  },
                  {
                    id: "cl-10-trichotillomania-bfrbs",
                    label: "CL-10 Trichotillomania & BFRBs",
                    link: "cl-10-trichotillomania-bfrbs",
                    icon: "bx bx-scissors",
                  },
                  {
                    id: "cl-11-agitation-management",
                    label: "CL-11 Agitation Management",
                    link: "cl-11-agitation-management",
                    icon: "bx bx-error-circle",
                  },
                  {
                    id: "cl-12-ocd",
                    label: "CL-12 Obsessive-Compulsive Disorder",
                    link: "cl-12-ocd",
                    icon: "bx bx-rotate-left",
                  },
                  {
                    id: "cl-13-ptsd",
                    label: "CL-13 PTSD & Complex PTSD",
                    link: "cl-13-ptsd",
                    icon: "bx bx-shield-x",
                  },
                  {
                    id: "cl-14-personality-disorders",
                    label: "CL-14 Personality Disorders",
                    link: "cl-14-personality-disorders",
                    icon: "bx bx-user-x",
                  },
                  {
                    id: "cl-15-eating-disorders",
                    label: "CL-15 Eating Disorders",
                    link: "cl-15-eating-disorders",
                    icon: "bx bx-dish",
                  },
                  {
                    id: "cl-16-cannabis-polysubstance",
                    label: "CL-16 Cannabis & Poly-substance Use Disorder",
                    link: "cl-16-cannabis-polysubstance",
                    icon: "bx bx-leaf",
                  },
                  {
                    id: "cl-17-child-adolescent-psychiatry",
                    label: "CL-17 Child & Adolescent Psychiatry",
                    link: "cl-17-child-adolescent-psychiatry",
                    icon: "bx bx-child",
                  },
                  {
                    id: "cl-18-geriatric-psychiatry",
                    label: "CL-18 Geriatric Psychiatry",
                    link: "cl-18-geriatric-psychiatry",
                    icon: "bx bx-user-circle",
                  },
                  {
                    id: "cl-19-intellectual-disability",
                    label: "CL-19 Intellectual Disability & Neurodevelopmental Disorders",
                    link: "cl-19-intellectual-disability",
                    icon: "bx bx-accessibility",
                  },
                  {
                    id: "cl-20-first-episode-psychosis",
                    label: "CL-20 First-Episode Psychosis",
                    link: "cl-20-first-episode-psychosis",
                    icon: "bx bx-help-circle",
                  },
                  {
                    id: "jagrutii-agitation-sop",
                    label: "Jagrutii SOP — Agitation Management",
                    link: "jagrutii-agitation-sop",
                    icon: "bx bx-file",
                  },
                  {
                    id: "jagrutii-electrolyte-emergency-sop",
                    label: "Jagrutii SOP — Electrolyte Emergency",
                    link: "jagrutii-electrolyte-emergency-sop",
                    icon: "bx bx-pulse",
                  },
                  {
                    id: "jagrutii-violent-patient-sop",
                    label: "Jagrutii SOP — Violent / Aggressive Patients",
                    link: "jagrutii-violent-patient-sop",
                    icon: "bx bx-shield-x",
                  },
                  {
                    id: "se-01-suicide-risk-prevention",
                    label: "SE-01 Suicide Risk Prevention & Management",
                    link: "se-01-suicide-risk-prevention",
                    icon: "bx bx-shield-alt-2",
                  },
                  {
                    id: "se-02-violence-aggression-management",
                    label: "SE-02 Violence & Aggression Management",
                    link: "se-02-violence-aggression-management",
                    icon: "bx bx-error-alt",
                  },
                  {
                    id: "se-03-restraint-seclusion-governance",
                    label: "SE-03 Restraint & Seclusion Governance",
                    link: "se-03-restraint-seclusion-governance",
                    icon: "bx bx-lock-alt",
                  },
                  {
                    id: "se-04-medical-emergency-icu-escalation",
                    label: "SE-04 Medical Emergency & ICU Escalation",
                    link: "se-04-medical-emergency-icu-escalation",
                    icon: "bx bx-plus-medical",
                  },
                ]}
              />
              <Routes>
                <Route index element={<GuidelinesDashboard />} />
                <Route
                  path="adm-01-voluntary-admission-sop"
                  element={<Adm01VoluntaryAdmissionSOPPage />}
                />
                <Route
                  path="adm-02-rejection-criteria-sop"
                  element={<Adm02RejectionCriteriaSOPPage />}
                />
                <Route
                  path="adm-03-lab-investigations-sop"
                  element={<Adm03LabInvestigationsSOPPage />}
                />
                <Route
                  path="adm-04-capacity-assessment-sop"
                  element={<Adm04CapacityAssessmentSOPPage />}
                />
                <Route
                  path="adm-05-emergency-involuntary-sop"
                  element={<Adm05EmergencyInvoluntarySOPPage />}
                />
                <Route
                  path="adm-06-clinical-care-pathways-sop"
                  element={<Adm06ClinicalCarePathwaysSOPPage />}
                />
                <Route
                  path={`accounting-guidelines`}
                  element={<AccountingGuidelines />}
                />
                <Route
                  path="admission-discharge-guidelines"
                  element={<AdmissionDischargeGuidelines />}
                />
                <Route
                  path="enquiry-guidelines"
                  element={<EnquiryGuidelines />}
                />
                <Route
                  path="hygiene-guidelines"
                  element={<HygieneGuidelines />}
                />
                <Route
                  path="rehabilitation-guidelines"
                  element={<RehabiliationGuidelines />}
                />
                <Route
                  path="bedside-notes-guidelines"
                  element={<BedsideNotesGuidelines />}
                />
                <Route
                  path="wf-01-psychiatrist-on-duty-workflow"
                  element={<Wf01PsychiatristOnDutyWorkflowPage />}
                />
                <Route
                  path="wf-02-staff-nurse-on-duty-workflow"
                  element={<Wf02StaffNurseOnDutyWorkflowPage />}
                />
                <Route
                  path="wf-03-psychologist-on-duty-workflow"
                  element={<Wf03PsychologistOnDutyWorkflowPage />}
                />
                <Route
                  path="wf-04-msw-on-duty-workflow"
                  element={<Wf04MswOnDutyWorkflowPage />}
                />
                <Route
                  path="wf-05-patient-admission-workflow"
                  element={<Wf05PatientAdmissionWorkflowPage />}
                />
                <Route
                  path="wf-06-patient-discharge-workflow"
                  element={<Wf06PatientDischargeWorkflowPage />}
                />
                <Route
                  path="wf-07-mdt-meeting-workflow"
                  element={<Wf07MdtMeetingWorkflowPage />}
                />
                <Route
                  path="wf-08-nursing-incharge-shift-handover-workflow"
                  element={<Wf08NursingInChargeWorkflowPage />}
                />
                <Route
                  path="cl-01-schizophrenia-spectrum-disorders"
                  element={<Cl01SchizophreniaProtocolPage />}
                />
                <Route
                  path="cl-02-bipolar-spectrum-disorders"
                  element={<Cl02BipolarSpectrumDisordersPage />}
                />
                <Route
                  path="cl-03-depressive-disorders"
                  element={<Cl03DepressiveDisordersPage />}
                />
                <Route
                  path="cl-04-anxiety-disorders"
                  element={<Cl04AnxietyDisordersPage />}
                />
                <Route
                  path="cl-05-alcohol-use-disorder-withdrawal"
                  element={<Cl05AlcoholUseDisorderWithdrawalPage />}
                />
                <Route
                  path="cl-06-opioid-use-disorder-withdrawal"
                  element={<Cl06OpioidUseDisorderWithdrawalPage />}
                />
                <Route
                  path="cl-07-adhd"
                  element={<Cl07ADHDPage />}
                />
                <Route
                  path="cl-08-autism-spectrum-disorder"
                  element={<Cl08AutismSpectrumDisorderPage />}
                />
                <Route
                  path="cl-09-insomnia-dementia-elderly"
                  element={<Cl09InsomniaDementiaElderlyPage />}
                />
                <Route
                  path="cl-10-trichotillomania-bfrbs"
                  element={<Cl10TrichotillomaniaBFRBsPage />}
                />
                <Route
                  path="cl-11-agitation-management"
                  element={<Cl11AgitationManagementPage />}
                />
                <Route
                  path="jagrutii-agitation-sop"
                  element={<JagrutiiAgitationSOPPage />}
                />
                <Route
                  path="jagrutii-electrolyte-emergency-sop"
                  element={<JagrutiiElectrolyteEmergencySOPPage />}
                />
                <Route
                  path="jagrutii-violent-patient-sop"
                  element={<JagrutiiViolentPatientSOPPage />}
                />
                <Route
                  path="cl-12-ocd"
                  element={<Cl12OCDPage />}
                />
                <Route
                  path="cl-13-ptsd"
                  element={<Cl13PTSDPage />}
                />
                <Route
                  path="cl-14-personality-disorders"
                  element={<Cl14PersonalityDisordersPage />}
                />
                <Route
                  path="cl-15-eating-disorders"
                  element={<Cl15EatingDisordersPage />}
                />
                <Route
                  path="cl-16-cannabis-polysubstance"
                  element={<Cl16CannabisPolysubstancePage />}
                />
                <Route
                  path="cl-17-child-adolescent-psychiatry"
                  element={<Cl17ChildAdolescentPsychiatryPage />}
                />
                <Route
                  path="cl-18-geriatric-psychiatry"
                  element={<Cl18GeriatricPsychiatryPage />}
                />
                <Route
                  path="cl-19-intellectual-disability"
                  element={<Cl19IntellectualDisabilityNeurodevelopmentalPage />}
                />
                <Route
                  path="cl-20-first-episode-psychosis"
                  element={<Cl20FirstEpisodePsychosisPage />}
                />
                <Route
                  path="se-01-suicide-risk-prevention"
                  element={<Se01SuicideRiskPreventionPage />}
                />
                <Route
                  path="se-02-violence-aggression-management"
                  element={<Se02ViolenceAggressionManagementPage />}
                />
                <Route
                  path="se-03-restraint-seclusion-governance"
                  element={<Se03RestraintSeclusionGovernancePage />}
                />
                <Route
                  path="se-04-medical-emergency-icu-escalation"
                  element={<Se04MedicalEmergencyIcuEscalationPage />}
                />
              </Routes>
            </div>
          </Container>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Guidelines;
