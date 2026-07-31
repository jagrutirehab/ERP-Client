# JRCPL Clinical Alert System — Block-by-Block Build Sheet

Every **target block** to create in **SopConfigs**, written out one by one with the exact form fields:
**Name · Severity · Alert message · Condition(s) · Routing · Action guidance · Reference section.**
Only blocks buildable on the **current committed workflow** are listed. Concepts & gap analysis: [JRCPL_CLINICAL_ALERT_SETUP.md](./JRCPL_CLINICAL_ALERT_SETUP.md).

**Global notes**
- Author **one rule per instrument**; each block below is a target block (conditions **AND**'d inside a block; blocks **OR** at the rule level).
- **All blocks are triggerType IMMEDIATE** unless noted. Every rule must be scoped to the JRCPL **center(s)**.
- **Routing** names ("Nursing", "On-call physician", "Psychiatrist", "Medical director") map to real roles via `GET /sop/getroles`; "Admission doctor/psychologist" = the care-team **toggles**.
- **Alert message** supports `{patient.name}` and `{field.value}` (the triggering score).
- `CONSECUTIVE_LOW` editor = **threshold** + **consecutive count** (default 2). Fires once when the last N assessments are all strictly below threshold; auto-resets when a score rises to/above it.

---

# 1. CIWA-Ar  (Rule model: `ciwaTest`, field `systemTotalScore`) · §3

### Block 1.1 — CIWA-Ar Alert (8–14)
- **Name:** CIWA-Ar Alert (8–14)
- **Severity:** MEDIUM
- **Alert message:** `CIWA-Ar {field.value} for {patient.name} — mild–moderate alcohol withdrawal. Review and consider PRN benzodiazepine per protocol.`
- **Conditions (AND):**
  - `ciwaTest.systemTotalScore GREATER_THAN_OR_EQUAL 8`
  - `ciwaTest.systemTotalScore LESS_THAN 15`
- **Routing:** Roles → Nursing, On-call physician
- **Action guidance:** Notify nursing + on-call physician for review; consider PRN dose per protocol.
- **Reference section:** JRCPL-EMR-CAS-001 §3.2

### Block 1.2 — CIWA-Ar Urgent (≥15)
- **Name:** CIWA-Ar Urgent (≥15)
- **Severity:** HIGH
- **Alert message:** `URGENT — CIWA-Ar {field.value} for {patient.name}: severe alcohol withdrawal. Immediate physician review.`
- **Conditions (AND):**
  - `ciwaTest.systemTotalScore GREATER_THAN_OR_EQUAL 15`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate physician review; consider additional medication or escalation of care.
- **Reference section:** JRCPL-EMR-CAS-001 §3.2

### Block 1.3 — CIWA-Ar Suggest Discontinue
- **Name:** CIWA-Ar Suggest Discontinue
- **Severity:** LOW
- **Alert message:** `{patient.name}: CIWA-Ar in the 0–7 range for 2 consecutive assessments. Suggest discontinuing daily CIWA-Ar monitoring — clinician acknowledgment required.`
- **Conditions (AND):**
  - `ciwaTest.systemTotalScore CONSECUTIVE_LOW` — threshold **8**, count **2**
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Suggestion only — discontinuation requires clinician acknowledgment, not an automatic stop.
- **Reference section:** JRCPL-EMR-CAS-001 §3.3

> ❌ Not built: Day-12 "Protocol Duration Exceeded" alert; the "no autonomic instability / no seizures in interim" gate.

---

# 2. C-SSRS  (Rule model: `SSRSTest`, fields `systemIdeationScore`, `systemBehaviorScore`) · §4

### Block 2.1 — C-SSRS Low flag (ideation 1–2)
- **Name:** C-SSRS Low flag (ideation 1–2)
- **Severity:** LOW
- **Alert message:** `{patient.name}: C-SSRS ideation {field.value} (low-severity). Log and continue weekly screening; routine clinical awareness.`
- **Conditions (AND):**
  - `SSRSTest.systemIdeationScore GREATER_THAN_OR_EQUAL 1`
  - `SSRSTest.systemIdeationScore LESS_THAN_OR_EQUAL 2`
  - `SSRSTest.systemBehaviorScore LESS_THAN 1`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Log and continue weekly screening; routine clinical awareness.
- **Reference section:** JRCPL-EMR-CAS-001 §4.2

### Block 2.2 — C-SSRS Alert (ideation 3–4)
- **Name:** C-SSRS Alert (ideation 3–4)
- **Severity:** MEDIUM
- **Alert message:** `C-SSRS ideation {field.value} for {patient.name} — moderate ideation. Clinician review; review safety plan; consider increased monitoring.`
- **Conditions (AND):**
  - `SSRSTest.systemIdeationScore GREATER_THAN_OR_EQUAL 3`
  - `SSRSTest.systemIdeationScore LESS_THAN_OR_EQUAL 4`
  - `SSRSTest.systemBehaviorScore LESS_THAN 1`
- **Routing:** Admission doctor (toggle) + Roles → On-call physician
- **Action guidance:** Clinician review, safety-plan review, consider increased monitoring.
- **Reference section:** JRCPL-EMR-CAS-001 §4.2

### Block 2.3 — C-SSRS Urgent (ideation 5)
- **Name:** C-SSRS Urgent (ideation 5)
- **Severity:** HIGH
- **Alert message:** `URGENT — C-SSRS ideation 5 for {patient.name}: specific plan and intent. Immediate psychiatric evaluation; consider 1:1 observation.`
- **Conditions (AND):**
  - `SSRSTest.systemIdeationScore GREATER_THAN_OR_EQUAL 5`
- **Routing:** Roles → On-call physician, Psychiatrist
- **Action guidance:** Immediate psychiatric evaluation; consider 1:1 observation.
- **Reference section:** JRCPL-EMR-CAS-001 §4.2

### Block 2.4 — C-SSRS Urgent (behavior item)
- **Name:** C-SSRS Urgent (behavior item)
- **Severity:** HIGH
- **Alert message:** `URGENT — {patient.name}: positive C-SSRS suicidal-behavior item. Immediate psychiatric evaluation regardless of ideation score.`
- **Conditions (AND):**
  - `SSRSTest.systemBehaviorScore GREATER_THAN_OR_EQUAL 1`
- **Routing:** Roles → On-call physician, Psychiatrist
- **Action guidance:** Any positive behavior-subscale item triggers urgent review regardless of ideation.
- **Reference section:** JRCPL-EMR-CAS-001 §4.2

### Block 2.5 — C-SSRS Suggest Discontinue
- **Name:** C-SSRS Suggest Discontinue
- **Severity:** LOW
- **Alert message:** `{patient.name}: C-SSRS ideation 0–1 with no behavior item for 2 consecutive weeks. Suggest discontinuing weekly C-SSRS monitoring — clinician acknowledgment required.`
- **Conditions (AND):**
  - `SSRSTest.systemIdeationScore CONSECUTIVE_LOW` — threshold **2**, count **2**
  - `SSRSTest.systemBehaviorScore CONSECUTIVE_LOW` — threshold **1**, count **2**
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Suggestion only; any positive behavior item blocks discontinuation.
- **Reference section:** JRCPL-EMR-CAS-001 §4.3

---

# 3. Standardized Lab Alerts  (Rule model: `LabReport`, field `reports.aiResponse.flaggedItems`) · §5

Operator auto-sets to `ARRAY_ANY_MATCHES`. Each block: pick **Mode**, **Test**, **threshold**.

## 3a. ULN-multiplier blocks (precise)

### Block 3.1 — LFT ALT Alert
- **Name:** LFT ALT Alert (>1–3× ULN)
- **Severity:** MEDIUM
- **Alert message:** `{patient.name}: ALT elevated (1–3× ULN). Nursing + assigned clinician review.`
- **Condition:** `LabReport.reports.aiResponse.flaggedItems ARRAY_ANY_MATCHES` — Mode **× ULN between**, Test **ALT**, value **1 – 3**
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Needs review; not immediately dangerous.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.2 — LFT ALT Critical
- **Name:** LFT ALT Critical (>3× ULN)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: ALT >3× ULN. Immediate on-call physician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **ALT**, value **3**
- **Routing:** Roles → On-call physician
- **Action guidance:** Urgent; immediate clinician action.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.3 — LFT AST Alert
- **Name:** LFT AST Alert (>1–3× ULN)
- **Severity:** MEDIUM
- **Alert message:** `{patient.name}: AST elevated (1–3× ULN). Nursing + assigned clinician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN between**, Test **AST**, value **1 – 3**
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Needs review; not immediately dangerous.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.4 — LFT AST Critical
- **Name:** LFT AST Critical (>3× ULN)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: AST >3× ULN. Immediate on-call physician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **AST**, value **3**
- **Routing:** Roles → On-call physician
- **Action guidance:** Urgent; immediate clinician action.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.5 — Bilirubin Alert
- **Name:** Bilirubin Alert (1.5–2× ULN)
- **Severity:** MEDIUM
- **Alert message:** `{patient.name}: Total bilirubin 1.5–2× ULN. Review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN between**, Test **BILIRUBIN_TOTAL**, value **1.5 – 2**
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Catches isolated bilirubin rise (hemolysis, obstruction).
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.6 — Bilirubin Critical
- **Name:** Bilirubin Critical (>2× ULN)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: Total bilirubin >2× ULN. Immediate physician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **BILIRUBIN_TOTAL**, value **2**
- **Routing:** Roles → On-call physician
- **Action guidance:** Urgent; immediate clinician action.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.7 — Hy's Law (ALT + bilirubin)
- **Name:** Hy's Law pattern (ALT)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: Hy's Law pattern (ALT >3× ULN with bilirubin >2× ULN) — high risk of severe drug-induced liver injury. Immediate physician review.`
- **Conditions (AND):**
  - `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **ALT**, value **3**
  - `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **BILIRUBIN_TOTAL**, value **2**
- **Routing:** Roles → On-call physician, Medical director
- **Action guidance:** Treat as Critical regardless of exact multiple.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.8 — Hy's Law (AST + bilirubin)
- **Name:** Hy's Law pattern (AST)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: Hy's Law pattern (AST >3× ULN with bilirubin >2× ULN) — high risk of severe drug-induced liver injury. Immediate physician review.`
- **Conditions (AND):**
  - `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **AST**, value **3**
  - `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **BILIRUBIN_TOTAL**, value **2**
- **Routing:** Roles → On-call physician, Medical director
- **Action guidance:** Treat as Critical regardless of exact multiple.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.9 — Ammonia Alert
- **Name:** Ammonia Alert (1.5–2× ULN)
- **Severity:** MEDIUM
- **Alert message:** `{patient.name}: Serum ammonia 1.5–2× ULN. Correlate with mental status (hepatic encephalopathy risk).`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN between**, Test **AMMONIA**, value **1.5 – 2**
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Correlate with mental status.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.10 — Ammonia Critical
- **Name:** Ammonia Critical (>2× ULN)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: Serum ammonia >2× ULN. Immediate review — hepatic encephalopathy risk.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN >**, Test **AMMONIA**, value **2**
- **Routing:** Roles → On-call physician
- **Action guidance:** Urgent; immediate clinician action.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.11 — INR Alert
- **Name:** INR Alert (1.5–2.9)
- **Severity:** MEDIUM
- **Alert message:** `{patient.name}: INR 1.5–2.9 — declining liver synthetic function. Review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN between**, Test **PT_INR**, value **1.25 – 2.42**  *(= INR 1.5–2.9; ULN 1.2)*
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Relevant alongside LFT.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.12 — INR Critical
- **Name:** INR Critical (≥3.0)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: INR ≥3.0. Immediate physician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN ≥**, Test **PT_INR**, value **2.5**  *(= INR 3.0; ULN 1.2)*
- **Routing:** Roles → On-call physician
- **Action guidance:** Urgent; immediate clinician action.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.13 — Creatinine Critical (absolute)
- **Name:** Creatinine Critical (≥4.0 mg/dL)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — {patient.name}: Serum creatinine ≥4.0 mg/dL. Immediate physician review (AKI).`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **× ULN ≥**, Test **CREATININE**, value **3.33**  *(= Cr 4.0 mg/dL; ULN 1.2)*
- **Routing:** Roles → On-call physician
- **Action guidance:** Absolute critical arm only.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

> ❌ Not built: creatinine **baseline-relative** arms (1.5–2.9× / ≥3× the patient's own baseline).

## 3b. Severity-net blocks (electrolytes / CBC / glucose / Ca / Mg)

Absolute per-test cutoffs need the `numericValue` UI mode (not exposed yet). Until then, use the AI severity net across the whole panel:

### Block 3.14 — Critical Labs (any test)
- **Name:** Critical Labs — Very High (any test)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL lab value flagged for {patient.name}. Immediate on-call physician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **By severity**, Test **⚡ Any test (`*`)**, threshold **Very High**
- **Routing:** Roles → On-call physician
- **Action guidance:** Any test flagged critically abnormal (either direction).
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

### Block 3.15 — Alert Labs (any test)
- **Name:** Alert Labs — High (any test)
- **Severity:** MEDIUM
- **Alert message:** `Abnormal lab value flagged for {patient.name}. Nursing + assigned clinician review.`
- **Condition:** `ARRAY_ANY_MATCHES` — Mode **By severity**, Test **⚡ Any test (`*`)**, threshold **High**
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** Needs review; not immediately dangerous.
- **Reference section:** JRCPL-EMR-CAS-001 §5.2

> Covers Sodium, Potassium, Calcium, Magnesium, Glucose, Hemoglobin, WBC, Platelets by AI severity (approximate two-tier net). For the spec's exact numeric cutoffs (Na ≤122 etc.), the `numericValue` compare mode must be exposed in the UI (engine/API already supports it).

---

# 4. YMRS  (Rule model: `ymrsTest`, field `systemTotalScore`) · §6.1

### Block 4.1 — YMRS Alert (12–25)
- **Name:** YMRS Alert (12–25)
- **Severity:** MEDIUM
- **Alert message:** `YMRS {field.value} for {patient.name} — mild–moderate mania. Clinician review; assess safety/impulsivity risk.`
- **Conditions (AND):** `ymrsTest.systemTotalScore GREATER_THAN_OR_EQUAL 12` · `ymrsTest.systemTotalScore LESS_THAN 26`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review; assess safety/impulsivity risk.
- **Reference section:** JRCPL-EMR-CAS-001 §6.1

### Block 4.2 — YMRS Urgent (≥26)
- **Name:** YMRS Urgent (≥26)
- **Severity:** HIGH
- **Alert message:** `URGENT — YMRS {field.value} for {patient.name}: severe mania. Immediate physician/psychiatrist review; consider safety precautions.`
- **Conditions:** `ymrsTest.systemTotalScore GREATER_THAN_OR_EQUAL 26`
- **Routing:** Roles → On-call physician, Psychiatrist
- **Action guidance:** Immediate review; consider safety precautions.
- **Reference section:** JRCPL-EMR-CAS-001 §6.1

### Block 4.3 — YMRS Suggest Discontinue
- **Name:** YMRS Suggest Discontinue
- **Severity:** LOW
- **Alert message:** `{patient.name}: YMRS 0–11 for 2 consecutive weeks. Suggest discontinuing weekly YMRS monitoring — clinician acknowledgment required.`
- **Conditions:** `ymrsTest.systemTotalScore CONSECUTIVE_LOW` — threshold **12**, count **2**
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Suggestion only.
- **Reference section:** JRCPL-EMR-CAS-001 §6.1

---

# 5. HAM-A  (Rule model: `hamaTest`, field `systemTotalScore`) · §6.2

### Block 5.1 — HAM-A Alert (8–24)
- **Name:** HAM-A Alert (8–24)
- **Severity:** MEDIUM
- **Alert message:** `HAM-A {field.value} for {patient.name} — mild–moderate anxiety. Clinician review; consider treatment adjustment.`
- **Conditions (AND):** `hamaTest.systemTotalScore GREATER_THAN_OR_EQUAL 8` · `hamaTest.systemTotalScore LESS_THAN 25`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review; consider treatment adjustment.
- **Reference section:** JRCPL-EMR-CAS-001 §6.2

### Block 5.2 — HAM-A Urgent (≥25)
- **Name:** HAM-A Urgent (≥25)
- **Severity:** HIGH
- **Alert message:** `URGENT — HAM-A {field.value} for {patient.name}: severe anxiety. Immediate clinician review.`
- **Conditions:** `hamaTest.systemTotalScore GREATER_THAN_OR_EQUAL 25`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.2

### Block 5.3 — HAM-A Suggest Discontinue
- **Name:** HAM-A Suggest Discontinue
- **Severity:** LOW
- **Alert message:** `{patient.name}: HAM-A ≤7 for 2 consecutive assessments. Suggest discontinuing HAM-A monitoring — clinician acknowledgment required.`
- **Conditions:** `hamaTest.systemTotalScore CONSECUTIVE_LOW` — threshold **8**, count **2**
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Suggestion only.
- **Reference section:** JRCPL-EMR-CAS-001 §6.2

---

# 6. HAM-D  (Rule model: `hamdTest`, field `systemTotalScore`) · §6.3

### Block 6.1 — HAM-D Alert (8–22)
- **Name:** HAM-D Alert (8–22)
- **Severity:** MEDIUM
- **Alert message:** `HAM-D {field.value} for {patient.name} — mild–severe depression. Clinician review; consider treatment adjustment.`
- **Conditions (AND):** `hamdTest.systemTotalScore GREATER_THAN_OR_EQUAL 8` · `hamdTest.systemTotalScore LESS_THAN 23`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review; consider treatment adjustment.
- **Reference section:** JRCPL-EMR-CAS-001 §6.3

### Block 6.2 — HAM-D Urgent (≥23)
- **Name:** HAM-D Urgent (≥23)
- **Severity:** HIGH
- **Alert message:** `URGENT — HAM-D {field.value} for {patient.name}: very severe depression. Immediate clinician review.`
- **Conditions:** `hamdTest.systemTotalScore GREATER_THAN_OR_EQUAL 23`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.3

### Block 6.3 — HAM-D Suggest Discontinue
- **Name:** HAM-D Suggest Discontinue
- **Severity:** LOW
- **Alert message:** `{patient.name}: HAM-D ≤7 for 2 consecutive assessments. Suggest discontinuing HAM-D monitoring — clinician acknowledgment required.`
- **Conditions:** `hamdTest.systemTotalScore CONSECUTIVE_LOW` — threshold **8**, count **2**
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Suggestion only.
- **Reference section:** JRCPL-EMR-CAS-001 §6.3

> ❌ Not built: HAM-D Item-3 (suicide) ≥2 override (item 3 isn't a stored field). Suicide risk covered by C-SSRS (Rule 2).

---

# 7. PANSS  (Rule model: `panssTest`, field `systemTotalScore`) · §6.4  *(no stop rule)*

### Block 7.1 — PANSS Alert (58–95)
- **Name:** PANSS Alert (58–95)
- **Severity:** MEDIUM
- **Alert message:** `PANSS {field.value} for {patient.name} — moderate. Clinician review.`
- **Conditions (AND):** `panssTest.systemTotalScore GREATER_THAN_OR_EQUAL 58` · `panssTest.systemTotalScore LESS_THAN 96`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.4

### Block 7.2 — PANSS Urgent (≥96)
- **Name:** PANSS Urgent (≥96)
- **Severity:** HIGH
- **Alert message:** `URGENT — PANSS {field.value} for {patient.name}: marked–severe. Immediate psychiatrist review.`
- **Conditions:** `panssTest.systemTotalScore GREATER_THAN_OR_EQUAL 96`
- **Routing:** Roles → Psychiatrist
- **Action guidance:** Immediate psychiatrist review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.4

---

# 8. Y-BOCS  (Rule model: `ybocTest` — note no "S", field `systemTotalScore`) · §6.5  *(no stop rule)*

### Block 8.1 — Y-BOCS Alert (8–23)
- **Name:** Y-BOCS Alert (8–23)
- **Severity:** MEDIUM
- **Alert message:** `Y-BOCS {field.value} for {patient.name} — mild–moderate. Clinician review.`
- **Conditions (AND):** `ybocTest.systemTotalScore GREATER_THAN_OR_EQUAL 8` · `ybocTest.systemTotalScore LESS_THAN 24`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.5

### Block 8.2 — Y-BOCS Urgent (≥24)
- **Name:** Y-BOCS Urgent (≥24)
- **Severity:** HIGH
- **Alert message:** `URGENT — Y-BOCS {field.value} for {patient.name}: severe–extreme. Immediate clinician review.`
- **Conditions:** `ybocTest.systemTotalScore GREATER_THAN_OR_EQUAL 24`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.5

---

# 9. MMSE  (Rule model: `MMSETest`, field `scores.total`) · §6.6  *(inverted; no stop rule)*

### Block 9.1 — MMSE Alert (18–23)
- **Name:** MMSE Alert (18–23)
- **Severity:** MEDIUM
- **Alert message:** `MMSE {field.value} for {patient.name} — mild cognitive impairment. Clinician review.`
- **Conditions (AND):** `MMSETest.scores.total GREATER_THAN_OR_EQUAL 18` · `MMSETest.scores.total LESS_THAN_OR_EQUAL 23`
- **Routing:** Admission doctor (toggle)
- **Action guidance:** Clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §6.6

### Block 9.2 — MMSE Urgent (≤17)
- **Name:** MMSE Urgent (≤17)
- **Severity:** HIGH
- **Alert message:** `URGENT — MMSE {field.value} for {patient.name}: moderate–severe impairment. Immediate clinician review; assess functional safety.`
- **Conditions:** `MMSETest.scores.total LESS_THAN_OR_EQUAL 17`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate clinician review; assess functional safety.
- **Reference section:** JRCPL-EMR-CAS-001 §6.6

---

# 10. Morse Fall Scale  (Rule model: `morseTest`, field `systemTotalScore`) · §7.3  *(no stop rule)*

### Block 10.1 — Morse Alert (25–44)
- **Name:** Morse Fall Alert (25–44)
- **Severity:** MEDIUM
- **Alert message:** `Morse Fall score {field.value} for {patient.name} — moderate fall risk. Initiate standard fall precautions; notify nursing.`
- **Conditions (AND):** `morseTest.systemTotalScore GREATER_THAN_OR_EQUAL 25` · `morseTest.systemTotalScore LESS_THAN 45`
- **Routing:** Roles → Nursing
- **Action guidance:** Initiate standard fall precautions; notify nursing.
- **Reference section:** JRCPL-EMR-CAS-001 §7.3

### Block 10.2 — Morse Urgent (≥45)
- **Name:** Morse Fall Urgent (≥45)
- **Severity:** HIGH
- **Alert message:** `URGENT — Morse Fall score {field.value} for {patient.name}: high fall risk. Initiate high-risk fall precautions (1:1 / close supervision); notify nursing + assigned clinician.`
- **Conditions:** `morseTest.systemTotalScore GREATER_THAN_OR_EQUAL 45`
- **Routing:** Roles → Nursing + Admission doctor (toggle)
- **Action guidance:** High-risk fall precautions; notify nursing + assigned clinician.
- **Reference section:** JRCPL-EMR-CAS-001 §7.3

---

# 11. GCS  (Rule model: `glasgowTest`, field `systemTotalScore`) · §7.6  *(inverted; no stop rule)*

### Block 11.1 — GCS Alert (13–14)
- **Name:** GCS Alert (13–14)
- **Severity:** MEDIUM
- **Alert message:** `GCS {field.value} for {patient.name} — mild decrease. Nursing review; increase observation frequency.`
- **Conditions (AND):** `glasgowTest.systemTotalScore GREATER_THAN_OR_EQUAL 13` · `glasgowTest.systemTotalScore LESS_THAN_OR_EQUAL 14`
- **Routing:** Roles → Nursing
- **Action guidance:** Nursing review; increase observation frequency.
- **Reference section:** JRCPL-EMR-CAS-001 §7.6

### Block 11.2 — GCS Urgent (9–12)
- **Name:** GCS Urgent (9–12)
- **Severity:** HIGH
- **Alert message:** `URGENT — GCS {field.value} for {patient.name}: moderate decrease. Immediate clinician review.`
- **Conditions (AND):** `glasgowTest.systemTotalScore GREATER_THAN_OR_EQUAL 9` · `glasgowTest.systemTotalScore LESS_THAN_OR_EQUAL 12`
- **Routing:** Roles → On-call physician
- **Action guidance:** Immediate clinician review.
- **Reference section:** JRCPL-EMR-CAS-001 §7.6

### Block 11.3 — GCS Critical (≤8)
- **Name:** GCS Critical (≤8)
- **Severity:** CRITICAL
- **Alert message:** `CRITICAL — GCS {field.value} for {patient.name}: severe. Immediate physician review — assess airway; consider transfer to acute medical care.`
- **Conditions:** `glasgowTest.systemTotalScore LESS_THAN_OR_EQUAL 8`
- **Routing:** Roles → On-call physician, Medical director
- **Action guidance:** Assess airway; consider transfer to acute medical care.
- **Reference section:** JRCPL-EMR-CAS-001 §7.6

---

# 12. Vitals  (Rule model: `VitalSign`) · §1 / §9  — **PENDING clinical sign-off**

Fields (numeric): `bloodPressure.systolic`, `bloodPressure.diastolic`, `pulse`, `spo2`, `temprature` *(misspelled in schema)*, `respirationRate`. Build blocks in the same pattern once §9 thresholds are approved. Example skeleton:
- **Name:** SpO2 Low (Urgent) · **Severity:** HIGH · **Alert message:** `SpO2 {field.value}% for {patient.name} — low. Immediate review.` · **Condition:** `VitalSign.spo2 LESS_THAN 92` · **Routing:** Nursing + On-call physician · **Reference section:** §9
> Do not author until bands are signed off.

---

# 13. Not buildable today (no test model) — §7.1, §7.2, §7.4, §7.5

**COWS, AIMS, PCL-5, AUDIT** have no model/watcher, so there is nothing to write a condition against. Skip until models + capture flow exist (setup doc §8.3). AIMS also needs count-based item logic the engine lacks.

---

# 14. Escalation (Section 8)

Primary recipients are set per block (routing above). ❌ **Time-based escalation** ("escalate to X after N hours if unacknowledged") is **not implemented** — only initial routing exists today (setup doc §8.4).
