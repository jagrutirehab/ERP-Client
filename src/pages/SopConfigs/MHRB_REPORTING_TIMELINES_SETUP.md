# MHRB Reporting Timelines — SOP Setup

> # ⛔ SUPERSEDED — DO NOT BUILD FROM THIS DOCUMENT
>
> A 24-agent code audit found two errors here that make the rule tables below **non-functional**, and a third that makes the design **incorrect**:
>
> 1. **§5 claims gender matching is case-insensitive. It is not.** `sopEvaluator.js:490` is `String(a) === String(b)`. The tables specify `Female`/`Male`; stored values are `FEMALE`/`MALE`. **Both §89 rules match zero patients.**
> 2. **§2 says empty `centers` means all centres.** Empty is rejected client-side *and* server-side. Every rule must be centre-scoped.
> 3. **The `isMHRBEmailSent EQUALS false` gate guarantees a false negative.** §89→§90 happens on the *same* Addmission, so filing the §89 report sets the flag `true` and the §90 rule **never fires**. Good §89 compliance causes §90 non-reporting.
>
> Use **[MHRB_IMPLEMENTATION_PLAN.md](MHRB_IMPLEMENTATION_PLAN.md)** instead. This file is kept for the requirement breakdown and the not-automatable analysis in §8, which remain valid.

Mental Healthcare Act 2017, as applicable in Maharashtra. Block-by-block field values for the §87 / §89 / §90 / §94 reporting deadlines.

**Read §1 before building anything.** Four of the five rows on the infographic are buildable, but one blocker makes them nag daily forever, and a second means they currently match almost no patients. Both are fixable; neither is fixed yet.

---

## 1. Read this first

### 1.1 🚫 Blocker — there is no way to stop an alert once the report is filed

The admission record *does* track MHRB submission:

| Field | Meaning |
|---|---|
| `isMHRBEmailSent` | `true` once the MHRB email is sent |
| `mhrbEmailFormURL[]` | the uploaded MHRB form PDFs |

**Neither field is selectable in the SOP builder.** The condition dropdown is driven by an allow-list in `src/controllers/sop/sopMetaController.js`, and `ALLOWED_FIELDS.Addmission` contains only:

```
addmissionform · consentform · dischargeform · undertakingdischargeform
provisional_diagnosis · patientType · priority · isRamsayApplicable · addmissionDate
```

Without that gate, every rule below fires **once per day, per admission, until discharge** — whether or not the report was filed on day one. That is the opposite of what a compliance reminder should do.

**The fix is one line** — add `'isMHRBEmailSent'` to `ALLOWED_FIELDS.Addmission`. But see 1.2, because exposing it is not sufficient on its own.

### 1.2 🚫 Blocker — the MHRB field is inconsistent, so no single operator matches "not filed"

`isMHRBEmailSent` is only ever written as `true`, by [admissionform.controller.js:524](../../controllers/patient/admissionform.controller.js). It is never explicitly set to `false`. "Not filed" is therefore represented two different ways depending on which code path created the admission:

| State | Open admissions | `EXISTS` | `NOT_EXISTS` | `EQUALS false` | `NOT_EQUALS true` |
|---|---|---|---|---|---|
| field absent | **1,164** | ✗ | ✓ | ✗ | ✗ |
| `false` | 2 | ✓ | ✗ | ✓ | ✓ |
| `true` (filed) | 5 | ✓ | ✗ | ✗ | ✗ |

There is **no operator that matches both "absent" and "false"**. A missing field never satisfies `NOT_EQUALS` either — the evaluator's `isBlank` guard treats "no reading" as "does not differ from X".

**This is a clean deploy boundary, not a bug.** `isMHRBEmailSent` was added to the schema on **24 Sep 2026 14:59 IST** (commit `db69b737`). Every admission created since has the field; the handful of older ones that have it are those where the MHRB email was actually sent, which is the controller writing `true`. Verified: of 2 admissions created post-deploy, **0 are missing the field**.

So no code path needs fixing. `isMHRBEmailSent EQUALS false` becomes a complete and permanent gate **as soon as the field is added to the allow-list** (1.1) — nothing else.

**Do not backfill the legacy admissions.** 1,169 open admissions predate the field and will stay silent under this gate. That is the correct outcome: their MHRB deadlines are historic, and backfilling `false` would raise 1,169 overdue alerts at once. These rules should govern admissions going forward.

### 1.3 ⚠️ The category filters currently match almost nobody

§87/§89/§90 differ by admission type, which is resolved from `admissionTypeHistory`. On staging that array is empty for **1,162 of 1,171 open admissions** — including most created this week:

| Current admission type | Open admissions |
|---|---|
| *(no history entry at all)* | **1,162** |
| SUPPORTIVE_ADMISSION | 5 |
| EMERGENCY_ADMISSION | 3 |
| INDEPENDENT_ADMISSION | 1 |

A §89 rule filtered on supported admissions would match 5 patients out of 1,171.

**Check production before concluding anything** — the live §89/§90 rules fired 74 and 162 alerts on 23 Sep, so production is clearly better populated than staging. There is also a backfill script at `src/scripts/backfillAdmissionTypeHistory.js`.

### 1.4 ⚠️ Volume — safe *with* the gate, catastrophic without it

1,165 of the 1,171 open admissions are already older than 7 days, and a state rule re-fires once per IST day for as long as its condition holds. **Built without the gate, §90 alone raises ~1,165 alerts on its first run and again every day after.**

**With** the `isMHRBEmailSent EQUALS false` gate the blast radius is naturally tiny — only admissions created after the 24 Sep deploy carry the flag, which is **1 open admission today**. Volume then grows one admission at a time and each clears itself the moment the MHRB email goes out. That is the intended behaviour.

The gate is therefore not just a nice-to-have. It is the only thing standing between these rules and a four-figure daily alert flood.

### 1.5 Design constraint — one condition per block

On the DELAYED path the cron loops `for each block → for each condition` and fires an alert **per condition**, deduped as `…:{block}:{cond}:state:{date}`. Two conditions in one block produce **two alerts per day**, not one ANDed alert.

Two consequences, and both shape everything below:

- **All filtering goes in `satisfyingCriteria`** (rule-level, ANDed, evaluated as a gate). Only the timing condition goes in the target block.
- **`satisfyingCriteria` is rule-level, not per-block** — so each patient category needs its **own rule**. That is why this is 4 rules, not 1 rule with 4 blocks.

Also note `OLDER_THAN_DAYS` has no upper bound, so tiers inevitably overlap — a 90-day admission satisfies `>3`, `>7` and `>30` simultaneously. **Give each rule exactly one block with one condition.** Escalating tiers are not expressible here.

---

## 2. Fields common to every rule

| Form field | Value |
|---|---|
| Model (target block) | `Addmission` |
| Field | `addmissionDate` |
| Operator | `OLDER_THAN_DAYS` |
| Trigger type | **`DELAYED`** |
| Centers | *(empty = all; scope to Maharashtra centres if these timelines are state-specific)* |

`OLDER_THAN_DAYS` is strictly `>`, measured against the live record at cron time. The sweep runs at **02:00 and 14:00 IST** daily.

**Every rule gets this same gate in `satisfyingCriteria` once 1.1–1.2 are done:**

| Model | Field | Operator | Value |
|---|---|---|---|
| `Addmission` | `isMHRBEmailSent` | `EQUALS` | `false` |

---

## 3. Rule: §87 — Admission of Minor (72 hours)

**Report to MHRB within 72 hours (3 days).**

`adultationType` (ADULT/MINOR) is **not** exposed as a condition field, so minor status is filtered on `Patient.age` instead — which *is* available, and is the more reliable signal anyway.

### satisfyingCriteria

| Model | Field | Operator | Value |
|---|---|---|---|
| `Patient` | `age` | `LESS_THAN` | `18` |
| `Addmission` | `isMHRBEmailSent` | `EQUALS` | `false` |

### Target block

| Field | Value |
|---|---|
| Block name | `MHRB §87 — minor, 72-hour report overdue` |
| Condition | `Addmission.addmissionDate OLDER_THAN_DAYS 3` |
| Severity | `HIGH` |
| Notify | MANAGER, ADMIN, DOCTOR |
| Alert template | `Minor admitted more than 72 hours ago — MHRB report not recorded.` |
| Action guidance | `Report this admission to MHRB immediately. Statutory deadline is 72 hours from admission (MHA 2017 §87).` |
| Reference | `MHA 2017 §87` |

### Second rule: §87 — 30-day continuation

The infographic also requires *"if admission continues for more than 30 days, inform MHRB immediately."* That is a **separate rule** (different deadline, different message), same `satisfyingCriteria`:

| Field | Value |
|---|---|
| Block name | `MHRB §87 — minor, admission exceeds 30 days` |
| Condition | `Addmission.addmissionDate OLDER_THAN_DAYS 30` |
| Severity | `HIGH` |
| Notify | MANAGER, ADMIN, DOCTOR |
| Action guidance | `Minor admission has continued beyond 30 days — inform MHRB immediately. Board reviews within 7 days of intimation, then every 30 days thereafter.` |

> Both rules will fire daily from day 30 onward, since a 40-day admission satisfies `>3` and `>30`. This is unavoidable without the MHRB gate — another reason 1.1–1.2 come first.

---

## 4. Rule: §89 — Supported Admission, Female (3 days)

### satisfyingCriteria

| Model | Field | Operator | Value |
|---|---|---|---|
| `Patient` | `gender` | `EQUALS` | `Female` |
| `Addmission` | `admissionSupportType` | `EQUALS` | `UPTO30DAYS` |
| `Addmission` | `isMHRBEmailSent` | `EQUALS` | `false` |

`admissionSupportType` is a synthetic field — the server resolves it from the newest in-force `admissionTypeHistory` entry. Its dropdown offers `UPTO30DAYS` / `BEYOND30DAYS`; supported admission "initially valid up to 30 days" is `UPTO30DAYS`.

### Target block

| Field | Value |
|---|---|
| Block name | `MHRB §89 — female, 3-day report overdue` |
| Condition | `Addmission.addmissionDate OLDER_THAN_DAYS 3` |
| Severity | `HIGH` |
| Notify | MANAGER, ADMIN |
| Alert template | `Supported admission (female) exceeds 3 days — MHRB report not recorded.` |
| Action guidance | `Report to MHRB within 3 days of admission (MHA 2017 §89). Supported admission is initially valid up to 30 days.` |
| Reference | `MHA 2017 §89` |

---

## 5. Rule: §89 — Supported Admission, Male (7 days)

Identical to §4 except gender and the deadline.

### satisfyingCriteria

| Model | Field | Operator | Value |
|---|---|---|---|
| `Patient` | `gender` | `EQUALS` | `Male` |
| `Addmission` | `admissionSupportType` | `EQUALS` | `UPTO30DAYS` |
| `Addmission` | `isMHRBEmailSent` | `EQUALS` | `false` |

### Target block

| Field | Value |
|---|---|
| Block name | `MHRB §89 — male, 7-day report overdue` |
| Condition | `Addmission.addmissionDate OLDER_THAN_DAYS 7` |
| Severity | `HIGH` |
| Notify | MANAGER, ADMIN |
| Alert template | `Supported admission (male) exceeds 7 days — MHRB report not recorded.` |
| Action guidance | `Report to MHRB within 7 days of admission (MHA 2017 §89). Supported admission is initially valid up to 30 days.` |
| Reference | `MHA 2017 §89` |

> 🔴 **WRONG — matching is case-SENSITIVE.** `sopEvaluator.js:490` is `String(actualValue) === String(tv)`. Verified by running the evaluator: stored `FEMALE` against authored `Female` returns **false**. The builder's gender dropdown emits Title Case and `ConditionRow.js:833-840` overwrites the value array to that single element, so the multi-casing workaround is not authorable in the UI either. **As specified above, both §89 rules match zero patients.** See Phase 0.2 of the implementation plan.
>
> Separately on data quality: gender holds `MALE` (4,690), `FEMALE` (2,752), `male` lowercase (2), `OTHERS` (6), literal `undefined` (2), absent (13). Even after the casing fix, **21 patients match neither rule** and fall through both §89 rules. Worth a catch-all rule for unrecorded gender.

---

## 6. Rule: §90 — Continued Admission (7 days)

### satisfyingCriteria

| Model | Field | Operator | Value |
|---|---|---|---|
| `Addmission` | `admissionSupportType` | `EQUALS` | `BEYOND30DAYS` |
| `Addmission` | `isMHRBEmailSent` | `EQUALS` | `false` |

No gender split — §90 applies to male or female alike.

### Target block

| Field | Value |
|---|---|
| Block name | `MHRB §90 — continued admission, 7-day report overdue` |
| Condition | `Addmission.addmissionDate OLDER_THAN_DAYS 7` |
| Severity | `HIGH` |
| Notify | MANAGER, ADMIN, DOCTOR |
| Alert template | `Continued admission under §90 exceeds 7 days — MHRB report not recorded.` |
| Action guidance | `Report admission/readmission under §90 to MHRB within 7 days. MHRB reviews and decides within 21 days. First continuation may run up to 120 days; subsequent periods generally up to 180 days.` |
| Reference | `MHA 2017 §90` |

> **You already have §89/§90 rules in production** (`Admission Duration Review §89` / `§90`), firing at Day 25 and Day 85. Those are *authorisation-expiry* warnings — "the 30/90-day window is about to lapse" — which is a different question from "was the MHRB report filed on time". The two are complementary; keep both, but name them distinctly so the inbox stays readable.

---

## 7. §94 — Emergency Treatment

**Nothing to build.** The infographic is explicit: *"No separate MHRB reporting timeline."*

§94 permits emergency treatment for up to 72 hours or until assessment, whichever is earlier. After assessment, if admission continues it is re-recorded under §89 or §90 — at which point the rules above take over, because `admissionSupportType` is resolved from the **newest in-force** `admissionTypeHistory` entry.

If you want a safety net for emergency admissions that were never reclassified, that is a genuinely useful rule and it *is* buildable — but it is not on the infographic, so I have not specified it. Say the word.

---

## 8. What cannot be automated

| Requirement | Why not |
|---|---|
| §87 — "Board to review within 7 days of intimation" | No field records the MHRB **intimation date**. Deadlines can only be measured from `addmissionDate`. |
| §87 — "Subsequent reviews every 30 days" | Needs a board-review record to count against. No such model exists. |
| §87 — "female attendant must stay with her throughout" | No structured field for the nominated representative or their gender. |
| §90 — "MHRB to review and decide within 21 days" | Same as above — no MHRB submission date to count from. |
| §90 — "first continuation up to 120 days, subsequent up to 180" | Continuation **periods** are not tracked; only the current support type is. Partially covered by the existing Day 85 rule. |

Each of these becomes automatable if an MHRB submission record is added — a small sub-document on the admission holding `{ section, submittedAt, decidedAt, outcome }` would cover every row in this table, and would also solve the gate problem in §1.1 properly rather than by re-purposing a boolean.

---

## 9. Before you activate

**Do the three data fixes first** (§1.1–1.2). Building the rules is safe; activating them before the gate exists means ~1,165 alerts per day that nobody can clear.

**Verify `admissionTypeHistory` coverage on production**, not staging. If it is as sparse there as here, run `src/scripts/backfillAdmissionTypeHistory.js` before activating §89 or §90, or those rules will silently match a handful of patients and look like they are working.

**Test the gate before anything else.** Take one admission with `isMHRBEmailSent: false`, confirm the rule fires, set the flag to `true` through the normal MHRB email flow, and confirm it stops firing the next day. If it does not stop, nothing else in this document matters.

**Check one patient per category** — a minor, a supported female, a supported male, a §90 continued admission — and confirm each is matched by exactly one rule. A patient matched by two rules gets two alerts per day.

**Confirm severity and routing.** The infographic specifies neither. Everything above is set to `HIGH` / MANAGER + ADMIN (+ DOCTOR for clinical sections) on the basis that these are statutory deadlines with legal consequence — but that is my proposal, not your policy. Adjust before activating.

**Decide the centre scope.** These timelines are Maharashtra-specific. The extended timelines under §114 (120 hours for §87, 7/10 days for §89) apply to certain north-eastern/hill states and UTs, **not** Maharashtra. If this system serves centres outside Maharashtra, scope each rule's `centers` list rather than leaving it empty.
