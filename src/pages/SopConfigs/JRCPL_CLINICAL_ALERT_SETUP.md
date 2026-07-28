# JRCPL Clinical Alert System → ERP SOP Engine

**Setup playbook + gap analysis** for implementing `JRCPL-EMR-CAS-001` (Clinical Alert System — Functional Specification v0.2) on the existing SOP rule engine (ERP-Client `src/pages/SopConfigs` + ERP-Server `src/services/sop`).

> This was written against the **live source**, not the older `SOP_WORKFLOW.md` / `SOP_DELAYED_WORKFLOW.md` docs — several of those are stale (see [§9](#9-corrections-to-existing-docs)). Where they disagree with this file, trust this file.

---

## 1. TL;DR — what you can build today, and what needs code

The spec has 15 instruments + vitals + labs. Mapping them onto the engine, they fall into four buckets:

| Bucket | Tests | What's needed |
|---|---|---|
| ✅ **Authorable now** (zero code) | CIWA-Ar, GCS, Morse Fall, Labs (9 of 15 analytes), Vitals* | Just configure rules in the UI |
| ✅ **Authorable now** — config **applied 2026-07-28** | YMRS, HAM-A, HAM-D, PANSS, Y-BOCS, C-SSRS, MMSE | Numeric-operator + allow-list unblocks done; now configure in UI |
| ✅ **Authorable now** — catalogue **updated 2026-07-28** | Calcium, Hemoglobin, WBC, Platelets, Glucose, CK | 6 lab tests added to the catalogue; now configure in UI |
| 🔴 **New engine feature** (not done) | COWS, AIMS, PCL-5, AUDIT (no model); every "Suggest Discontinue" rule; creatinine-vs-baseline; HAM-D item-3 / AIMS count logic; Section-8 escalation timers | Real development |

> **Implementation status (2026-07-28):** Tiers 1 & 2 have been **applied to ERP-Server** and verified — the 7 scales above are now UI-authorable and the 6 lab tests are in the catalogue. Tiers 3 & 4 (new test models + stateful/escalation engine features) are **not** done. What changed is detailed in §8.1 / §8.2.

**The single biggest gap:** the engine is **stateless** — every condition sees exactly one document (the just-saved one, or the latest). It cannot express *"low score on N consecutive assessments,"* so **none of the spec's discontinuation / "Suggest Discontinue Monitoring" rules (§3.3, §4.3, §6.1–6.3, §7.1) are implementable without new code.** The threshold/alert side of every scale, however, maps cleanly.

Full change list is in [§8](#8-gap-analysis--required-changes).

---

## 2. How the engine actually works (2-minute model)

A **Rule** has three layers:

1. **`satisfyingCriteria`** — a patient gate (all conditions AND'd) + a required list of **applicable centers**. Empty conditions = applies to every patient in those centers.
2. **`targetBlocks[]`** — independent alert recipes. **Within a block, all conditions are AND'd. Across blocks, it's OR** (each passing block fires its own alert). This is the only way to express OR.
3. **`suggestedMedicines[]`** — optional medicine recommendations surfaced onto the prescription chart.

Each condition = **`model` + `field` (dot-path) + `operator` + `value[]`** and a **`triggerType`**:

- **IMMEDIATE** — evaluated the instant a document is saved (Mongoose post-hook → Redis → `sopEngine.js`). Fires when the condition **passes** (an abnormal value was recorded). *This is what nearly every JRCPL threshold band uses.*
- **DELAYED** — evaluated by a **twice-daily cron** (`sopDelayedCheck.cron.js`, `0 2,14 * * *` IST) over active admissions. Fires when an expected document is **missing/failing** in a scheduled time window. *This is for "test wasn't done on schedule" enforcement — optional for JRCPL.*

Key engine facts that shape every recipe below:

- **No cross-assessment state.** No streaks, no "consecutive," no trend. (`evaluateLeaf` in `sopEvaluator.js` only ever receives one doc.)
- **String scores are coerced to numbers at eval time** (`toFiniteNumber`), so numeric comparisons work even though most `systemTotalScore` fields are stored as `String`.
- **Severity is per-block** (`LOW / MEDIUM / HIGH / CRITICAL`). There is no rule-level severity.
- **Routing is per-block**, three mechanisms only: notify **roles**, notify **specific users**, and **care-team toggles** (`notifyAdmissionDoctor` / `notifyAdmissionPsychologist`). **There is no time-based escalation** anywhere.
- The **authoring UI is server-driven**: the field dropdown comes from `GET /sop/fields/:model`, which is filtered by an **allow-list** (`sopMetaController.js`) and typed via **`sopFieldOverrides.js`**. If a field isn't allow-listed, or its type isn't overridden to `Number`, the UI won't let you build the rule — even though the engine would run it.

---

## 3. Translation layer — spec conventions → engine conventions

### 3.1 Alert levels → severity enum

The spec uses None / Low flag / Alert / Urgent / Critical. Recommended mapping (adjustable — severity only drives inbox colour/priority + which routing block you attach):

| Spec level | Engine severity | Notes |
|---|---|---|
| None | *(no block)* | Nothing fires; simply don't author a block for that band |
| Low flag (C-SSRS 1–2) | `LOW` | |
| Alert | `MEDIUM` | |
| Urgent | `HIGH` | |
| Critical (labs); GCS ≤8 | `CRITICAL` | reserve for immediately life-threatening |

### 3.2 Alert type → triggerType

| Spec intent | triggerType |
|---|---|
| "Score crossed a band" (every §3–§7 threshold table) | **IMMEDIATE** |
| "Scheduled test was not performed" (enforce daily CIWA, weekly C-SSRS, Day-1/15/30 PANSS, etc.) | **DELAYED** with a `schedule` (optional add-on; see [§7](#7-optional-cadence-enforcement-delayed)) |
| "Suggest discontinue monitoring" (§3.3, §4.3, §6, §7.1) | ❌ not expressible — see [§8.4](#84-tier-4--new-engine-features-red) |

### 3.3 Recipients (Section 8) → routing

Map the spec's roles to your actual role names (check **`GET /sop/getroles`** — the exact strings matter):

| Spec recipient | Engine routing |
|---|---|
| Nursing / nursing station | `notifyRoles: ["<Nurse role>"]` |
| On-call physician | `notifyRoles: ["<On-call physician role>"]` |
| Medical director / psychiatrist | `notifyRoles: ["<…>"]` |
| **Assigned clinician / doctor** | ✅ `notifyAdmissionDoctor` toggle |
| **Assigned psychologist** | ✅ `notifyAdmissionPsychologist` toggle |
| "Escalate to X after N hours if unacknowledged" | ❌ no mechanism — see [§8.4](#84-tier-4--new-engine-features-red) |

### 3.4 Three modeling patterns you'll reuse constantly

1. **Bound the middle band with two conditions** so one score doesn't trip two blocks. E.g. CIWA "Alert 8–14" = `systemTotalScore GREATER_THAN_OR_EQUAL 8` **AND** `systemTotalScore LESS_THAN 15`. The top band stays open-ended (`GREATER_THAN_OR_EQUAL 15`).
2. **OR = multiple blocks.** "ideation = 5 **or** any behavior item" → one block for ideation, a second block for behavior.
3. **Hy's Law (combined tests) = multiple conditions in one block.** `ALT > 3× ULN` **AND** `bilirubin > 2× ULN` are two `ARRAY_ANY_MATCHES` conditions in the same block (both read the same saved LabReport). Because the block is AND-only and Hy's Law is "ALT **or** AST", use two blocks: (ALT AND bili) and (AST AND bili).

### 3.5 Before you author anything (prerequisites)

- [ ] Every rule **requires ≥1 applicable center** (UI enforces it). Pick the JRCPL center(s).
- [ ] Confirm the role strings via `GET /sop/getroles` and fill them into §3.3.
- [ ] Apply the [§8.1](#81-tier-1--trivial-backend-config-🟡) config edits first if you want YMRS/HAM-A/HAM-D/PANSS/Y-BOCS/C-SSRS/MMSE.
- [ ] Verify the catalogue ULN values (`GET /sop/lab-tests`) against your own lab's reference ranges — spec §9 open item. The catalogue currently hard-codes e.g. ALT/AST ULN = 40, bilirubin ULN = 1.2.

---

## 4. Authoring one rule in the UI (generic walkthrough)

`SopConfigs → Create Rule` (`/sop-configs/save`; needs `SOPCONFIGS / MANAGE / WRITE`).

1. **Basic Info** — `ruleName` (globally unique), optional `protocol`.
2. **Satisfying Criteria** — pick applicable **center(s)**; optionally add gate conditions (e.g. only IPD). Leave conditions empty to apply to all patients in those centers.
3. **Target Blocks** — for each severity band, add a block:
   - **Name** (shows as the "Rule" line in the alert inbox), e.g. `CIWA-Ar Urgent (≥15)`.
   - **Severity** per §3.1.
   - **Conditions** — pick **Model**, then **Field** (dropdown from the server), **Operator**, **Value**, **Trigger = IMMEDIATE**.
   - **Routing** per §3.3 (≥1 channel required).
   - **Action Guidance** — paste the spec's "Action" cell text.
   - **Reference Section** — e.g. `JRCPL-EMR-CAS-001 §3.2`.
4. (Optional) **Suggested Medicines**, **SOP Document** upload (attach the spec PDF).
5. Save → confirm. Editing later creates a new version.

The recipes below give you the exact block contents.

---

## 5. Per-test setup recipes

Legend: **model.field `OPERATOR` value**. All conditions are IMMEDIATE unless noted. Reference column omitted for brevity — use the spec section shown in each heading.

### 5.1 CIWA-Ar — ✅ authorable now &nbsp;·&nbsp; §3.2

- **Model** `ciwaTest` · **Field** `systemTotalScore` (Number-typed ✓)

| Block | Conditions (AND) | Severity | Route |
|---|---|---|---|
| CIWA-Ar Alert (8–14) | `systemTotalScore GREATER_THAN_OR_EQUAL 8` · `systemTotalScore LESS_THAN 15` | MEDIUM | Nursing + on-call physician |
| CIWA-Ar Urgent (≥15) | `systemTotalScore GREATER_THAN_OR_EQUAL 15` | HIGH | On-call physician |

> Spec's table says "8–15 Alert", but its pseudocode routes exactly 15 to Urgent — recipe follows the pseudocode. Discontinuation (§3.3) and the Day-12 "protocol exceeded" alert are **not** expressible here (state logic) — see [§8.4](#84-tier-4--new-engine-features-red).

### 5.2 C-SSRS — ✅ authorable now &nbsp;·&nbsp; §4.2

- **Model** `SSRSTest` · **Fields** `systemIdeationScore`, `systemBehaviorScore` (both `Number`)
- ✅ **Applied 2026-07-28:** the allow-list now exposes `systemIdeationScore` + `systemBehaviorScore`. There is no boolean behavior *flag* — "any positive behavior item" = `systemBehaviorScore ≥ 1`.

| Block | Conditions (AND) | Severity | Route |
|---|---|---|---|
| C-SSRS Low flag (ideation 1–2) | `systemIdeationScore GREATER_THAN_OR_EQUAL 1` · `systemIdeationScore LESS_THAN_OR_EQUAL 2` · `systemBehaviorScore LESS_THAN 1` | LOW | log only |
| C-SSRS Alert (ideation 3–4) | `systemIdeationScore GREATER_THAN_OR_EQUAL 3` · `systemIdeationScore LESS_THAN_OR_EQUAL 4` · `systemBehaviorScore LESS_THAN 1` | MEDIUM | Assigned clinician + on-call physician |
| C-SSRS Urgent (ideation 5) | `systemIdeationScore GREATER_THAN_OR_EQUAL 5` | HIGH | On-call physician / psychiatrist |
| C-SSRS Urgent (behavior) | `systemBehaviorScore GREATER_THAN_OR_EQUAL 1` | HIGH | On-call physician / psychiatrist |

> The `systemBehaviorScore LESS_THAN 1` guard on the low/alert blocks makes a behavior-positive case raise **only** the Urgent behavior block (spec's "behavior overrides ideation"). Discontinuation (§4.3) not expressible.

### 5.3 Standardized Lab Alerts — ✅ authorable now (all 15 analytes) &nbsp;·&nbsp; §5.2

- **Model** `LabReport` · **Field** `reports.aiResponse.flaggedItems` (operator forced to `ARRAY_ANY_MATCHES`)
- `arrayMatch = { keyField:"canonicalName", keyValue:<TEST_ID>, compareField:<…>, comparator:<…> }`, threshold in `value[]`.
- **Two comparison modes:** `compareField:"ulnMultiplier"` (value ÷ fixed catalogue ULN) or `compareField:"numericValue"` (raw result value). Use ULN-multiplier for the LFT "×ULN" bands; use numericValue for the electrolyte/absolute cutoffs.

**Available now** (exact `keyValue` in **bold**):

| Analyte (`keyValue`) | Alert block | Critical block |
|---|---|---|
| ALT (**`ALT`**), AST (**`AST`**) | `ulnMultiplier BETWEEN [1,3]` → MEDIUM | `ulnMultiplier GREATER_THAN 3` → CRITICAL |
| Bilirubin (**`BILIRUBIN_TOTAL`**) | `ulnMultiplier BETWEEN [1.5,2]` → MEDIUM | `ulnMultiplier GREATER_THAN 2` → CRITICAL |
| **Hy's Law** (2 blocks) | — | Block A: `ALT ulnMultiplier GT 3` **AND** `BILIRUBIN_TOTAL ulnMultiplier GT 2`; Block B: same with `AST` → CRITICAL |
| Sodium (**`SODIUM`**) | `numericValue BETWEEN [123,134]` **and** a 2nd block `[146,149]` → MEDIUM | `numericValue LESS_THAN_OR_EQUAL 122` **and** `numericValue GREATER_THAN_OR_EQUAL 150` (2 blocks) → CRITICAL |
| Potassium (**`POTASSIUM`**) | `[3.0,3.4]` and `[5.1,5.9]` → MEDIUM | `LESS_THAN 3.0` and `GREATER_THAN_OR_EQUAL 6.0` → CRITICAL |
| Magnesium (**`MAGNESIUM`**) | `[1.0,1.4]` and `[2.6,3.9]` → MEDIUM | `LESS_THAN 1.0` and `GREATER_THAN_OR_EQUAL 4.0` → CRITICAL |
| Ammonia (**`AMMONIA`**) | `ulnMultiplier BETWEEN [1.5,2]` → MEDIUM | `ulnMultiplier GREATER_THAN 2` → CRITICAL |
| INR (**`PT_INR`**) | `numericValue BETWEEN [1.5,2.9]` → MEDIUM | `numericValue GREATER_THAN_OR_EQUAL 3.0` → CRITICAL |
| Creatinine (**`CREATININE`**) | ⚠️ baseline-relative — **not** expressible | absolute arm only: `numericValue GREATER_THAN_OR_EQUAL 4.0` → CRITICAL |

**Now available** (added to the catalogue **2026-07-28** — see §8.2) — author with `compareField:"numericValue"` and the spec's absolute cutoffs:

| Analyte (`keyValue`) | Alert block (MEDIUM) | Critical block (CRITICAL) |
|---|---|---|
| Calcium (**`CALCIUM`**) | `numericValue BETWEEN [7.0,8.4]` · 2nd block `[10.6,12.9]` | `numericValue LESS_THAN 7.0` · `GREATER_THAN_OR_EQUAL 13.0` |
| Hemoglobin (**`HEMOGLOBIN`**) | `numericValue BETWEEN [8.0,9.9]` | `numericValue LESS_THAN 7.0` · `GREATER_THAN 20.0` |
| WBC (**`WBC`**) | `numericValue BETWEEN [2.0,3.9]` · 2nd block `[11.0,19.9]` | `numericValue LESS_THAN 2.0` · `GREATER_THAN_OR_EQUAL 20.0` |
| Platelets (**`PLATELETS`**) | `numericValue BETWEEN [50,99]` · 2nd block `[450,999]` | `numericValue LESS_THAN 50` · `GREATER_THAN_OR_EQUAL 1000` |
| Glucose (**`GLUCOSE`**) | `numericValue BETWEEN [54,69]` · 2nd block `[200,399]` | `numericValue LESS_THAN 54` · `GREATER_THAN_OR_EQUAL 400` |
| CK (**`CK`**) | `numericValue BETWEEN [1000,4999]` | `numericValue GREATER_THAN_OR_EQUAL 5000` |

> The catalogue reference ranges added for these are standard adult defaults (they feed only AI severity hinting + multipliers); the SOP cutoffs above use `numericValue` directly. Verify both against your lab (spec §9).

> Caveats: (1) `numericValue` is AI-normalized — sanity-check units against your reports. (2) The KFT "1.5–2.9× baseline / ≥3× baseline" arms need the baseline feature ([§8.4](#84-tier-4--new-engine-features-red)); "new dialysis" is a clinical event, not a lab value, so it's out of scope for value-based alerting. (3) low-side electrolytes could alternatively use `compareField:"llnMultiplier"`, but the spec's absolute cutoffs map most faithfully to `numericValue`.

### 5.4 YMRS / HAM-A / HAM-D / PANSS / Y-BOCS — ✅ authorable now &nbsp;·&nbsp; §6

All five use `systemTotalScore` (stored as `String`). The `Number` type override was **applied 2026-07-28** (see §8.1), so the UI now offers numeric operators and these bands work:

| Test | Model | Alert block (MEDIUM) | Urgent block (HIGH) |
|---|---|---|---|
| YMRS §6.1 | `ymrsTest` | `≥ 12` AND `< 26` | `≥ 26` |
| HAM-A §6.2 | `hamaTest` | `≥ 8` AND `< 25` | `≥ 25` |
| HAM-D §6.3 | `hamdTest` | `≥ 8` AND `< 23` | `≥ 23` |
| PANSS §6.4 | `panssTest` | `≥ 58` AND `< 96` | `≥ 96` |
| Y-BOCS §6.5 | `ybocTest` *(note: no "S")* | `≥ 8` AND `< 24` | `≥ 24` |

(Conditions are on `systemTotalScore` with `GREATER_THAN_OR_EQUAL` / `LESS_THAN`.) PANSS/Y-BOCS have **no stop rule** → fully covered. YMRS/HAM-A/HAM-D discontinuation and the **HAM-D item-3 suicide override** are **not** expressible (item 3 isn't stored as a field). PANSS also exposes a `severity` bucket field if you prefer string matching.

### 5.5 MMSE — ✅ authorable now &nbsp;·&nbsp; §6.6 (inverted: lower = worse)

- **Model** `MMSETest` · **Field** `scores.total` (`Number`, nested)
- ✅ **Applied 2026-07-28:** `scores.total` is now exposed in the allow-list (alongside `interpretation`).

| Block | Conditions | Severity |
|---|---|---|
| MMSE Alert (18–23) | `scores.total GREATER_THAN_OR_EQUAL 18` · `scores.total LESS_THAN_OR_EQUAL 23` | MEDIUM |
| MMSE Urgent (≤17) | `scores.total LESS_THAN_OR_EQUAL 17` | HIGH |

No stop rule → fully covered.

### 5.6 Morse Fall Scale — ✅ authorable now &nbsp;·&nbsp; §7.3

- **Model** `morseTest` · **Field** `systemTotalScore` (Number ✓)

| Block | Conditions | Severity | Route |
|---|---|---|---|
| Morse Alert (25–44) | `≥ 25` AND `< 45` | MEDIUM | Nursing |
| Morse Urgent (≥45) | `≥ 45` | HIGH | Nursing + assigned clinician |

No stop rule. (Event-triggered re-assessment "after a fall" is a workflow concern, outside the alert engine.)

### 5.7 GCS — ✅ authorable now &nbsp;·&nbsp; §7.6 (inverted)

- **Model** `glasgowTest` · **Field** `systemTotalScore` (Number ✓; `eyeScore`/`verbalScore`/`motorScore` also exposed if needed)

| Block | Conditions | Severity | Route |
|---|---|---|---|
| GCS Alert (13–14) | `≥ 13` AND `≤ 14` | MEDIUM | Nursing |
| GCS Urgent (9–12) | `≥ 9` AND `≤ 12` | HIGH | On-call physician |
| GCS Critical (≤8) | `≤ 8` | CRITICAL | On-call physician (airway) |

### 5.8 Vitals — ✅ authorable now, thresholds pending &nbsp;·&nbsp; §1 / §9

`VitalSign` is fully exposed and all vitals are `Number`-typed. Fields: `bloodPressure.systolic`, `bloodPressure.diastolic`, `pulse`, `spo2`, **`temprature`** (note the misspelling), `respirationRate`. The spec leaves the bands "to be finalized" (§9) — once clinical governance sets them, author blocks exactly like the scales above (e.g. `spo2 LESS_THAN 92` → HIGH).

### 5.9 COWS / AIMS / PCL-5 / AUDIT — 🔴 no model, not implementable yet &nbsp;·&nbsp; §7.1, §7.2, §7.4, §7.5

None of these four have a Mongoose model or a watcher registration, so there is **nothing to write a condition against.** See [§8.3](#83-tier-3--new-clinical-test-models-🔴). AIMS additionally needs count-based logic the engine lacks.

### 5.10 Coverage matrix

| Instrument | Model | Threshold alerts | Discontinuation | Special logic |
|---|---|---|---|---|
| CIWA-Ar | `ciwaTest` | ✅ | ❌ state | Day-12 exceeded ❌ |
| C-SSRS | `SSRSTest` | ✅ | ❌ state | behavior override ✅ |
| Labs | `LabReport` | ✅ all 15 | n/a | Hy's Law ✅ · baseline creatinine ❌ |
| YMRS | `ymrsTest` | ✅ | ❌ state | — |
| HAM-A | `hamaTest` | ✅ | ❌ state | — |
| HAM-D | `hamdTest` | ✅ | ❌ state | item-3 override ❌ |
| PANSS | `panssTest` | ✅ | n/a | — |
| Y-BOCS | `ybocTest` | ✅ | n/a | — |
| MMSE | `MMSETest` | ✅ | n/a | inverted ✅ |
| Morse Fall | `morseTest` | ✅ | n/a | — |
| GCS | `glasgowTest` | ✅ | n/a | inverted ✅ |
| Vitals | `VitalSign` | ✅ (bands TBD) | n/a | — |
| COWS | — | 🔴 no model | ❌ | — |
| AIMS | — | 🔴 no model | n/a | count logic ❌ |
| PCL-5 | — | 🔴 no model | — | — |
| AUDIT | — | 🔴 no model | n/a | — |

---

## 6. (Optional) Cadence enforcement — DELAYED

The spec's "frequency" columns describe when a test *should* be administered. If you also want the system to alert when a scheduled test **wasn't done**, add a DELAYED condition (usually with **Field = "Record Exists?"** = `FIELD_EXISTS`) and a `schedule`:

| Spec cadence | Schedule config |
|---|---|
| CIWA daily / COWS daily | `CONTINUOUS`, `intervalHours: 24` (or `DAYS [1] daysOnwards`) |
| C-SSRS weekly / YMRS weekly | `CONTINUOUS`, `intervalHours: 168` (or `FREQUENCY` 1/WEEK) |
| HAM-A / HAM-D every 15 days | `CONTINUOUS`, `intervalHours: 360` |
| PANSS/Y-BOCS/MMSE/PCL-5 "Day 1, 15, 30, then monthly" | best approximation: `FREQUENCY` band `{fromDay:1, times:1, per:MONTH}`; the exact "Day 1/15/30 then monthly" isn't a single native primitive |

The cron fires one "missed" alert per checkpoint (deduped). This is an **add-on** — the spec's core alerting is the IMMEDIATE score bands in §5.

---

## 7. What a fully-configured rule set looks like

- One rule per instrument (e.g. `CIWA-Ar Alerting`, `C-SSRS Alerting`, `Critical Lab Values`), scoped to the JRCPL center(s).
- Each rule = 2–4 IMMEDIATE blocks (the bands), routed per Section 8, action guidance + reference section filled from the spec.
- Labs = one rule with ~30 blocks (Alert/Critical × 15 analytes + Hy's Law ×2), or split per organ system for manageability.
- Attach the spec PDF via the SOP Document upload so clinicians can open it from the rule.

---

## 8. Gap analysis — required changes

Ordered cheapest → hardest. Tiers 1–2 unlock the large majority of the spec.

### 8.1 Tier 1 — trivial backend config 🟡

> ✅ **APPLIED 2026-07-28** — verified `node --check` clean, overrides present, fields exposed. Two constants files, no logic changes; unblocks 7 instruments.

**`ERP-Server/src/constants/sopFieldOverrides.js`** — `Number` overrides so the UI offers numeric operators (the evaluator already coerces the String at run time):
```js
ymrsTest:  { systemTotalScore: "Number" },
hamaTest:  { systemTotalScore: "Number" },
hamdTest:  { systemTotalScore: "Number" },
panssTest: { systemTotalScore: "Number" },
ybocTest:  { systemTotalScore: "Number" },
// C-SSRS (systemIdeation/BehaviorScore) and MMSE (scores.total) are already Number
// in their schemas → they need only the allow-list change below, no override.
```

**`ERP-Server/src/controllers/sop/sopMetaController.js`** (`ALLOWED_FIELDS`) — expose the fields the spec bands need:
```js
SSRSTest: ['testType', 'systemTotalScore', 'systemIdeationScore', 'systemBehaviorScore'],
MMSETest: ['testType', 'interpretation', 'scores.total'],
// ymrs/hama/hamd/panss/yboc already expose systemTotalScore — only the type override above.
```
> Engine impact: none — `evaluateLeaf` already coerces and already handles these paths. This purely unblocked the **authoring UI**.

### 8.2 Tier 2 — lab catalogue 🟠

> ✅ **APPLIED 2026-07-28** — verified `LAB_TEST_IDS` now 21, no duplicates, multipliers compute. The AI prompt is catalogue-driven (`CATALOGUE_FOR_PROMPT`), so extraction, the create/update validators, and the `/sop/lab-tests` dropdown picked the new tests up automatically — no other file needed.

The 6 entries added to **`ERP-Server/src/constants/labTestCatalogue.js`** (`id`, `display`, `unit`, `uln`, `lln`, `direction`), now targetable by `canonicalName`:

| Analyte | Suggested `id` | direction / cutoffs to encode (spec §5.2) |
|---|---|---|
| Calcium (corrected) | `CALCIUM` | BIDIRECTIONAL; crit <7.0 / ≥13.0, alert 7.0–8.4 / 10.6–12.9 |
| Hemoglobin | `HEMOGLOBIN` | BIDIRECTIONAL; crit <7.0 / >20.0, alert 8.0–9.9 |
| WBC | `WBC` | BIDIRECTIONAL; crit <2.0 / ≥20.0, alert 2.0–3.9 / 11.0–19.9 |
| Platelets | `PLATELETS` | BIDIRECTIONAL; crit <50 / ≥1000, alert 50–99 / 450–999 |
| Glucose | `GLUCOSE` | BIDIRECTIONAL; crit <54 / ≥400, alert 54–69 / 200–399 |
| CK | `CK` | UP_ONLY; crit ≥5000, alert 1000–4999 |

Author them with `compareField:"numericValue"` exactly like sodium/potassium (recipes in §5.3). The `uln`/`lln` set here are standard adult defaults — verify these and the existing catalogue ULNs against your lab (spec §9).

### 8.3 Tier 3 — new clinical-test models 🔴

For **COWS, AIMS, PCL-5, AUDIT**, each needs (once the EMR captures the score):
1. A Mongoose model storing `systemTotalScore` + `patientId` (mirror `ciwaTest`).
2. Register in **6 places**: `SOPRules.model.js` `model` enum · `sopWatcher.js` `DEFAULT_CONFIG` · `sopEvaluator.js` `PATIENT_REF_FIELD` · `sopMetaController.js` `TARGET_MODELS` + `ALLOWED_FIELDS` · `sopFieldOverrides.js` · frontend `sopConstants.js` `TARGET_OPTIONS`.
3. Then author bands like the other scales (COWS: Alert 5–24 / Urgent ≥25; PCL-5: Alert 33–49 / Urgent ≥50; AUDIT: Alert ≥8; GCS-style for AIMS total ≥8).

### 8.4 Tier 4 — new engine features 🔴

| Feature | Needed for | Sketch |
|---|---|---|
| **Stateful "N consecutive" evaluator** | Every "Suggest Discontinue" rule (§3.3, §4.3, §6.1–6.3, §7.1) + CIWA Day-12 + all reset rules | New evaluator that loads the last N assessments per admission (natural home: the DELAYED cron), checks the low-band streak + reset events, and fires a one-shot "suggest discontinue" notification (dedupe per admission+rule, cleared on clinician action). Requires a new condition/operator type and possibly persisted `consecutive_low_count` / `discontinue_suggested_flag`. **Largest item.** |
| **Per-patient baseline creatinine** | KFT "1.5–2.9× / ≥3× baseline" (§5.2) | Store baseline creatinine per patient; compute a `baselineMultiplier` on flagged items at ingest; add it as a `compareField`. (Absolute arm `Cr ≥ 4.0` already works.) |
| **Item-level & count conditions** | HAM-D item-3 override (§6.3); AIMS Schooler-Kane "≥2 items scored 2" (§7.2) | Store the suicide item as its own field on `hamdTest`; add a `COUNT_MATCHES`-style operator ("count array items meeting X ≥ N") for AIMS. (AIMS "1 item ≥3 / any item = 4" would already work via `ARRAY_ANY_MATCHES` once the model exists; only the *count* arm needs the new operator.) Note the dedicated C-SSRS pathway already covers suicide risk, and spec §9 itself questions whether the HAM-D override is even wanted. |
| **Time-based escalation** | Section 8 "escalate to X after N hours if unacknowledged" | Add escalation targets + timers to the block/routing schema, plus a cron that finds unacknowledged (unread/unresolved) alerts past their window and notifies the escalation role. Today only initial routing + read/resolve tracking exist. |

### 8.5 Reliability / housekeeping (not spec-specific)

- **IMMEDIATE alerts have no dedupe** and every app replica writes — re-saving a test or multi-process deploys can double-fire a clinical alert. Consider a dedupe key for IMMEDIATE if duplicates are a problem.
- **`admissionType` (IPD/OPD) gate is commented out** in the engine — if JRCPL rules should be IPD-only, that needs re-enabling.

---

## 9. Corrections to existing docs

The client-side `SOP_WORKFLOW.md` / `SOP_DELAYED_WORKFLOW.md` / `SOP_CONDITION_EVALUATION.md` are inconsistent about DELAYED (one says "no publisher yet", one says BullMQ jobs, one says a cron). **Ground truth from the server:** DELAYED is a **twice-daily node-cron** (`sopDelayedCheck.cron.js`) that expands each condition's `schedule` into checkpoints and fires on missing/failing data, deduped by `dedupeKey`. IMMEDIATE runs via the Mongoose-hook → Redis → `sopEngine.js` path and now covers **all** registered models (not just `VitalSign`, as the old doc claims). Worth reconciling those docs.

---

*Prepared for the EMR development team · references `JRCPL-EMR-CAS-001 v0.2`. Section numbers (§3.2 etc.) point into that spec; use them as each block's Reference Section.*
