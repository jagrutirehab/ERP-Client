/* eslint-disable */
/**
 * Generates SOP_INTAKE_SHEET.xlsx — the step-by-step workbook clinicians fill in
 * to request SOP alerts. Spreadsheet counterpart to SOP_INTAKE_FORM.pdf in this
 * folder: same questions, same A–G trigger letters.
 *
 * LAYOUT NOTE. An earlier version put one alert per ROW, which meant 33 columns
 * and a lot of horizontal scrolling — unreadable in practice. Each alert is now a
 * VERTICAL BLOCK: labels down column A, answers beside them, sections numbered
 * 1–5. The trigger section is seven sentence-lines (A–G) and the clinician fills
 * only the one matching the option they picked, which is what makes a 30-row
 * block quicker than a 33-column row.
 *
 * The dropdowns are not invented — they are the real enums and catalogues:
 *   Addmission.patientType   ["suicidal","runaway","serious","aggresive","normal"]
 *                            ERP-Server/db/models/addmission.model.js:293-297
 *   SOP field picklist       ERP-Server/src/controllers/sop/sopMetaController.js
 *   Lab tests + severities   ERP-Server/src/constants/labTestCatalogue.js
 *   Operators / schedules    ERP-Server/db/models/SOPRules.model.js
 *   ICD codes               {code, text} — ERP-Server/db/models/ICDCodes/icdCodes.model.js
 *
 * Regenerate whenever the engine gains a capability or an enum changes:
 *   node src/pages/SopConfigs/SOP_INTAKE_SHEET.generator.cjs
 */

const path = require("path");
const ExcelJS = require("exceljs");

/* ────────────────────────────── palette ─────────────────────────────────── */
const NAVY = "FF1F3A8A";
const NAVY_SOFT = "FFE8EDFA";
const INK = "FF111827";
const MUTED = "FF6B7280";
const HAIR = "FFD1D5DB";
const GREY = "FFF3F4F6";

// Section colours, explained by the key on the Start here sheet.
const G_ALWAYS = "FFDCFCE7"; // green  — always fill
const G_LIMIT = "FFDBEAFE"; // blue   — the threshold line
const G_TIMING = "FFFFEDD5"; // orange — the timing lines
const G_WHO = "FFF3E8FF"; // purple — routing and wording

const INPUT = "FFFFFDE7"; // pale yellow = "type here"

/* ────────────────────────────── list data ───────────────────────────────── */

// How the patient was admitted. Values match what the admission form and the
// Admission Type chart already persist:
//   ERP-Server/db/models/admissionType.model.js
//   addmission.addmissionfromRaw[].admissionType
const ADMISSION_TYPES = [
  ["Any admission type", "(no restriction)"],
  ["Independent", "INDEPENDENT_ADMISSION"],
  ["Supportive", "SUPPORTIVE_ADMISSION"],
  ["Emergency", "EMERGENCY_ADMISSION"],
];

// Addmission.patientType, in the doctor's words. Raw enum value kept alongside
// so the ERP team never has to guess which label maps to which (note the
// schema's "aggresive" spelling).
//   ERP-Server/db/models/addmission.model.js:293-297
const PATIENT_TYPES = [
  ["Any patient type", "(no restriction)"],
  ["Normal", "normal"],
  ["Aggressive", "aggresive"],
  ["Medically serious", "serious"],
  ["Runaway risk", "runaway"],
  ["Suicidal", "suicidal"],
];

const PATIENT_GROUPS = [
  "Any",
  "Addiction",
  "Psychiatry",
  "Old Age / Geriatric",
  "Dual diagnosis",
  "Other (say which in notes)",
];

// Letters match options A–G on the PDF form, so the two documents agree.
const WHEN_OPTIONS = [
  "A. Reading crosses a limit (immediate)",
  "B. Not done by a deadline",
  "C. Not done often enough",
  "D. Admission older than N days",
  "E. Due on certain admission days",
  "F. Due every N hours",
  "G. Score stayed low - suggest stopping",
];

const COMPARISONS = [
  "above",
  "at or above",
  "below",
  "at or below",
  "exactly equals",
  "between",
];

const PERIODS = ["day", "week", "month"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];
const YES_NO = ["Yes", "No"];
const SETTINGS = ["Admitted (IPD) patients only", "OPD patients only", "Both"];
const GENDERS = ["Any", "Male", "Female"];
const YES_NO_DIAG = ["No - every diagnosis", "Yes - only the codes below"];

// What the engine can actually read today, grouped for legibility. Feeds the
// "What to check" dropdown and the reference sheet.
const MEASURABLE = [
  ["Withdrawal, sedation & risk scales", "CIWA-Ar total score"],
  ["Withdrawal, sedation & risk scales", "COWS total score"],
  ["Withdrawal, sedation & risk scales", "Ramsay Sedation total score"],
  ["Withdrawal, sedation & risk scales", "Morse Fall Risk total score"],
  ["Withdrawal, sedation & risk scales", "Glasgow Coma Scale total score"],
  ["Withdrawal, sedation & risk scales", "Glasgow - eye score"],
  ["Withdrawal, sedation & risk scales", "Glasgow - verbal score"],
  ["Withdrawal, sedation & risk scales", "Glasgow - motor score"],
  ["Withdrawal, sedation & risk scales", "AUDIT total score"],

  ["Psychiatric rating scales", "C-SSRS total score"],
  ["Psychiatric rating scales", "C-SSRS ideation score"],
  ["Psychiatric rating scales", "C-SSRS behaviour score"],
  ["Psychiatric rating scales", "Y-BOCS total score"],
  ["Psychiatric rating scales", "YMRS total score"],
  ["Psychiatric rating scales", "HAM-A total score"],
  ["Psychiatric rating scales", "HAM-D total score"],
  ["Psychiatric rating scales", "PANSS total score"],
  ["Psychiatric rating scales", "PANSS severity band"],
  ["Psychiatric rating scales", "MMSE total score"],
  ["Psychiatric rating scales", "MMSE interpretation"],
  ["Psychiatric rating scales", "MPQ total score"],
  ["Psychiatric rating scales", "ACDS total score"],
  ["Psychiatric rating scales", "CGI-S total score"],

  ["Vital signs", "Blood pressure - systolic"],
  ["Vital signs", "Blood pressure - diastolic"],
  ["Vital signs", "Pulse"],
  ["Vital signs", "Temperature"],
  ["Vital signs", "Respiration rate"],
  ["Vital signs", "SpO2"],
  ["Vital signs", "Blood sugar"],
  ["Vital signs", "Weight"],

  ["Laboratory", "ANY flagged lab test"],
  ["Laboratory", "ALT / SGPT"],
  ["Laboratory", "AST / SGOT"],
  ["Laboratory", "ALP"],
  ["Laboratory", "Total bilirubin"],
  ["Laboratory", "Albumin"],
  ["Laboratory", "Ammonia"],
  ["Laboratory", "INR / PT-INR"],
  ["Laboratory", "Creatinine"],
  ["Laboratory", "BUN"],
  ["Laboratory", "eGFR"],
  ["Laboratory", "Sodium"],
  ["Laboratory", "Potassium"],
  ["Laboratory", "Magnesium"],
  ["Laboratory", "Phosphate"],
  ["Laboratory", "Calcium"],
  ["Laboratory", "Glucose (FBS / RBS)"],
  ["Laboratory", "HbA1c"],
  ["Laboratory", "Haemoglobin"],
  ["Laboratory", "WBC / TLC"],
  ["Laboratory", "Platelets"],
  ["Laboratory", "CPK / CK"],

  ["Was it recorded at all?", "Vital signs recorded"],
  ["Was it recorded at all?", "Clinical note recorded"],
  ["Was it recorded at all?", "Counselling session recorded"],
  ["Was it recorded at all?", "Prescription recorded"],
  ["Was it recorded at all?", "Mental status examination recorded"],
  ["Was it recorded at all?", "Detailed admission recorded"],
  ["Was it recorded at all?", "Lab report recorded"],
  ["Was it recorded at all?", "Admission form completed"],
  ["Was it recorded at all?", "Consent form completed"],
  ["Was it recorded at all?", "Discharge form completed"],
  ["Was it recorded at all?", "Undertaking discharge form completed"],

  ["Patient & admission", "Days since admission"],
  ["Patient & admission", "Age"],
  ["Patient & admission", "Gender"],
  ["Patient & admission", "Provisional diagnosis"],
];

// Examples only — the live picklist is the ICD collection in the ERP.
const ICD_EXAMPLES = [
  ["Addiction", "F10.20", "Alcohol dependence, uncomplicated"],
  ["Addiction", "F10.23", "Alcohol dependence with withdrawal"],
  ["Addiction", "F10.239", "Alcohol dependence with withdrawal, unspecified"],
  ["Addiction", "F11.20", "Opioid dependence, uncomplicated"],
  ["Addiction", "F11.23", "Opioid dependence with withdrawal"],
  ["Addiction", "F12.20", "Cannabis dependence, uncomplicated"],
  ["Addiction", "F13.20", "Sedative / hypnotic dependence, uncomplicated"],
  ["Addiction", "F14.20", "Cocaine dependence, uncomplicated"],
  ["Addiction", "F15.20", "Other stimulant dependence, uncomplicated"],
  ["Addiction", "F17.200", "Nicotine dependence, unspecified"],
  ["Addiction", "F19.20", "Other psychoactive substance dependence"],

  ["Psychiatry", "F20.9", "Schizophrenia, unspecified"],
  ["Psychiatry", "F22", "Delusional disorder"],
  ["Psychiatry", "F25.0", "Schizoaffective disorder, bipolar type"],
  ["Psychiatry", "F31.9", "Bipolar disorder, unspecified"],
  ["Psychiatry", "F32.9", "Major depressive disorder, single episode"],
  ["Psychiatry", "F33.9", "Major depressive disorder, recurrent"],
  ["Psychiatry", "F41.1", "Generalised anxiety disorder"],
  ["Psychiatry", "F41.9", "Anxiety disorder, unspecified"],
  ["Psychiatry", "F42.9", "Obsessive-compulsive disorder, unspecified"],
  ["Psychiatry", "F43.10", "Post-traumatic stress disorder, unspecified"],
  ["Psychiatry", "F60.3", "Borderline personality disorder"],
  ["Psychiatry", "F90.9", "ADHD, unspecified type"],

  ["Old Age / Geriatric", "F03.90", "Unspecified dementia, no behavioural disturbance"],
  ["Old Age / Geriatric", "F03.91", "Unspecified dementia with behavioural disturbance"],
  ["Old Age / Geriatric", "F01.50", "Vascular dementia, no behavioural disturbance"],
  ["Old Age / Geriatric", "G30.9", "Alzheimer's disease, unspecified"],
  ["Old Age / Geriatric", "G20", "Parkinson's disease"],
  ["Old Age / Geriatric", "F05", "Delirium due to a known physiological condition"],
  ["Old Age / Geriatric", "F06.7", "Mild cognitive impairment"],
];

/* ───────────────────────────── style helpers ────────────────────────────── */

const wb = new ExcelJS.Workbook();
wb.creator = "Jagruti Rehabilitation Centre - ERP";
wb.title = "SOP / Clinical Alert Request Sheet";
wb.created = new Date(2026, 7, 13);

const thin = { style: "thin", color: { argb: HAIR } };
const boxed = { top: thin, left: thin, bottom: thin, right: thin };
const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

/** Big navy banner across the top of a sheet. */
const banner = (ws, span, text, sub) => {
  ws.mergeCells(`A1:${span}1`);
  const c = ws.getCell("A1");
  c.value = text;
  c.font = { size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  c.fill = fill(NAVY);
  c.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 30;

  if (sub) {
    ws.mergeCells(`A2:${span}2`);
    const s = ws.getCell("A2");
    s.value = sub;
    s.font = { size: 10, italic: true, color: { argb: MUTED } };
    s.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: true };
    ws.getRow(2).height = 28;
  }
};

const section = (ws, row, span, text, tint = NAVY_SOFT, color = NAVY) => {
  ws.mergeCells(`A${row}:${span}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.font = { size: 10.5, bold: true, color: { argb: color } };
  c.fill = fill(tint);
  c.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(row).height = 21;
};

const labelled = (ws, row, label, { to = "D", hint, height = 20 } = {}) => {
  const l = ws.getCell(`A${row}`);
  l.value = label;
  l.font = { size: 10, bold: true };
  l.alignment = { vertical: "middle", wrapText: true, indent: 1 };

  if (to !== "B") ws.mergeCells(`B${row}:${to}${row}`);
  const v = ws.getCell(`B${row}`);
  v.fill = fill(INPUT);
  v.border = boxed;
  v.alignment = { vertical: "middle", indent: 1, wrapText: true };

  if (hint) {
    const colAfter = String.fromCharCode(to.charCodeAt(0) + 1);
    const h = ws.getCell(`${colAfter}${row}`);
    h.value = hint;
    h.font = { size: 9, italic: true, color: { argb: MUTED } };
    h.alignment = { vertical: "middle", wrapText: true, indent: 1 };
  }
  ws.getRow(row).height = height;
  return `B${row}`;
};

const para = (ws, row, span, text, opts = {}) => {
  ws.mergeCells(`A${row}:${span}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.font = { size: 10, bold: !!opts.bold, color: { argb: opts.color || INK } };
  c.alignment = { vertical: "top", wrapText: true, indent: 1 };
  ws.getRow(row).height = opts.height || 16;
};

const dropdown = (ws, range, values) =>
  ws.dataValidations.add(range, {
    type: "list",
    allowBlank: true,
    formulae: [`"${values.join(",")}"`],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Pick from the list",
    error: "Please choose one of the listed options, or clear the cell.",
  });

const listRange = (ws, range, ref) =>
  ws.dataValidations.add(range, {
    type: "list",
    allowBlank: true,
    formulae: [ref],
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Pick from the list",
    error: "Please choose one of the listed options, or clear the cell.",
  });

/* ══════════════════════════ Lists (hidden source) ════════════════════════ */
const lists = wb.addWorksheet("Lists");
lists.columns = [
  { width: 34 }, // A measurable
  { width: 26 }, // B group
  { width: 24 }, // C admission type
  { width: 40 }, // D when
  { width: 16 }, // E comparison
  { width: 12 }, // F period
  { width: 12 }, // G urgency
  { width: 10 }, // H yes/no
  { width: 24 }, // I patient type
];
[
  MEASURABLE.map((m) => m[1]),
  PATIENT_GROUPS,
  ADMISSION_TYPES.map((a) => a[0]),
  WHEN_OPTIONS,
  COMPARISONS,
  PERIODS,
  URGENCIES,
  YES_NO,
  PATIENT_TYPES.map((p) => p[0]),
].forEach((values, i) =>
  values.forEach((v, r) => {
    lists.getCell(r + 1, i + 1).value = v;
  }),
);
lists.state = "hidden";

const R_MEASURE = `Lists!$A$1:$A$${MEASURABLE.length}`;
const R_GROUP = `Lists!$B$1:$B$${PATIENT_GROUPS.length}`;
const R_ADMTYPE = `Lists!$C$1:$C$${ADMISSION_TYPES.length}`;
const R_WHEN = `Lists!$D$1:$D$${WHEN_OPTIONS.length}`;
const R_PATTYPE = `Lists!$I$1:$I$${PATIENT_TYPES.length}`;

/* ════════════════════════ the vertical alert block ═══════════════════════ */
/**
 * Column plan for the alerts sheet. Column A holds labels; B–K carry the
 * sentence cells for the trigger lines; L holds hints.
 */
const ALERT_WIDTHS = [40, 13, 10, 22, 10, 14, 10, 12, 10, 13, 10, 34];
const LAST = "L";

/**
 * The seven trigger options as fill-in sentences. `cells` are laid out from
 * column B rightwards: ["t", text] static word, ["in", key] free input,
 * ["dd", key, values|ref] dropdown, ["tm", text] static text merged to K.
 */
const TRIGGER_LINES = [
  {
    letter: "A",
    tint: G_LIMIT,
    label: "A.   Reading crosses a limit  —  fires immediately",
    cells: [
      ["t", "value is"],
      ["dd", "A1", COMPARISONS],
      ["t", "this limit"],
      ["in", "A2"],
      ["t", "or between"],
      ["in", "A3"],
      ["t", "and"],
      ["in", "A4"],
    ],
    hint: "e.g. CIWA-Ar  at or above  15",
  },
  {
    letter: "B",
    tint: G_TIMING,
    label: "B.   Not done by a deadline  —  one-off check",
    cells: [
      ["t", "within"],
      ["in", "B1"],
      ["t", "hours of admission"],
      ["skip"],
      ["t", "grace"],
      ["in", "B2"],
      ["t", "hours"],
    ],
    hint: "e.g. within 24 hours, grace 6",
  },
  {
    letter: "C",
    tint: G_TIMING,
    label: "C.   Not done often enough",
    cells: [
      ["t", "at least"],
      ["in", "C1"],
      ["t", "times per"],
      ["dd", "C2", PERIODS],
      ["t", "from day"],
      ["in", "C3"],
      ["t", "to day"],
      ["in", "C4"],
      ["t", "grace hrs"],
      ["in", "C5"],
    ],
    hint: "Leave “to day” blank to mean onwards.",
  },
  {
    letter: "D",
    tint: G_TIMING,
    label: "D.   Admission is older than N days  —  one-time milestone",
    cells: [
      ["t", "more than"],
      ["in", "D1"],
      ["tm", "days since admission"],
    ],
    hint: "e.g. more than 30 days",
  },
  {
    letter: "E",
    tint: G_TIMING,
    label: "E.   Due on certain admission days",
    cells: [
      ["t", "on day(s)"],
      ["in", "E1"],
      ["t", "of the admission"],
      ["skip"],
      ["t", "grace"],
      ["in", "E2"],
      ["t", "hours"],
    ],
    hint: "e.g. 1, 3, 7   —   add “onwards” in Notes if it repeats after.",
  },
  {
    letter: "F",
    tint: G_TIMING,
    label: "F.   Due every N hours, until discharge",
    cells: [
      ["t", "every"],
      ["in", "F1"],
      ["t", "hours"],
      ["skip"],
      ["t", "grace"],
      ["in", "F2"],
      ["t", "hours"],
    ],
    hint: "e.g. every 4 hours, grace 1",
  },
  {
    letter: "G",
    tint: G_TIMING,
    label: "G.   Score stayed low  —  suggest stopping monitoring",
    cells: [
      ["t", "below"],
      ["in", "G1"],
      ["t", "on"],
      ["in", "G2"],
      ["tm", "assessments in a row"],
    ],
    hint: "Fires once. Resets by itself if a score rises again.",
  },
];

/** Simple label / answer row inside an alert block. */
const blockRow = (ws, r, label, opts = {}) => {
  const { hint, list, values, tall, readOnly, value } = opts;

  const l = ws.getCell(`A${r}`);
  l.value = label;
  l.font = { size: 10, bold: true, color: { argb: INK } };
  l.alignment = { vertical: tall ? "top" : "middle", wrapText: true, indent: 2 };

  const to = tall ? "K" : "E";
  ws.mergeCells(`B${r}:${to}${r}`);
  const v = ws.getCell(`B${r}`);
  if (value !== undefined) v.value = value;
  v.fill = fill(readOnly ? GREY : INPUT);
  v.border = boxed;
  v.font = {
    size: 10,
    italic: !!readOnly,
    color: { argb: readOnly ? MUTED : INK },
  };
  v.alignment = { vertical: tall ? "top" : "middle", wrapText: true, indent: 1 };

  if (!tall) {
    ws.mergeCells(`F${r}:${LAST}${r}`);
    const h = ws.getCell(`F${r}`);
    if (hint) h.value = hint;
    h.font = { size: 9, italic: true, color: { argb: MUTED } };
    h.alignment = { vertical: "middle", wrapText: true, indent: 1 };
  }

  if (list && !readOnly) listRange(ws, `B${r}`, list);
  if (values && !readOnly) dropdown(ws, `B${r}`, values);

  ws.getRow(r).height = tall ? 34 : 19;
  return r + 1;
};

/**
 * Writes one complete alert block starting at `startRow`. Returns the next free
 * row. Pass `data` to render it filled-in (used by the Example sheet).
 */
const alertBlock = (ws, startRow, n, data = null) => {
  const ro = !!data;
  const val = (k) => (data ? data[k] : undefined);
  let r = startRow;

  // Block banner.
  ws.mergeCells(`A${r}:${LAST}${r}`);
  const b = ws.getCell(`A${r}`);
  b.value = ro
    ? `ALERT ${n}   —   ${val("label")}   (example, do not fill in)`
    : `ALERT ${n}`;
  b.font = { size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  b.fill = fill(NAVY);
  b.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(r).height = 26;
  r++;

  section(ws, r++, LAST, "1     WHAT MUST HAPPEN", G_ALWAYS, INK);
  r = blockRow(ws, r, "What to check", {
    list: R_MEASURE,
    readOnly: ro,
    value: val("check"),
    hint: "Full list on the “What we can measure” tab.",
  });
  r = blockRow(ws, r, "Patient type", {
    list: R_PATTYPE,
    readOnly: ro,
    value: val("patType"),
    hint: "Narrows this one alert to those patients. Leave as “Any” if it is for everyone on tab 3.",
  });
  r = blockRow(ws, r, "When should it fire?", {
    list: R_WHEN,
    readOnly: ro,
    value: val("when"),
    hint: "Pick ONE. Then fill only that lettered line in section 2.",
  });

  section(
    ws,
    r++,
    LAST,
    "2     NOW FILL ONLY THE ONE LINE BELOW THAT MATCHES YOUR CHOICE ABOVE",
    G_ALWAYS,
    INK,
  );

  TRIGGER_LINES.forEach((line) => {
    const chosen = ro && String(val("when") || "").startsWith(`${line.letter}.`);
    const dim = ro && !chosen;

    const l = ws.getCell(`A${r}`);
    l.value = line.label;
    l.font = {
      size: 9.5,
      bold: !dim,
      color: { argb: dim ? HAIR : INK },
    };
    l.fill = fill(dim ? "FFFAFAFA" : line.tint);
    l.border = boxed;
    l.alignment = { vertical: "middle", wrapText: true, indent: 2 };

    // Lay the sentence out from column B rightwards.
    let ci = 2; // column B
    line.cells.forEach((cell) => {
      const [kind] = cell;
      if (kind === "skip") {
        ci++;
        return;
      }
      const c = ws.getCell(r, ci);
      if (kind === "t") {
        c.value = cell[1];
        c.font = { size: 9, color: { argb: dim ? HAIR : MUTED } };
        c.alignment = { vertical: "middle", horizontal: "right" };
        ci++;
      } else if (kind === "tm") {
        const from = ws.getCell(r, ci).address;
        ws.mergeCells(`${from}:K${r}`);
        c.value = cell[1];
        c.font = { size: 9, color: { argb: dim ? HAIR : MUTED } };
        c.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        ci = 12;
      } else {
        // "in" or "dd" — an answer cell
        const key = cell[1];
        if (ro && chosen && val(key) !== undefined) c.value = val(key);
        c.fill = fill(dim ? "FFFAFAFA" : ro ? GREY : INPUT);
        c.border = boxed;
        c.font = {
          size: 10,
          italic: !!ro,
          color: { argb: dim ? HAIR : ro ? MUTED : INK },
        };
        c.alignment = { vertical: "middle", horizontal: "center" };
        if (kind === "dd" && !ro) dropdown(ws, c.address, cell[2]);
        ci++;
      }
    });

    // Hint in the last column.
    const h = ws.getCell(`${LAST}${r}`);
    h.value = line.hint;
    h.font = { size: 9, italic: true, color: { argb: dim ? HAIR : MUTED } };
    h.alignment = { vertical: "middle", wrapText: true, indent: 1 };

    ws.getRow(r).height = 20;
    r++;
  });

  section(ws, r++, LAST, "3     WHO MUST BE TOLD", G_WHO, INK);
  r = blockRow(ws, r, "Urgency", {
    values: URGENCIES,
    readOnly: ro,
    value: val("urgency"),
    hint: "Critical means act immediately. Please use it sparingly.",
  });
  r = blockRow(ws, r, "Tell which role(s)", {
    readOnly: ro,
    value: val("tell"),
    hint: "e.g. Nursing, On-call physician.",
  });
  r = blockRow(ws, r, "Also the admission doctor?", {
    values: YES_NO,
    readOnly: ro,
    value: val("tellDoc"),
  });
  r = blockRow(ws, r, "Also the admission psychologist?", {
    values: YES_NO,
    readOnly: ro,
    value: val("tellPsy"),
  });

  section(ws, r++, LAST, "4     WHAT IT SHOULD SAY", G_WHO, INK);
  r = blockRow(ws, r, "Message to show them", {
    tall: true,
    readOnly: ro,
    value: val("message"),
  });
  r = blockRow(ws, r, "What should they do about it?", {
    tall: true,
    readOnly: ro,
    value: val("action"),
  });
  r = blockRow(ws, r, "Protocol / document section", {
    readOnly: ro,
    value: val("section"),
    hint: "e.g. JRC/DA/AWP/002 §VIII.C",
  });
  r = blockRow(ws, r, "Notes / anything odd about this one", {
    tall: true,
    readOnly: ro,
    value: val("notes"),
  });

  ws.getRow(r).height = 10; // spacer between blocks
  return r + 1;
};

/* ═══════════════════════════ 1. Start here ═══════════════════════════════ */
{
  const ws = wb.addWorksheet("1. Start here", {
    properties: { tabColor: { argb: NAVY } },
    views: [{ showGridLines: false }],
  });
  ws.columns = [{ width: 4 }, { width: 30 }, { width: 62 }, { width: 40 }];

  banner(
    ws,
    "D",
    "SOP / Clinical Alert Request Sheet",
    "Tell us what alerts your protocol needs. Write in clinical language — the ERP team turns it into the system's rules. One workbook per protocol.",
  );

  let r = 4;
  section(ws, r++, "D", "Fill the tabs in order — they are numbered");

  [
    ["2. About the SOP", "Name the protocol and who wrote it.", "1 minute"],
    [
      "3. Who it applies to",
      "Which centre, which patients, which diagnoses. This is a gate: a patient who does not match ALL of it gets none of your alerts.",
      "2 minutes",
    ],
    [
      "4. The alerts",
      "The main tab. One block per alert, filled top to bottom. Most answers are dropdowns.",
      "the real work",
    ],
  ].forEach(([tab, what, time]) => {
    ws.getCell(`B${r}`).value = `Tab  ${tab}`;
    ws.getCell(`B${r}`).font = { size: 10, bold: true, color: { argb: NAVY } };
    ws.getCell(`B${r}`).alignment = { vertical: "top", indent: 1, wrapText: true };
    ws.getCell(`C${r}`).value = what;
    ws.getCell(`C${r}`).font = { size: 10 };
    ws.getCell(`C${r}`).alignment = { vertical: "top", wrapText: true };
    ws.getCell(`D${r}`).value = time;
    ws.getCell(`D${r}`).font = { size: 9, italic: true, color: { argb: MUTED } };
    ws.getCell(`D${r}`).alignment = { vertical: "top" };
    ws.getRow(r).height = 32;
    r++;
  });

  r++;
  section(ws, r++, "D", "How one alert works — and why it is one block");
  para(
    ws,
    r++,
    "D",
    "Think of your protocol as a tree. Every path from the top down to one thing-that-must-happen is one alert, so it is one block on tab 4.",
    { height: 28 },
  );
  r++;

  const tree = [
    ["Tab 3 says this once", "ADDICTION PATIENTS,  F10.20 / F10.23", ""],
    ["", "|", ""],
    ["Tab 4, one block each", "+-- CIWA-Ar every 4 hours", "= alert 1"],
    ["", "+-- CIWA-Ar 15 or above", "= alert 2"],
    ["", "+-- Counselling 2x per week", "= alert 3"],
    ["", "+-- ALT 3x upper normal limit", "= alert 4"],
    ["", "+-- Review at 10 days", "= alert 5"],
  ];
  tree.forEach(([a, b, c]) => {
    ws.getCell(`B${r}`).value = a;
    ws.getCell(`C${r}`).value = b;
    ws.getCell(`D${r}`).value = c;
    ws.getCell(`B${r}`).font = { name: "Consolas", size: 10, bold: true };
    ws.getCell(`C${r}`).font = { name: "Consolas", size: 10 };
    ws.getCell(`D${r}`).font = { size: 9, italic: true, color: { argb: NAVY } };
    ["B", "C"].forEach((col) => {
      ws.getCell(`${col}${r}`).alignment = { vertical: "middle", indent: 1 };
    });
    ws.getRow(r).height = 17;
    r++;
  });
  r++;
  para(
    ws,
    r++,
    "D",
    "You describe the patients once, on tab 3. Every alert on tab 4 then applies to those patients, so a block only has to say what to check and who to tell.",
    { height: 26 },
  );
  para(
    ws,
    r++,
    "D",
    "If your protocol treats two groups differently — Addiction one way, Old Age another — send one workbook per group rather than mixing them.",
    { height: 26, color: MUTED },
  );

  r++;
  section(ws, r++, "D", "What one block looks like");
  [
    ["1  WHAT MUST HAPPEN", "What to check, and when it should fire (pick one of A–G)."],
    ["2  THE LETTERED LINES", "Seven lines, A to G. Fill ONLY the one you picked in section 1. Ignore the other six."],
    ["3  WHO MUST BE TOLD", "Urgency, roles, and the two Yes/No toggles."],
    ["4  WHAT IT SHOULD SAY", "The message, the action, the protocol section, and any notes."],
  ].forEach(([head, what]) => {
    ws.getCell(`B${r}`).value = head;
    ws.getCell(`B${r}`).font = { size: 10, bold: true, color: { argb: NAVY } };
    ws.getCell(`B${r}`).alignment = { vertical: "top", indent: 1, wrapText: true };
    ws.getCell(`C${r}`).value = what;
    ws.getCell(`C${r}`).font = { size: 10 };
    ws.getCell(`C${r}`).alignment = { vertical: "top", wrapText: true };
    ws.getRow(r).height = 26;
    r++;
  });

  r++;
  section(ws, r++, "D", "Colour key");
  [
    [G_ALWAYS, "Green", "Always fill this section."],
    [G_LIMIT, "Blue", "The line for a reading crossing a limit."],
    [G_TIMING, "Orange", "The lines for timing — deadlines, how often, which days."],
    [G_WHO, "Purple", "Who to tell and what to say. Always fill."],
    [INPUT, "Yellow", "Every yellow cell is a cell for you to fill."],
  ].forEach(([argb, name, what]) => {
    const swatch = ws.getCell(`B${r}`);
    swatch.value = name;
    swatch.fill = fill(argb);
    swatch.border = boxed;
    swatch.font = { size: 10, bold: true };
    swatch.alignment = { vertical: "middle", horizontal: "center" };
    ws.getCell(`C${r}`).value = what;
    ws.getCell(`C${r}`).font = { size: 10 };
    ws.getCell(`C${r}`).alignment = { vertical: "middle", wrapText: true };
    ws.getRow(r).height = 20;
    r++;
  });

  r++;
  section(ws, r++, "D", "Three rules and you're done");
  [
    "Describe the patients once on tab 3, then never again.",
    "In section 2 of each block, fill only the lettered line you chose. The other six are meant to stay empty.",
    "If what you need isn't in a dropdown, type it in anyway and say so in Notes. We'll tell you whether it needs development first.",
  ].forEach((t, i) => para(ws, r++, "D", `${i + 1}.  ${t}`, { height: 26 }));

  r++;
  para(
    ws,
    r++,
    "D",
    "Tab 4 has fifteen blank blocks. Use as many as you need and leave the rest empty — nothing happens to an empty block. Need more than fifteen? Select a whole empty block including its ALERT banner, copy it, and paste below the last one; the dropdowns come with it.",
    { color: MUTED, height: 40 },
  );
  para(
    ws,
    r++,
    "D",
    "Tabs 5, 6 and 7 are reference only — a filled-in example, ICD code examples, and everything the system can measure today.",
    { color: MUTED, height: 24 },
  );
}

/* ═══════════════════════════ 2. About the SOP ════════════════════════════ */
{
  const ws = wb.addWorksheet("2. About the SOP", {
    properties: { tabColor: { argb: NAVY } },
    views: [{ showGridLines: false }],
  });
  ws.columns = [{ width: 30 }, { width: 26 }, { width: 22 }, { width: 22 }, { width: 40 }];

  banner(ws, "E", "Step 1 — About this SOP", "Fill the yellow cells.");

  let r = 4;
  labelled(ws, r++, "Protocol / SOP name", { to: "D", hint: "e.g. Alcohol Withdrawal Protocol" });
  labelled(ws, r++, "Document number", { to: "D", hint: "e.g. JRC/DA/AWP/002" });
  labelled(ws, r++, "Version", { to: "D" });
  labelled(ws, r++, "Dated", { to: "D", hint: "dd/mm/yyyy" });
  labelled(ws, r++, "What is this protocol for, in one line?", { to: "D", height: 32 });
  r++;
  section(ws, r++, "E", "Who is asking for it");
  labelled(ws, r++, "Prepared by (name)", { to: "D" });
  labelled(ws, r++, "Designation / department", { to: "D" });
  labelled(ws, r++, "Date", { to: "D" });
}

/* ═════════════════════════ 3. Who it applies to ══════════════════════════ */
{
  const ws = wb.addWorksheet("3. Who it applies to", {
    properties: { tabColor: { argb: NAVY } },
    views: [{ showGridLines: false }],
  });
  ws.columns = [{ width: 32 }, { width: 30 }, { width: 20 }, { width: 20 }, { width: 46 }];

  banner(
    ws,
    "E",
    "Step 2 — Which patients does it apply to?",
    "A gate, not a filter: unless a patient matches ALL of this, none of your alerts on tab 4 will fire for them. Leave anything blank to mean “no restriction”.",
  );

  let r = 4;
  section(ws, r++, "E", "Where");
  labelled(ws, r++, "Centre(s)", { to: "D", hint: "Name them, or write “All centres”." });

  r++;
  section(ws, r++, "E", "Which patients");
  dropdown(ws, labelled(ws, r++, "Patient setting", { to: "D", hint: "Dropdown." }), SETTINGS);
  listRange(
    ws,
    labelled(ws, r++, "Patient group", {
      to: "D",
      hint: "Dropdown. Your own grouping — the system reads it from the diagnosis codes below.",
    }),
    R_GROUP,
  );
  listRange(
    ws,
    labelled(ws, r++, "Admission type", {
      to: "D",
      hint: "Dropdown. Maps to the admission type recorded on the patient's admission.",
    }),
    R_ADMTYPE,
  );

  r++;
  section(ws, r++, "E", "Diagnosis");
  dropdown(
    ws,
    labelled(ws, r++, "Restrict to particular diagnoses?", { to: "D", hint: "Dropdown." }),
    YES_NO_DIAG,
  );
  para(
    ws,
    r++,
    "E",
    "If yes, list the codes. Tab 6 has examples for Addiction, Psychiatry and Old Age, ready to copy.",
    { color: MUTED, height: 26 },
  );

  ["ICD CODE", "DISEASE / DESCRIPTION", "", "", "NOTES"].forEach((h, i) => {
    const c = ws.getCell(r, i + 1);
    c.value = h;
    c.font = { size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = fill(NAVY);
    c.alignment = { vertical: "middle", indent: 1 };
    c.border = boxed;
  });
  ws.mergeCells(`B${r}:D${r}`);
  ws.getRow(r).height = 18;
  r++;

  [
    ["F10.23", "Alcohol dependence with withdrawal", "example — overwrite me"],
    ["F03.90", "Unspecified dementia, no behavioural disturbance", "example — overwrite me"],
  ].forEach(([code, text, note]) => {
    ws.getCell(`A${r}`).value = code;
    ws.mergeCells(`B${r}:D${r}`);
    ws.getCell(`B${r}`).value = text;
    ws.getCell(`E${r}`).value = note;
    ["A", "B", "E"].forEach((col) => {
      const c = ws.getCell(`${col}${r}`);
      c.font = { size: 10, italic: true, color: { argb: MUTED } };
      c.fill = fill(GREY);
      c.border = boxed;
      c.alignment = { vertical: "middle", indent: 1 };
    });
    ws.getRow(r).height = 18;
    r++;
  });
  for (let i = 0; i < 8; i++) {
    ws.mergeCells(`B${r}:D${r}`);
    ["A", "B", "E"].forEach((col) => {
      const c = ws.getCell(`${col}${r}`);
      c.fill = fill(INPUT);
      c.border = boxed;
      c.alignment = { vertical: "middle", indent: 1 };
    });
    ws.getRow(r).height = 18;
    r++;
  }

  r++;
  section(ws, r++, "E", "Any other limit");
  dropdown(ws, labelled(ws, r++, "Gender", { to: "D", hint: "Dropdown." }), GENDERS);
  labelled(ws, r++, "Age — from", { to: "D", hint: "Blank for no lower limit." });
  labelled(ws, r++, "Age — to", { to: "D", hint: "Blank for no upper limit." });
  labelled(ws, r++, "Anything else about which patients", { to: "D", height: 34 });

  r += 2;
  section(ws, r++, "E", "One workbook covers one kind of patient");
  para(
    ws,
    r++,
    "E",
    "Everything on this tab applies to every alert on tab 4 — there is no per-alert override.",
    { height: 18 },
  );
  para(
    ws,
    r++,
    "E",
    "So if your protocol treats two groups differently — Addiction patients get one set of checks, Old Age patients another — please send one workbook per group. It is quicker than trying to squeeze both into one, and it is how the system stores them anyway.",
    { color: MUTED, height: 40 },
  );
}

/* ════════════════════════════ 4. The alerts ══════════════════════════════ */
{
  const ws = wb.addWorksheet("4. The alerts", {
    properties: { tabColor: { argb: "FF16A34A" } },
    views: [{ showGridLines: false, state: "frozen", ySplit: 3 }],
  });
  ws.columns = ALERT_WIDTHS.map((w) => ({ width: w }));

  banner(
    ws,
    LAST,
    "Step 3 — The alerts",
    "One block per alert, top to bottom. These all apply to the patients you described on tab 3. In section 2 of each block, fill ONLY the lettered line matching what you chose in section 1 — the other six lines are meant to stay empty. Use as many or as few of the 15 blocks as you need; leave the rest empty. Tab 5 shows three worked examples.",
  );
  ws.getRow(3).height = 8;

  let r = 4;
  for (let n = 1; n <= 15; n++) r = alertBlock(ws, r, n);

  r++;
  para(
    ws,
    r,
    LAST,
    "Need more than fifteen? Select a whole empty block including its ALERT banner row, copy it, and paste below the last one — the dropdowns come with it.",
    { color: MUTED, height: 24 },
  );
}

/* ═════════════════════ 5. Example (filled in) ════════════════════════════ */
{
  const ws = wb.addWorksheet("5. Example (filled in)", {
    properties: { tabColor: { argb: MUTED } },
    views: [{ showGridLines: false }],
  });
  ws.columns = ALERT_WIDTHS.map((w) => ({ width: w }));

  banner(
    ws,
    LAST,
    "Worked example — reference only, do not fill this tab in",
    "One protocol: the Alcohol Withdrawal Protocol, for addiction patients. Tab 3 would say “Addiction, codes F10.20 and F10.23” once, and then every alert below inherits it. The recap is the whole protocol at a glance; the blocks after it show three of them filled in properly.",
  );

  // Whole protocol at a glance — one line per alert, so the shape is visible
  // without needing a wide grid.
  let r = 4;
  section(ws, r++, LAST, "THE WHOLE PROTOCOL AT A GLANCE", G_ALWAYS, INK);

  const recapHead = ["ALERT", "WHAT TO CHECK", "WHEN", "URGENCY"];
  const spans = [
    ["A", "D"],
    ["E", "G"],
    ["H", "J"],
    ["K", LAST],
  ];
  recapHead.forEach((h, i) => {
    const [from, to] = spans[i];
    ws.mergeCells(`${from}${r}:${to}${r}`);
    const c = ws.getCell(`${from}${r}`);
    c.value = h;
    c.fill = fill(NAVY);
    c.font = { size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { vertical: "middle", indent: 1 };
    c.border = boxed;
  });
  ws.getRow(r).height = 18;
  r++;

  [
    ["1   CIWA cadence", "CIWA-Ar total score", "every 4 hours, grace 1", "Medium"],
    ["2   CIWA high", "CIWA-Ar total score", "at or above 15 (immediate)", "High"],
    ["3   Counselling shortfall", "Counselling session recorded", "2 per week, day 5 to 30", "Medium"],
    ["4   Liver derangement", "ALT / SGPT", "3× upper normal limit or more", "High"],
    ["5   Detox review", "Days since admission", "more than 10 days", "Low"],
    ["6   Settled — stop scoring", "CIWA-Ar total score", "below 8 on 3 in a row", "Low"],
  ].forEach((row, i) => {
    row.forEach((v, ci) => {
      const [from, to] = spans[ci];
      ws.mergeCells(`${from}${r}:${to}${r}`);
      const c = ws.getCell(`${from}${r}`);
      c.value = v;
      c.fill = fill(GREY);
      c.border = boxed;
      c.font = { size: 9.5, italic: true, color: { argb: MUTED } };
      c.alignment = { vertical: "middle", wrapText: true, indent: 1 };
    });
    ws.getRow(r).height = 18;
    r++;
  });

  r++;
  para(
    ws,
    r++,
    LAST,
    "Three of those six, filled in properly — a threshold alert, an every-N-hours alert, and a not-often-enough alert. Notice each block fills only one lettered line in section 2. All three leave Patient type as “Any”, because they apply to every addiction patient — you would narrow it to, say, “Suicidal” only when that one alert is meant for a smaller group than tab 3 describes.",
    { color: MUTED, height: 40 },
  );
  r++;

  const examples = [
    {
      label: "CIWA cadence",
      patType: "Any patient type",
      check: "CIWA-Ar total score",
      when: "F. Due every N hours",
      F1: 4,
      F2: 1,
      urgency: "Medium",
      tell: "Nursing",
      tellDoc: "No",
      tellPsy: "No",
      message: "CIWA-Ar is due for {patient.name}.",
      action: "Score the patient and record it now.",
      section: "JRC/DA/AWP/002 §VI.A",
      notes: "The first 72 hours matter most — tell us if we can tighten the window later.",
    },
    {
      label: "CIWA high",
      patType: "Any patient type",
      check: "CIWA-Ar total score",
      when: "A. Reading crosses a limit (immediate)",
      A1: "at or above",
      A2: 15,
      urgency: "High",
      tell: "Nursing, On-call physician",
      tellDoc: "Yes",
      tellPsy: "No",
      message:
        "CIWA-Ar {field.value} for {patient.name} — severe alcohol withdrawal. Review immediately.",
      action:
        "Assess at bedside within 30 minutes; give benzodiazepine per protocol; inform the duty consultant.",
      section: "JRC/DA/AWP/002 §VIII.C",
      notes: "",
    },
    {
      label: "Counselling shortfall",
      patType: "Any patient type",
      check: "Counselling session recorded",
      when: "C. Not done often enough",
      C1: 2,
      C2: "week",
      C3: 5,
      C4: 30,
      C5: 24,
      urgency: "Medium",
      tell: "Psychology",
      tellDoc: "No",
      tellPsy: "Yes",
      message: "{patient.name} has had fewer than 2 counselling sessions this week.",
      action: "Schedule the outstanding session before the week closes.",
      section: "Counselling SOP §II",
      notes: "",
    },
  ];
  examples.forEach((d, i) => {
    r = alertBlock(ws, r, i + 1, d);
  });
}

/* ═══════════════════════ 6. ICD code examples ════════════════════════════ */
{
  const ws = wb.addWorksheet("6. ICD code examples", {
    properties: { tabColor: { argb: MUTED } },
    views: [{ state: "frozen", ySplit: 4, showGridLines: false }],
  });
  ws.columns = [{ width: 22 }, { width: 14 }, { width: 56 }, { width: 34 }];

  banner(
    ws,
    "D",
    "ICD code examples",
    "A starter list, not the whole book — copy what fits into tab 3, or type your own codes. The ERP holds the full ICD list; if a code you need isn't in it, tell us and we'll add it.",
  );

  ["PATIENT GROUP", "ICD CODE", "DISEASE / DESCRIPTION", "NOTES"].forEach((h, i) => {
    const c = ws.getCell(4, i + 1);
    c.value = h;
    c.fill = fill(NAVY);
    c.font = { size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { vertical: "middle", indent: 1 };
    c.border = boxed;
  });
  ws.getRow(4).height = 20;

  let r = 5;
  let lastGroup = null;
  ICD_EXAMPLES.forEach(([group, code, text]) => {
    const banded = group !== lastGroup;
    lastGroup = group;
    ws.getCell(`A${r}`).value = banded ? group : "";
    ws.getCell(`B${r}`).value = code;
    ws.getCell(`C${r}`).value = text;
    ["A", "B", "C", "D"].forEach((col) => {
      const c = ws.getCell(`${col}${r}`);
      c.border = boxed;
      c.font = { size: 10, bold: col === "A" && banded };
      c.alignment = { vertical: "middle", indent: 1, wrapText: true };
      if (col === "A") c.fill = fill(NAVY_SOFT);
    });
    ws.getRow(r).height = 18;
    r++;
  });

  r++;
  para(
    ws,
    r++,
    "D",
    "Codes are stored on the admission as a list, so a patient can carry more than one. A rule naming several codes fires for a patient carrying any of them.",
    { color: MUTED, height: 26 },
  );
  para(
    ws,
    r++,
    "D",
    "“Addiction”, “Psychiatry” and “Old Age” are your groupings, not fields in the system. We express them as the diagnosis codes you list — and for Old Age we can add an age threshold too, if you want one.",
    { color: MUTED, height: 30 },
  );
  ws.autoFilter = { from: "A4", to: "D4" };
}

/* ═════════════════ 7. What the system can measure ════════════════════════ */
{
  const ws = wb.addWorksheet("7. What we can measure", {
    properties: { tabColor: { argb: MUTED } },
    views: [{ state: "frozen", ySplit: 4, showGridLines: false }],
  });
  ws.columns = [{ width: 32 }, { width: 40 }, { width: 52 }];

  banner(
    ws,
    "C",
    "What the system can measure today",
    "Anything here can go straight into a rule. If what you need is missing, write it into tab 4 anyway and say so in Notes — we'll tell you whether it needs development first.",
  );

  ["GROUP", "WHAT TO CHECK", "NOTES"].forEach((h, i) => {
    const c = ws.getCell(4, i + 1);
    c.value = h;
    c.fill = fill(NAVY);
    c.font = { size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    c.alignment = { vertical: "middle", indent: 1 };
    c.border = boxed;
  });
  ws.getRow(4).height = 20;

  const NOTE_BY_GROUP = {
    Laboratory:
      "By flagged severity (Low / Medium / High / Very High) or as a multiple of the upper normal limit. “ANY flagged lab test” covers all of them at once.",
    "Was it recorded at all?":
      "Existence check — the alert fires because nothing was recorded in the expected window, not because a value was wrong. This is what lines B, C, E and F use.",
  };

  let r = 5;
  let lastGroup = null;
  MEASURABLE.forEach(([group, name]) => {
    const banded = group !== lastGroup;
    if (banded) lastGroup = group;
    ws.getCell(`A${r}`).value = banded ? group : "";
    ws.getCell(`B${r}`).value = name;
    ws.getCell(`C${r}`).value = banded ? NOTE_BY_GROUP[group] || "" : "";
    ["A", "B", "C"].forEach((col) => {
      const c = ws.getCell(`${col}${r}`);
      c.border = boxed;
      c.font = {
        size: 10,
        bold: col === "A" && banded,
        italic: col === "C",
        color: { argb: col === "C" ? MUTED : INK },
      };
      c.alignment = { vertical: "middle", indent: 1, wrapText: true };
      if (col === "A") c.fill = fill(NAVY_SOFT);
    });
    ws.getRow(r).height = banded && NOTE_BY_GROUP[group] ? 32 : 17;
    r++;
  });

  r++;
  section(ws, r++, "C", "Two limits worth knowing before you write");
  para(ws, r++, "C", "Threshold alerts (line A) fire immediately, the moment the reading is saved.", {
    height: 18,
  });
  para(
    ws,
    r++,
    "C",
    "The timing checks (lines B–G) run twice a day, around 02:00 and 14:00. An alert for a missed window appears at the next run, not the minute the deadline passes. If something must be caught faster, say so in Notes.",
    { height: 34 },
  );

  // Two separate things that are easy to confuse, so both mappings are spelled
  // out: what the clinician picks, and what is actually stored.
  const mapping = (title, pairs, note) => {
    r++;
    section(ws, r++, "C", title);
    const first = r;
    pairs.slice(1).forEach(([label, raw]) => {
      ws.getCell(`A${r}`).value = label;
      ws.getCell(`B${r}`).value = raw;
      ws.getCell(`A${r}`).font = { size: 10, bold: true };
      ws.getCell(`B${r}`).font = { name: "Consolas", size: 9, color: { argb: MUTED } };
      ["A", "B"].forEach((col) => {
        ws.getCell(`${col}${r}`).alignment = { vertical: "middle", indent: 1 };
      });
      ws.getRow(r).height = 16;
      r++;
    });
    const n = ws.getCell(`C${first}`);
    n.value = note;
    n.font = { size: 9, italic: true, color: { argb: MUTED } };
    n.alignment = { vertical: "top", wrapText: true, indent: 1 };
    ws.getRow(first).height = 32;
  };

  mapping(
    "Admission type — how the patient was admitted   (tab 3, once for the whole protocol)",
    ADMISSION_TYPES,
    "Recorded on the admission form and on the Admission Type chart. Left column is what you pick; right column is what is stored.",
  );

  mapping(
    "Patient type — what kind of care they need   (tab 4, per alert)",
    PATIENT_TYPES,
    "Recorded on the admission itself. Left column is what you pick; right column is what is stored.",
  );
}

/* ───────────────────────────────── write ────────────────────────────────── */
const OUT = path.join(__dirname, "SOP_INTAKE_SHEET.xlsx");
wb.xlsx
  .writeFile(OUT)
  .then(() => console.log(`[SOP] wrote ${OUT}`))
  .catch((err) => {
    console.error("[SOP] workbook generation failed:", err);
    process.exit(1);
  });
