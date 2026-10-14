/* eslint-disable */
/**
 * Generates SOP_INTAKE_FORM.pdf — the blank form clinicians fill in to request
 * SOP alerts, which the ERP team then configures in /sop-configs/create.
 *
 * This is the INBOUND counterpart to the outbound build sheets in this folder
 * (AWP_SOP_SETUP_GUIDE.md, JRCPL_SOP_BLOCKS.md): those translate a written
 * protocol into config; this collects the protocol in the first place.
 *
 * Kept in the repo so the form can be regenerated whenever the engine gains a
 * capability — the picklists in Appendix A are derived from the real catalogues:
 *   ERP-Server/src/controllers/sop/sopMetaController.js   (ALLOWED_FIELDS)
 *   ERP-Server/src/constants/labTestCatalogue.js          (lab tests, severities)
 *   ERP-Server/db/models/SOPRules.model.js                (operators, schedules)
 *
 * One ALERT REQUEST card must fit exactly one A4 page — clinicians photocopy
 * that page once per alert. If you add a question, take the space from somewhere
 * else and re-check the page count. The footer numbers itself, so an overflow
 * shows up as an extra page rather than as silently wrong numbering.
 *
 * Run:  node src/pages/SopConfigs/SOP_INTAKE_FORM.generator.cjs
 */

const path = require("path");
const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToFile,
} = require("@react-pdf/renderer");

const e = React.createElement;

const INK = "#111827";
const MUTED = "#6b7280";
const RULE = "#9ca3af";
const HAIR = "#d1d5db";
const SHADE = "#f3f4f6";
const ACCENT = "#1f3a8a";

const BOLD = "Helvetica-Bold";

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 34,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK,
    lineHeight: 1.25,
  },
  h1: { fontFamily: BOLD, fontSize: 16, color: ACCENT },
  sub: { fontSize: 8.5, color: MUTED, marginTop: 3 },
  part: {
    fontFamily: BOLD,
    fontSize: 10.5,
    color: "#fff",
    backgroundColor: ACCENT,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  q: { fontFamily: BOLD, fontSize: 9, marginTop: 5, marginBottom: 2 },
  h3: { fontFamily: BOLD, fontSize: 9.5, marginTop: 8, marginBottom: 3 },
  p: { fontSize: 9, marginBottom: 3 },
  small: { fontSize: 8.5, color: MUTED },
  tiny: { fontSize: 7.5, color: MUTED },
  row: { flexDirection: "row", alignItems: "flex-start" },
  endRow: { flexDirection: "row", alignItems: "flex-end" },
  card: { borderWidth: 1, borderColor: RULE, padding: 8, marginBottom: 8 },
  cardHead: {
    fontFamily: BOLD,
    fontSize: 10,
    backgroundColor: SHADE,
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginBottom: 4,
  },
  office: {
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: SHADE,
    padding: 5,
    marginTop: 5,
  },
  officeHead: { fontSize: 7.5, fontFamily: BOLD, color: MUTED, marginBottom: 2 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 7,
    color: MUTED,
    borderTopWidth: 0.5,
    borderTopColor: HAIR,
    paddingTop: 4,
    textAlign: "right",
  },
});

/** Empty tick box. Drawn as a bordered View — the built-in fonts have no glyph for one. */
const Box = (mt = 1) =>
  e(View, {
    style: {
      width: 7,
      height: 7,
      borderWidth: 0.8,
      borderColor: INK,
      marginRight: 3.5,
      marginTop: mt,
    },
  });

/** Tick box followed by its label. */
const Tick = (label, { w, fs = 8.5, mb = 2 } = {}) =>
  e(
    View,
    { style: [s.row, { marginBottom: mb, width: w }] },
    Box(),
    e(Text, { style: { fontSize: fs } }, label),
  );

/** A row of tick boxes laid out horizontally, wrapping as needed. */
const TickRow = (labels, { colW = 118, fs = 8.5, mb = 2 } = {}) =>
  e(
    View,
    { style: [s.row, { flexWrap: "wrap", marginBottom: mb }] },
    ...labels.map((l, i) =>
      e(
        View,
        { key: i, style: [s.row, { width: colW, marginBottom: 1 }] },
        Box(),
        e(Text, { style: { fontSize: fs } }, l),
      ),
    ),
  );

/** Bare dotted fill-in rule. */
const Blank = ({ w = "100%", h = 11, mb = 3, key } = {}) =>
  e(View, {
    key,
    style: {
      width: w,
      borderBottomWidth: 0.7,
      borderBottomColor: RULE,
      borderBottomStyle: "dotted",
      height: h,
      marginBottom: mb,
    },
  });

/** Inline "Label ................." pair. */
const Field = (label, { w = "100%", labelW, fs = 8.5, mb = 3 } = {}) =>
  e(
    View,
    { style: [s.endRow, { width: w, marginBottom: mb }] },
    label
      ? e(Text, { style: { fontSize: fs, width: labelW, marginRight: 4 } }, label)
      : null,
    e(View, {
      style: {
        flexGrow: 1,
        borderBottomWidth: 0.7,
        borderBottomColor: RULE,
        borderBottomStyle: "dotted",
        height: 10,
      },
    }),
  );

/** A run-on sentence with blanks in it: Sentence(["Every", 40, "hours."]) */
const Sentence = (parts, { fs = 8.5, mb = 3 } = {}) =>
  e(
    View,
    { style: [s.endRow, { marginBottom: mb, flexWrap: "wrap" }] },
    ...parts.map((part, i) =>
      typeof part === "number"
        ? e(View, {
            key: i,
            style: {
              width: part,
              borderBottomWidth: 0.7,
              borderBottomColor: RULE,
              borderBottomStyle: "dotted",
              height: 10,
              marginHorizontal: 4,
            },
          })
        : e(Text, { key: i, style: { fontSize: fs } }, part),
    ),
  );

/** N blank writing lines. */
const Lines = (n, { mb = 3, h = 11 } = {}) =>
  e(
    View,
    { style: { marginBottom: mb } },
    ...Array.from({ length: n }, (_, i) => Blank({ h, mb: 3, key: i })),
  );

/** Page numbers render themselves, so an accidental overflow can't desync them. */
const Footer = (label) =>
  e(Text, {
    style: s.footer,
    fixed: true,
    render: ({ pageNumber, totalPages }) =>
      `SOP / Clinical Alert Request Form          ${label}          Page ${pageNumber} of ${totalPages}`,
  });

/* ─────────────────────────── Trigger option block ───────────────────────── */
/**
 * One of the seven "when should this fire?" patterns. The engine shape each maps
 * to is deliberately not shown — that belongs in the ERP-team strip at the foot
 * of the card, not in the clinician's reading path.
 */
const Option = (letter, title, hint, children) =>
  e(
    View,
    { style: { marginBottom: 4 }, wrap: false },
    e(
      View,
      { style: [s.row, { marginBottom: 1 }] },
      Box(1.3),
      e(
        Text,
        { style: { fontSize: 8.5, flexShrink: 1 } },
        e(Text, { style: { fontFamily: BOLD } }, `${letter}.  ${title}`),
        hint ? e(Text, { style: { color: MUTED, fontSize: 7.5 } }, `   ${hint}`) : null,
      ),
    ),
    e(View, { style: { marginLeft: 11 } }, ...children),
  );

/** Frequency band table for option C. */
const FreqTable = () => {
  const W = ["17%", "21%", "17%", "17%", "28%"];
  const HEAD = ["HOW MANY TIMES", "PER (day/week/month)", "FROM DAY", "TO DAY", "GRACE (hours)"];
  const cell = (w, label, head, key) =>
    e(
      View,
      {
        key,
        style: {
          width: w,
          borderWidth: 0.5,
          borderColor: RULE,
          paddingVertical: 2,
          paddingHorizontal: 3,
          backgroundColor: head ? SHADE : undefined,
          minHeight: head ? 0 : 14,
        },
      },
      e(
        Text,
        { style: { fontSize: head ? 6.5 : 8.5, fontFamily: head ? BOLD : "Helvetica" } },
        label,
      ),
    );

  return e(
    View,
    { style: { marginBottom: 2 } },
    e(View, { style: s.row }, ...HEAD.map((h, i) => cell(W[i], h, true, i))),
    ...Array.from({ length: 2 }, (_, r) =>
      e(View, { style: s.row, key: r }, ...W.map((w, i) => cell(w, " ", false, i))),
    ),
  );
};

/* ───────────────────────────── The alert card ───────────────────────────── */
const AlertCard = (n) =>
  e(
    View,
    null,
    e(Text, { style: s.cardHead }, `ALERT REQUEST  ${n}`),

    Field("Short name for this alert", { labelW: 112, mb: 2 }),

    e(Text, { style: s.q }, "1.  What should the alert say to whoever receives it?"),
    e(Text, { style: [s.tiny, { marginBottom: 2 }] },
      "Write it as you would want to read it. You may use {patient.name} and {field.value} — the system fills those in."),
    Lines(2, { mb: 1 }),

    e(Text, { style: s.q }, "2.  How urgent is it?"),
    TickRow(
      ["Low — note it, no rush", "Medium — review today", "High — review now", "Critical — act immediately"],
      { colW: 127, mb: 1 },
    ),

    e(Text, { style: s.q }, "3.  Who must be told?"),
    Field("Role(s) / designation(s)", { labelW: 112, mb: 2 }),
    e(
      View,
      { style: [s.row, { flexWrap: "wrap", marginBottom: 1 }] },
      e(
        View,
        { style: [s.row, { width: 172 }] },
        Box(),
        e(Text, { style: { fontSize: 8.5 } }, "The patient's admission doctor"),
      ),
      e(
        View,
        { style: s.row },
        Box(),
        e(Text, { style: { fontSize: 8.5 } }, "The patient's admission psychologist"),
      ),
    ),
    Field("Specific people by name (if any)", { labelW: 142, mb: 2 }),

    e(Text, { style: s.q }, "4.  What should they do about it?"),
    Lines(2, { mb: 1 }),

    Field("5.  Protocol / document section this comes from", { labelW: 205, mb: 4 }),

    e(Text, { style: s.q },
      "6.  WHEN should it fire?   Tick ONE option (A–G) below and fill in only that one."),

    Option("A", "A reading or score crosses a limit", "fires the moment it is saved", [
      Field("Which assessment or reading (Appendix A)", { labelW: 196, mb: 2 }),
      e(Text, { style: [s.small, { marginBottom: 1 }] }, "Fires when the value is:"),
      TickRow(["above", "at or above", "below", "at or below", "exactly equal to"], { colW: 92, mb: 1 }),
      Sentence(["this value", 78, "or   between", 52, "and", 52], { mb: 2 }),
    ]),

    Option("B", "Something was not done by a deadline", "one-off check", [
      Field("What must be recorded", { labelW: 112, mb: 2 }),
      Sentence(["Within", 40, "hours of admission.     Allow", 36, "hours grace."], { mb: 2 }),
    ]),

    Option("C", "Not being done often enough", "one line per stage; leave TO DAY blank for “onwards”", [
      Field("What must be recorded", { labelW: 112, mb: 2 }),
      FreqTable(),
    ]),

    Option("D", "The patient has now been admitted a certain number of days", "one-time milestone", [
      Sentence(["Alert once the admission is older than", 42, "days."], { mb: 2 }),
    ]),

    Option("E", "Due on particular days of the admission", "e.g. day 1, 3 and 7", [
      Field("Due on admission day(s)", { labelW: 118, mb: 2 }),
      Tick("…and then every day after the last day listed, until discharge", { mb: 2 }),
    ]),

    Option("F", "Due every so many hours, continuously", "admission until discharge", [
      Sentence(["Every", 40, "hours.     Allow", 36, "hours grace."], { mb: 2 }),
    ]),

    Option("G", "The score has stayed low — suggest stopping monitoring", "fires once; resets if a score rises", [
      Field("Which assessment", { labelW: 90, mb: 2 }),
      Sentence(["Score stays below", 44, "on", 32, "assessments in a row."], { mb: 2 }),
    ]),

    e(Text, { style: s.q }, "7.  If this is a LAB result, complete this box instead of the value in A"),
    e(
      View,
      { style: { borderWidth: 1, borderColor: HAIR, padding: 5, marginBottom: 1 } },
      Field("Which test (Appendix A) — or write ANY for any flagged test", { labelW: 262, mb: 2 }),
      e(
        View,
        { style: [s.endRow, { marginBottom: 1 }] },
        Box(2.5),
        e(Text, { style: { fontSize: 8.5 } }, "flagged severity is"),
        Blank({ w: 56, h: 10, mb: 0 }),
        e(Text, { style: { fontSize: 8.5, marginLeft: 4 } },
          "or worse   (Low / Medium / High / Very High)"),
      ),
      e(
        View,
        { style: s.endRow },
        Box(2.5),
        e(Text, { style: { fontSize: 8.5 } }, "the value reaches"),
        Blank({ w: 36, h: 10, mb: 0 }),
        e(Text, { style: { fontSize: 8.5, marginLeft: 4 } },
          "times the upper normal limit, or more"),
      ),
    ),

    e(Text, { style: s.q }, "8.  Should the reminder stop once the patient is stable?"),
    e(
      View,
      { style: s.endRow },
      Box(2.5),
      e(Text, { style: { fontSize: 8.5 } }, "Yes — stop after"),
      Blank({ w: 32, h: 10, mb: 0 }),
      e(Text, { style: { fontSize: 8.5, marginHorizontal: 4 } }, "assessments all below"),
      Blank({ w: 38, h: 10, mb: 0 }),
      e(Text, { style: [s.tiny, { marginLeft: 6 }] }, "(leave blank to keep reminding)"),
    ),

    /* Not for the clinician — filled in by whoever builds the rule, so the
       returned form doubles as the record of what was configured. */
    e(
      View,
      { style: s.office },
      e(Text, { style: s.officeHead }, "FOR ERP TEAM USE — LEAVE BLANK"),
      e(
        View,
        { style: s.row },
        e(
          View,
          { style: { width: "50%", paddingRight: 8 } },
          Field("Model / field", { labelW: 60, fs: 8, mb: 2 }),
          Field("Operator / value", { labelW: 60, fs: 8, mb: 0 }),
        ),
        e(
          View,
          { style: { width: "50%" } },
          Field("Trigger / schedule", { labelW: 72, fs: 8, mb: 2 }),
          Field("Rule + block name", { labelW: 72, fs: 8, mb: 0 }),
        ),
      ),
    ),
  );

/** Medicine suggestion table for Part 4. */
const MedTable = () => {
  const W = ["22%", "12%", "16%", "12%", "13%", "13%", "12%"];
  const HEAD = ["MEDICINE", "STRENGTH", "DOSE (M–E–N)", "DAYS ACTIVE", "BEFORE / AFTER FOOD", "PRIORITY", "WHY (SECTION)"];
  const cell = (w, label, head, key) =>
    e(
      View,
      {
        key,
        style: {
          width: w,
          borderWidth: 0.5,
          borderColor: RULE,
          paddingVertical: 3,
          paddingHorizontal: 3,
          backgroundColor: head ? SHADE : undefined,
          minHeight: head ? 0 : 17,
        },
      },
      e(
        Text,
        { style: { fontSize: head ? 6.5 : 9, fontFamily: head ? BOLD : "Helvetica" } },
        label,
      ),
    );

  return e(
    View,
    { style: { marginBottom: 4 } },
    e(View, { style: s.row }, ...HEAD.map((h, i) => cell(W[i], h, true, i))),
    ...Array.from({ length: 6 }, (_, r) =>
      e(View, { style: s.row, key: r }, ...W.map((w, i) => cell(w, " ", false, i))),
    ),
  );
};

/** A filled-in card, for reference. */
const ExampleCard = () => {
  const L = (label, value, key) =>
    e(
      View,
      { key, style: [s.row, { marginBottom: 2 }] },
      e(Text, { style: { fontSize: 8.5, width: 148, color: MUTED } }, label),
      e(Text, { style: { fontSize: 8.5, flexGrow: 1, flexBasis: 0, flexShrink: 1 } }, value),
    );

  return e(
    View,
    { style: s.card },
    e(Text, { style: s.cardHead }, "ALERT REQUEST  1   (example)"),
    L("Short name", "CIWA-Ar high — urgent review", 1),
    L("1. Message", "CIWA-Ar {field.value} for {patient.name} — severe alcohol withdrawal. Review immediately.", 2),
    L("2. Urgency", "High", 3),
    L("3. Who must be told", "Nursing, On-call physician  +  the patient's admission doctor", 4),
    L("4. What they should do", "Assess at bedside within 30 minutes; give benzodiazepine per protocol; inform the duty consultant.", 5),
    L("5. Protocol section", "JRC/DA/AWP/002 §VIII.C", 6),
    L("6. When should it fire", "Option A ticked — a reading crosses a limit", 7),
    L("       Which assessment", "CIWA-Ar", 8),
    L("       Fires when value is", "“at or above” ticked, this value: 15", 9),
    L("7. Lab box", "not applicable", 10),
    L("8. Stop when stable", "left blank", 11),
    e(
      View,
      { style: s.office },
      e(Text, { style: s.officeHead }, "FOR ERP TEAM USE — filled in after configuring"),
      L("Model / field", "ciwaTest  ·  systemTotalScore", 12),
      L("Operator / value", "GREATER_THAN_OR_EQUAL  ·  15", 13),
      L("Trigger / schedule", "IMMEDIATE  ·  —", 14),
    ),
  );
};

const RefBlock = (title, items, key) =>
  e(
    View,
    { key, style: { marginBottom: 6 }, wrap: false },
    e(Text, { style: { fontSize: 9, fontFamily: BOLD, marginBottom: 2 } }, title),
    e(Text, { style: { fontSize: 8.5, color: "#374151" } }, items),
  );

/* ──────────────────────────────── Document ──────────────────────────────── */
const Doc = () =>
  e(
    Document,
    {
      title: "SOP / Clinical Alert Request Form",
      author: "Jagruti Rehabilitation Centre — ERP",
      subject: "Blank intake form for clinician-authored SOP alerts",
      keywords: "SOP, clinical alerts, protocol, intake form",
    },

    /* ── Page 1 — how to fill it in, the protocol, and who it applies to ── */
    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: s.h1 }, "SOP / Clinical Alert Request Form"),
      e(Text, { style: s.sub },
        "Use this form to tell the ERP team what alerts your protocol needs. Write in clinical language — the team converts it into the system's rules. One form per protocol."),

      e(Text, { style: s.part }, "HOW TO FILL THIS IN"),
      e(Text, { style: s.p }, "1.  Complete Part 1 and Part 2 once, for the whole protocol."),
      e(Text, { style: s.p }, "2.  Complete one ALERT REQUEST card for each separate alert you want. Photocopy that page as many times as you need."),
      e(Text, { style: s.p }, "3.  In each card, question 6 asks WHEN the alert should fire. Tick only ONE of options A–G, and fill in just that option."),
      e(Text, { style: s.p }, "4.  Appendix A lists what the system already measures. If what you need isn't there, write it in anyway — we'll tell you whether it needs development first."),
      e(Text, { style: [s.p, { fontFamily: BOLD }] }, "5.  Leave every shaded “FOR ERP TEAM USE” box blank."),

      e(Text, { style: s.part }, "PART 1 — ABOUT THIS SOP"),
      Field("Protocol / SOP name", { labelW: 112, fs: 9 }),
      e(
        View,
        { style: s.row },
        e(View, { style: { width: "50%", paddingRight: 10 } }, Field("Document number", { labelW: 92, fs: 9 })),
        e(View, { style: { width: "25%", paddingRight: 10 } }, Field("Version", { labelW: 42, fs: 9 })),
        e(View, { style: { width: "25%" } }, Field("Dated", { labelW: 36, fs: 9 })),
      ),
      Field("What is this protocol for, in one line?", { labelW: 182, fs: 9 }),
      e(
        View,
        { style: s.row },
        e(View, { style: { width: "50%", paddingRight: 10 } }, Field("Prepared by (name)", { labelW: 100, fs: 9 })),
        e(View, { style: { width: "50%" } }, Field("Designation / department", { labelW: 126, fs: 9 })),
      ),

      e(Text, { style: s.part }, "PART 2 — WHICH PATIENTS DOES IT APPLY TO?"),
      e(Text, { style: [s.tiny, { marginBottom: 5 }] },
        "These answers act as a gate. Unless a patient matches ALL of them, none of the alerts in this form will fire for that patient."),

      e(Text, { style: s.h3 }, "a.  Which centre(s)?"),
      Field("", { fs: 9, mb: 2 }),
      Tick("All centres", { fs: 9, mb: 3 }),

      e(Text, { style: s.h3 }, "b.  Which patients?"),
      TickRow(["Admitted (IPD) patients only", "OPD patients only", "All patients"], { colW: 164, fs: 9, mb: 3 }),

      e(Text, { style: s.h3 }, "c.  Only for particular diagnoses?"),
      Tick("No — applies to every diagnosis", { fs: 9, mb: 2 }),
      e(
        View,
        { style: [s.row, { marginBottom: 2 }] },
        Box(),
        e(Text, { style: { fontSize: 9 } },
          "Yes — only these diagnoses (name them, with the ICD code if you know it):"),
      ),
      Lines(2, { mb: 3 }),

      e(Text, { style: s.h3 }, "d.  Any other limit on which patients this applies to?"),
      e(Text, { style: [s.tiny, { marginBottom: 2 }] },
        "e.g. age above or below a number, one gender only, a particular admission type or priority."),
      Lines(2, { mb: 0 }),

      Footer("Parts 1–2"),
    ),

    /* ── Pages 2–3 — two blank alert cards, one page each ── */
    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: [s.part, { marginTop: 0 }] },
        "PART 3 — ALERT REQUESTS   (photocopy this page for each additional alert)"),
      AlertCard("1"),
      Footer("Alert request"),
    ),
    e(
      Page,
      { size: "A4", style: s.page },
      AlertCard("2"),
      Footer("Alert request"),
    ),

    /* ── Page 4 — medicines, free text, sign-off ── */
    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: [s.part, { marginTop: 0 }] }, "PART 4 — MEDICINES TO SUGGEST   (optional)"),
      e(Text, { style: [s.tiny, { marginBottom: 5 }] },
        "Medicines listed here appear as suggestions on the prescription screen for any patient this protocol applies to. They are suggestions only — nothing is ever prescribed automatically."),
      MedTable(),

      e(Text, { style: s.part }, "PART 5 — ANYTHING ELSE WE SHOULD KNOW"),
      e(Text, { style: [s.tiny, { marginBottom: 3 }] },
        "Escalation steps, exceptions, anything that didn't fit the cards above, or alerts you're unsure the system can do."),
      Lines(8, { h: 13 }),

      e(Text, { style: s.part }, "PART 6 — SIGN-OFF"),
      e(
        View,
        { style: s.row },
        e(
          View,
          { style: { width: "50%", paddingRight: 12 } },
          Field("Clinician", { labelW: 64, fs: 9 }),
          Field("Signature", { labelW: 64, fs: 9 }),
          Field("Date", { labelW: 64, fs: 9, mb: 0 }),
        ),
        e(
          View,
          { style: { width: "50%" } },
          Field("Approved by", { labelW: 80, fs: 9 }),
          Field("Signature", { labelW: 80, fs: 9 }),
          Field("Date", { labelW: 80, fs: 9, mb: 0 }),
        ),
      ),
      e(
        View,
        { style: [s.office, { marginTop: 12 }] },
        e(Text, { style: s.officeHead }, "FOR ERP TEAM USE — LEAVE BLANK"),
        e(
          View,
          { style: s.row },
          e(
            View,
            { style: { width: "50%", paddingRight: 8 } },
            Field("Received on", { labelW: 64, fs: 8, mb: 2 }),
            Field("Configured by", { labelW: 64, fs: 8, mb: 0 }),
          ),
          e(
            View,
            { style: { width: "50%" } },
            Field("SOP rule name", { labelW: 78, fs: 8, mb: 2 }),
            Field("Blocks created", { labelW: 78, fs: 8, mb: 0 }),
          ),
        ),
      ),
      Footer("Parts 4–6"),
    ),

    /* ── Page 5 — worked example ── */
    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: [s.part, { marginTop: 0 }] }, "WORKED EXAMPLE — how a filled-in card looks"),
      e(Text, { style: [s.tiny, { marginBottom: 6 }] }, "For reference only. Do not fill this page in."),
      ExampleCard(),

      e(Text, { style: s.h3 }, "A second example — an alert for something that was not done"),
      e(Text, { style: s.p },
        "“Option C ticked. What must be recorded: Counselling session. 2 times per week, from day 5 to day 30, grace 24 hours.” That produces one alert whenever a patient at that stage of admission has had fewer than two counselling sessions in the week."),

      e(Text, { style: s.h3 }, "A third — a length-of-stay milestone"),
      e(Text, { style: s.p },
        "“Option D ticked. Alert once the admission is older than 30 days.” Used for review meetings, insurance checkpoints, and anything else that is due because of how long the patient has been with us rather than because of a reading."),

      e(Text, { style: s.h3 }, "Common mistakes worth avoiding"),
      e(Text, { style: s.p },
        "•  Ticking more than one of A–G on the same card. If an alert genuinely has two conditions that must BOTH hold, say so in Part 5 — we can build that, but it needs describing in words."),
      e(Text, { style: s.p },
        "•  Writing “urgent” in the message but choosing Low urgency. The urgency you tick is what decides how the alert is presented and who chases it."),
      e(Text, { style: s.p },
        "•  Leaving question 3 blank. An alert with nobody to receive it is never seen."),
      e(Text, { style: s.p },
        "•  Naming a reading we don't record yet. Check Appendix A first; if it isn't there, it needs development before the alert can exist."),

      Footer("Example"),
    ),

    /* ── Pages 6–7 — appendices ── */
    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: [s.part, { marginTop: 0 }] }, "APPENDIX A — WHAT THE SYSTEM ALREADY MEASURES"),
      e(Text, { style: [s.p, { marginBottom: 6 }] },
        "Anything listed here can be used in a rule today. If what you need is missing, write it into the card anyway — we will tell you whether it needs development first."),

      RefBlock("Vital signs  (Vital Sign chart)",
        "Blood pressure — systolic  ·  Blood pressure — diastolic  ·  Pulse  ·  Temperature  ·  Respiration rate  ·  SpO2  ·  Blood sugar  ·  Weight  ·  CNS  ·  CVS  ·  RS  ·  PA", 1),

      RefBlock("Withdrawal, sedation and risk scales  (total score unless noted)",
        "CIWA-Ar  ·  COWS  ·  Ramsay Sedation  ·  Morse Fall Risk  ·  Glasgow Coma Scale (total, and eye / verbal / motor separately)  ·  AUDIT", 2),

      RefBlock("Psychiatric rating scales  (total score unless noted)",
        "Y-BOCS  ·  C-SSRS (total, and ideation / behaviour subscales separately)  ·  YMRS  ·  HAM-A  ·  HAM-D  ·  PANSS (total, and severity band)  ·  MMSE (total, and interpretation)  ·  MPQ  ·  ACDS  ·  CGI-S  ·  Rorschach  ·  generic clinical test", 3),

      RefBlock("Laboratory results  (by flagged severity, or as a multiple of the upper normal limit)",
        "ALT / SGPT  ·  AST / SGOT  ·  ALP  ·  Total bilirubin  ·  Albumin  ·  Ammonia  ·  INR / PT-INR  ·  Creatinine  ·  BUN  ·  eGFR  ·  Sodium  ·  Potassium  ·  Magnesium  ·  Phosphate  ·  Calcium  ·  Glucose (FBS / RBS)  ·  HbA1c  ·  Haemoglobin  ·  WBC / TLC  ·  Platelets  ·  CPK / CK", 4),

      RefBlock("Patient and admission details",
        "Age  ·  Gender  ·  Currently admitted  ·  Discharged  ·  Admission date (this is what “admitted N days” rules use)  ·  Provisional diagnosis  ·  Patient type (IPD / OPD)  ·  Priority  ·  Whether the admission, consent, discharge or undertaking form has been completed", 5),

      RefBlock("Clinical records — usable for their content, and for “was this recorded at all?”",
        "Prescription (doctor's notes, diagnosis)  ·  Clinical Note (complaints, observations, diagnosis, notes)  ·  Mental Status Examination (chief complaints, mood, thought content and process, perception, memory, insight, judgment, remarks, observation)  ·  Counselling Note (conclusion, objective, short- and long-term goals, homework, next session date)  ·  Detailed Admission (physical examination — CNS, CVS, pulse, BP, RS, PA; provisional diagnosis; age; blood group)", 6),

      e(Text, { style: s.h3 }, "On “was this recorded at all?”"),
      e(Text, { style: s.p },
        "Every record type above can also be checked simply for existence. That is what options B, C, E and F rely on — the alert fires because nothing was recorded in the expected window, not because a value was wrong."),

      e(Text, { style: s.h3 }, "Two limits worth knowing before you write"),
      e(Text, { style: s.p },
        "•  Threshold alerts (option A) fire immediately, the moment the reading is saved."),
      e(Text, { style: s.p },
        "•  The scheduled checks (options B–F) run twice a day, at about 02:00 and 14:00. An alert for a missed window therefore appears at the next run, not the minute the deadline passes. If something needs to be caught faster than that, say so in Part 5."),

      Footer("Appendix A"),
    ),

    e(
      Page,
      { size: "A4", style: s.page },
      e(Text, { style: [s.part, { marginTop: 0 }] },
        "APPENDIX B — WHAT THE ALERT LOOKS LIKE WHEN IT ARRIVES"),
      e(Text, { style: s.p },
        "Alerts appear in the Alerts screen for everyone you named in question 3. Each one shows:"),
      e(Text, { style: s.p }, "•  the urgency you chose, as a coloured band"),
      e(Text, { style: s.p }, "•  the message you wrote in question 1, with the patient's name and the actual reading filled in"),
      e(Text, { style: s.p }, "•  the action you wrote in question 4"),
      e(Text, { style: s.p }, "•  the protocol section from question 5"),
      e(Text, { style: s.p }, "•  which patient it concerns, and the reading that triggered it"),
      e(Text, { style: [s.p, { marginTop: 4 }] },
        "Recipients can add notes to an alert as they work on it, and mark it resolved once the action has been taken. Both are recorded against the person's name and the time. Alerts can also be exported for audit."),
      e(Text, { style: [s.p, { marginTop: 4 }] },
        "The same alert is not repeated for the same patient and the same window, so a missed record produces one alert rather than one per check."),

      e(Text, { style: s.h3 }, "Choosing an urgency"),
      e(Text, { style: s.p }, "Low — worth knowing; no action needed today."),
      e(Text, { style: s.p }, "Medium — should be reviewed during the shift."),
      e(Text, { style: s.p }, "High — needs attention now."),
      e(Text, { style: s.p }, "Critical — patient safety issue; act immediately."),
      e(Text, { style: [s.tiny, { marginTop: 3 }] },
        "Please use Critical sparingly. If everything is critical, nothing is."),

      e(Text, { style: s.h3 }, "If you're not sure"),
      e(Text, { style: s.p },
        "If anything on this form is unclear, or you are unsure whether the system can do what you need, send the form back with a note in Part 5 rather than leaving it blank. It is easier for us to answer a question than to guess at an intention."),

      e(
        View,
        { style: [s.office, { marginTop: 14 }] },
        e(Text, { style: s.officeHead }, "FOR ERP TEAM USE — WHERE THIS GETS BUILT"),
        e(Text, { style: [s.tiny, { color: "#374151" }] },
          "Part 2 becomes the rule's Satisfying Criteria, plus its centres.      Each ALERT REQUEST card becomes one Target Block on that rule.      Part 4 becomes the Suggested Medicines.      Option A and question 7 are immediate-phase conditions; options B–G drive the delayed-phase schedule."),
      ),

      Footer("Appendix B"),
    ),
  );

const OUT = path.join(__dirname, "SOP_INTAKE_FORM.pdf");

renderToFile(e(Doc), OUT)
  .then(() => console.log(`[SOP] wrote ${OUT}`))
  .catch((err) => {
    console.error("[SOP] PDF generation failed:", err);
    process.exit(1);
  });
