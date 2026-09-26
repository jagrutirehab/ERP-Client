# MHRB Reporting Timelines — Implementation Plan

Mental Healthcare Act 2017 (Maharashtra). Supersedes the rule tables in `MHRB_REPORTING_TIMELINES_SETUP.md`, which contain two errors that would have made the §89 rules match zero patients.

**Method.** A 24-agent audit: six readers over the SOP engine, admission lifecycle, MHRB flow, alert delivery, the Baseline Investigation Package, and cron reliability; four independent architectures; adversarial judging on three lenses. 14 agents completed; 8 judges, the synthesis and the completeness critic were lost to a session limit, so **judging is partial** — the rules-only approach was fully judged (14/30, 16 fatal flaws), the other three were not. This plan is synthesised by hand from the maps, designs and surviving verdicts, with the load-bearing claims re-verified directly against the code. Claims marked ⚠️ UNVERIFIED have not been.

---

## 1. Verdict

**Do not author the rules first.** The single biggest finding is that the gate this plan was built around — `isMHRBEmailSent EQUALS false` — is not merely imperfect. It guarantees a **false negative on a statutory deadline**, which is a worse failure than the alert flood it was chosen to prevent.

Three code changes and one schema change come first. Then the rules are near-trivial.

---

## 2. What the audit overturned

These were stated as fact earlier in this work, including in the setup doc. They are wrong.

### 2.1 🔴 The gate silences the wrong rules — §90 would never fire

`Addmission.isMHRBEmailSent` is **one boolean for the whole admission** (`addmission.model.js:322`). A §89→§90 transition does **not** create a new Addmission — `admissionTypeHistory` is an array on the same document. So:

> A patient is admitted under §89. Staff correctly file the MHRB report on day 2. `isMHRBEmailSent` flips to `true`. Thirty days later the admission continues under §90, which carries its own 7-day reporting duty. **The §90 rule is gated on `isMHRBEmailSent EQUALS false`, which is now `false`, so it never fires.**

The better the staff comply with §89, the more certainly §90 goes unreported. The same applies to §87's 30-day continuation intimation. The gate does not mean "this obligation is discharged" — it means "somebody uploaded an MHRB PDF at some point on this admission".

**This makes the per-section submission record a precondition, not a later refinement.**

### 2.2 🔴 The §89 gender rules would match zero patients

Verified by running the evaluator:

| Stored | Authored | Matches |
|---|---|---|
| `MALE` | `Male` | **false** |
| `FEMALE` | `Female` | **false** |
| `MALE` | `MALE` | true |
| `MALE` | `["Male","MALE"]` | true |

`sopEvaluator.js:490` is `String(actualValue) === String(tv)` — exact and case-**sensitive**. The setup doc's claim that matching is case-insensitive is flatly wrong. The builder's gender dropdown emits Title Case `"Male"`/`"Female"` (`sopConstants.js:16-20`) and `ConditionRow.js:833-840` **hard-overwrites the value array to that single element**, so the multi-casing workaround is not authorable in the UI either.

Worth checking before trusting the live §89/§90 rules: if they fire at all, they cannot be using a gender condition.

### 2.3 🟡 `Patient.age LESS_THAN 18` *is* authorable — but by accident

`age` is declared **twice** in `patient.model.js` (String at :176, Number at :219). The later key wins, so the runtime type is `Number` and the builder offers `LESS_THAN`. Verified at runtime.

§87 works today because of a duplicate object key. Anyone tidying that duplicate has a 50% chance of silently breaking the minor filter. **Delete the String declaration explicitly and leave a comment**, rather than relying on key order.

(`adultationType` is not the answer here: `setAdmissionType.controller.js:16` collects it only for `INDEPENDENT_ADMISSION`, so a minor admitted under a supported or emergency section carries none — exactly the §87 population. Exposing the field would not help.)

### 2.4 🟡 `mhrbEmailFormURL[]` already has half the audit trail

Earlier I said nothing records an MHRB submission date. Wrong — the sub-schema already stores `uploadedAt` and `uploadedBy` (`addmission.model.js:318-319`), populated on every upload. Missing are only **section**, true **sent date** (vs upload date), and **board outcome**. That is three fields on an existing sub-schema, not a new collection.

### 2.5 🟡 The MHRB filing UI already exists — on upstream only

`MHRBEmailUploadModal.js` plus two entry points exist on `upstream/main` and `upstream/staging`. `git grep` finds **zero** files on local `main`, `staging`, `awais`, `origin/main` and `origin/staging`. **The local ERP-Client checkout is stale.** Budget nothing for building this UI, and branch any client work from upstream.

### 2.6 🟡 New admissions have no `admissionTypeHistory`

The production backfill covered admissions that existed at backfill time. `admitPatient.controller.js:264` writes no `admissionTypeHistory`, so **every new admission and every readmission starts empty** and stays empty until someone uploads the admission form or files an Admission Type chart.

MHRB deadlines fall at days 3 and 7 — inside exactly that gap. A §89/§90 rule gated on `admissionSupportType` is structurally unable to see the patients most likely to be non-compliant.

### 2.7 🟡 Other corrections that change the plan

- **Boolean fields offer only `EQUALS`.** `ConditionRow.js` sets `allowedOps = ["EQUALS"]` for Boolean, so `isMHRBEmailSent EXISTS` / `NOT_EXISTS` is not authorable. The "legacy admissions stay silent" outcome is enforced by the client, not chosen — staff cannot change their minds without a code change. *(Also: there is a stray `console.log({ allowedOps })` left in that file.)*
- **Empty `centers` is unreachable.** Blocked client-side (`SOPForm.js:562-563`) and server-side (`sopRulesController.js:467-471`). Every rule is centre-scoped, so onboarding a centre means editing all the MHRB rules.
- **There is no alert delivery at all.** Socket push is commented out (`sopEngine.js:386`), the DELAYED writer never publishes, and there is no email/SMS/push anywhere. `GET /sop/alerts/unread` is wired in the client helper but **imported by nothing** — no bell, no badge. The inbox is fetch-on-mount plus a manual Refresh button. Two in-repo docs claim otherwise and are stale.
- **No ADMIN bypass on alert visibility.** `buildRouteMatches` has three clauses, none role-privileged. An ADMIN auditing compliance sees only what is routed to the literal string `ADMIN`.
- **Nothing auto-resolves an alert.** An alert resolved at 09:00 is recreated at 02:00 next day under a new date-keyed dedupeKey. Resolving is bookkeeping, not suppression.
- **Role vocabulary is split.** `authRoles.js` has 11 roles (no SUPERADMIN/RMO/HR/IT); those names come from the separate dynamic `roles` collection, which is what `notifyRoles` draws on. Routing to `"RMO"` may reach nobody. ⚠️ Confirm which vocabulary your staff actually hold.
- **`isMHRBEmailSent` is only set when a PDF is attached** (`admissionform.controller.js:519`), and the endpoint returns "uploaded successfully" even when it wrote nothing.
- **`BEYOND30DAYS` is labelled "beyond 30 days, up to 90"** in the builder, contradicting the statute's 120/180. Staff author §90 rules reading that label.

### 2.8 🟢 A useful primitive nobody knew about

The diagnosis-backed branch uses dedupeKey `${rule}:${admission}:${b}:${c}:state` with **no date segment** (`sopDelayedCheck.cron.js:409`) — verified. A block whose condition is `Addmission.provisional_diagnosis EXISTS` therefore fires **exactly once per admission, ever**.

That is a genuine fire-once primitive requiring zero code change, and it is the antidote to the daily nag. Caveat: admissions with no diagnosis anywhere are silently skipped.

---

## 3. Architecture

**Section-keyed submissions on the existing array, driven by the existing rule engine.** Not a parallel subsystem.

The Baseline Investigation Package was the obvious template and it does not fit:

| Baseline invariant | Why MHRB breaks it |
|---|---|
| One config per admission | A minor **is also** a supported admission — §87 and §89 ladders must run simultaneously |
| Tier enum caps the ladder at 4 | §87's "reviews every 30 days" is unbounded |
| `tierDueAt` anchors on `addmissionDate` | Five MHRB duties count from *intimation* or *submission*, not admission |

Reuse the **ladder pattern** (per-fire computed severity via `fireSopAlert`, which `baselineSweep.js:220-222` already does) if and when the recurring §87 cycles are built — not the config model.

---

## 4. Phased plan

### Phase 0 — Unblock (½ day, no behaviour change)

| # | Change | File |
|---|---|---|
| 0.1 | Delete the duplicate `age: {type: String}` declaration; comment that `Number` is required for `LESS_THAN` | `db/models/patient.model.js:176` |
| 0.2 | Normalise gender comparison, **or** allow the builder to emit multiple casings | `sopEvaluator.js:490` or `ConditionRow.js:833-840` |
| 0.3 | Remove the stray `console.log({ allowedOps })` | `ConditionRow.js` |
| 0.4 | Fix the stale `admissionSupportType` comment (says "newest upload of `addmissionfromRaw`"; the evaluator deliberately does not consult it) | `sopMetaController.js:213-218` |
| 0.5 | Correct the `BEYOND30DAYS` label to match the statute, or state the facility policy | `sopMetaController.js:227` |

**Exit:** `Patient.gender EQUALS Female` matches a patient stored as `FEMALE`, proven by a unit test.

> For 0.2 I'd normalise in the evaluator (case-insensitive compare for `EQUALS`/`NOT_EQUALS` on String fields) rather than widen the dropdown — it fixes every existing rule at once. But it changes matching semantics for **all** SOP rules, so it needs a regression pass over the live rule set. If that's too broad, do it in the dropdown and accept that only MHRB benefits.

### Phase 1 — Section-keyed submission record (1 day)

Extend the existing sub-schema rather than adding a collection:

```js
mhrbEmailFormURL: [{
  /* existing: originalName, name, url, path, type, size, uploadedAt, uploadedBy */
  section:   { type: String, enum: ["87", "87_CONT", "89", "90"] },
  sentAt:    { type: Date },   // when the email actually went out (vs uploadedAt)
  decidedAt: { type: Date },   // board decision — powers §90's 21-day window
  outcome:   { type: String }, // board outcome
}]
```

Then a derived condition field, following the `admissionSupportType` precedent (`sopEvaluator.js:277-285` + `sopMetaController` metadata): **`mhrbPendingSection`** — resolves the admission's current statutory section and returns it **only if no submission for that section exists**, else null.

One field, authorable as `mhrbPendingSection EQUALS 89`. It is self-clearing, per-section, and immune to §2.1 entirely.

**Exit:** filing a §89 report leaves `mhrbPendingSection` returning `90` once the admission moves to §90, proven on a fixture.

### Phase 2 — Author the rules (½ day, no code)

Four rules. Each is **one block, one condition** (the DELAYED path fires per *condition*, so a second condition means a second alert), with all filtering in rule-level `satisfyingCriteria`.

| Rule | satisfyingCriteria | Block condition | Severity |
|---|---|---|---|
| §87 minor — 72h | `Patient.age LESS_THAN 18` + `mhrbPendingSection EQUALS 87` | `addmissionDate OLDER_THAN_DAYS 2` | HIGH |
| §89 female — 3d | `Patient.gender EQUALS FEMALE` + `mhrbPendingSection EQUALS 89` | `addmissionDate OLDER_THAN_DAYS 2` | HIGH |
| §89 male — 7d | `Patient.gender EQUALS MALE` + `mhrbPendingSection EQUALS 89` | `addmissionDate OLDER_THAN_DAYS 6` | HIGH |
| §90 continued — 7d | `mhrbPendingSection EQUALS 90` | `addmissionDate OLDER_THAN_DAYS 6` | HIGH |

**Thresholds are one day early by design.** The sweep runs only at 02:00 and 14:00 IST, so worst-case latency is 12 hours — on a 72-hour statutory budget that is ~17% consumed by scheduling jitter. Author early; do not author the statutory number.

§94 needs no rule: no separate timeline, and reclassification is picked up automatically because `admissionSupportType` reads the newest in-force history entry.

**Exit:** each rule matches exactly one test patient per category, and zero patients who have filed.

### Phase 3 — The recurring duties (2–3 days) ⚠️ scope to confirm

Everything anchored on something other than `addmissionDate` — §87 board review within 7 days of intimation, §87 30-day review cycles, §90's 21-day decision window, and the 120/180-day continuation periods.

Phase 1's `sentAt`/`decidedAt` make the first three expressible. The continuation periods need a first-vs-subsequent distinction that does not exist at any price today: `sameType` (`admissionTypeHistory.js:44-45`) treats a re-asserted `BEYOND30DAYS` as a no-op and **writes nothing**, so renewing a §90 authorisation leaves no record at all.

Decide whether to build this or accept it as a manual process.

### Phase 4 — Operational hardening (1–2 days)

The sweep these rules depend on is not reliable enough for a statutory deadline:

- **A run reports `success` while having skipped an arbitrary subset of the ward.** Per-(admission × rule) errors are caught and counted to stdout only (`:378`, `:598`); `runCheck` has no return statement so `affectedCount` is never recorded; if `CronLog.create` itself fails the sweep runs with no row at all.
- **A missed day is permanently lost.** State dedupeKeys embed the IST calendar date, so if both of a day's runs skip a patient, that day's alert never fires and no later run replays it.
- **There is no replay.** `runCheck` is not exported, there is no admin route, and `triggerService` needs a task function the caller cannot obtain. Today a missed statutory day is recoverable only by a deploy.
- **No mid-run kill switch.** The rule set is snapshotted at run start; deactivating a runaway rule does not stop a run that can last 62 minutes.

Minimum: make `runCheck` return `{checked, fired, errored, skipped}` so `CronLog` records it, and add an admin replay route.

---

## 5. Coverage

| Requirement | After Phase 2 | After Phase 3 |
|---|---|---|
| §87 minor — 72h report | ✅ | ✅ |
| §87 — >30 days, inform MHRB | ✅ (fifth rule, same shape) | ✅ |
| §87 — board review within 7 days of intimation | ❌ | ✅ via `sentAt` |
| §87 — subsequent reviews every 30 days | ❌ | ⚠️ needs recurring ladder |
| §87 — female attendant for minor girl | ❌ | ❌ **no structured field for the nominated representative** |
| §89 female — 3 days | ✅ | ✅ |
| §89 male — 7 days | ✅ | ✅ |
| §89 — 30-day validity | ✅ (existing Day-25 rule) | ✅ |
| §90 — 7-day report | ✅ | ✅ |
| §90 — 21-day decision | ❌ | ✅ via `decidedAt` |
| §90 — 120/180 continuation periods | ❌ | ❌ **needs continuation tracking that does not exist** |
| §94 — no separate timeline | ✅ nothing to build | ✅ |

**Never covered without further work:** the §87 female-attendant duty and the §90 continuation periods. Both need new data capture, not new rules. Say so to whoever signs off on compliance.

---

## 6. Open decisions

| Question | Recommendation |
|---|---|
| Gender fix — evaluator or dropdown? | **Evaluator**, case-insensitive for String `EQUALS`/`NOT_EQUALS`. Fixes every rule at once. Needs a regression pass. |
| Which role vocabulary for routing? | ⚠️ Confirm whether staff hold `authRoles` values or dynamic-`roles` values. Routing to `"RMO"` may reach nobody. |
| Who may mark an MHRB duty waived? | Nobody today. If deadlines can be legitimately waived, that needs a reason and an actor — the ACCOUNTANT-marked-a-clinical-package incident is the precedent for gating it. |
| Build §90 continuation tracking? | Defer. High cost, and today's vocabulary actively contradicts the statute. |
| Alert delivery? | Out of scope here, but note **there is none** — a compliance alert nobody is pushed is a compliance alert nobody reads. |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| New admissions have no `admissionTypeHistory` for the first days (§2.6) | Make `mhrbPendingSection` fall back to `admissionType` when history is empty, **or** fire a separate "admission type not recorded" alert at 24h. Without one of these the rules miss the worst offenders. |
| Gender normalisation changes matching for all live rules | Regression-test the existing rule set before deploying 0.2 |
| First run after activation floods | The `mhrbPendingSection` gate scopes it naturally, but **verify the count before activating** — the sweep has no lookback window and no per-run fire cap |
| Deleting the duplicate `age` key breaks §87 | Keep the `Number` declaration; add a test asserting `schema.path('age').instance === 'Number'` |
| `rule.createdAt` floor is dead code (`expandSchedule` never reads its 4th parameter) | Irrelevant to MHRB — these rules never reach `expandSchedule` — but it means **any** new cadence rule fires its full historical backlog. Fix before the next cadence rollout. |

---

## 8. Verification

1. **Gender** — a patient stored `FEMALE` matches the §89 female rule. This is the single most likely thing to be silently wrong.
2. **The §89→§90 handover** — file a §89 report, move the admission to §90, confirm the §90 rule fires. This is §2.1, the failure that motivated the whole plan.
3. **Self-clearing** — file the report, confirm the alert stops the next sweep. Remember nothing resolves existing alerts; they simply stop being recreated.
4. **A fresh admission with no `admissionTypeHistory`** — confirm it is either covered or deliberately alerted on, not silently skipped.
5. **Awkward cases** — readmission; §94→§89 mid-admission; discharge before deadline; unrecorded gender; a minor turning 18 mid-stay; a deadline already missed at activation. ⚠️ None of these have been traced through the code yet.
6. **First-run blast radius** — count matching admissions *before* activating.
