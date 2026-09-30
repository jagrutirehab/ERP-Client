# Lab Report SOP Setup — Electrolytes & Haematology

Block-by-block field values for the electrolyte and haematology tiering table.
Every value below is **exactly what to type into the form**. Nothing here needs conversion by hand — the conversions have already been applied.

Covers 8 rules / 54 blocks. Four rows from the source table are deliberately excluded — see [What is not covered](#what-is-not-covered).

---

## 1. Read this first — three things that will silently break these rules

These are not theoretical. All three have already produced wrong alerts in the live system.

### 1.1 Enter values in the catalogue's unit, not the lab's

The AI extractor converts every reading into the catalogue's canonical unit before any rule sees it. A threshold typed in the unit printed on the lab report will be compared against a number in a different scale.

The conversion is performed by the **language model**, not by deterministic code — the extraction prompt instructs it to *"CONVERT numericValue to the catalogue's unit using standard conversions… if conversion is ambiguous or you're unsure, leave numericValue null."* Two consequences worth holding onto:

- Where the report's unit already **matches** the catalogue, no conversion happens and the value is exact. This is the reliable case.
- Where it **differs**, the number depends on the model getting the arithmetic right, and an "unsure" result yields `null` — which raises **no alert at all**. A silent miss, not a wrong alert.

This is the argument for keeping catalogue units aligned with what your labs actually print. It applies to Magnesium — see §6.

| Test | Your table's unit | Catalogue unit | Conversion needed |
|---|---|---|---|
| Sodium | mmol/L | mEq/L | **None** — 1:1 for Na⁺ |
| Potassium | mmol/L | mEq/L | **None** — 1:1 for K⁺ |
| Calcium | mg/dL | mg/dL | **None** |
| Haemoglobin | g/dL | g/dL | **None** |
| WBC | x10⁹/L | x10³/µL | **None** — numerically identical |
| Platelets | x10⁹/L | x10³/µL | **None** — numerically identical |
| Magnesium | mg/dL | mg/dL | **None** — catalogue was changed to mg/dL for this reason |
| **ANC** | **/mm³** | **x10³/µL** | **÷ 1000** ⚠️ |

**ANC is now the only one that bites**, and it is already wrong in the live rule: the current `ANC < 100` block compares against a value in x10³/µL. A normal ANC of 8,000/mm³ arrives as `8`, and `8 < 100` fires **CRITICAL agranulocytosis** on a healthy patient. §10 gives the converted numbers.

Magnesium used to bite the same way — a *high* magnesium of 2.5 mg/dL arrived as `1.03` mmol/L and was reported as *moderate hypomagnesaemia*, the opposite of the truth. That was fixed at source by changing the catalogue unit to mg/dL (see §6), so magnesium thresholds are now typed verbatim from the table.

### 1.2 Use `Numeric between (low ≤ x ≤ high)`, not `Numeric band`

The mode dropdown offers two band comparators:

| UI label | Stored as | Means |
|---|---|---|
| `Numeric between (low ≤ x ≤ high)` | `BETWEEN` | **inclusive both ends** ← use this |
| `Numeric band (low < x ≤ high)` | `BETWEEN_EXCLUSIVE_LOW` | low end **excluded** |

`Numeric band` exists for ladders written as ULN multiples (1–2, 2–3, 3–5), where consecutive tiers share a boundary and only one should claim it. Your table does not share boundaries — it uses distinct ranges like `125–129` then `130–134`.

If you pick `Numeric band` here, **a value sitting exactly on the low end never fires.** A sodium of exactly 146 entered as a `146–149` band would produce no alert at all. Use `Numeric between` for every banded tier in this document.

The one exception is Magnesium, where conversion produces continuous decimals — see §5.

### 1.3 "Psychiatrist" is not a role in this system

The routing column names Psychiatrist and Centre Manager. Neither exists under those names. The available roles are:

`SUPERADMIN · ADMIN · DOCTOR · MANAGER · NURSE · RMO · PSYCHOLOGIST · COUNSELLOR · ACCOUNTANT · HR · IT · ONLINE SUPPORT ADMIN · TELECALLER-LEAD · Training Manager`

Mapping used throughout this document:

| Table says | Select | Why |
|---|---|---|
| Psychiatrist | **DOCTOR** | Psychiatrists hold the DOCTOR role. `PSYCHOLOGIST` is a different profession — do **not** use it. |
| Centre Manager | **MANAGER** | |
| Nurse | **NURSE** | |
| RMO | **RMO** | |

> **Confirm this mapping before go-live.** If psychiatrists need to be reachable separately from other doctors, that needs a new role first — routing to `DOCTOR` will also notify physicians and every other doctor in the centre.

---

## 2. Fields that are identical on every block

Set these the same way for all 54 blocks. Only the test, the comparator, the numbers, the severity and the routing change.

| Form field | Value |
|---|---|
| Model | `LabReport` |
| Field | `reports.aiResponse.flaggedItems` (the flagged-lab-items editor) |
| Trigger type | `IMMEDIATE` |
| Compare basis | **`Absolute value`** |
| Deadline hours | `0` |
| Centers | *(leave empty = all centres)* |

**Compare basis matters.** The dropdown offers `× ULN (upper limit)`, `× LLN (lower limit)` and `Absolute value`. Every threshold in your table is an absolute concentration, so it must be `Absolute value`. Picking `× ULN` would read `6.5` as *6.5 times the upper limit*.

This is the second live bug worth knowing about: the current `Haemoglobin <6.5` block is set to `× ULN` **and** points at the wrong test (`MAGNESIUM`). It fires CRITICAL severe anaemia off the magnesium result. Setting `keyValue` correctly is not enough on that block — the basis has to change too.

### Severity mapping

| Priority column | Severity to select |
|---|---|
| Low | `LOW` |
| Medium | `MEDIUM` |
| High | `HIGH` |
| Critical / Critical (Emergency) | `CRITICAL` |

---

## 3. Rule: Sodium (Na)

**Test to select:** `Sodium (Na+)` · **Unit shown:** mEq/L · **Reference:** 135–145

Create as **one rule** with 8 blocks (low ladder + high ladder).

### Low ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Sodium (Na) T1 130–134` | Numeric between | `130` | `134` | LOW | NURSE, RMO |
| `Sodium (Na) T2 125–129` | Numeric between | `125` | `129` | MEDIUM | RMO |
| `Sodium (Na) T3 120–124` | Numeric between | `120` | `124` | HIGH | RMO, DOCTOR |
| `Sodium (Na) T4 <120` | Numeric `<` | `120` | — | CRITICAL | RMO, DOCTOR, MANAGER |

### High ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Sodium (Na) T1 146–149` | Numeric between | `146` | `149` | LOW | NURSE, RMO |
| `Sodium (Na) T2 150–155` | Numeric between | `150` | `155` | MEDIUM | RMO |
| `Sodium (Na) T3 156–160` | Numeric between | `156` | `160` | HIGH | RMO, DOCTOR |
| `Sodium (Na) T4 >160` | Numeric `>` | `160` | — | CRITICAL | RMO, DOCTOR, MANAGER |

✅ Ladder is gap-free and non-overlapping against the 135–145 reference range.

---

## 4. Rule: Potassium (K)

**Test to select:** `Potassium (K+)` · **Unit shown:** mEq/L · **Reference:** 3.5–5.0

### Low ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Potassium (K) T1 3.1–3.4` | Numeric between | `3.1` | `3.4` | LOW | NURSE |
| `Potassium (K) T2 2.6–3.0` | Numeric between | `2.6` | `3.0` | MEDIUM | NURSE, RMO |
| `Potassium (K) T3 2.0–2.5` | Numeric between | `2.0` | `2.5` | HIGH | NURSE, RMO |

T4 excluded — see [What is not covered](#what-is-not-covered).

### High ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Potassium (K) T1 5.1–5.5` | Numeric between | `5.1` | `5.5` | LOW | NURSE, RMO |
| `Potassium (K) T2 5.6–6.0` | Numeric between | `5.6` | `6.0` | MEDIUM | NURSE, RMO |
| `Potassium (K) T3 6.1–6.9` | Numeric between | `6.1` | `6.9` | HIGH | NURSE, RMO |
| `Potassium (K) T4 ≥7.0` | Numeric `≥` | `7.0` | — | CRITICAL | NURSE, RMO, DOCTOR, MANAGER |

> ⚠️ **T4 is only half implemented.** The table reads *"≥7.0 mmol/L, **OR any level with ECG changes** (peaked T waves, widened QRS)"*. Only the `≥7.0` half is automatable — there is no structured ECG-findings field to test. A patient at K 5.8 with peaked T waves will get the T2 MEDIUM alert, not CRITICAL. That gap has to be closed by the nurse at the bedside, so it belongs in the action guidance, not the rule.

**Action guidance for T4:** `Emergency correction; continuous cardiac monitoring; consider dialysis. NOTE: escalate to CRITICAL at ANY potassium level if ECG shows peaked T waves or widened QRS — this rule cannot detect that.`

---

## 5. Rule: Calcium (corrected)

**Test to select:** `Calcium (corrected)` · **Unit shown:** mg/dL · **Reference:** 8.5–10.5

### Low ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Calcium T1 7.5–8.0` | Numeric between | `7.5` | `8.0` | LOW | RMO |
| `Calcium T2 7.0–7.4` | Numeric between | `7.0` | `7.4` | MEDIUM | RMO |
| `Calcium T3 6.5–6.9` | Numeric between | `6.5` | `6.9` | HIGH | RMO, NURSE |

T4 excluded — see [What is not covered](#what-is-not-covered).

### High ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Calcium T1 10.6–11.5` | Numeric between | `10.6` | `11.5` | LOW | RMO |
| `Calcium T2 11.6–12.5` | Numeric between | `11.6` | `12.5` | MEDIUM | RMO |
| `Calcium T3 12.6–14.0` | Numeric between | `12.6` | `14.0` | HIGH | RMO, DOCTOR |
| `Calcium T4 >14.0` | Numeric `>` | `14.0` | — | CRITICAL | RMO, DOCTOR, MANAGER |

> ⚠️ **Gap in the source table: 8.1 – 8.4 mg/dL.** The lower reference limit is 8.5, but the low T1 band stops at 8.0. A calcium of 8.2 is below normal and will raise nothing. Either widen T1 to `7.5–8.4`, or accept it deliberately.

**T4 routing was truncated in the source image** — `RMO + Psychiatrist + …`. Assumed `MANAGER` to match every other Critical tier. Confirm.

---

## 6. Rule: Magnesium

**Test to select:** `Magnesium (Mg2+)` · **Unit shown:** mg/dL · **Reference:** 1.7–2.2

Type your table's numbers **verbatim** — no conversion.

> **The catalogue unit was changed for this.** `MAGNESIUM` in `src/constants/labTestCatalogue.js` was `mmol/L` (uln 1.0 / lln 0.7) and is now `mg/dL` (uln 2.2 / lln 1.7). 1.7–2.2 mg/dL is the same reference interval as 0.7–1.0 mmol/L (× 2.4305), so only the scale changed, not the clinical meaning.
>
> This was done because local labs print magnesium in mg/dL. While the catalogue said mmol/L, the extraction prompt made the language model convert every report — turning a *high* 2.5 mg/dL into `1.03` mmol/L, which then landed in the hypomagnesaemia ladder and alerted as the opposite of the truth. The model now stores the printed number unchanged.
>
> Verified after the change: a report printed `2.5 mg/dL` now fires `Magnesium 2.3–3.0` (mild hypermagnesaemia, correct) instead of the false `1.0–1.2` hypomagnesaemia alert.

### Low ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Magnesium T1 1.3–1.6` | Numeric between | `1.3` | `1.6` | LOW | NURSE |
| `Magnesium T2 1.0–1.2` | Numeric between | `1.0` | `1.2` | MEDIUM | RMO |
| `Magnesium T3 0.7–0.9` | Numeric between | `0.7` | `0.9` | HIGH | RMO |
| `Magnesium T4 <0.7` | Numeric `<` | `0.7` | — | CRITICAL | RMO, DOCTOR |

### High ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Magnesium T1 2.3–3.0` | Numeric between | `2.3` | `3.0` | LOW | RMO |
| `Magnesium T2 3.1–4.0` | Numeric between | `3.1` | `4.0` | MEDIUM | RMO |
| `Magnesium T3 4.1–6.0` | Numeric between | `4.1` | `6.0` | HIGH | RMO, DOCTOR |
| `Magnesium T4 >6.0` | Numeric `>` | `6.0` | — | CRITICAL | RMO, DOCTOR |

> **Historical magnesium readings are on the old mmol/L basis** and now read as severely low. On staging only 2 readings were ever actually converted (both from the test upload), 10 have no unit recorded and 21 have no reading at all — so there is nothing worth backfilling. **Check the same counts on production before deploying**, and disregard any pre-existing Magnesium alert either way, since the rule was broken before this change.

> **The existing `Magnesium (CAS_25)` rule is now correct.** Its bands were authored in mg/dL all along — the catalogue was the mismatched half. You can keep it rather than rebuilding, but check two things: its blocks use `Numeric band (low < x ≤ high)`, so a magnesium of exactly `1.0` falls between T3 and T2 and fires nothing; and its T1 severity is MEDIUM where your table says Low.

---

## 7. Rule: Haemoglobin (Hb)

**Test to select:** `Haemoglobin` · **Unit shown:** g/dL · **Reference:** 12–17

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Haemoglobin T1 10.1–11.9` | Numeric between | `10.1` | `11.9` | LOW | NURSE |
| `Haemoglobin T2 8.0–10.0` | Numeric between | `8.0` | `10.0` | MEDIUM | NURSE |
| `Haemoglobin T3 6.5–7.9` | Numeric between | `6.5` | `7.9` | HIGH | NURSE, RMO |
| `Haemoglobin T4 <6.5` | Numeric `<` | `6.5` | — | CRITICAL | RMO, DOCTOR, MANAGER |

✅ Gap-free and non-overlapping.

> **There is an existing rule named `Haemoglobin (Hb) 10.1–11.9` that is badly broken** — three of its four blocks point at `MAGNESIUM` instead of `HEMOGLOBIN`, and the `<6.5` block compares `× ULN` rather than absolute value. It currently fires CRITICAL severe anaemia off the magnesium result. Delete or fix that rule rather than creating a second one alongside it.

> ⚠️ **No high-side tier.** The source table has no polycythaemia ladder. Hb above 17 raises nothing.

---

## 8. Rule: WBC Count

**Test to select:** `WBC (Total Leukocyte Count)` · **Unit shown:** x10³/µL · **Reference:** 4.0–11.0

x10⁹/L and x10³/µL are numerically identical — type your table's numbers unchanged.

### Low ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `WBC Count T1 3.0–3.9` | Numeric between | `3.0` | `3.9` | LOW | NURSE |
| `WBC Count T2 2.0–2.9` | Numeric between | `2.0` | `2.9` | MEDIUM | NURSE, RMO |
| `WBC Count T3 1.0–1.9` | Numeric between | `1.0` | `1.9` | HIGH | DOCTOR, RMO |
| `WBC Count T4 <1.0` | Numeric `<` | `1.0` | — | CRITICAL | DOCTOR, RMO |

### High ladder

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `WBC Count T1 11.1–15.0` | Numeric between | `11.1` | `15.0` | LOW | RMO |
| `WBC Count T2 15.1–20.0` | Numeric between | `15.1` | `20.0` | MEDIUM | RMO |
| `WBC Count T3 20.1–30.0` | Numeric between | `20.1` | `30.0` | HIGH | RMO, DOCTOR |
| `WBC Count T4 >30.0` | Numeric `>` | `30.0` | — | CRITICAL | RMO, DOCTOR, MANAGER |

> **The existing `WBC Count (CAS_25)` rule is authored in raw cells/µL** (`3000–3900`, `<1000`). It has fired zero alerts because it was edited after the last test upload, but the next report processed will trip `<1000` CRITICAL for any normal WBC. Fix or delete it before creating this one.

---

## 9. Rule: Platelet Count

**Test to select:** `Platelet Count` · **Unit shown:** x10³/µL · **Reference:** 150–450

x10⁹/L and x10³/µL are identical — numbers unchanged.

| Block name | Mode | Low | High | Severity | Notify |
|---|---|---|---|---|---|
| `Platelet Count T1 75–149` | Numeric between | `75` | `149` | LOW | NURSE |
| `Platelet Count T2 50–74` | Numeric between | `50` | `74` | MEDIUM | NURSE, RMO |
| `Platelet Count T3 25–49` | Numeric between | `25` | `49` | HIGH | DOCTOR, RMO |
| `Platelet Count T4 <25` | Numeric `<` | `25` | — | CRITICAL | DOCTOR, RMO, MANAGER |

> ⚠️ **No high-side tier.** Thrombocytosis is unmonitored at any value.

---

## 10. Rule: Absolute Neutrophil Count (ANC) — Clozapine — ⚠️ converted values

**Test to select:** `Absolute Neutrophil Count` · **Unit shown:** x10³/µL · **Reference:** 2.0–7.0

Your table is in **/mm³**; the catalogue stores **x10³/µL**. All values **÷ 1000**.

| Block name | Mode | Low | High | Severity | Notify | *(source, /mm³)* |
|---|---|---|---|---|---|---|
| `ANC T1 1000–1499/mm³` | Numeric between | `1.0` | `1.499` | HIGH | DOCTOR, RMO | 1000–1499 |
| `ANC T2 500–999/mm³` | Numeric between | `0.5` | `0.999` | CRITICAL | DOCTOR, RMO | 500–999 |
| `ANC T3 100–499/mm³` | Numeric between | `0.1` | `0.499` | CRITICAL | DOCTOR, RMO, MANAGER | 100–499 |
| `ANC T4 <100/mm³` | Numeric `<` | `0.1` | — | CRITICAL | DOCTOR, RMO, MANAGER | <100 |

Note T1 is **HIGH**, not LOW — this ladder starts at a higher severity than the others because it is clozapine monitoring.

Keep `/mm³` in the block name for the same reason as Magnesium — `0.499` is not a number clinicians recognise.

Unlike Magnesium, **leave the ANC catalogue unit alone.** x10³/µL is the conventional way clozapine protocols express ANC (1.5 / 1.0 / 0.5), so the catalogue is already right; it is the *rule* that was authored in the wrong unit. The model converted the sample report's `8,000 cells/µL` to `8` correctly.

> ⚠️ **Gap in the source table: 1500 – 1999/mm³.** The lower reference limit is 2000/mm³ but T1 stops at 1499. An ANC of 1,800 on a clozapine patient is genuinely low and will raise nothing. Consider widening T1 to `1.0 – 1.999`.

> **The existing `Absolute Neutrophil Count (ANC) — Clozapine` rule is authored in raw /mm³** and its `<100` block fires CRITICAL for every patient who has an ANC at all. This is the single highest-volume false positive in the system. Fix or delete it first.

---

## 11. What is not covered

Four rows from the source table are excluded.

| Row | Why |
|---|---|
| **Potassium T4 (low)** — `<2.0, OR any K<3.0 with ECG changes/arrhythmia` | Compound condition requiring structured ECG findings, which do not exist as a field. |
| **Calcium T4 (low)** — `<6.5, or symptomatic (tetany/seizure/arrhythmia) at any level` | Same — requires structured symptom capture. |
| **Na/K/Ca/Mg — Auto-escalation rule** *(active withdrawal → escalate one tier)* | **Not supported by the engine.** Rule blocks have no escalation field; severity is fixed per block. |
| **Na/K/Ca/Mg — Discontinuation / stop-low** *(2 normal readings → auto-resolve T1/T2)* | **Not supported for these rules.** `discontinueGate` exists but is read only by the DELAYED cron to suppress *missing-assessment* reminders. It cannot auto-resolve an already-fired IMMEDIATE alert. |

### If the auto-escalation rule is needed

The closest available construct is a **duplicate rule** carrying a rule-level satisfying criterion on the withdrawal assessment (e.g. `ciwaTest.systemTotalScore ≥ 8`), with each block one severity higher. Satisfying criteria are evaluated on the IMMEDIATE path, so this does work — but note:

- It is a **whole second rule**, doubling the blocks to maintain.
- Satisfying criteria are **rule-level, not block-level**, so the escalation applies to every tier in that rule, not selectively.
- Both rules fire independently, so a withdrawal patient gets **two alerts** — the base tier and the escalated one — unless the base rule also carries the inverse criterion.

Worth deciding whether that complexity is justified before building it.

---

## 12. Verify before go-live

**Upload one report per rule with a value inside each band** and confirm exactly one alert fires at the expected tier. Boundary values are what matter — test the low end of every band (146 for Sodium `146–149`, 75 for Platelets `75–149`). If a boundary value produces nothing, the block is on `Numeric band` instead of `Numeric between`.

**Upload a report with tests absent.** They arrive as `"Nill"` with a null value and must raise nothing. This is already handled, but it is the failure mode that produced ~2,900 false alerts historically, so confirm it still holds after adding these rules.

**Upload a fully normal report.** It must produce **zero** alerts. Any alert here means a band overlaps the reference range.

**Upload a report with magnesium printed in mg/dL** and confirm the stored `numericValue` matches the printed number exactly — `2.5 mg/dL` must store `2.5`, not `1.03`. If it still stores a converted value, the catalogue change has not reached that environment.

**Check the three broken live rules are gone or fixed** before activating their replacements — `Haemoglobin (Hb) 10.1–11.9`, `WBC Count (CAS_25)`, `Absolute Neutrophil Count (ANC) — Clozapine`. Leaving them active alongside the new rules means every patient gets both the correct alert and the false one.

**Confirm the DOCTOR routing decision** with whoever owns escalation. Every Critical tier here notifies DOCTOR, which reaches all doctors at the centre, not psychiatrists specifically.
