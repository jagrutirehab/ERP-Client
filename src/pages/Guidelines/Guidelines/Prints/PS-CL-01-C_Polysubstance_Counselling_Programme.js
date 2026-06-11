import React, { forwardRef, Fragment } from "react";
import {
  ModuleHeader, SectionTitle, BulletList, WarningBox, Table,
  ProtocolHeader, ProtocolControlTable, ProtocolApproval, ProtocolWrapper,
} from "./ProtocolComponents";

const CONTROL_ROWS = [
  ["Protocol Code", "PS-CL-01-C"],
  ["Title", "Counselling & Psychosocial Programme — Polysubstance Use Disorder, 15-Day Detox + 75-Day Therapeutic Phase"],
  ["Version", "1.0 (Effective June 2026)"],
  ["Total Programme", "90 Days | 5 Clinical Phases"],
  ["Phases", "P1: Comprehensive Assessment & Admission | P2: Medical Detoxification (Days 1–15) | P3: Stabilisation & Intensive Therapy (Days 16–35) | P4: Advanced Rehabilitation (Days 36–60) | P5: Relapse Prevention & Discharge Preparation (Days 61–90)"],
  ["Prepared By", "Dr. Amar Shinde, Clinical Director"],
  ["Approved By", "Dr. Bharat Mali, Cluster Head Psychiatrist"],
  ["Regulatory Basis", "MHCA 2017 · NABH COP · NDPS Act 1985"],
];

const MODALITIES_ROWS = [
  ["MET", "Motivational Enhancement Therapy", "P1–P3", "Individual 45–60 min", "Sessions 1–4 (Days 7, 11, 19, 29)"],
  ["CBT", "Cognitive Behavioural Therapy", "P2–P5", "Individual + Group", "Modules 1–6 across programme; 3 individual / week"],
  ["MBRP", "Mindfulness-Based Relapse Prevention", "P2–P5", "Group 45 min", "6 sessions across programme (D12, 26, 32, 38, 46, 57, 63)"],
  ["DBT", "Dialectical Behaviour Therapy (skills)", "P3", "Group 45 min", "Emotion regulation (D18) + interpersonal (D39)"],
  ["12SF", "12-Step Facilitation", "P2–P5", "Group / Individual", "Steps 1–12 across programme; weekly in-house AA/NA"],
  ["FST", "Family Systems Therapy", "P1–P5", "Family session 60 min", "16 sessions; every 4–5 days"],
  ["MGRP", "Marlatt & Gordon Relapse Prevention", "P3–P5", "Individual + Group", "Framework introduced D36; plan finalised D61; signed D76"],
  ["NT", "Narrative Therapy", "P2–P3", "Individual 45 min", "Sessions D9, D25, D35"],
  ["TF-CBT", "Trauma-Focused CBT", "P3–P4", "Individual", "If trauma identified (ACE ≥ 4); may refer for EMDR"],
  ["OT", "Occupational Therapy", "P3–P5", "Group / Individual", "Daily structured activities; vocational sessions D34, D59"],
  ["PSE", "Psychoeducation", "P1–P5", "Group 30–45 min", "Daily; substance-specific topics rotating"],
];

const MDT_ROLES_ROWS = [
  ["Treating Psychiatrist", "Case formulation; diagnostic review; psychoeducation (medical topics); dual diagnosis management; weekly MDT; discharge summary"],
  ["Clinical Psychologist", "MET, CBT (all modules), MBRP (all sessions), TF-CBT, NT, MGRP; individual sessions 3×/week; group facilitation; psychological testing; RP plan co-author"],
  ["Medical Social Worker", "Social history; all 16 family sessions; community linkage; MAT OPD coordination; vocational/legal referrals; discharge checklist"],
  ["Nursing Staff", "Morning check-in group; daily observation notes; medication compliance group; co-facilitation of psychoeducation groups"],
  ["Occupational Therapist", "Vocational rehabilitation; activity scheduling; daily structured programme; life-skills groups; physical wellness planning"],
  ["Yoga Instructor", "Daily yoga/pranayama; MBRP body-scan in coordination with psychologist; progressive muscle relaxation final sessions"],
  ["Peer Mentor (if available)", "AA/NA peer support; sponsor role modelling; service work; sharing sessions at 12-step groups"],
];

const DAILY_ROUTINE_ROWS = [
  ["06:00–06:15", "Wake-up · Vitals", "Nursing", "Nursing round; MAR check"],
  ["06:15–07:00", "Yoga / pranayama / morning walk", "Yoga instructor", "Mandatory P3–P5"],
  ["07:00–07:30", "Personal hygiene · morning medications", "Nursing (MAR)", ""],
  ["07:30–08:00", "Breakfast", "Self", ""],
  ["08:00–08:45", "Morning process group (check-in, mood score, intentions, gratitude)", "Psychologist / MSW", "Daily — mood score 1–10; one intention stated"],
  ["09:00–10:00", "Individual therapy (3× / week) OR CBT / DBT group (other days)", "Psychologist", "See day-by-day schedule"],
  ["10:00–10:15", "Tea break", "Self", ""],
  ["10:15–11:15", "Psychoeducation / topic group (rotating substance-specific topics)", "Psychologist / Dr / MSW", ""],
  ["11:15–12:00", "Occupational therapy / art therapy / vocational activity", "OT", "Structured activity"],
  ["12:00–12:30", "Lunch + midday medications", "Nursing", ""],
  ["12:30–14:00", "Rest hour", "Self", "Mandatory"],
  ["14:00–15:00", "Relapse prevention group OR 12-Step (alternate days)", "Psychologist / MSW", ""],
  ["15:00–15:30", "Free time / journalling (recovery workbook)", "Self", "Recovery workbook provided"],
  ["15:30–16:30", "Physical exercise / sport / outdoor activity", "OT-supervised", ""],
  ["16:30–17:00", "Family visiting (scheduled days, ~3× per week)", "MSW", ""],
  ["17:00–18:00", "MBRP / mindfulness (3× / week) OR free time", "Psychologist", "Urge surfing, body scan, sitting meditation"],
  ["18:00–19:00", "Dinner", "Self", ""],
  ["19:00–20:00", "Evening reflection group — gratitude, check-out, serenity prayer", "MSW / peer leader", ""],
  ["20:00–20:30", "Evening medications · nursing check", "Nursing", ""],
  ["20:30–22:00", "Personal time / journalling / reading", "Self", ""],
  ["22:00", "Lights out · night round", "Nursing", ""],
];

const PHASE1_ROWS = [
  ["Day 1", "Assessment & safety mapping", "Psychiatric evaluation; ICD-11 diagnostic formulation; suicidality screen; ASSIST interview", "Ward orientation; welcome group — 'Why I am here'", "Family arrival briefing; emergency contact documentation (MSW)", "Polysubstance profile mapped; MHCA consent signed"],
  ["Day 2", "Substance history & trauma screen", "Drinking / drug timeline (AUDIT, CAGE, COWS, SDS); MoCA cognitive screen; PHQ-9, GAD-7; ACE childhood trauma screen", "Psychoeducation: 'What is polysubstance dependence?'", "FAM-F-001 family assessment (MSW)", "Baseline psychological measures complete; trauma history documented"],
  ["Day 3", "Formulation & treatment plan", "URICA stage-of-change; motivation interview introduction; risk formulation", "Expectations group: strengths and hopes for recovery", "MDT case conference with family present (optional)", "Individualised treatment plan signed; substance priority ranking agreed"],
];

const PHASE2_ROWS = [
  ["Day 4", "Withdrawal education", "Bedside MET (brief, tolerant of withdrawal state); instillation of hope", "Psychoeducation: withdrawal process and what to expect; safety reassurance", "Family psychoeducation: what to expect from detox (MSW)", "Patient engaged; withdrawal monitored safely"],
  ["Day 5", "Craving science", "Craving awareness — Penn Craving Scale / VACS baseline; bedside education on craving neuroscience", "Group: 'What triggers my substance use?'", "Family session 1: understanding addiction as a brain disorder", "Cravings identified; triggers listed"],
  ["Day 6", "Mind–body connection", "Sleep hygiene counselling; pain management psychoeducation", "Group: Mindfulness — breath awareness (20 min); body scan", "—", "First mindfulness practice completed"],
  ["Day 7", "Ambivalence exploration", "MET Session 1 — decisional balance; 'what has substance use given me / cost me?'", "Group: 'Pros and cons of using' — anonymous card exercise", "MSW: social history; employment / housing / legal concerns", "Ambivalence expressed; change talk beginning"],
  ["Day 8", "Health consequences", "Medical psychoeducation session (Dr + Psychologist): organ damage, BBV risk, nutritional deficiency", "Group: 'My body report card' — self-assessment exercise", "—", "Health consequences acknowledged"],
  ["Day 9", "Shame & stigma", "Narrative therapy intro: externalising the problem ('addiction is not my identity')", "Group: stigma and self-compassion; reading 'The Anonymous Letter'", "—", "Shame addressed; self-compassion language introduced"],
  ["Day 10", "Social impact", "Social consequences review — family, work, legal; motivational enhancement", "Group: 'What has substance use cost those I love?'", "Family session 2: impact on family — emotional burden sharing", "Social costs acknowledged; empathy for family impact"],
  ["Day 11", "Readiness for change", "MET Session 2 — rolling with resistance; eliciting change talk statements", "Group: 'Where am I on the wheel of change?'", "—", "Ambivalence reduced; readiness for action stated"],
  ["Day 12", "Craving management intro", "Brief CBT intro — thoughts-feelings-substance-use cycle", "Group: urge surfing (mindfulness for cravings) — practice session", "—", "Urge surfing technique learned"],
  ["Day 13", "HALT awareness", "HALT (Hungry, Angry, Lonely, Tired) as craving triggers — CBT framework", "Group: HALT group — personal HALT examples shared", "Family session 3: family HALT triggers (enabling behaviours)", "HALT plan drafted"],
  ["Day 14", "Looking ahead", "Goal-setting intro; short-term and long-term sobriety goals", "Group: 'My vision for a sober future' — visualisation exercise", "MSW: post-discharge housing / income / social support plan starts", "Short-term goals written"],
  ["Day 15", "Detox milestone", "End-of-detox review; craving score reassessment; transition counselling", "Group: '15 Days Sober' milestone celebration; letter to self", "Family update (MSW); confirm families for ongoing programme", "15-day detox complete; therapeutic readiness confirmed"],
];

const PHASE3_ROWS = [
  ["Day 16", "CBT Module 1", "Functional analysis of polysubstance use — ABC (Antecedent–Behaviour–Consequence) model", "CBT group: 'Mapping my using patterns'", "—", "Using patterns mapped for each substance"],
  ["Day 17", "CBT Module 2", "Cognitive distortions — permission-giving thoughts, minimisation, rationalisation", "CBT group: 'My top 5 permission-giving thoughts'", "—", "3 cognitive distortions identified per patient"],
  ["Day 18", "Emotion regulation", "DBT-informed: identifying and naming emotions; opposite action", "Group: Emotion regulation skills (DBT Module 1)", "Family session 4: family communication skills — I-statements", "Emotion vocabulary expanded; opposite action used"],
  ["Day 19", "MET Session 3", "Values clarification — core values vs substance using life", "Group: 'Who am I without substances?' identity exercise", "—", "Values articulated; discrepancy with using life stated"],
  ["Day 20", "Anger & conflict", "Anger management — escalation cycle, de-escalation, time-out", "Group: Anger and interpersonal conflict role play", "—", "Personal anger cycle mapped; de-escalation plan"],
  ["Day 21", "Mid-programme review", "PHQ-9, GAD-7, URICA, ASSIST, PACS/VACS re-assessment; formulation update", "Group: 'Three weeks in — honest check-in'", "MDT review; family invited; medication review", "Updated formulation; KPI measures recorded"],
  ["Day 22", "Trauma-informed care", "ACE score review; trauma-informed CBT if trauma history identified; grounding techniques", "Group: 'Stories of resilience' — strengths-based narrative", "—", "Trauma acknowledged; grounding skills taught"],
  ["Day 23", "Sleep & lifestyle", "Sleep CBT — stimulus control, sleep restriction, relaxation; circadian rhythm restoration", "Group: Designing a sober daily routine", "—", "Sleep hygiene plan written"],
  ["Day 24", "12-Step facilitation", "Step 1–3 individual review with therapist", "Group: In-house AA/NA meeting — Step 1 facilitation", "—", "Step 1–3 understood; surrender concept explored"],
  ["Day 25", "Assertiveness", "Assertiveness skills — drink/drug refusal training; I-messages", "Group: Assertiveness role play — peer pressure scenarios (substance-specific)", "—", "Refusal scripts rehearsed for each substance context"],
  ["Day 26", "MBRP Session 1", "Mindfulness-Based Relapse Prevention: automatic pilot and mindful awareness", "Group: MBRP — mindful awareness of cravings", "Family session 5: shared goals for recovery; vision board exercise", "MBRP automatic pilot concept understood"],
  ["Day 27", "Grief & loss", "Grief work — losses due to polysubstance use (relationships, career, health, self-identity)", "Group: 'What I have lost' — grief processing circle", "—", "Grief acknowledged; losses listed without shame"],
  ["Day 28", "CBT Module 3", "High-risk situations — substance-specific (e.g., party with alcohol + cocaine; stress and opioid use)", "CBT group: 'My personal high-risk situations map'", "—", "HRS map complete for each substance"],
  ["Day 29", "MET Session 4", "Strengthening commitment — importance and confidence rulers; commitment statement", "Group: 'My reasons to stay sober' — public commitment", "—", "Written commitment statement signed"],
  ["Day 30", "Month 1 review", "Comprehensive review — AUDIT, SDS, PHQ-9, GAD-7, URICA, craving scores", "Group: '30 Days Sober' — celebration and reflection", "Family session 6: family roles in enabling / supporting recovery", "1-month outcomes documented; families acknowledged"],
  ["Day 31", "CBT Module 4", "Coping with cravings — STOP technique, 5-4-3-2-1 grounding, urge surfing mastery", "CBT group: Craving coping toolkit", "—", "Each patient has a written craving coping toolkit"],
  ["Day 32", "MBRP Session 2", "Seeing thoughts as thoughts; defusion from craving-related cognitions", "Group: MBRP — cognitive defusion exercise", "—", "Defusion technique practiced × 3"],
  ["Day 33", "12-Step Steps 4–6", "Moral inventory (Step 4–6) with therapist; self-forgiveness framework", "Group: AA/NA Step 4 facilitation", "—", "Step 4 inventory started"],
  ["Day 34", "Vocational rehabilitation", "Vocational goals; return-to-work / study planning; legal issues review (with MSW + OT)", "Group: Life skills — financial management, routine building", "MSW: vocational and social reintegration plan", "Vocational plan drafted; legal referrals made"],
  ["Day 35", "Narrative identity", "Narrative therapy — rewriting the recovery story; sober identity consolidation", "Group: 'My recovery story' — letter to future self", "Family session 7: joint session — patient reads letter to family", "Positive recovery narrative formed; family reconnection"],
];

const PHASE4_ROWS = [
  ["Day 36", "Relapse prevention framework", "Marlatt & Gordon RP model introduction; PSUD-specific relapse chains", "Group: 'My relapse chain' — substance-specific mapping", "—", "Personal relapse chain mapped for each substance"],
  ["Day 37", "Warning signs", "Personal warning signs of relapse — emotional, cognitive, behavioural signals", "Group: 'My top 10 warning signs'", "—", "Warning signs list complete and laminated (take-away card)"],
  ["Day 38", "MBRP Session 3", "Mindfulness of difficult emotions; RAIN technique (Recognise, Allow, Investigate, Nurture)", "Group: MBRP — RAIN practice", "—", "RAIN technique used for 2 difficult emotions"],
  ["Day 39", "Interpersonal skills", "Communication skills — active listening, conflict resolution, repairing relationships", "Group: Interpersonal effectiveness (DBT module 2)", "Family session 8: boundary-setting and communication in the family", "Communication plan agreed with key family member"],
  ["Day 40", "Spirituality & meaning", "Meaning-making in recovery; spirituality (religious and non-religious pathways)", "Group: Spirituality and recovery discussion (non-dogmatic)", "—", "Personal meaning statement written"],
  ["Day 41", "Polydrug triggers", "Substance interaction craving — how using one substance triggers craving for others (gateway effect in PSUD)", "CBT group: 'Cross-craving mapping'", "—", "Cross-substance craving triggers identified"],
  ["Day 42", "Peer support", "12-Step sponsor model; peer mentorship; SMART Recovery introduction", "In-house AA/NA meeting; Steps 7–9 facilitation", "Family session 9: Al-Anon / Nar-Anon family group referral", "Peer support network identified; sponsor contact made"],
  ["Day 43", "Behavioural activation", "Activity scheduling — meaningful non-substance-related activities", "Group: 'Building a sober life' — hobby, exercise, volunteer listing", "—", "Weekly activity schedule created"],
  ["Day 44", "CBT Module 5", "Problem-solving model — IDEAL (Identify, Define, Explore, Act, Look back)", "CBT group: Problem-solving practice with real life scenarios", "—", "Problem-solving skill applied to 2 current life stressors"],
  ["Day 45", "6-week review", "PHQ-9, GAD-7, URICA, PACS/VACS — 6-week outcomes; formulation update", "Group: 'Halfway through our journey' — open reflection", "MDT + family (optional) — 6-week family review", "6-week outcome measures documented"],
  ["Day 46", "MBRP Session 4", "Mindful self-compassion; self-forgiveness for past using behaviour", "Group: MBRP — loving-kindness meditation", "—", "Self-compassion framework consolidated"],
  ["Day 47", "Sexuality & relationships", "Relationships and recovery; intimacy, trust, and substance use", "Group: Healthy relationships discussion (facilitated)", "—", "Relationship goals identified"],
  ["Day 48", "12-Step Steps 8–12", "Making amends framework; Steps 8–12 overview", "Group: AA/NA Steps 8–10 facilitation", "Family session 10: family amends conversation (facilitated, voluntary)", "Amends list drafted (to be acted on in community)"],
  ["Day 49", "Parenting & children", "Parenting under recovery; re-establishing parental role; child-safe planning (if applicable)", "Group: Parenting in recovery (relevant patients)", "MSW: child protection liaison if DCPS involved", "Parenting plan drafted (where applicable)"],
  ["Day 50", "Dual diagnosis management", "Comorbid psychiatric disorder psychoeducation — depression, anxiety, PTSD, ADHD in SUD", "Group: 'My mental health and my substance use' — psychoeducation", "—", "Dual diagnosis understanding confirmed"],
  ["Day 51", "Trauma processing", "Trauma-focused CBT session (if trauma history and patient is ready); EMDR triage if indicated", "Group: Grounding and stabilisation skills", "—", "Trauma processing underway / referred for specialist"],
  ["Day 52", "Relapse plan drilling", "Roleplay: patient encounters highest-risk situation and executes coping plan", "Group: Roleplay — substance-specific high-risk scenarios", "—", "Coping plan tested against roleplay scenarios"],
  ["Day 53", "Physical health", "Nutritional counselling; exercise physiology (OT); sexual health discussion", "Group: Yoga / progressive muscle relaxation (full session)", "—", "Physical wellness plan incorporated"],
  ["Day 54", "Craving mapping — week 8", "PACS / VACS craving reassessment; trend analysis; adjust intervention if needed", "Group: 'How has my craving changed?'", "—", "Craving trend documented; intervention adjusted if needed"],
  ["Day 55", "CBT Module 6", "Behavioural experiments — testing beliefs about substance use", "CBT group: behavioural experiment design", "—", "One behavioural experiment completed"],
  ["Day 56", "2-month review", "Comprehensive assessment — AUDIT, SDS, PHQ-9, GAD-7, URICA, ASSIST", "Group: '60 Days' — milestone celebration", "Family session 11: 60-day family update; discharge planning begins", "2-month outcomes documented; discharge plan initiated"],
  ["Day 57", "MBRP Session 5", "Mindfulness in daily life; informal mindfulness practices", "Group: MBRP — everyday mindfulness (eating, walking)", "—", "2 informal mindfulness practices in daily routine"],
  ["Day 58", "Community linkage", "Local AA/NA/SMART recovery chapters; community mental health resources; MAT OPD", "Group: Community resources — guest speaker from AA (optional)", "MSW: post-discharge community plan finalised", "Community support system mapped"],
  ["Day 59", "Vocational follow-through", "Job application support; education re-entry; employer disclosure decisions (OT + MSW)", "Group: Life skills — workplace skills, communication", "—", "Vocational plan updated"],
  ["Day 60", "Pre-discharge review", "Pre-discharge readiness screen; coping plan review; medication compliance", "Group: '60 Days and 30 days to go — what I still need to work on'", "Family session 12: pre-discharge family briefing", "Pre-discharge plan active; all gaps identified"],
];

const PHASE5_ROWS = [
  ["Day 61", "Final RP Plan — Draft", "Marlatt & Gordon RP plan — complete individualised document for PSUD (all substances)", "Group: 'My RP plan' — peer review and refinement", "—", "Written RP plan (first draft) completed"],
  ["Day 62", "Crisis management plan", "Crisis plan — what to do when I want to use; who to call; JRCPL helpline", "Group: Roleplay — crisis scenario management", "—", "Crisis plan laminated; helplines listed"],
  ["Day 63", "MBRP Session 6 (Final)", "MBRP review — bringing all skills together; practice schedule post-discharge", "Group: MBRP — integration session", "—", "Post-discharge MBRP practice schedule written"],
  ["Day 64", "Substance-specific triggers (final review)", "Final CBT trigger map — updated for all substances; new triggers from programme period", "CBT group: 'My updated trigger and coping map'", "—", "Final trigger map complete"],
  ["Day 65", "Lifestyle design", "Post-discharge daily structure — routine, sleep, exercise, social, spiritual", "Group: Designing a sober life — detailed schedule", "Family session 13: final family support plan", "Post-discharge daily routine schedule written"],
  ["Day 66", "Coping drill — final", "Final roleplay of top 3 highest-risk scenarios for each patient (individual)", "Group: Peer-led high-risk scenario practice", "—", "Top 3 HRS successfully navigated in roleplay"],
  ["Day 67", "Medication compliance", "Psychoeducation on MAT adherence; anticraving medication importance; depot Naltrexone discussion", "Group: 'My medication and my recovery'", "—", "Medication plan understood and accepted"],
  ["Day 68", "12-Step completion", "Steps 10–12 review with therapist; 'how will I continue the programme post-discharge?'", "Group: AA/NA in-house meeting; sobriety chips ceremony", "Family session 14: family commitment ceremony", "Steps 10–12 reviewed; family present at ceremony"],
  ["Day 69", "Self-care plan", "Comprehensive self-care plan — physical, emotional, social, spiritual", "Group: Self-care planning workshop", "—", "Written self-care plan"],
  ["Day 70", "10-week review", "PHQ-9, GAD-7, URICA, PACS/VACS, AUDIT — 10-week outcomes", "Group: Reflection on progress", "Family invited (optional)", "10-week outcomes documented"],
  ["Day 71", "Legal & financial", "Legal matters review (MSW); financial planning; debt management (if applicable)", "Group: Life skills — financial wellness, legal rights", "MSW: final community and legal referrals completed", "Legal / financial plan finalised"],
  ["Day 72", "Relapse is not failure", "Relapse education — lapse vs relapse; how to get back on track without shame", "Group: 'If I use — what do I do next hour, next day?'", "—", "Lapse recovery plan written"],
  ["Day 73", "Expressing gratitude", "Gratitude and positive psychology — recognising growth; celebrating milestones", "Group: Gratitude exercise — sharing 10 things gained in recovery", "—", "Gratitude list completed"],
  ["Day 74", "Peer mentorship", "Discuss taking on peer mentor role post-discharge; AA/NA service", "Group: Senior patients mentoring newer patients", "—", "Peer mentorship role accepted / considered"],
  ["Day 75", "2.5-month review", "Formal assessment update — all scales; discharge eligibility confirmed by MDT", "Group: 'Preparing for the world outside'", "MDT full review; family present (optional)", "Discharge eligibility confirmed by MDT"],
  ["Day 76", "RP Plan — final sign-off", "Relapse Prevention Plan reviewed; patient signs; copy retained in file + given to patient", "Group: RP plan peer witness (each patient reads 1 minute of their plan)", "—", "Signed RP plan filed"],
  ["Day 77", "Communication rehearsal", "Communication skills — re-entry conversations with family, employer, social circle", "Group: Role play — explaining sobriety to others", "Family session 15: final family preparation", "Re-entry scripts practised"],
  ["Day 78", "Discharge card & helplines", "Discharge card reviewed with patient — JRCPL 9822207761 (primary); Tele MANAS 14416; iCALL 9152987821", "Group: Helpline role play — when and how to call", "MSW: discharge checklist with family", "Discharge card understood; numbers memorised/saved"],
  ["Day 79", "Self-compassion final", "MBRP booster — self-compassion for anticipated post-discharge struggles", "Group: Compassion circle — what we wish each other post-discharge", "—", "Post-discharge challenges anticipated; self-compassion plan"],
  ["Day 80", "MDT discharge conference", "Final MDT conference — confirm EP-01 discharge criteria; discharge summary drafted", "Group: Peer recognition ceremony", "MSW: follow-up appointments FU-1 to FU-5 booked", "Discharge criteria confirmed; summary drafted"],
  ["Day 81", "Stress management", "Final stress inoculation practice — visualise high-stress scenario; execute plan calmly", "Group: Stress inoculation drill", "—", "Stress response plan solid"],
  ["Day 82", "Legacy letter", "Legacy letter to a future patient — what would I tell someone entering this programme?", "Group: Reading legacy letters aloud", "Family session 16: final joint session — patient reads commitment to family", "Legacy letter written; family commitment made"],
  ["Day 83", "Physical wellness final", "Exercise plan and nutritional guidance for post-discharge; yoga / stretching final class", "Group: Final yoga + progressive muscle relaxation session", "—", "Physical wellness plan complete"],
  ["Day 84", "3-month review", "Full outcome assessment — AUDIT, SDS, ASSIST, PHQ-9, GAD-7, URICA, WHO-5, PACS/VACS", "Group: '84 Days — Milestone Ceremony'", "Family present for milestone (optional)", "Final in-programme outcome battery completed"],
  ["Day 85", "Finalise discharge documents", "Individual review of all discharge documents; any gaps addressed", "Group: Open discussion — hopes and fears about discharge", "MSW: confirm accommodation, transport, MAT OPD link", "All discharge documents complete"],
  ["Day 86", "Farewell to programme", "Gratitude and reflection on 86 days; saying goodbye to therapeutic relationship", "Group: Farewell circle — each patient and therapist shares one thing", "—", "Therapeutic ending acknowledged"],
  ["Day 87", "Contingency planning", "What if my plan fails? Contingency layers — 5 back-up options for high-risk moments", "Group: 'Plan B and Plan C'", "—", "Contingency plan written"],
  ["Day 88", "Consolidation", "Final CBT summary session — reviewing all modules; patient summarises learning", "Group: Peer teaching — each patient teaches one skill they have learned", "—", "Learning consolidated; patient can articulate all tools"],
  ["Day 89", "Discharge preparation", "Final packing; goodbyes; spiritual reflection; serenity prayer / equivalent", "Group: Final evening group — gratitude and intentions", "Family present at final group", "Emotional readiness for discharge confirmed"],
  ["Day 90", "DISCHARGE", "Discharge interview; patient feedback form; aftercare plan signed; therapeutic summary given", "Final discharge group: 'The road ahead — carry the message'", "Family present at discharge; Discharge Card + RP Plan given to patient AND family", "Discharge completed per DC-001 SOP; follow-up FU-1 to FU-5 booked"],
];

const FAMILY_ROWS = [
  ["F1", "Day 1–2", "Family arrival orientation — admission process, rules, visiting hours, consent", "MSW", "Family oriented; emergency contacts logged"],
  ["F2", "Day 5", "Psychoeducation: polysubstance dependence — disease model; brain science", "MSW + Psychologist", "Family understands PSUD"],
  ["F3", "Day 10", "Impact on family — emotional burden, secondary trauma, codependency introduction", "MSW", "Family impact acknowledged"],
  ["F4", "Day 18", "Communication skills — I-statements; talking to someone in recovery", "Psychologist", "Communication skills practised"],
  ["F5", "Day 26", "Shared goals for recovery — family vision exercise; values alignment", "Psychologist + MSW", "Family-patient goals aligned"],
  ["F6", "Day 30", "Enabling behaviours — identification; boundary-setting; support vs enabling", "Psychologist", "Enabling identified; boundaries negotiated"],
  ["F7", "Day 35", "Joint session: patient reads 'letter to future self' to family", "Psychologist", "Emotional reconnection; positive narrative shared"],
  ["F8", "Day 39", "Boundary-setting and communication in the family — skills rehearsal", "Psychologist", "Family boundary plan agreed"],
  ["F9", "Day 42", "Al-Anon / Nar-Anon introduction — family support groups", "MSW", "Al-Anon / Nar-Anon referral made"],
  ["F10", "Day 48", "Making amends — facilitated conversation (voluntary); rebuilding trust", "Psychologist", "Amends conversation (if patient/family consent)"],
  ["F11", "Day 56", "60-day review — family progress; discharge planning starts", "MSW + Psychologist", "Family discharge plan initiated"],
  ["F12", "Day 60", "Pre-discharge briefing — family roles, safety plan, crisis response", "MSW + Psychologist", "Family safety plan drafted"],
  ["F13", "Day 65", "Final family support plan — practical responsibilities post-discharge", "MSW", "Family support plan finalised"],
  ["F14", "Day 68", "Family commitment ceremony — patient and family state commitments to each other", "MDT", "Written commitments witnessed"],
  ["F15", "Day 77", "Final family preparation — re-entry conversations; 'what to say when...'", "Psychologist", "Re-entry script rehearsed"],
  ["F16", "Day 90", "Discharge ceremony — family present; Discharge Card + RP Plan given to family", "MDT", "Family discharge package complete"],
];

const OUTCOME_ROWS = [
  ["ASSIST", "Alcohol, Smoking and Substance Involvement Screening Test", "Polysubstance severity mapping", "Day 1, Day 21, Day 45, Day 84"],
  ["AUDIT", "Alcohol Use Disorders Identification Test", "Alcohol use severity", "Day 1, Day 30, Day 56, Day 84, Day 90"],
  ["COWS", "Clinical Opiate Withdrawal Scale", "Opioid withdrawal severity", "q4h Days 4–7; daily Days 8–15"],
  ["CIWA-Ar", "Clinical Institute Withdrawal Assessment — Alcohol", "Alcohol/BDZ withdrawal severity", "q4h Days 4–7; daily Days 8–15"],
  ["SDS", "Severity of Dependence Scale", "Dependence severity per substance", "Day 2, Day 45, Day 84"],
  ["PHQ-9", "Patient Health Questionnaire — Depression", "Depression screening", "Day 2, Day 21, Day 45, Day 70, Day 84"],
  ["GAD-7", "Generalised Anxiety Disorder Scale", "Anxiety screening", "Day 2, Day 21, Day 45, Day 70, Day 84"],
  ["URICA", "Stages of Change — Readiness Scale", "Motivation / stage of change", "Day 3, Day 21, Day 45, Day 75"],
  ["PACS / VACS", "Penn Alcohol Craving Scale / Visual Analogue Craving", "Craving intensity", "Day 5, weekly (Days 12, 19, 26, 33...84)"],
  ["MoCA", "Montreal Cognitive Assessment", "Cognitive screening", "Day 2; Day 30 if concern"],
  ["ACE", "Adverse Childhood Experiences Questionnaire", "Trauma screening", "Day 2"],
  ["WHO-5", "WHO-5 Wellbeing Index", "Subjective wellbeing", "Day 15, Day 45, Day 75, Day 90"],
  ["FTND", "Fagerström Test for Nicotine Dependence", "Nicotine dependence (if tobacco use)", "Day 1"],
  ["CUDIT-R", "Cannabis Use Disorder Identification Test — Revised", "Cannabis use severity", "Day 1 (if cannabis component)"],
];

const DOCUMENTATION_ROWS = [
  ["Individual therapy session note", "Psychologist", "Within 24 hrs", "Case file"],
  ["Group session facilitation note", "Facilitator", "Same day", "Group register + case file"],
  ["Family session note", "MSW", "Within 24 hrs", "Case file + FAM-F"],
  ["Weekly MDT note", "All MDT", "Same day (Monday)", "Case file"],
  ["Mid-programme reviews (D21, D45, D75)", "Psychologist + Psychiatrist", "Due date", "Case file"],
  ["ASSIST / PHQ-9 / GAD-7 / URICA assessments", "Psychologist", "Within 48 hrs", "Case file"],
  ["Relapse Prevention Plan (signed)", "Psychologist + Patient", "Day 76", "Case file + copy to patient + copy to family"],
  ["Crisis management plan", "Psychologist + Patient", "Day 62", "Case file + copy to patient"],
  ["Final psychological summary for Discharge Summary", "Psychologist", "Day 88–89", "Part of DC Summary"],
  ["Discharge Card — JRCPL 9822207761 listed first", "MSW", "Day 90", "Given to patient + family"],
];

const KPI_ROWS = [
  ["Individual therapy sessions completed (vs planned per patient)", "≥ 90% attendance", "Monthly"],
  ["Family programme — minimum 6 sessions per admission", "100%", "Monthly"],
  ["Relapse Prevention Plan completed and signed before discharge", "100%", "Monthly"],
  ["PACS/VACS craving score reduction from baseline to Day 84", "≥ 40% reduction", "Quarterly"],
  ["URICA Stage — Preparation or Action by Day 90", "≥ 85%", "Quarterly"],
  ["PHQ-9 and GAD-7 improvement (Day 2 to Day 84)", "≥ 50% reduction", "Quarterly"],
  ["30-day post-discharge follow-up (FU-1 + FU-2) attendance", "≥ 75%", "Quarterly"],
  ["90-day post-discharge abstinence self-report (FU-5)", "≥ 55%", "Quarterly"],
  ["Family programme completion rate (≥ 8 sessions)", "≥ 70% of admissions", "Quarterly"],
  ["Dual diagnosis documentation completed by Day 21", "100%", "Monthly"],
];

const DAY_COLS = [
  { label: "Day", width: "7%" },
  { label: "Theme / Module", width: "15%" },
  { label: "Individual Therapy", width: "23%" },
  { label: "Group Session", width: "22%" },
  { label: "Family / MSW", width: "18%" },
  { label: "Outcome / Goal" },
];

const PsCl01CPolysubstanceCounsellingProgramme = forwardRef((props, ref) => (
  <Fragment>
    <ProtocolWrapper ref={ref} classnames={props.classnames}>
      <ProtocolHeader
        heading={props.heading}
        clCode="PS-CL-01-C"
        title="PSUD — Counselling & Psychosocial Programme"
        icdLine="ICD-11: 6C4E | DSM-5-TR: F19 | 15-Day Detox + 75-Day Therapeutic Phase | 90 Days Total | 5 Clinical Phases"
        org="jagrutii"
      />
      <ProtocolControlTable rows={CONTROL_ROWS} />

      {/* 1. PURPOSE & SCOPE */}
      <SectionTitle>1. Purpose &amp; Scope</SectionTitle>
      <p style={{ margin: "0 0 0.75rem" }}>
        This protocol governs the structured counselling and psychosocial programme for patients admitted with Polysubstance Use Disorder (PSUD) at JRCPL. It provides a day-by-day therapeutic roadmap across five clinical phases, addressing the unique complexity of PSUD — including cross-substance craving interactions, polydrug triggers, dual diagnosis comorbidity, and sequential withdrawal management.
      </p>
      <WarningBox>
        PSUD COMPLEXITY NOTE: Patients with PSUD require substance-specific therapeutic adaptations within each session. Individual therapy sessions must address the primary substance first, then integrate secondary substances. Group sessions use a polysubstance-inclusive framework. Therapists should be familiar with the neuroscience of each substance class involved.
      </WarningBox>

      {/* 2. CORE THERAPEUTIC MODALITIES */}
      <ModuleHeader>2. Core Therapeutic Modalities</ModuleHeader>
      <Table
        cols={[
          { label: "Modality", width: "9%" },
          { label: "Full Name", width: "26%" },
          { label: "Phases Used", width: "11%", center: true },
          { label: "Format", width: "18%" },
          { label: "Frequency / Notes" },
        ]}
        rows={MODALITIES_ROWS}
      />

      {/* 3. MDT COUNSELLING ROLES */}
      <ModuleHeader>3. MDT Counselling Roles</ModuleHeader>
      <Table
        cols={[{ label: "Role", width: "24%" }, { label: "Counselling Responsibilities" }]}
        rows={MDT_ROLES_ROWS}
      />

      {/* 4. STANDARD DAILY ROUTINE */}
      <ModuleHeader>4. Standard Daily Routine (Phase 3–5: Days 16–90)</ModuleHeader>
      <Table
        cols={[
          { label: "Time", width: "14%" },
          { label: "Activity", width: "34%" },
          { label: "Led By", width: "20%" },
          { label: "Notes" },
        ]}
        rows={DAILY_ROUTINE_ROWS}
      />

      {/* 5. DAY-BY-DAY SCHEDULE */}
      <ModuleHeader>5. Day-by-Day Counselling Schedule — 90 Days</ModuleHeader>

      <SectionTitle>Phase 1 — Comprehensive Assessment &amp; Admission | Days 1–3</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE1_ROWS} />

      <SectionTitle>Phase 2 — Medical Detoxification (15-Day Extended) | Days 4–15</SectionTitle>
      <WarningBox>
        Detox Phase Note: During active withdrawal (Days 4–8), individual sessions are brief (20–30 min), bedside, and paced to patient tolerance. Group sessions are psychoeducational only. No trauma processing, deep CBT, or confrontational work during this phase. CIWA/COWS monitoring continues in parallel with all therapeutic activities.
      </WarningBox>
      <Table cols={DAY_COLS} rows={PHASE2_ROWS} />

      <SectionTitle>Phase 3 — Stabilisation &amp; Intensive Therapy | Days 16–35</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE3_ROWS} />

      <SectionTitle>Phase 4 — Advanced Rehabilitation | Days 36–60</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE4_ROWS} />

      <SectionTitle>Phase 5 — Relapse Prevention &amp; Discharge Preparation | Days 61–90</SectionTitle>
      <Table cols={DAY_COLS} rows={PHASE5_ROWS} />

      {/* 6. FAMILY PROGRAMME */}
      <ModuleHeader>6. Family Programme — 16-Session Overview</ModuleHeader>
      <Table
        cols={[
          { label: "Session", width: "8%", center: true },
          { label: "Day", width: "9%", center: true },
          { label: "Topic", width: "36%" },
          { label: "Led By", width: "16%" },
          { label: "Outcome" },
        ]}
        rows={FAMILY_ROWS}
      />

      {/* 7. OUTCOME MEASUREMENT SCHEDULE */}
      <ModuleHeader>7. Outcome Measurement Schedule</ModuleHeader>
      <Table
        cols={[
          { label: "Tool", width: "10%", center: true },
          { label: "Full Name", width: "28%" },
          { label: "Purpose", width: "24%" },
          { label: "Administered At" },
        ]}
        rows={OUTCOME_ROWS}
      />

      {/* 8. DOCUMENTATION REQUIREMENTS */}
      <ModuleHeader>8. Documentation Requirements</ModuleHeader>
      <Table
        cols={[
          { label: "Document", width: "28%" },
          { label: "By", width: "18%" },
          { label: "Timeline", width: "16%" },
          { label: "Filed" },
        ]}
        rows={DOCUMENTATION_ROWS}
      />

      {/* 9. KPIs */}
      <ModuleHeader>9. KPIs — Counselling Programme</ModuleHeader>
      <Table
        cols={[
          { label: "KPI" },
          { label: "Target", width: "20%", center: true },
          { label: "Review", width: "12%", center: true },
        ]}
        rows={KPI_ROWS}
      />

      {/* 10. APPROVAL */}
      <ProtocolApproval docCode="PS-CL-01-C" docTitle="PSUD Counselling & Psychosocial Programme" />
    </ProtocolWrapper>
  </Fragment>
));

export default PsCl01CPolysubstanceCounsellingProgramme;
