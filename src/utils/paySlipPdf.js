import React from "react";
import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import logo from "../assets/images/jagruti-logo.png";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: { width: "96%" },

  // ── Header ──
  outerBox: { border: "1.5 solid #000", marginBottom: 6 },
  logoWrap: {
    height: 42,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
  },
  logoImage: { width: 95, height: 34, objectFit: "contain" },
  titleBar:  { backgroundColor: "#3f5f9f", paddingVertical: 6 },
  subTitle:  { paddingVertical: 8 },

  // ── Info grid ──
  infoBox: { border: "1.5 solid #000", marginBottom: 6 },
  infoRow: { flexDirection: "row", height: 20, borderBottom: "1 solid #000" },
  cellLabel: {
    width: "20%", borderRight: "1 solid #000",
    paddingHorizontal: 4, paddingVertical: 4, justifyContent: "center",
  },
  cellValue: {
    width: "30%", borderRight: "1 solid #000",
    paddingHorizontal: 4, paddingVertical: 4, justifyContent: "center",
  },
  cellLabelRight: {
    width: "20%", borderRight: "1 solid #000",
    paddingHorizontal: 4, paddingVertical: 4, justifyContent: "center",
  },
  cellValueRight: {
    width: "30%",
    paddingHorizontal: 4, paddingVertical: 4, justifyContent: "center",
  },

  // ── Earnings / Deductions ──
  sectionWrap: { flexDirection: "row", border: "1.5 solid #000" },
  half:        { width: "50%", borderRight: "1 solid #000" },
  halfLast:    { width: "50%" },

  sectionTitleCell: {
    paddingVertical: 4, borderBottom: "1 solid #000", alignItems: "center",
  },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #000", height: 20 },
  thParticulars: {
    width: "63%", borderRight: "1 solid #000",
    paddingHorizontal: 3, paddingVertical: 4, alignItems: "center",
  },
  thAmount: {
    width: "37%",
    paddingHorizontal: 3, paddingVertical: 4, alignItems: "flex-end",
  },
  row: { flexDirection: "row", height: 18, borderBottom: "1 solid #000" },
  tdParticulars: {
    width: "63%", borderRight: "1 solid #000",
    paddingHorizontal: 5, paddingVertical: 3, justifyContent: "center",
  },
  tdAmount: {
    width: "37%", paddingHorizontal: 5, paddingVertical: 3,
    justifyContent: "center", alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row", height: 22,
    borderTop: "1.5 solid #000", backgroundColor: "#f0f4ff",
  },
  totalLabelCell: {
    width: "63%", borderRight: "1 solid #000",
    paddingHorizontal: 3, paddingVertical: 4, alignItems: "center",
  },
  totalValueCell: {
    width: "37%", paddingHorizontal: 5, paddingVertical: 4, alignItems: "flex-end",
  },

  // ── Footer ──
  footerBox: {
    borderLeft: "1.5 solid #000",
    borderRight: "1.5 solid #000",
    borderBottom: "1.5 solid #000",
    paddingTop: 6,
    paddingBottom: 6,
  },
  footerRow:       { flexDirection: "row", minHeight: 18, marginBottom: 3 },
  footerLabelCell: { width: "28%", paddingLeft: 20, justifyContent: "center" },
  footerValueCell: { width: "72%", paddingRight: 8,  justifyContent: "center" },

  // ── Text ──
  tBold:     { fontWeight: 700 },
  tNormal:   { fontWeight: 400 },
  tSmall:    { fontSize: 7.5 },
  tSection:  { fontSize: 8.5, fontWeight: 700 },
  tTitle:    { fontSize: 11,  fontWeight: 700, color: "#fff", textAlign: "center" },
  tSubTitle: { fontSize: 9,   fontWeight: 700, textAlign: "center" },
  tHeader:   { fontWeight: 700, fontSize: 7.5, textAlign: "center" },
  tHeaderR:  { fontWeight: 700, fontSize: 7.5, textAlign: "right" },
  tTotal:    { fontWeight: 700, fontSize: 8 },
  tRight:    { textAlign: "right" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// String display: null/undefined/empty → "--"
const dv = (value) =>
  value !== undefined && value !== null && value !== "" ? String(value) : "--";

// Format number as Indian locale; returns null for missing values
const fmt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : null;
};

// Data rows: null/undefined/empty → "--"; 0 → "Rs. 0"; number → "Rs. X"
const dm = (value) => {
  const f = fmt(value);
  if (f === null) return "--";
  return `Rs. ${f}`;
};

// Totals / Net Pay: always show "Rs. X" including 0
const dmTotal = (value) => {
  const f = fmt(value);
  return f !== null ? `Rs. ${f}` : "Rs. 0";
};

const monthYearLabel = (row) =>
  row?.month && row?.year ? `${row.month} ${row.year}` : "--";

// Sum all finite numeric values; null entries skipped
const sumRows = (values = []) =>
  values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .reduce((a, b) => a + b, 0);

const numberToWordsIndian = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n) || n === 0) return "Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits   = (x) =>
    x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? ` ${a[x % 10]}` : ""}`;
  const threeDigits = (x) => {
    let s = "";
    if (Math.floor(x / 100)) s += `${a[Math.floor(x / 100)]} Hundred `;
    if (x % 100)              s += twoDigits(x % 100);
    return s.trim();
  };

  let n2    = Math.floor(n);
  const crore = Math.floor(n2 / 10000000); n2 %= 10000000;
  const lakh  = Math.floor(n2 / 100000);   n2 %= 100000;
  const thou  = Math.floor(n2 / 1000);     n2 %= 1000;

  const parts = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh)  parts.push(`${threeDigits(lakh)} Lakh`);
  if (thou)  parts.push(`${threeDigits(thou)} Thousand`);
  if (n2)    parts.push(threeDigits(n2));

  return `${parts.join(" ")} Only`;
};

// ─── Table Row ────────────────────────────────────────────────────────────────

const TRow = ({ label, value }) => (
  <View style={styles.row} wrap={false}>
    <View style={styles.tdParticulars}>
      <Text style={styles.tSmall}>{label}</Text>
    </View>
    <View style={styles.tdAmount}>
      <Text style={[styles.tSmall, styles.tRight]}>{dm(value)}</Text>
    </View>
  </View>
);

// ─── PayslipPdf ───────────────────────────────────────────────────────────────

const PayslipPdf = ({ row }) => {

  // ── Earnings — 11 rows, exact labels from PDF ─────────────────────────────
  // null  → field not present in DB      → shows "--"
  // 0     → field present, zero value    → shows "Rs. 0"
  const earningsRows = [
    { label: "Basic Salary Earned",         value: row?.basicAmount         ?? null },
    { label: "House Rent Allowance Earned", value: row?.HRAAmount           ?? null },
    { label: "Conveyance Allow Earned",     value: row?.conveyanceAllowance ?? null },
    { label: "SPL Allowance Earned",        value: row?.SPLAllowance        ?? null },
    { label: "Statutory Bonus Earned",      value: row?.statutoryBonus      ?? null },
    { label: "Incentive",                   value: row?.incentives          ?? null },
    { label: "Leave Encashment",            value: row?.leaveEncashment     ?? null },
    { label: "Notice Pay out",              value: row?.noticePay           ?? null },
    { label: "Gratuity",                    value: row?.gratuity            ?? null },
    { label: "Other Variable",              value: row?.otherVariable1      ?? null },
    { label: "Other Variable",              value: row?.otherVariable2      ?? null },
  ];

  // ── Deductions — 11 rows, exact labels from PDF ───────────────────────────
  const deductionRows = [
    { label: "PF Employee",    value: row?.pfEmployee     ?? null },
    { label: "Voluntary PF",   value: row?.voluntaryPF    ?? null },
    { label: "PF Arrear",      value: row?.pfArrear       ?? null },
    { label: "Member ESIC",    value: row?.esicEmployee   ?? null },
    { label: "LWF",            value: row?.LWFEmployee    ?? null },
    { label: "Salary Advance", value: row?.advanceSalary  ?? null },
    { label: "Salary Advance", value: row?.advanceSalary2 ?? null },
    { label: "--",             value: null },
    { label: "--",             value: null },
    { label: "--",             value: null },
    { label: "--",             value: null },
  ];

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalE = sumRows(earningsRows.map((r) => r.value));
  const totalD = sumRows(deductionRows.map((r) => r.value));

  // Prefer stored inHandSalary; fall back to computed
  const netPay =
    row?.inHandSalary != null && Number.isFinite(Number(row.inHandSalary))
      ? Number(row.inHandSalary)
      : totalE - totalD;

  // ── Info rows — exact order / labels from PDF ─────────────────────────────
  const infoRows = [
    ["Employee Name",              row?.employeeName,  "Date of Joining",       row?.joiningDate],
    ["Employee Code",              row?.employeeCode,  "LOP Days",              row?.lopDays      ?? "--"],
    ["Designation",                row?.designation,   "Working Days Attended", row?.workingDaysAttended ?? "--"],
    ["PAN",                        row?.pan,           "PF Number",             row?.pfNumber],
    ["Beneficiary Account Number", row?.accountNumber, "UAN No.",               row?.uanNo],
  ];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.sheet}>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={styles.outerBox}>
            <View style={styles.logoWrap}>
              <Image src={logo} style={styles.logoImage} />
            </View>
            <View style={styles.titleBar}>
              <Text style={styles.tTitle}>
                {row?.center?.title || "Jagruti Rehab Centre"}
              </Text>
            </View>
            <View style={styles.subTitle}>
              <Text style={styles.tSubTitle}>
                Payslip for the month of {monthYearLabel(row)}
              </Text>
            </View>
          </View>

          {/* ── Employee Info ───────────────────────────────────────────── */}
          <View style={styles.infoBox}>
            {infoRows.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.infoRow,
                  idx === infoRows.length - 1 ? { borderBottom: 0 } : null,
                ]}
                wrap={false}
              >
                <View style={styles.cellLabel}>
                  <Text style={styles.tBold}>{dv(item[0])}</Text>
                </View>
                <View style={styles.cellValue}>
                  <Text style={styles.tNormal}>{dv(item[1])}</Text>
                </View>
                <View style={styles.cellLabelRight}>
                  <Text style={styles.tBold}>{dv(item[2])}</Text>
                </View>
                <View style={styles.cellValueRight}>
                  <Text style={styles.tNormal}>{dv(item[3])}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Earnings & Deductions side by side ─────────────────────── */}
          <View style={styles.sectionWrap}>

            {/* Left — Earnings */}
            <View style={styles.half}>
              <View style={styles.sectionTitleCell}>
                <Text style={styles.tSection}>Earnings</Text>
              </View>
              <View style={styles.tableHeader} wrap={false}>
                <View style={styles.thParticulars}>
                  <Text style={styles.tHeader}>Particulars</Text>
                </View>
                <View style={styles.thAmount}>
                  <Text style={styles.tHeaderR}>Amount</Text>
                </View>
              </View>
              {earningsRows.map((r, i) => (
                <TRow key={i} label={r.label} value={r.value} />
              ))}
              <View style={styles.totalRow} wrap={false}>
                <View style={styles.totalLabelCell}>
                  <Text style={styles.tTotal}>Total (E)</Text>
                </View>
                <View style={styles.totalValueCell}>
                  <Text style={[styles.tTotal, styles.tRight]}>{dmTotal(totalE)}</Text>
                </View>
              </View>
            </View>

            {/* Right — Deductions */}
            <View style={styles.halfLast}>
              <View style={styles.sectionTitleCell}>
                <Text style={styles.tSection}>Deductions</Text>
              </View>
              <View style={styles.tableHeader} wrap={false}>
                <View style={styles.thParticulars}>
                  <Text style={styles.tHeader}>Particulars</Text>
                </View>
                <View style={styles.thAmount}>
                  <Text style={styles.tHeaderR}>Amount</Text>
                </View>
              </View>
              {deductionRows.map((r, i) => (
                <TRow key={i} label={r.label} value={r.value} />
              ))}
              <View style={styles.totalRow} wrap={false}>
                <View style={styles.totalLabelCell}>
                  <Text style={styles.tTotal}>Total (D)</Text>
                </View>
                <View style={styles.totalValueCell}>
                  <Text style={[styles.tTotal, styles.tRight]}>{dmTotal(totalD)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Footer — Net Pay | Amount in Words | Note ──────────────── */}
          <View style={styles.footerBox}>
            <View style={styles.footerRow} wrap={false}>
              <View style={styles.footerLabelCell}>
                <Text style={[styles.tSmall, styles.tBold]}>Net Pay (E-D)</Text>
              </View>
              <View style={styles.footerValueCell}>
                <Text style={[styles.tSmall, styles.tBold]}>{dmTotal(netPay)}</Text>
              </View>
            </View>

            <View style={styles.footerRow} wrap={false}>
              <View style={styles.footerLabelCell}>
                <Text style={[styles.tSmall, styles.tBold]}>Amount in Words</Text>
              </View>
              <View style={styles.footerValueCell}>
                <Text style={styles.tSmall}>{numberToWordsIndian(netPay)}</Text>
              </View>
            </View>

            <View style={styles.footerRow} wrap={false}>
              <View style={styles.footerLabelCell}>
                <Text style={[styles.tSmall, styles.tBold]}>Note :</Text>
              </View>
              <View style={styles.footerValueCell}>
                <Text style={styles.tSmall}>
                  This payslip is computer generated, hence no signature is required.
                </Text>
              </View>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default PayslipPdf;