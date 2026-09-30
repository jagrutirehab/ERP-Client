import React, { forwardRef } from "react";
import {
  ProtocolWrapper,
  ProtocolHeader,
  ProtocolApprovalNew,
  ModuleHeader,
  SectionTitle,
  BulletList,
  CalloutBox,
  WarningBox,
  Table,
} from "./ProtocolComponents";

const MODALITIES_ROWS = [
  ["CBTp", "Cognitive Behavioural Therapy for Psychosis", "NICE CG178; Cochrane meta-analysis", "P1–P3", "Indiv. 45–60 min", "7 modules; 3×/week in Phase 2–3"],
  ["ACT", "Acceptance and Commitment Therapy", "RCT evidence for psychosis (Bach & Hayes)", "P2–P3", "Group 45 min", "3 sessions (D33, D53, D74)"],
  ["CogRem", "Cognitive Remediation Therapy", "NICE; Wykes et al. meta-analysis", "P2–P3", "Group 30–45 min", "6 modules (D35,41,49,54,59,63,73)"],
  ["SST", "Social Skills Training", "WHO; Bellack et al.", "P1–P3", "Group 45–60 min", "7 sessions across programme"],
  ["BFT", "Behavioural Family Therapy", "Leff & Falloon; Pharoah Cochrane", "P1–P3", "Family 60 min", "18 formal family sessions"],
  ["WRAP", "Wellness Recovery Action Plan", "Mary Ellen Copeland; peer research", "P3", "Group + Indiv.", "Sessions D61–D69; completed D69"],
  ["PSYCH-ED", "Structured Psychoeducation", "NICE; Xia et al. Cochrane", "P1–P3", "Group 30–45 min", "Daily psychoeducation in programme"],
  ["OT/CR", "Occupational Therapy / Community Reintegration", "NICE; WFOT standards", "P1–P3", "Group + Indiv.", "Daily structured; ADL intensive D24; community D55"],
  ["MSM", "Medication Self-Management Programme", "Velligan et al.; adherence research", "P2–P3", "Group + Indiv.", "Sessions D13, D43, D71, D88"],
  ["RPP", "Relapse Prevention Planning", "Birchwood relapse signature model", "P3", "Indiv. + Family", "D40, D51, D64, D76"],
];

const MDT_ROLES_ROWS = [
  ["Treating Psychiatrist", "Case formulation; diagnostic review; psychoeducation (medical); mental state reviews; MDT lead; PANSS/CGIS/AIMS at all checkpoints; LAI and Clozapine decisions; discharge summary"],
  ["Clinical Psychologist", "CBTp (all modules); ACT (all sessions); CogRem (all modules); insight work; ITAQ; S-QoL; MoCA/RBANS; C-SSRS; RPP co-author; WRAP; individual therapy 3×/week"],
  ["Medical Social Worker", "Social history; all 18 family sessions; BFT co-facilitation; community linkage; CMHC referral; vocational plan; housing; legal; FAM-F forms; discharge checklist"],
  ["Nursing Staff", "Morning check-in group; PMR and relaxation groups; medication group; observation notes; ADL monitoring; co-facilitation of psychoeducation"],
  ["Occupational Therapist", "ADL assessment; vocational rehabilitation; community reintegration; daily structured activity; life skills groups; physical wellness; community outing D55"],
  ["Yoga / Wellness Instructor", "Daily yoga / pranayama; PMR; breathing exercises; gentle movement; OT-coordinated exercise programme"],
  ["Peer Specialist (if available)", "Shared experience sessions; hope instillation; peer mentorship; WRAP co-facilitation; community AA/recovery group bridging"],
];

const DAILY_ROUTINE_ROWS = [
  ["06:00–06:15", "Wake-up · Vitals", "Nursing", "Nursing check; weight weekly"],
  ["06:15–07:00", "Yoga / gentle movement / morning walk", "Yoga instructor", "Modified for symptom severity; non-mandatory in acute phase"],
  ["07:00–07:30", "Personal hygiene (ADL monitoring) · morning medications", "Nursing (MAR)", "Supervised ADL in Phase 1; independent in Phase 3"],
  ["07:30–08:00", "Breakfast", "Self", "Metabolic-friendly meals; supervised eating if needed"],
  ["08:00–08:45", "Morning group: check-in, mood score (1–10), one intention", "Psychologist / Nursing", "Low-stimulation; brief and structured; optional in Phase 1"],
  ["09:00–10:00", "Individual therapy (CBTp / ACT / CogRem / supportive — 3×/week) OR CBTp group / CogRem (other days)", "Psychologist", "Paced to symptom state"],
  ["10:00–10:15", "Tea break", "Self", ""],
  ["10:15–11:15", "Psychoeducation group / SST / OT group (rotating)", "Psychologist / OT / MSW", "See day-by-day schedule"],
  ["11:15–12:00", "Occupational therapy / life skills / vocational activity", "OT", "ADL, creative, vocational"],
  ["12:00–12:30", "Lunch + midday medications", "Nursing", ""],
  ["12:30–14:00", "Rest hour (mandatory)", "Self", "Especially important in Phase 1 — sensory rest"],
  ["14:00–15:00", "Psychoeducation / WRAP / RPP / medication group (rotating)", "Psychologist / MSW", ""],
  ["15:00–15:30", "Free time / journalling / reading", "Self", "Recovery workbook and illness education booklet available"],
  ["15:30–16:30", "Physical exercise / sport / OT outdoor activity", "OT-supervised", "Graded by phase; community walk in Phase 3"],
  ["16:30–17:00", "Family visiting (scheduled, 3×/week)", "MSW", "Structured visits with MSW present in Phase 1"],
  ["17:00–18:00", "Mindfulness / ACT / relaxation (3×/week)", "Psychologist", "PMR, breathing, ACT exercises"],
  ["18:00–19:00", "Dinner", "Self", ""],
  ["19:00–20:00", "Evening reflection group: check-out, gratitude, intention", "Nursing / MSW", ""],
  ["20:00–20:30", "Evening medications · nursing check", "Nursing", ""],
  ["20:30–22:00", "Personal time / journalling", "Self", ""],
  ["22:00", "Lights out · night round", "Nursing", ""],
];

const PHASE1_ROWS = [
  ["Day 1", "Safety & acute orientation", "Brief supportive contact; MSE; suicide/violence risk (C-SSRS); establish therapeutic rapport", "Ward orientation group (low stimulation, 20 min max)", "Family arrival briefing; consent documentation (MSW + Psychiatrist)", "Patient is safe; MHCA consent documented"],
  ["Day 2", "Assessment — psychiatric", "Psychiatric diagnostic interview (ICD-11); PANSS; CGIS; substance screen (AUDIT/ASSIST)", "Gentle group: 'Welcome and introductions' (15 min)", "FAM-F-001 family assessment initiated (MSW)", "Baseline PANSS and CGIS recorded"],
  ["Day 3", "Assessment — psychological", "MoCA / RBANS cognitive screen; ITAQ (insight); GAF; ACE trauma screen; S-QoL 18", "Sensory-friendly group: mindfulness breathing (15 min)", "MSW completes social history; housing/support mapping", "Baseline cognitive and insight scores recorded"],
  ["Day 4", "Assessment — family & social", "Psychoeducation introduction (brief, supported); explore patient's understanding of illness", "Low-stimulation art group (unstructured creativity)", "Family psychoeducation session 1: 'What is schizophrenia?' (MSW + Psychiatrist)", "Family oriented; patient understanding of illness explored"],
  ["Day 5", "Formulation", "Initial case formulation discussion with patient; strengths-based framing; stress-vulnerability model intro", "Supportive group: 'My strengths' (15 min)", "MDT case conference; treatment plan signed; family present (optional)", "Treatment plan in place; formulation shared with patient"],
  ["Day 6", "Sleep & safety", "Sleep hygiene support; address nighttime fears or hallucination-related distress", "Gentle movement / yoga (20 min, OT-led)", "Family check-in call (MSW)", "Sleep routine established; nighttime safety plan"],
  ["Day 7", "Week 1 review", "PANSS brief; medication side effect review with patient; titration counselling", "Group: relaxation — progressive muscle relaxation (PMR)", "Family session 1 (formal): illness understanding; medication consent", "Day 7 PANSS documented; medication tolerated; family engaged"],
  ["Day 8", "Positive symptoms — education", "Supportive psychotherapy: normalising hallucinations and delusions; reducing shame", "Group: 'Experiences we share' (hearing voices — normalised, non-pathologising)", "—", "Patient can describe positive symptoms without shame"],
  ["Day 9", "Cognitive orientation", "Cognitive rehabilitation intro: attention and concentration exercises (pen-paper)", "OT group: structured attention task (puzzles, word games)", "—", "Engagement in structured cognitive task achieved"],
  ["Day 10", "Emotional safety", "Supportive therapy: identifying emotions; emotion names; containment strategies", "Group: emotion identification exercise (visual emotion cards)", "Family session 2: family coping and self-care (MSW)", "Patient can name 3 emotions; containment strategy identified"],
  ["Day 11", "Coping with voices", "CBT-informed: normalising and coping with distressing auditory hallucinations (voice diary)", "Group: 'Voices and what they mean' — shared experience (facilitated)", "—", "Voice diary started; at least one coping strategy for voices"],
  ["Day 12", "Reality testing — gentle intro", "Gentle Socratic questioning around a specific belief; no confrontation; guided reflection", "Group: 'What is real? What might be my mind?' — psychoeducation (low pressure)", "—", "Patient able to hold two perspectives without escalation"],
  ["Day 13", "Medication engagement", "Collaborative medication discussion — patient's views, concerns, and hopes for medication", "Group: 'My medication — questions I have' (anonymous card questions, psychiatrist answers)", "MSW: document patient preference (oral vs LAI) — MHCA §18", "Medication concerns addressed; preferences documented"],
  ["Day 14", "Routine building", "OT-led daily structure planning; meaningful activity scheduling", "OT group: 'My ideal day' — structured scheduling exercise", "Family session 3: family routine and home environment planning (MSW)", "Daily routine plan drafted"],
  ["Day 15", "Phase 1 review", "PANSS Day 15; CGIS Day 15; medication response review; formulation update; transition to Phase 2", "Group: '2 weeks in — how are you feeling?' — open reflection", "MDT Phase 1 review; family outcome update", "Phase 1 outcomes documented; transition to Phase 2 confirmed"],
];

const PHASE2_ROWS = [
  ["Day 16", "Psychoeducation — illness model", "Stress-vulnerability model (Zubin & Spring) — personalised for patient; trigger identification", "Group: 'Understanding my illness' — interactive psychoeducation", "Family psychoeducation session 3: stress-vulnerability model for families", "Patient can explain stress-vulnerability model in own words"],
  ["Day 17", "CBTp — Module 1", "Thought record introduction; identifying automatic thoughts; cognitive ABC model adapted for psychosis", "CBTp group: 'My thoughts — where do they come from?'", "—", "First thought record completed"],
  ["Day 18", "Negative symptoms focus", "Behavioural activation for negative symptoms — identifying small meaningful activities", "OT group: activity menu — choosing one daily pleasure activity", "—", "One pleasure activity scheduled daily"],
  ["Day 19", "CBTp Module 2", "Normalising model — psychosis as extreme end of normal continuum; reducing self-stigma", "Group: 'Voices and visions — experiences across cultures'", "—", "Self-stigma reduced; normalising framework understood"],
  ["Day 20", "Social skills (SST) — Session 1", "Social skills training: eye contact, conversation initiation, turn-taking", "SST group: introduction session — basic conversation skills role play", "Family session 4: communication strategies when patient is unwell", "Basic conversation skills practised"],
  ["Day 21", "3-week MDT review", "PANSS Day 21; CGIS; ITAQ re-assessment; LAI discussion if compliance concern", "Group: 'Three weeks — what's changing for me?'", "MDT review — psychiatrist, psychologist, MSW, nursing, OT; family invited", "3-week outcomes documented; LAI decision made if indicated"],
  ["Day 22", "CBTp Module 3", "Evidence for and against — examining the evidence for a specific belief collaboratively", "CBTp group: 'Testing my beliefs gently' — Socratic dialogue exercise", "—", "One belief examined using evidence-testing method"],
  ["Day 23", "Emotion regulation", "DBT-informed: identify emotion triggers; reduce vulnerability (PLEASE skills)", "Group: PLEASE skills (Physical health, Licit drugs, Eating, Avoiding, Sleep, Exercise)", "—", "PLEASE self-care plan drafted"],
  ["Day 24", "Occupational therapy intensive", "ADL (Activities of Daily Living) assessment; cooking, hygiene, money management skills", "OT group: practical life skills — meal preparation or laundry (hands-on)", "—", "ADL assessment complete; skills gap identified"],
  ["Day 25", "CBTp Module 4", "Attention-switching / selective attention in psychosis; spotlight metaphor", "Group: 'Where is your spotlight pointing?' — attention exercise", "Family session 5: family expressed emotion — reducing high EE", "High EE patterns identified in family; family strategies for low EE"],
  ["Day 26", "SST — Session 2", "Social skills: assertiveness and saying no; asking for help", "SST group: assertiveness role play — asking for help scenarios", "—", "Assertiveness role play completed × 3 scenarios"],
  ["Day 27", "Peer support introduction", "Introduction to peer support; peer specialist model; normalising help-seeking", "Group: Guest peer specialist (person with lived experience of psychosis recovery)", "—", "Peer support normalised; patient expresses hope"],
  ["Day 28", "CBTp Module 5", "Safety behaviours in psychosis — identifying and reducing unhelpful safety behaviours", "CBTp group: 'What do I do to feel safe? Does it help?'", "—", "One safety behaviour identified; experiment designed"],
  ["Day 29", "Trauma-informed care", "Trauma screen (ACE) review; trauma-informed supportive therapy if trauma history identified; grounding techniques", "Group: Grounding and containment skills — 5-4-3-2-1 technique", "—", "Grounding skill practised; trauma referred if indicated"],
  ["Day 30", "1-month review", "PANSS Day 30; CGIS; S-QoL; metabolic monitoring by nursing; full MDT review; medication efficacy assessment", "Group: '1 Month Milestone' — celebration and reflection", "MDT + family: 1-month review meeting; discharge planning timeline introduced", "1-month outcomes documented; treatment response classified"],
  ["Day 31", "CBTp Module 6", "Formulation-based belief modification — updating personal formulation; what has changed?", "Group: 'My updated story' — sharing formulation changes in group", "—", "Updated CBTp formulation document"],
  ["Day 32", "SST — Session 3", "Social skills: friendship skills; joining a conversation; ending conversations politely", "SST group: social interaction role play — joining and leaving conversations", "Family session 6: rebuilding family relationships — communication practice", "Friendship skills rehearsed × 4 scenarios"],
  ["Day 33", "Mindfulness for psychosis", "Mindfulness for psychosis — mindful observation of thoughts without fusion (Acceptance and Commitment)", "ACT group: 'Leaves on a stream' — defusion exercise for intrusive thoughts", "—", "Defusion technique practised × 2"],
  ["Day 34", "Vocational rehabilitation", "Vocational history; work/study goals; supported employment pathway discussion (OT + MSW)", "OT group: strengths and skills inventory; career values exercise", "MSW: vocational plan; supported employment / NSDC linkage", "Vocational plan draft initiated"],
  ["Day 35", "Cognitive rehabilitation (CogRem) 1", "CogRem: attention training — sustained attention tasks (CogPack / pen-paper)", "Cognitive group: attention exercises (30 min)", "—", "Attention training session 1 complete; baseline score"],
  ["Day 36", "CBTp Module 7", "Imagery rescripting — modifying distressing imagery associated with delusional or hallucinatory content", "Group: 'Changing the picture' — guided imagery exercise", "—", "One distressing image modified using rescripting"],
  ["Day 37", "Sleep & circadian", "CBT-I (insomnia): sleep restriction, stimulus control, relaxation in the context of antipsychotic use", "Group: 'Sleep and schizophrenia' — psychoeducation + CBT-I techniques", "Family session 7: family sleep environment and night-time safety", "Sleep diary started; sleep hygiene plan written"],
  ["Day 38", "SST — Session 4", "Workplace / community social skills: dealing with authority figures, strangers, service settings", "SST group: community role play — bank, clinic, supermarket scenarios", "—", "Community social skills rehearsed × 3 settings"],
  ["Day 39", "Stigma & self-identity", "Narrative therapy: 'preferred identity' — who I am beyond my diagnosis", "Group: 'My story — more than my diagnosis' narrative group", "—", "Patient articulates preferred identity narrative"],
  ["Day 40", "Family therapy — EE focus", "Psychoeducation about relapse warning signs for family; early warning sign joint identification", "Group: 'My early warning signs' — patient-led identification", "Family session 8: early warning signs jointly mapped by patient + family", "Early warning sign list created; family has a copy"],
  ["Day 41", "CogRem 2", "Working memory training — verbal and visual working memory tasks", "Cognitive group: memory training tasks (30 min)", "—", "Working memory session 2; improvement vs baseline tracked"],
  ["Day 42", "ACT — Session 2", "Values identification in ACT — what truly matters to this patient beyond symptoms", "ACT group: 'The bull's eye exercise' — values and committed action", "—", "Personal values statement written"],
  ["Day 43", "Medication adherence", "Medication self-management programme: understanding own medication, monitoring side effects, when to call for help", "Group: 'Being your own medication expert' — medication self-management skills", "Family session 9: medication management at home; what to do if patient refuses", "Medication self-management skills demonstrated"],
  ["Day 44", "Physical wellness", "Exercise physiology (OT); nutritional counselling (metabolic monitoring context); smoking cessation discussion", "OT group: structured exercise programme; yoga / stretching", "—", "Physical wellness plan drafted; exercise schedule created"],
  ["Day 45", "Phase 2 / 6-week review", "PANSS Day 45; CGIS; AIMS (tardive dyskinesia check); S-QoL; ITAQ; cognitive re-assessment; formulation update", "Group: '6 Weeks — a check-in on my journey'", "MDT full review + family; LAI confirmed / discontinued; switch decision if needed", "6-week comprehensive outcomes documented"],
];

const PHASE3_ROWS = [
  ["Day 46", "Recovery model introduction", "Personal recovery — CHIME framework (Connectedness, Hope, Identity, Meaning, Empowerment) introduced", "Group: 'What does recovery mean to me?'", "Family session 10: family vision for recovery", "CHIME framework understood; personal recovery vision started"],
  ["Day 47", "SST — Session 5", "Advanced social skills: employment interview skills; professional communication", "SST group: job interview role play", "MSW: employment / education application support", "Interview skills practised × 2 mock interviews"],
  ["Day 48", "CBTp — Maintenance Module", "Relapse prevention using CBTp: early warning signs + CBT coping strategies integrated", "Group: 'My CBT toolkit for bad days'", "—", "Personal CBT relapse prevention toolkit written"],
  ["Day 49", "CogRem 3", "Processing speed training — processing speed tasks; information retrieval exercises", "Cognitive group: processing speed tasks (30 min)", "—", "Processing speed session 3 complete"],
  ["Day 50", "Insight deepening", "ITAQ re-assessment; collaborative discussion of insight level; non-coercive exploration of illness understanding", "Group: 'Understanding what happened to me' — psychoeducation", "—", "Insight score updated; patient's explanatory model documented"],
  ["Day 51", "Relapse prevention plan (draft)", "Begin personalised Relapse Prevention Plan (RPP): triggers, warning signs, coping, escalation contacts", "Group: 'My plan for staying well' — RPP workshop", "Family session 11: family role in the RPP; family emergency contacts", "RPP first draft completed"],
  ["Day 52", "Spirituality & meaning", "Meaning-making in illness; spiritual / existential dimensions of recovery (non-dogmatic)", "Group: 'Finding meaning' — spirituality and recovery discussion", "—", "Personal meaning statement written"],
  ["Day 53", "ACT — Session 3", "Committed action — taking values-based action despite symptoms; psychological flexibility", "ACT group: 'What would I do if symptoms were 20% quieter?' — committed action planning", "—", "One committed action step taken this week"],
  ["Day 54", "CogRem 4", "Executive function training — problem-solving, planning, and sequencing tasks", "Cognitive group: executive function exercises — Tower of Hanoi / planning tasks", "—", "Executive function session 4 complete"],
  ["Day 55", "Community integration", "Community trips planning (OT + MSW); public transport, shopping, community mental health centre orientation", "OT group: community outing preparation — safety planning", "MSW: community mental health linkage; CMHC / ASHA worker introduction", "Community integration plan in place; community outing scheduled"],
  ["Day 56", "Family therapy — advanced", "Behavioural family therapy: problem-solving skills within the family unit", "Group: Problem-solving skills training", "Family session 12: family problem-solving session — structured IDEAL model", "Family can use structured problem-solving for one identified family issue"],
  ["Day 57", "SST — Session 6", "Community living skills: using public services, accessing healthcare, managing appointments", "SST group: healthcare navigation role play — 'Booking my follow-up appointment'", "—", "Healthcare self-advocacy skills practised"],
  ["Day 58", "2-month review", "PANSS Day 60; CGIS; S-QoL; MoCA; metabolic monitoring; review LAI adherence", "Group: '60 Days — celebrating progress'", "MDT + family: 2-month review; discharge date confirmed; plan finalised", "2-month outcomes documented; discharge plan confirmed"],
  ["Day 59", "CogRem 5", "Social cognition training: emotion recognition, theory of mind exercises", "Cognitive group: facial emotion recognition tasks; ToM stories", "—", "Social cognition training session 5 complete"],
  ["Day 60", "Discharge planning — practical", "Practical discharge planning: housing, support networks, finances, ID documents (with MSW)", "Group: 'Preparing for life outside'", "Family session 13: discharge readiness; home safety plan", "Practical discharge checklist initiated"],
  ["Day 61", "Wellbeing plan", "Wellbeing action plan (WRAP — Wellness Recovery Action Plan): daily wellness tools", "Group: WRAP workshop — building a personal wellness plan", "—", "WRAP document started"],
  ["Day 62", "CBTp booster", "Booster session: review all CBTp modules; patient summarises what they have learned", "CBTp group: 'My CBT story — what has changed?'", "—", "All CBTp modules reviewed; learning consolidated"],
  ["Day 63", "CogRem 6", "Memory strategies for daily living: external aids, mnemonics, phone reminders", "Cognitive group: everyday memory strategies — practical application", "—", "3 practical memory strategies adopted"],
  ["Day 64", "Crisis plan", "Detailed crisis plan: what to do when feeling unwell; who to call; what NOT to do", "Group: Crisis plan workshop — 'My safety plan'", "Family session 14: family crisis response plan; hospital re-admission pathway", "Crisis plan signed; family has a copy"],
  ["Day 65", "Grief & loss in psychosis", "Grief work — losses from illness (relationships, career, time, aspirations); narrative grief therapy", "Group: 'What I have lost and what I have gained' — grief processing", "—", "Grief acknowledged; resilience narrative alongside grief"],
  ["Day 66", "SST — Session 7 (advanced)", "Community and workplace disclosure: how to talk about mental illness; to disclose or not to disclose", "SST group: disclosure decision-making role play; practising a brief disclosure script", "—", "Disclosure script practised; decision about disclosure context made"],
  ["Day 67", "Self-management — early warning", "Personal early warning sign card finalised; individualised action steps at each stage", "Group: 'My traffic light plan' — green/amber/red self-management framework", "Family session 15: traffic light plan reviewed with family; roles clarified", "Traffic light plan laminated; family has a copy"],
  ["Day 68", "Occupation & purpose", "Meaning through occupation — volunteering, structured activity, creative pursuits", "OT group: community activity options; creative project (to take home)", "MSW: finalise vocational / community activity placement if applicable", "Ongoing occupation identified; referral made if applicable"],
  ["Day 69", "WRAP completion", "WRAP document finalised — daily maintenance plan, triggers, early warning signs, crisis plan, post-crisis plan", "Group: WRAP sharing session — each patient shares one section", "—", "WRAP document complete; signed; copy given to patient and family"],
  ["Day 70", "10-week review", "PANSS Day 70; CGIS; AIMS; S-QoL; ITAQ; medication review; RPP progress", "Group: '10 Weeks — looking back and looking forward'", "MDT review; family update; confirm discharge date and post-discharge plan", "10-week outcomes documented"],
  ["Day 71", "Medication self-management", "Final medication self-management session: own medication card; how to access prescription; what to do in emergency", "Group: 'I am my own medication manager' — role play", "—", "Personal medication card completed; patient can state own medication names and doses"],
  ["Day 72", "Social network mapping", "Personal social network map — supportive vs stressful relationships; strengthening support network", "Group: Social network exercise — drawing my circle of support", "Family session 16: family as part of the support network; boundaries and roles", "Social network map complete; 3 key supports identified"],
  ["Day 73", "CogRem — Final session", "CogRem completion: summary of improvements; strategies to continue independently", "Cognitive group: graduation exercise — 'My cognitive toolkit'", "—", "CogRem programme complete; post-test scores vs baseline documented"],
  ["Day 74", "ACT — Final session", "ACT values in action: review committed action steps taken during programme; consolidate psychological flexibility", "ACT group: 'The life I want' — committed action review", "—", "Values-based committed action plan for post-discharge written"],
  ["Day 75", "Pre-discharge review", "PANSS Day 75; CGIS; review RPP; confirm all discharge documents; medication optimised", "Group: '75 Days — pre-discharge circle'", "MDT pre-discharge conference; family present; confirm EP-01 criteria met", "Pre-discharge criteria confirmed by MDT"],
  ["Day 76", "Relapse Prevention Plan final", "RPP finalised and signed; copy to patient, family, and case file; rehearse top 3 early warning signs", "Group: RPP peer witness — patients read a paragraph of their plan aloud", "—", "Signed RPP filed; patient can recite own early warning signs and action steps"],
  ["Day 77", "Communication rehearsal", "Re-entry conversation practice: talking to family, employer, social contacts about the admission", "Group: Re-entry role play — 'How to explain where I've been'", "Family session 17: re-entry logistics; first week at home plan", "Re-entry script practised; first week at home plan written"],
  ["Day 78", "Discharge card & helplines", "Discharge card reviewed: JRCPL 9822207761 (primary); Tele MANAS 14416; iCALL 9152987821; Vandrevala 9999 666 555", "Group: Helpline role play — 'When to call; what to say'", "MSW: discharge checklist; follow-up FU-1 to FU-5 booked; CMHC link confirmed", "Discharge card understood; helplines saved in patient's phone"],
  ["Day 79", "Self-compassion", "Self-compassion for setbacks — anticipating bad days; self-compassion plan for post-discharge", "Group: Compassion circle — 'What I wish for myself and each other post-discharge'", "—", "Self-compassion plan written"],
  ["Day 80", "Final MDT conference", "MDT discharge conference; all documents reviewed; clinical discharge summary drafted; EP-01 criteria confirmed", "Group: Peer recognition ceremony", "MSW: DC card, WRAP, RPP, crisis plan given to family", "Discharge documents complete; EP-01 confirmed"],
  ["Day 81", "Physical health final", "Final physical review: weight, BMI, metabolic screen, AIMS; any referrals needed (endocrinology, cardiology)", "OT group: final exercise and wellness session", "—", "Final metabolic and AIMS documented; referrals made"],
  ["Day 82", "Legacy letter", "Patient writes a 'legacy letter' — advice to someone newly admitted with schizophrenia", "Group: Legacy letters read aloud; message of hope for the programme", "Family session 18: final joint session — patient reads commitment to family", "Legacy letter written; family commitment ceremony completed"],
  ["Day 83", "Consolidation", "Final individual review of all therapeutic tools — WRAP, RPP, crisis plan, medication card, traffic light plan", "Group: 'My toolkit' — patient presents their full set of discharge tools to the group", "—", "All tools reviewed; patient confident using each tool"],
  ["Day 84", "3-month review", "Final comprehensive outcome battery: PANSS, CGIS, AIMS, S-QoL, ITAQ, MoCA/RBANS, GAF, C-SSRS", "Group: '84 Days — Milestone Ceremony'", "Family present for milestone; outcome report shared with family", "Final outcome battery complete; programme data recorded"],
  ["Day 85", "Finalise discharge documents", "Any outstanding discharge documents completed; medication supply confirmed; referral letters sent", "Group: Open discussion — hopes and fears about going home", "MSW: confirm transport, accommodation, MAT/CMHC follow-up", "All discharge documents complete; CMHC referral sent"],
  ["Day 86", "Farewell to programme", "Therapeutic ending: gratitude and reflection on 86 days; therapeutic relationship closure", "Group: Farewell circle — each patient and therapist shares one thing they will carry forward", "—", "Therapeutic relationship ended with dignity; patient expresses readiness"],
  ["Day 87", "Contingency planning", "What if things go wrong? Five layers of contingency — person to call, action to take, place to go", "Group: 'Plan B and Plan C'", "—", "Contingency plan (5 layers) complete; laminated card"],
  ["Day 88", "Medication final check", "Review discharge medication with patient; dose, timing, storage, refill process, what to do if missed", "Group: 'Medication for life — questions and fears'", "—", "Patient can state all medications, doses, and what to do if a dose is missed"],
  ["Day 89", "Discharge preparation", "Final packing; goodbyes; serenity reflection; spiritual closing; peer recognition", "Group: Final evening group — 'The road ahead'", "Family present at final group", "Emotional readiness for discharge confirmed"],
  ["Day 90", "DISCHARGE", "Discharge interview; patient satisfaction form; aftercare plan signed; all documents given to patient + family", "Final discharge group: 'Carry the message'", "Family present at discharge; Discharge Card, WRAP, RPP, Crisis Plan, Medication Card given", "Discharge completed per DC-001 SOP; follow-up FU-1 to FU-5 booked"],
];

const FAMILY_ROWS = [
  ["F1", "Day 4", "'What is schizophrenia?' — illness education session", "MSW + Psychiatrist", "Family understands diagnosis; stigma addressed"],
  ["F2", "Day 7", "Medication consent; LAI discussion; medication information leaflet given", "Psychiatrist + MSW", "Informed consent documented; medication questions answered"],
  ["F3", "Day 10", "Family coping and self-care; identifying caregiver strain", "MSW", "Family coping plan; caregiver strain acknowledged"],
  ["F4", "Day 16", "Stress-vulnerability model for families; how family behaviour affects relapse", "MSW + Psychologist", "Family understands stress-vulnerability model"],
  ["F5", "Day 20", "Communication strategies when patient is unwell; de-escalation", "MSW", "Family has 3 de-escalation strategies"],
  ["F6", "Day 25", "Expressed emotion (EE): what it is, how to reduce it; warmth without over-involvement", "Psychologist", "High EE patterns identified; reduction strategies in place"],
  ["F7", "Day 32", "Rebuilding family relationships — communication exercise; 'I' statements", "MSW", "Family communication practice; 'I' statement skill demonstrated"],
  ["F8", "Day 37", "Sleep environment and night-time safety at home; what to do if patient is distressed at night", "MSW", "Night-time safety plan written"],
  ["F9", "Day 40", "Early warning signs — family identification and action plan", "Psychologist + MSW", "Family has written early warning sign list with action steps"],
  ["F10", "Day 43", "Medication management at home; what to do if patient refuses medication", "Psychiatrist + MSW", "Medication refusal plan documented; family confident"],
  ["F11", "Day 46", "Family vision for recovery; CHIME model for families", "Psychologist", "Family recovery vision written"],
  ["F12", "Day 51", "Family role in the Relapse Prevention Plan (RPP)", "Psychologist + MSW", "Family RPP role documented; emergency contacts confirmed"],
  ["F13", "Day 56", "Behavioural family therapy: structured family problem-solving (IDEAL model)", "Psychologist", "Family can use IDEAL model for one family problem"],
  ["F14", "Day 60", "Discharge readiness; home safety plan; community support mapping", "MSW", "Home safety plan and community support map complete"],
  ["F15", "Day 64", "Family crisis response plan; hospital re-admission pathway; JRCPL 9822207761", "MSW", "Crisis plan signed; family knows re-admission steps"],
  ["F16", "Day 67", "Traffic light plan reviewed with family; family roles at each stage", "Psychologist + MSW", "Family has laminated traffic light plan"],
  ["F17", "Day 72", "Family as part of support network; boundaries and roles post-discharge", "MSW", "Family network map; healthy boundaries agreed"],
  ["F18", "Day 82", "Final joint session — patient reads commitment to family; legacy letter", "Psychologist + MSW", "Family commitment ceremony completed; therapeutic ending with family"],
];

const COGREM_ROWS = [
  ["CogRem 1", "Day 35", "Attention", "Sustained attention tasks — CogPack / pen-paper digit cancellation; Trail Making Test A", "Sustained Attention (pre-score)"],
  ["CogRem 2", "Day 41", "Working Memory", "Verbal and visual working memory — digit span forward/backward; Corsi block tapping", "Working Memory Index (RBANS)"],
  ["CogRem 3", "Day 49", "Processing Speed", "Symbol coding; reaction time tasks; information retrieval speed exercises", "Processing Speed Index"],
  ["CogRem 4", "Day 54", "Executive Function", "Tower of Hanoi; BADS planning tasks; sequencing exercises; problem-solving scenarios", "Executive Function composite"],
  ["CogRem 5", "Day 59", "Social Cognition", "Facial emotion recognition (FERT); Theory of Mind stories (Happé TOM stories)", "FERT accuracy score"],
  ["CogRem 6", "Day 63", "Memory Strategies", "External memory aids; mnemonic techniques; phone reminder systems; prospective memory tasks", "Everyday Memory Self-Report"],
  ["CogRem 7", "Day 73", "Final Review & Post-test", "Full RBANS post-test; patient summary of cognitive toolkit; strategies to continue at home", "RBANS post-test vs baseline (Day 35)"],
];

const OUTCOME_ROWS = [
  ["PANSS", "Positive and Negative Syndrome Scale", "Psychosis severity — 30 items", "D1, D15, D21, D30, D45, D60, D75, D84, D90"],
  ["CGIS", "Clinical Global Impression — Severity", "Overall severity", "D1, D7, D14, D21, D30, D45, D60, D75, D90"],
  ["CGIC", "Clinical Global Impression — Change", "Response to treatment", "D14, D30, D45, D60, D90"],
  ["AIMS", "Abnormal Involuntary Movement Scale", "Tardive dyskinesia screening", "D1, D45, D90; every 6 months ongoing"],
  ["ITAQ", "Insight and Treatment Attitudes Questionnaire", "Insight level", "D3, D21, D45, D75, D90"],
  ["S-QoL 18", "Schizophrenia Quality of Life Scale — 18 items", "Subjective quality of life", "D5, D30, D60, D84"],
  ["GAF", "Global Assessment of Functioning", "Functional level", "D3, D30, D60, D90"],
  ["MoCA", "Montreal Cognitive Assessment", "Cognitive screening", "D3, D45, D90"],
  ["RBANS", "Repeatable Battery for Assessment of Neuropsychological Status", "Cognitive domains (CogRem)", "D35 (pre-CogRem), D73 (post-CogRem)"],
  ["C-SSRS", "Columbia Suicide Severity Rating Scale", "Suicide risk", "D1, D7, D15, D30, D60, D90; any concern"],
  ["AUDIT", "Alcohol Use Disorders Identification Test", "Comorbid substance use", "D2, D45"],
  ["ASSIST", "Substance Involvement Screening Test", "Polysubstance comorbidity", "D2, D45"],
  ["STAMP/HCR-20 brief", "Violence risk screen", "Violence risk monitoring", "D1, D30, D75"],
  ["PHQ-9", "Patient Health Questionnaire", "Comorbid depression", "D5, D21, D45, D75, D90"],
  ["WHOQOL-BREF", "WHO Quality of Life Brief", "Wellbeing", "D45, D90"],
];

const DOCUMENTATION_ROWS = [
  ["Individual therapy session note (CBTp / ACT / supportive)", "Psychologist", "Within 24 hrs", "Case file"],
  ["Group session facilitation note", "Facilitator", "Same day", "Group register + case file"],
  ["Family session note", "MSW", "Within 24 hrs", "Case file + FAM-F"],
  ["PANSS / CGIS assessment note", "Psychiatrist", "Day of assessment", "Case file"],
  ["AIMS assessment note", "Psychiatrist", "D1, D45, D90", "Case file; MedRec"],
  ["CogRem session note with pre/post scores", "Psychologist", "Within 24 hrs", "Case file; CogRem log"],
  ["Weekly MDT note", "All MDT", "Same day", "Case file"],
  ["Relapse Prevention Plan (signed by patient)", "Psychologist + Patient", "Day 76", "Case file + patient + family"],
  ["WRAP document (signed)", "Psychologist + Patient", "Day 69", "Case file + patient + family"],
  ["Crisis plan (signed)", "Psychologist + Patient", "Day 64", "Case file + patient + family"],
  ["Traffic light plan (laminated)", "Psychologist", "Day 67", "Given to patient + family"],
  ["Discharge Card — JRCPL 9822207761 listed first", "MSW", "Day 90", "Given to patient + family"],
  ["Clinical Discharge Summary (DS-[ID]-[DATE])", "Psychiatrist", "Day 89–90", "Case file + copy to receiving provider"],
];

const KPI_ROWS = [
  ["PANSS documented at all 9 checkpoints", "100%", "Monthly"],
  ["CBTp individual sessions completed (vs planned)", "≥ 90% attendance", "Monthly"],
  ["Family programme — minimum 10 sessions per admission", "100% of admissions with family contact", "Monthly"],
  ["RPP, WRAP, and Crisis Plan completed before discharge", "100%", "Monthly"],
  ["AIMS documented at admission, Day 45, Day 90", "100%", "Monthly"],
  ["CogRem 7-module completion rate", "≥ 85%", "Quarterly"],
  ["30-day post-discharge antipsychotic continuation (FU-2)", "≥ 90%", "Quarterly"],
  ["PANSS improvement ≥ 20% from Day 1 to Day 90", "≥ 75% of patients", "Quarterly"],
  ["Hospital readmission within 90 days post-discharge", "< 20%", "Quarterly"],
  ["S-QoL 18 improvement from D5 to D84", "≥ 25% improvement", "Quarterly"],
  ["Community placement (CMHC / OPD / supported living) at discharge", "100%", "Monthly"],
];

const SczCl01CSchizophreniaRehabilitation = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
    <ProtocolHeader
      heading={props.heading}
      clCode="SCZ-CL-01-C"
      title="Psychosocial Rehabilitation Programme — Schizophrenia Spectrum Disorders"
      icdLine="Acute Stabilisation (D1–15) · Consolidation (D16–45) · Maintenance & Discharge Preparation (D46–90) | Protocol Code: SCZ-CL-01-C v1.0 | Effective: June 2026"
      org="jagrutii"
      subtitle="Clinical Excellence Framework — Psychiatric Care Vertical"
    />

    {/* 1. Purpose & Scope */}
    <SectionTitle>1. PURPOSE &amp; SCOPE</SectionTitle>
    <p style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
      This protocol governs the psychosocial rehabilitation programme for patients admitted to JRCPL's Psychiatric Care Vertical with Schizophrenia Spectrum Disorders (SSD). It provides a day-by-day therapeutic framework across 90 days, integrating evidence-based psychological therapies, cognitive rehabilitation, social skills training, family work, and recovery-oriented occupational therapy within a rights-based, MHCA 2017 compliant care structure.
    </p>
    <CalloutBox>
      <strong>SCHIZOPHRENIA-SPECIFIC CLINICAL PRINCIPLES:</strong> (1) Pace all psychological interventions to the patient's current symptom load — do not conduct high-demand cognitive or exposure work during acute positive symptoms. (2) Maintain a low-stimulation environment in Phase 1. (3) All therapy is collaborative, never coercive. (4) Insight work must be non-confrontational and exploratory. (5) Family involvement is therapeutic — manage Expressed Emotion (EE) actively. (6) Recovery is possible — communicate hope explicitly in every encounter.
    </CalloutBox>

    {/* 2. Core Therapeutic Modalities */}
    <SectionTitle>2. CORE THERAPEUTIC MODALITIES</SectionTitle>
    <Table
      cols={[
        { label: "Modality", width: "9%" },
        { label: "Full Name", width: "22%" },
        { label: "Evidence Base", width: "20%" },
        { label: "Phase", width: "7%", center: true },
        { label: "Format", width: "14%" },
        { label: "Schedule", width: "28%" },
      ]}
      rows={MODALITIES_ROWS}
    />

    {/* 3. MDT Roles */}
    <SectionTitle>3. MDT ROLES — PSYCHOSOCIAL PROGRAMME</SectionTitle>
    <Table
      cols={[
        { label: "Role", width: "22%" },
        { label: "Psychosocial Responsibilities", width: "78%" },
      ]}
      rows={MDT_ROLES_ROWS}
    />

    {/* 4. Standard Daily Routine */}
    <SectionTitle>4. STANDARD DAILY ROUTINE (Phase 2–3: Days 16–90)</SectionTitle>
    <Table
      cols={[
        { label: "Time", width: "14%" },
        { label: "Activity", width: "34%" },
        { label: "Led By", width: "20%" },
        { label: "Notes", width: "32%" },
      ]}
      rows={DAILY_ROUTINE_ROWS}
    />

    {/* 5. Day-by-Day Programme */}
    <SectionTitle>5. DAY-BY-DAY PSYCHOSOCIAL PROGRAMME — 90 DAYS</SectionTitle>

    <ModuleHeader>PHASE 1 — ACUTE STABILISATION | Days 1–15</ModuleHeader>
    <WarningBox>
      Phase 1 Clinical Note: Maintain low stimulation environment. Keep group sessions short (15–20 min max, Days 1–5). Individual sessions are supportive and brief (20–30 min). No confrontational or challenging CBT work. Priority: Safety · Trust · Engagement · Routine.
    </WarningBox>
    <Table
      cols={[
        { label: "Day", width: "7%" },
        { label: "Theme / Module", width: "13%" },
        { label: "Individual Therapy", width: "22%" },
        { label: "Group Session", width: "22%" },
        { label: "Family / MSW", width: "20%" },
        { label: "Outcome / Goal", width: "16%" },
      ]}
      rows={PHASE1_ROWS}
    />

    <ModuleHeader>PHASE 2 — CONSOLIDATION &amp; INTENSIVE REHABILITATION | Days 16–45</ModuleHeader>
    <CalloutBox>
      Phase 2 Clinical Note: Positive symptoms should be sufficiently controlled to allow structured individual and group therapy. Begin CBTp, CogRem, and SST in earnest. Family high expressed emotion (HEE) management is a priority. Pace all cognitive work to individual capacity. PANSS review at Day 21 and Day 30 guides titration of therapeutic intensity.
    </CalloutBox>
    <Table
      cols={[
        { label: "Day", width: "7%" },
        { label: "Theme / Module", width: "13%" },
        { label: "Individual Therapy", width: "22%" },
        { label: "Group Session", width: "22%" },
        { label: "Family / MSW", width: "20%" },
        { label: "Outcome / Goal", width: "16%" },
      ]}
      rows={PHASE2_ROWS}
    />

    <ModuleHeader>PHASE 3 — MAINTENANCE, RECOVERY SKILLS &amp; DISCHARGE PREPARATION | Days 46–90</ModuleHeader>
    <CalloutBox>
      Phase 3 Clinical Note: Focus shifts from symptom management to personal recovery, community reintegration, and relapse prevention. Discharge is actively planned. Every session should strengthen the patient's confidence in managing independently. Family is being prepared as the primary community support system.
    </CalloutBox>
    <Table
      cols={[
        { label: "Day", width: "7%" },
        { label: "Theme / Module", width: "13%" },
        { label: "Individual Therapy", width: "22%" },
        { label: "Group Session", width: "22%" },
        { label: "Family / MSW", width: "20%" },
        { label: "Outcome / Goal", width: "16%" },
      ]}
      rows={PHASE3_ROWS}
    />

    {/* 6. Family Programme */}
    <SectionTitle>6. FAMILY PROGRAMME — 18-SESSION OVERVIEW</SectionTitle>
    <Table
      cols={[
        { label: "Session", width: "8%", center: true },
        { label: "Day", width: "7%", center: true },
        { label: "Topic", width: "35%" },
        { label: "Led By", width: "18%" },
        { label: "Outcome", width: "32%" },
      ]}
      rows={FAMILY_ROWS}
    />

    {/* 7. CogRem */}
    <SectionTitle>7. COGNITIVE REMEDIATION PROGRAMME (CogRem) — 7-MODULE OVERVIEW</SectionTitle>
    <Table
      cols={[
        { label: "Module", width: "12%" },
        { label: "Day", width: "7%", center: true },
        { label: "Domain", width: "16%" },
        { label: "Tasks / Tools", width: "38%" },
        { label: "Outcome Measure", width: "27%" },
      ]}
      rows={COGREM_ROWS}
    />

    {/* 8. Outcome Measurement */}
    <SectionTitle>8. OUTCOME MEASUREMENT SCHEDULE</SectionTitle>
    <Table
      cols={[
        { label: "Tool", width: "16%" },
        { label: "Full Name", width: "30%" },
        { label: "Purpose", width: "22%" },
        { label: "Administered At", width: "32%" },
      ]}
      rows={OUTCOME_ROWS}
    />

    {/* 9. Documentation */}
    <SectionTitle>9. DOCUMENTATION REQUIREMENTS</SectionTitle>
    <Table
      cols={[
        { label: "Document", width: "35%" },
        { label: "By", width: "20%" },
        { label: "Timeline", width: "15%" },
        { label: "Filed", width: "30%" },
      ]}
      rows={DOCUMENTATION_ROWS}
    />

    {/* 10. KPIs */}
    <SectionTitle>10. KPIs — PSYCHOSOCIAL PROGRAMME</SectionTitle>
    <Table
      cols={[
        { label: "KPI", width: "52%" },
        { label: "Target", width: "28%" },
        { label: "Review", width: "20%" },
      ]}
      rows={KPI_ROWS}
    />

    {/* 11. Approval */}
    <ProtocolApprovalNew
      docCode="SCZ-CL-01-C"
      docTitle="Psychosocial Rehabilitation Programme — Schizophrenia Spectrum Disorders"
    />
  </ProtocolWrapper>
));

export default SczCl01CSchizophreniaRehabilitation;
