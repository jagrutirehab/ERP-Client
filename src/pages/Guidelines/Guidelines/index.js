import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AccountingChecklistPrint from "./Prints/AccountingPrint";
import AdmissionDischargePrint from "./Prints/AdmissionDischargePrint";
import EnquiryTakingPrint from "./Prints/EnquiryPrint";
import Guideline from "./Guideline";
import HygieneMaintenancePrint from "./Prints/HygienePrint";
import RehabilitationGuidelinesPrint from "./Prints/RehabPrint";
import BedsideNotesPrint from "./Prints/BedsideNotesPrint";
import Adm01VoluntaryAdmissionSOP from "./Prints/Adm-01_Voluntary_Independent_Admission_SOP";
import Adm02RejectionCriteriaSOP from "./Prints/Adm-02_Admission_Rejection_Criteria_SOP";
import Adm03LabInvestigationsSOP from "./Prints/Adm-03_Admission_Lab_Investigations_SOP";
import Adm04CapacityAssessmentSOP from "./Prints/Adm-04_Capacity_Assessment_SOP";
import Adm05EmergencyInvoluntarySOP from "./Prints/Adm-05_Emergency_Involuntary_Admission_SOP";
import Adm06ClinicalCarePathwaysSOP from "./Prints/Adm-06_Clinical_Care_Pathways_LOS_Policy";
import Wf01PsychiatristOnDutyWorkflow from "./Prints/WF-01_Psychiatrist_On_Duty_Workflow";
import Wf02StaffNurseOnDutyWorkflow from "./Prints/WF-02_Staff_Nurse_On_Duty_Workflow";
import Wf03PsychologistOnDutyWorkflow from "./Prints/WF-03_Psychologist_On_Duty_Workflow";
import Wf04MswOnDutyWorkflow from "./Prints/WF-04_MSW_On_Duty_Workflow";
import Wf05PatientAdmissionWorkflow from "./Prints/WF-05_Patient_Admission_Workflow";
import Wf06PatientDischargeWorkflow from "./Prints/WF-06_Patient_Discharge_Workflow";
import Wf07MdtMeetingWorkflow from "./Prints/WF-07_MDT_Meeting_Workflow";
import Wf08NursingInChargeWorkflow from "./Prints/WF-08_Nursing_InCharge_Shift_Handover_Workflow";
import Cl01SchizophreniaProtocol from "./Prints/CL-01_Schizophrenia_Spectrum_Disorders";
import Cl02BipolarSpectrumDisorders from "./Prints/CL-02_Bipolar_Spectrum_Disorders";
import Cl03DepressiveDisorders from "./Prints/CL-03_Depressive_Disorders";
import Cl04AnxietyDisorders from "./Prints/CL-04_Anxiety_Disorders";
import Cl05AlcoholUseDisorderWithdrawal from "./Prints/CL-05_Alcohol_Use_Disorder_Withdrawal";
import Cl06OpioidUseDisorderWithdrawal from "./Prints/CL-06_Opioid_Use_Disorder_Withdrawal";
import Cl07ADHD from "./Prints/CL-07_ADHD";
import Cl08AutismSpectrumDisorder from "./Prints/CL-08_Autism_Spectrum_Disorder";
import Cl09InsomniaDementiaElderly from "./Prints/CL-09_Insomnia_Dementia_Elderly";
import Cl10TrichotillomaniaBFRBs from "./Prints/CL-10_Trichotillomania_BFRBs";
import Cl11AgitationManagement from "./Prints/CL-11_Agitation_Management";
import JagrutiiAgitationSOP from "./Prints/Jagrutii_Agitation_SOP";
import JagrutiiElectrolyteEmergencySOP from "./Prints/Jagrutii_Electrolyte_Emergency_SOP";
import JagrutiiViolentPatientSOP from "./Prints/Jagrutii_Violent_Patient_SOP";
import Cl12OCD from "./Prints/CL-12_OCD";
import Cl13PTSD from "./Prints/CL-13_PTSD";
import Cl14PersonalityDisorders from "./Prints/CL-14_Personality_Disorders";
import Cl15EatingDisorders from "./Prints/CL-15_Eating_Disorders";
import Cl16CannabisPolysubstance from "./Prints/CL-16_Cannabis_Polysubstance";
import Cl17ChildAdolescentPsychiatry from "./Prints/CL-17_Child_Adolescent_Psychiatry";
import Cl18GeriatricPsychiatry from "./Prints/CL-18_Geriatric_Psychiatry";
import Cl19IntellectualDisabilityNeurodevelopmental from "./Prints/CL-19_Intellectual_Disability_Neurodevelopmental";
import Cl20FirstEpisodePsychosis from "./Prints/CL-20_First_Episode_Psychosis";
import Se01SuicideRiskPrevention from "./Prints/SE-01_Suicide_Risk_Prevention_Management";
import Se02ViolenceAggressionManagement from "./Prints/SE-02_Violence_Aggression_Management";
import Se03RestraintSeclusionGovernance from "./Prints/SE-03_Restraint_Seclusion_Governance";
import Se04MedicalEmergencyIcuEscalation from "./Prints/SE-04_Medical_Emergency_ICU_Escalation";
import Cc07EctGovernanceSOP from "./Prints/CC-07_ECT_Governance_SOP";
import JagrutiiAlcoholWithdrawalProtocolV2 from "./Prints/Jagruti_Alcohol_Withdrawal_Protocol_V2";
import PsCl01PPolysubstanceUseDisorder from "./Prints/PS-CL-01-P_Polysubstance_Use_Disorder";
import PsCl01CPolysubstanceCounsellingProgramme from "./Prints/PS-CL-01-C_Polysubstance_Counselling_Programme";
import SczCl01PSchizophreniaPharmacological from "./Prints/SCZ-CL-01-P_Schizophrenia_Pharmacological";
import Cl05CAlcoholCounsellingProgramme from "./Prints/CL-05-C_Alcohol_Counselling_Programme";
import Cl05PAlcoholPharmacological from "./Prints/CL-05-P_Alcohol_Pharmacological";
import SczCl01CSchizophreniaRehabilitation from "./Prints/SCZ-CL-01-C_Schizophrenia_Rehabilitation";
import Select from "react-select";

const guidelines = [
  {
    id: 1,
    name: "Adm-01 — Voluntary (Independent) Admission SOP",
    description:
      "Mandatory clinical, legal, and administrative procedure for admitting a patient under Independent (Voluntary) Admission per MHCA 2017 Sections 86 & 87 — informed consent, capacity assessment, patient rights, and EMR gate checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — MHCA",
    print: Adm01VoluntaryAdmissionSOP,
    link: "adm-01-voluntary-admission-sop",
    category: "admission",
  },
  {
    id: 2,
    name: "Adm-02 — Admission Rejection & Referral Criteria SOP",
    description:
      "Evidence-informed criteria for refusing admission to JRCPL facilities and the protocol for safe referral of rejected patients to appropriate medical facilities — covers clinical instability, medical risk, de-addiction, geriatric, and administrative grounds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Triage — Safety",
    print: Adm02RejectionCriteriaSOP,
    link: "adm-02-rejection-criteria-sop",
    category: "admission",
  },
  {
    id: 3,
    name: "Adm-03 — Admission Laboratory Investigations SOP",
    description:
      "Standardised admission lab protocol for Psychiatry (≤50), Elderly (>50), and De-addiction patients — routine panels, age- and substance-specific add-ons, repeat monitoring schedule, and critical-value action thresholds.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Admission — Investigations",
    print: Adm03LabInvestigationsSOP,
    link: "adm-03-lab-investigations-sop",
    category: "admission",
  },
  {
    id: 4,
    name: "Adm-04 — Decision-Making Capacity Assessment SOP",
    description:
      "Step-by-step procedure for assessing, documenting, and acting on decision-making capacity under MHCA 2017 Section 4 — the four-point test, NR identification, admission classification, mandatory reassessment, and prohibited actions.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Governance — MHCA",
    print: Adm04CapacityAssessmentSOP,
    link: "adm-04-capacity-assessment-sop",
    category: "admission",
  },
  {
    id: 5,
    name: "Adm-05 — Emergency & Involuntary Admission SOP",
    description:
      "Complete framework for emergency and involuntary (supported) admissions under MHCA 2017 — 72-hour Emergency Admission Certificate, Sec. 89 supported, Sec. 90 dual-psychiatrist involuntary, MHRB compliance timeline, and restraint legal boundaries.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Emergency — MHCA",
    print: Adm05EmergencyInvoluntarySOP,
    link: "adm-05-emergency-involuntary-sop",
    category: "admission",
  },
  {
    id: 6,
    name: "Adm-06 — Clinical Care Pathways, Programme Duration & LOS Policy",
    description:
      "Authoritative reference for all six clinical programmes — Acute Psychiatric, Psychiatric Rehab, Alcohol De-Addiction, Drug De-Addiction, Elderly/Dementia, and End of Life — with standard duration, phase structure, outcome milestones, and cross-programme governance.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Programme — LOS",
    print: Adm06ClinicalCarePathwaysSOP,
    link: "adm-06-clinical-care-pathways-sop",
    category: "admission",
  },
  {
    id: 7,
    name: "Accounting Guidelines",
    description:
      "Accounting Guidelines are a set of rules and procedures that guide the accounting process in a business. They ensure that the financial records are accurate and compliant with the relevant laws and regulations.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Accounting",
    print: AccountingChecklistPrint,
    link: "accounting-guidelines",
    category: "general",
  },
  {
    id: 8,
    name: "Admission Discharge Guidelines",
    description:
      "Admission Discharge Guidelines are a set of rules and procedures that guide the admission and discharge process in a business. They ensure that the patient is admitted and discharged in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Admission Discharge",
    print: AdmissionDischargePrint,
    link: "admission-discharge-guidelines",
    category: "general",
  },
  {
    id: 9,
    name: "Enquiry Taking Guidelines",
    description:
      "Enquiry Taking Guidelines are a set of rules and procedures that guide the enquiry taking process in a business. They ensure that the enquiry is taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Enquiry",
    print: EnquiryTakingPrint,
    link: "enquiry-guidelines",
    category: "general",
  },
  {
    id: 10,
    name: "Hygiene Maintenance Guidelines",
    description:
      "Hygiene Maintenance Guidelines are a set of rules and procedures that guide the hygiene maintenance process in a business. They ensure that the hygiene is maintained in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Hygiene Maintenance",
    print: HygieneMaintenancePrint,
    link: "hygiene-guidelines",
    category: "general",

  },
  {
    id: 11,
    name: "Rehabilitation Guidelines",
    description:
      "Rehabilitation Guidelines are a set of rules and procedures that guide the rehabilitation process in a business. They ensure that the rehabilitation is done in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Rehabilitation",
    print: RehabilitationGuidelinesPrint,
    link: "rehabilitation-guidelines",
    category: "general",
  },
  {
    id: 12,
    name: "Bedside Notes Guidelines",
    description:
      "Bedside Notes Guidelines are a set of rules and procedures that guide the bedside notes process in a business. They ensure that the bedside notes are taken in a safe and compliant manner.",
    lastUpdated: "January 15, 2024",
    status: "Active",
    type: "Bedside Notes",
    print: BedsideNotesPrint,
    link: "bedside-notes-guidelines",
    category: "general",
  },
  {
    id: 13,
    name: "WF-01 — Psychiatrist On Duty Workflow",
    description:
      "Start-of-duty sequence, 7 leadership standards (decision-making, staff education, behavioural safety, documentation, error correction, MDT leadership, system safety), and end-of-duty sign-off checklist for psychiatrists, senior residents, and medical officers.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf01PsychiatristOnDutyWorkflow,
    link: "wf-01-psychiatrist-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 14,
    name: "WF-02 — Staff Nurse On-Duty Workflow",
    description:
      "Eight-step shift-start sequence, core duties covering observation levels, five-rights medication, vitals thresholds, injection register, I/O charts, physical care, and restraint, plus end-of-shift SBAR handover checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf02StaffNurseOnDutyWorkflow,
    link: "wf-02-staff-nurse-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 15,
    name: "WF-03 — Psychologist On-Duty Workflow",
    description:
      "Eight-step pre-session preparation, core duty streams (individual therapy, group therapy, assessment, family counselling, intake, supervision) with same-day documentation requirements, and end-of-duty sign-off for psychologists and counsellors.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf03PsychologistOnDutyWorkflow,
    link: "wf-03-psychologist-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 16,
    name: "WF-04 — MSW On-Duty Workflow",
    description:
      "Eight-step start-of-duty preparation, core duty streams (social assessment, family counselling, discharge planning, community linkage, legal/financial aid, intake, patient advocacy), and end-of-duty documentation checklist for medical social workers.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf04MswOnDutyWorkflow,
    link: "wf-04-msw-on-duty-workflow",
    category: "workflow",
  },
  {
    id: 17,
    name: "WF-05 — Patient Admission Workflow",
    description:
      "Five-stage admission protocol: triage, clinical assessment (MSE, capacity, risk, legal basis), consent and registration, ward orientation, and post-admission milestones — with documentation gate checklist per MHCA 2017 and NABH ACC.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf05PatientAdmissionWorkflow,
    link: "wf-05-patient-admission-workflow",
    category: "workflow",
  },
  {
    id: 18,
    name: "WF-06 — Patient Discharge Workflow",
    description:
      "Five-stage discharge process: planning (5–7 days prior), clinical clearance, documentation (summary, CCP, relapse plan), financial clearance, and post-discharge MSW follow-up — with discharge-type definitions and documentation gate checklist.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf06PatientDischargeWorkflow,
    link: "wf-06-patient-discharge-workflow",
    category: "workflow",
  },
  {
    id: 19,
    name: "WF-07 — MDT Meeting Workflow",
    description:
      "Weekly MDT structure: quorum requirements, mandatory attendees, 7-item standing agenda (new admissions, high-risk, treatment review, discharge, incidents, legal/family, documentation gaps), before/during/after workflow, and key standards with audit indicators.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf07MdtMeetingWorkflow,
    link: "wf-07-mdt-meeting-workflow",
    category: "workflow",
  },
  {
    id: 20,
    name: "WF-08 — Nursing In-Charge Shift Handover Workflow",
    description:
      "Four-stage accountability framework: shift start (NDPS count, observation levels, team brief), SBAR handover format, during-shift governance (observation, medication, vitals, restraint, incidents, registers), and shift-end checklist — with dual escalation triggers and audit standards.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Workflow",
    print: Wf08NursingInChargeWorkflow,
    link: "wf-08-nursing-incharge-shift-handover-workflow",
    category: "workflow",
  },
  {
    id: 21,
    name: "CL-01 — Schizophrenia Spectrum Disorders",
    description:
      "10-module treatment protocol covering admission assessment (PANSS/BPRS), MDT treatment planning, pharmacological management (antipsychotics, clozapine monitoring), psychosocial interventions, nursing care, emergency management, documentation standards, discharge criteria, rehabilitation, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl01SchizophreniaProtocol,
    link: "cl-01-schizophrenia-spectrum-disorders",
    category: "clinical sops",
  },
  {
    id: 22,
    name: "CL-02 — Bipolar Spectrum Disorders",
    description:
      "Evidence-based protocol for Bipolar I/II, Cyclothymia, and Schizoaffective (bipolar type) covering diagnostic classification, admission assessment (YMRS/HAM-D/C-SSRS), baseline investigations with alert thresholds, episode phase identification, pharmacological management (mania, bipolar depression, lithium toxicity), psychological interventions (acute Phase A and recovery Phase B), discharge criteria, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl02BipolarSpectrumDisorders,
    link: "cl-02-bipolar-spectrum-disorders",
    category: "clinical sops",
  },
  {
    id: 23,
    name: "CL-03 — Depressive Disorders",
    description:
      "Evidence-based protocol for MDD and recurrent depression covering severity grading (PHQ-9/HAM-D), pharmacological management by severity (SSRI/SNRI/TCA, augmentation, ECT indications), psychotherapy protocol (CBT, BA, IPT, family psychoeducation), monitoring phases, rehabilitation, discharge criteria, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl03DepressiveDisorders,
    link: "cl-03-depressive-disorders",
    category: "clinical sops",
  },
  {
    id: 24,
    name: "CL-04 — Anxiety Disorders",
    description:
      "Comprehensive 14-section protocol for GAD, Panic Disorder, Social Anxiety, Specific Phobia, and Agoraphobia — covering diagnostic classification, screening battery, medical rule-outs, differential diagnosis, disorder-specific pharmacotherapy and CBT models (Clark's panic model, Clark-Wells SAD model), comorbidity management, monitoring, psychotherapy delivery standards, safety monitoring, discharge criteria, relapse prevention plan, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl04AnxietyDisorders,
    link: "cl-04-anxiety-disorders",
    category: "clinical sops",
  },
  {
    id: 25,
    name: "CL-05 — Alcohol Use Disorder & Withdrawal",
    description:
      "Inpatient alcohol withdrawal protocol covering admission assessment, mandatory baseline investigations with alert thresholds, 10-day fixed-dose Chlordiazepoxide (CDZ) taper, antiepileptics, general medicines, hepatic encephalopathy management, post-withdrawal maintenance (days 10–45), discharge prescription, elderly dose adjustments (age ≥ 60), and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl05AlcoholUseDisorderWithdrawal,
    link: "cl-05-alcohol-use-disorder-withdrawal",
    category: "clinical sops",
  },
  {
    id: 53,
    name: "CL-05-C — Counselling & Psychosocial Programme: Alcohol De-Addiction",
    description:
      "12-Day Detox Phase + 33-Day Therapeutic Phase (45 Days Total | 5 Clinical Phases) — core therapeutic modalities (MET, CBT, MBRP, 12-Step, FST, MGRP, NT, DBT, OT, PSE), MDT counselling roles, standard daily routine, day-by-day counselling schedule across all 45 days, 9-session family programme, outcome measurement schedule (AUDIT, CAGE, PACS, PHQ-9, GAD-7, URICA, WHO-5), documentation requirements, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "De-Addiction Protocol",
    print: Cl05CAlcoholCounsellingProgramme,
    link: "cl-05-c-alcohol-counselling-programme",
    category: "clinical sops",
  },
  {
    id: 54,
    name: "CL-05-P — Pharmacological Protocol: Alcohol Withdrawal & De-Addiction Management",
    description:
      "12-Day Extended Detox + Post-Withdrawal Maintenance (Days 13–45) — admission assessment (intoxicated state, baseline investigations), CDZ fixed-dose taper (standard adult & elderly ≥ 60 yrs), CIWA-Ar guided PRN protocol, antiepileptics (Levetiracetam/Carbamazepine), general/supportive medicines (Thiamine IV mandatory, B-Plex, Magnesium, Pantoprazole, Udiliv, IV Fluids), hepatic encephalopathy protocol (Rifagut, Duphalac, Lornit), post-withdrawal maintenance (Acamprosate, Topiramate, Baclofen, Naltrexone, Gabapentin, SSRI), discharge prescription (Disulfiram consent requirement), monitoring schedule, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "De-Addiction Protocol",
    print: Cl05PAlcoholPharmacological,
    link: "cl-05-p-alcohol-pharmacological",
    category: "clinical sops",
  },
  {
    id: 26,
    name: "CL-06 — Opioid Use Disorder & Withdrawal",
    description:
      "Inpatient OUD protocol: COWS assessment, Buprenorphine induction & titration, Naloxone overdose protocol, OST programme, special populations (pregnancy, HIV), psychological interventions (MET, CBT, NA), NDPS Act compliance, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl06OpioidUseDisorderWithdrawal,
    link: "cl-06-opioid-use-disorder-withdrawal",
    category: "clinical sops",
  },
  {
    id: 27,
    name: "CL-07 — ADHD",
    description:
      "ADHD protocol across age groups: DSM-5-TR criteria, rating scales (Vanderbilt, Conners, ASRS), pharmacotherapy (Methylphenidate, Atomoxetine, Guanfacine), psychosocial interventions (PMT, CBT, school accommodations), monitoring, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl07ADHD,
    link: "cl-07-adhd",
    category: "clinical sops",
  },
  {
    id: 28,
    name: "CL-08 — Autism Spectrum Disorder",
    description:
      "ASD protocol: DSM-5-TR dual-domain criteria, diagnostic battery (M-CHAT-R/F, ADOS-2, ISAA), core interventions (EIBI, ABA, SLT, OT), target-symptom pharmacotherapy (Risperidone, Melatonin), family counselling (RPWD Act 2016), and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl08AutismSpectrumDisorder,
    link: "cl-08-autism-spectrum-disorder",
    category: "clinical sops",
  },
  {
    id: 29,
    name: "CL-09 — Insomnia & Behavioural Symptoms in Elderly / Dementia",
    description:
      "Geriatric sleep & BPSD protocol: 6-phenotype classification, non-pharmacological first-line steps, pre-antipsychotic dementia checklist, 5-tier pharmacological hierarchy (Melatonin → SSRI → Donepezil → Trazodone → last-resort antipsychotic), and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl09InsomniaDementiaElderly,
    link: "cl-09-insomnia-dementia-elderly",
    category: "clinical sops",
  },
  {
    id: 30,
    name: "CL-10 — Trichotillomania & Body-Focused Repetitive Behaviours",
    description:
      "Trichotillomania & BFRB protocol: DSM-5 criteria, 3 subtypes (automatic/focused/mixed), assessment (MGH-HPS, Milwaukee Inventory), behavioural therapies (HRT & ComB Grade A, ACT), pharmacotherapy (NAC, Clomipramine), and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl10TrichotillomaniaBFRBs,
    link: "cl-10-trichotillomania-bfrbs",
    category: "clinical sops",
  },
  {
    id: 40,
    name: "CL-11 — Agitation Management in Rehabilitation Settings",
    description:
      "Agitation protocol (NICE NG10): 7-cause classification (withdrawal/psychosis/delirium/mood/pain/environmental/personality), 8-mechanism clinical principles, STAMP early warning framework, NICE-aligned de-escalation techniques, RT stepped protocol (Lorazepam+Olanzapine oral → IM Haloperidol+Promethazine; IM olanzapine+BZD combination contraindicated), mandatory post-RT monitoring (GCS/RR/SpO₂/BP/ECG thresholds), documentation standards, and KPIs.",
    lastUpdated: "June 06, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl11AgitationManagement,
    link: "cl-11-agitation-management",
    category: "clinical sops",
  },
  {
    id: 31,
    name: "CL-12 — Obsessive-Compulsive Disorder (OCD)",
    description:
      "OCD protocol (NICE NG59): 6 symptom dimensions, Y-BOCS/OCI-R scales, SSRI pharmacotherapy at OCD doses, augmentation (Risperidone/Aripiprazole/NAC), 8-component ERP with SUDS hierarchy (IPD 5×/week), treatment-resistant pathway, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl12OCD,
    link: "cl-12-ocd",
    category: "clinical sops",
  },
  {
    id: 32,
    name: "CL-13 — Post-Traumatic Stress Disorder (PTSD)",
    description:
      "PTSD & C-PTSD protocol (NICE NG116/ISTSS 2019): PCL-5/IES-R/ITQ scales, 3-phase model (Stabilisation → Trauma Processing → Integration), TF-CBT & EMDR Grade A, pharmacotherapy (Sertraline, Prazosin; benzodiazepines contraindicated), crisis management, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl13PTSD,
    link: "cl-13-ptsd",
    category: "clinical sops",
  },
  {
    id: 33,
    name: "CL-14 — Personality Disorders",
    description:
      "BPD & ASPD protocol: ICD-11 severity specifiers, DSM-5-TR 9-criterion BPD diagnosis, symptom-targeted pharmacotherapy (Lamotrigine, Aripiprazole; benzodiazepines contraindicated), 6-module DBT programme, 4-tier crisis management, ASPD HCR-20 risk assessment, and KPIs.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl14PersonalityDisorders,
    link: "cl-14-personality-disorders",
    category: "clinical sops",
  },
  {
    id: 34,
    name: "CL-15 — Eating Disorders",
    description:
      "Inpatient eating disorders protocol (AN/BN/BED/ARFID) — MARSIPAN medical risk triage, BMI-stratified refeeding, CBT-E & MANTRA psychotherapy, pharmacotherapy guide (Bupropion contraindicated), and adolescent FBT pathway.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl15EatingDisorders,
    link: "cl-15-eating-disorders",
    category: "clinical sops",
  },
  {
    id: 35,
    name: "CL-16 — Cannabis & Poly-substance Use Disorder",
    description:
      "De-addiction protocol for cannabis & poly-substance use — CUDIT-R screening, cannabis withdrawal & psychosis management, BZD taper guide, stimulant protocols, poly-substance prioritisation (Alcohol/BZD first), and CBT/MET rehabilitation.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl16CannabisPolysubstance,
    link: "cl-16-cannabis-polysubstance",
    category: "clinical sops",
  },
  {
    id: 36,
    name: "CL-17 — Child & Adolescent Psychiatry",
    description:
      "Child & adolescent psychiatry protocol (< 18 yrs) — legal framework (MHCA/POCSO/JJ Act), 7-domain developmental assessment, age-stratified rating scales, paediatric psychotropic guide, and no-minors-in-adult-ward standard.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl17ChildAdolescentPsychiatry,
    link: "cl-17-child-adolescent-psychiatry",
    category: "clinical sops",
  },
  {
    id: 37,
    name: "CL-18 — Geriatric Psychiatry",
    description:
      "Geriatric psychiatry protocol (≥ 60 yrs) — CGA within 48 hrs (MoCA/GDS-15/Barthel/Morse Fall), Beers Criteria avoid-list, late-life depression/anxiety/delirium/BPSD management, antipsychotic black box warning, and caregiver burden screening (ZBI).",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl18GeriatricPsychiatry,
    link: "cl-18-geriatric-psychiatry",
    category: "clinical sops",
  },
  {
    id: 38,
    name: "CL-19 — Intellectual Disability & Neurodevelopmental Disorders",
    description:
      "Rights-based intellectual disability protocol (RPWD 2016/MHCA 2017) — IQ & adaptive functioning assessment (Vineland-3/MISIC), PAS-ADD comorbidity screen, FBA + PBS behavioural plan, stepped pharmacotherapy with diagnostic overshadowing warning, and 7-domain rehabilitation.",
    lastUpdated: "June 06, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl19IntellectualDisabilityNeurodevelopmental,
    link: "cl-19-intellectual-disability",
    category: "clinical sops",
  },
  {
    id: 39,
    name: "CL-20 — First-Episode Psychosis (FEP)",
    description:
      "First-Episode Psychosis protocol — ICD-11 8-diagnosis classification, mandatory medical exclusion workup (anti-NMDA-R/MRI), DUP tracking, low-dose antipsychotic guide (Clozapine for TRS only), metabolic monitoring, 4-phase CBTp, 6-session family intervention, and UHR/prodromal pathway.",
    lastUpdated: "June 06, 2026",
    status: "Active",
    type: "Clinical Protocol",
    print: Cl20FirstEpisodePsychosis,
    link: "cl-20-first-episode-psychosis",
    category: "clinical sops",
  },
  {
    id: 43,
    name: "Jagrutii SOP — Handling Violent / Aggressive Patients",
    description:
      "Jagrutii SOP for violent/aggressive patients — 8 safety principles, de-escalation protocol, escalation to duty doctor & security, restraint & medication guidelines, and documentation requirements.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Emergency Protocol",
    print: JagrutiiViolentPatientSOP,
    link: "jagrutii-violent-patient-sop",
    category: "clinical sops",
  },
  {
    id: 42,
    name: "Jagrutii SOP — Electrolyte Emergency Management",
    description:
      "Jagrutii emergency electrolyte protocol — Na⁺ & K⁺ 3-tier severity thresholds, emergency transfer criteria, 6 mandatory management steps, and documentation requirements.",
    lastUpdated: "June 01, 2026",
    status: "Active",
    type: "Emergency Protocol",
    print: JagrutiiElectrolyteEmergencySOP,
    link: "jagrutii-electrolyte-emergency-sop",
    category: "clinical sops",
  },
  {
    id: 41,
    name: "Jagrutii SOP — Management of Agitated Patients in Rehabilitation Settings",
    description:
      "Original Jagrutii agitation SOP — 8 clinical principles (stimulus control, milieu therapy, withdrawal stabilisation), clinical insight, and golden rule. Superseded by CL-11.",
    lastUpdated: "June 01, 2026",
    status: "Superseded",
    type: "Clinical Protocol",
    print: JagrutiiAgitationSOP,
    link: "jagrutii-agitation-sop",
    category: "clinical sops",
  },
  {
    id: 44,
    name: "SE-01 — Suicide Risk Prevention & Management SOP",
    description:
      "Jagrutii-wide suicide risk prevention SOP — C-SSRS at 8 mandatory touchpoints, 4-level risk stratification, observation & documentation standards, environmental ligature safety, Stanley-Brown safety planning, 6-step sentinel event response, special populations (de-addiction/child/elderly/involuntary), and 11 KPIs.",
    lastUpdated: "June 08, 2026",
    status: "Active",
    type: "Safety & Emergency — SE Series",
    print: Se01SuicideRiskPrevention,
    link: "se-01-suicide-risk-prevention",
    category: "clinical sops",
  },
  {
    id: 45,
    name: "SE-02 — Violence & Aggression Prevention & Management SOP",
    description:
      "Jagrutii-wide violence prevention & management SOP — Safewards proactive model, STAMP early warning framework, NICE NG10 7-step de-escalation, 3-level escalation response, RT stepwise protocol with doses & contraindications, post-RT monitoring, physical intervention prohibitions (prone restraint = criminal offence), 6-step post-incident protocol, special populations (de-addiction/child/elderly/pregnancy/involuntary), and 12 KPIs.",
    lastUpdated: "June 08, 2026",
    status: "Active",
    type: "Safety & Emergency — SE Series",
    print: Se02ViolenceAggressionManagement,
    link: "se-02-violence-aggression-management",
    category: "clinical sops",
  },
  {
    id: 46,
    name: "SE-03 — Restraint & Seclusion Governance SOP",
    description:
      "JRCPL v2 governance SOP for physical, mechanical, chemical restraint & seclusion — 5 non-negotiable principles (prone restraint = criminal), MHCA Sec. 94/97/99/100/115 legal matrix, 3-criteria indications, 6 contraindications, authorisation framework (15–30 min limits), 5-step procedure, 8-parameter monitoring with escalation thresholds, duration limits table, seclusion room specs & 8-step protocol, dual documentation (RR-F-001 + EMR), MHRB notification for involuntary patients, patient debrief, RCA trigger matrix (9 triggers), special populations (elderly/paediatric/pregnant/involuntary/de-addiction), training competency table, and 12 KPIs (3 zero-tolerance).",
    lastUpdated: "June 08, 2026",
    status: "Active",
    type: "Safety & Emergency — SE Series",
    print: Se03RestraintSeclusionGovernance,
    link: "se-03-restraint-seclusion-governance",
    category: "clinical sops",
  },
  {
    id: 47,
    name: "SE-04 — Medical Emergency & ICU Escalation SOP",
    description:
      "Jagruti SOP for medical emergencies (seizure, DTs, overdose, cardiac arrest, respiratory distress, lithium toxicity, Clozapine reaction) — 5-step immediate response (BLS/ABC/vitals), stabilisation measures, ICU escalation criteria, ambulance & transfer protocol, 7-item emergency equipment checklist (crash cart/O2/oximeter), EMR documentation requirements, 72-hr post-event review, and 4 KPIs.",
    lastUpdated: "June 09, 2026",
    status: "Active",
    type: "Safety & Emergency — SE Series",
    print: Se04MedicalEmergencyIcuEscalation,
    link: "se-04-medical-emergency-icu-escalation",
    category: "clinical sops",
  },
  {
    id: 48,
    name: "CC-07 — Electroconvulsive Therapy (ECT) Governance SOP",
    description:
      "Jagruti ECT governance SOP — MHCA 2017 compliance (unmodified ECT prohibited, anaesthesia mandatory), 5 clinical indications, pre-ECT risk assessment (CV/neuro/ICP/ECG), 3-step capacity & consent procedure (nominee consent for supported admission), 6-item pre-procedure checklist, anaesthesia monitoring (pulse/BP/SpO2/ECG), per-session documentation (electrode placement/stimulus/seizure duration), post-ECT recovery, complication management (5 types), privileging by Clinical Director, and 4 KPIs.",
    lastUpdated: "June 09, 2026",
    status: "Active",
    type: "Clinical Care — CC Series",
    print: Cc07EctGovernanceSOP,
    link: "cc-07-ect-governance-sop",
    category: "clinical sops",
  },
  {
    id: 50,
    name: "PS-CL-01-P — Pharmacological Protocol: Polysubstance Use Disorder",
    description:
      "15-Day Extended Detox + 75-Day Post-Withdrawal Maintenance (90-Day Total Programme) — substance use profile mapping (Alcohol/Opioids/Cannabis/Stimulants/BZD/Inhalants), mandatory baseline investigations, CDZ taper (standard & elderly), Buprenorphine-Naloxone induction & taper, stimulant/cannabis symptomatic management, hepatic encephalopathy protocol, monitoring schedule, post-withdrawal maintenance (MAT, anticraving, SSRI), discharge prescription, lab-deviation adjustments, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "De-Addiction Protocol",
    print: PsCl01PPolysubstanceUseDisorder,
    link: "ps-cl-01-p-polysubstance-use-disorder",
    category: "clinical sops",
  },
  {
    id: 51,
    name: "PS-CL-01-C — Counselling & Psychosocial Programme: Polysubstance Use Disorder",
    description:
      "15-Day Detox + 75-Day Therapeutic Phase (90-Day Total | 5 Clinical Phases) — core therapeutic modalities (MET, CBT, MBRP, DBT, 12-Step, FST, MGRP, NT, TF-CBT, OT, PSE), MDT counselling roles, standard daily routine, day-by-day counselling schedule across all 90 days, 16-session family programme, outcome measurement schedule (ASSIST, AUDIT, PHQ-9, GAD-7, URICA, PACS/VACS), documentation requirements, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "De-Addiction Protocol",
    print: PsCl01CPolysubstanceCounsellingProgramme,
    link: "ps-cl-01-c-psud-counselling-programme",
    category: "clinical sops",
  },
  {
    id: 49,
    name: "Jagruti — Alcohol Withdrawal Management Protocol V2.0",
    description:
      "Comprehensive inpatient alcohol withdrawal management protocol for Jagruti Rehabilitation Centre — CDZ 10-day fixed-dose taper, antiepileptics, general medicines, hepatic encephalopathy & portal hypertension management, post-withdrawal maintenance (Days 10–45), discharge prescription, elderly dose adjustments (≥ 60 yr), lab deviation protocols (> 3× ULN for LFT/bilirubin/renal/ammonia/electrolytes), quick reference matrix, and multi-organ transfer criteria.",
    lastUpdated: "June 10, 2026",
    status: "Active",
    type: "De-Addiction Protocol",
    print: JagrutiiAlcoholWithdrawalProtocolV2,
    link: "jagruti-alcohol-withdrawal-protocol-v2",
    category: "clinical sops",
  },
  {
    id: 55,
    name: "SCZ-CL-01-C — Psychosocial Rehabilitation Programme: Schizophrenia Spectrum Disorders",
    description:
      "90-Day Psychosocial Rehabilitation Programme — Phase 1 (Days 1–15 Acute Stabilisation), Phase 2 (Days 16–45 Consolidation & Intensive Rehabilitation), Phase 3 (Days 46–90 Maintenance, Recovery Skills & Discharge Preparation). Integrates CBTp (7 modules), ACT (3 sessions), CogRem (7 modules), SST (7 sessions), Behavioural Family Therapy (18 sessions), WRAP, Relapse Prevention Planning (RPP), and OT/Community Reintegration. Outcome measures: PANSS (9 checkpoints), AIMS, ITAQ, S-QoL 18, MoCA/RBANS, C-SSRS. Day-by-day schedule with MDT roles, standard daily routine, family programme, documentation requirements, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "Psychiatric Rehabilitation Protocol",
    print: SczCl01CSchizophreniaRehabilitation,
    link: "scz-cl-01-c-schizophrenia-rehabilitation",
    category: "clinical sops",
  },
  {
    id: 52,
    name: "SCZ-CL-01-P — Pharmacological Protocol: Schizophrenia Spectrum Disorders",
    description:
      "90-Day Programme (Acute Stabilisation D1–15 · Consolidation D16–45 · Maintenance Prep D46–90) — first-line antipsychotic selection & decision tree, dose titration schedule, acute agitation management (oral/IM/refractory), LAI antipsychotics (Risperidone/Paliperidone/Aripiprazole/Haloperidol/Zuclopenthixol Decanoate), Clozapine protocol for treatment-resistant schizophrenia, adjunctive medications, metabolic risk monitoring by antipsychotic, 90-day monitoring schedule, discharge prescription, lab-deviation adjustments, and KPIs.",
    lastUpdated: "June 2026",
    status: "Active",
    type: "Psychiatric Protocol",
    print: SczCl01PSchizophreniaPharmacological,
    link: "scz-cl-01-p-schizophrenia-pharmacological",
    category: "clinical sops",
  },
];

const categories = [
  { value: "all", label: "All" },
  { value: "admission", label: "Admission" },
  { value: "workflow", label: "Workflow" },
  { value: "clinical sops", label: "Clinical SOPs" },
  { value: "general", label: "General" },
];

const GuidelinesDashboard = () => {
  const [query, setQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState({ value: "all", label: "All" });

  const filteredGuidelines = useMemo(() => {
    return guidelines.filter((g) => {
      const matchesSearch =
        !query ||
        `${g.name} ${g.description} ${g.type}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory =
        selectedOption.value === "all" ||
        g.category === selectedOption.value;

      return matchesSearch && matchesCategory;
    });
  }, [query, selectedOption]);

  return (
    <div className="w-100 d-flex flex-column w-100 bg-white p-4 gap-2 mb-4">
      <h1 className="display-6 font-weight-bold text-primary">Guidelines</h1>
      <p className="text-muted lead">
        Manage your guidelines with ease and efficiency
      </p>
      <div className="d-flex gap-2 align-items-center">
        <div className="position-relative" style={{ width: "280px" }}>
          <Search
            className="position-absolute"
            style={{
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              height: "18px",
              width: "18px",
              color: "#6c757d",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <input
            type="text"
            placeholder="Search guidelines..."
            className="form-control"
            style={{
              paddingLeft: "36px",
              height: "40px",
            }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: "200px" }}>
          <Select
            options={categories}
            placeholder="Select category..."
            value={selectedOption}
            onChange={setSelectedOption}
          />
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-3">
          <h3 className="h4 mb-0">Guidelines List</h3>
        </div>

        <div className="list-group">
          {filteredGuidelines.length === 0 ? (
            <div className="text-muted p-3">
              No guidelines match your search.
            </div>
          ) : (
            filteredGuidelines.map((guideline) => (
              <Guideline key={guideline.id} guideline={guideline} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidelinesDashboard;
