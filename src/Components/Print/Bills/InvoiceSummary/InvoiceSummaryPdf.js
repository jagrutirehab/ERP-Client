import React from "react";
import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  Image,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";

import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import addComma from "../../../../utils/addComma";
import { getValidLogoSrc } from "../../constants/jagrutiLogo";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

// 5 columns, total = 100%
// S.No:8% | Category:44% | TotalAmt:16% | Discount:16% | NetAmount:16%
const COLS = {
  sNo: "8%",
  category: "44%",
  totalAmt: "16%",
  discount: "16%",
  netAmount: "16%",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    flexDirection: "column",
  },
  logoSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrapper: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    width: 120,
    height: 44,
    objectFit: "contain",
  },
  clinicBlock: {
    width: "55%",
    textAlign: "right",
  },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  title: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1pt solid black",
    paddingBottom: 8,
    marginBottom: 10,
    fontSize: 9,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 10,
    fontFamily: "Roboto",
    fontWeight: "heavy",
    color: "#2a5c8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  table: {
    width: "100%",
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderTop: "1pt solid black",
    borderBottom: "1pt solid black",
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 8,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
    paddingTop: 3.5,
    paddingBottom: 3.5,
    fontSize: 8,
  },
  totalsRow: {
    flexDirection: "row",
    borderTop: "1pt solid black",
    borderBottom: "1pt solid black",
    backgroundColor: "#f2f2f2",
    paddingTop: 4.5,
    paddingBottom: 4.5,
    fontSize: 8,
  },
  sNo: { width: COLS.sNo, textAlign: "center" },
  category: {
    width: COLS.category,
    textAlign: "left",
    paddingLeft: 6,
    textTransform: "capitalize",
  },
  totalAmt: { width: COLS.totalAmt, textAlign: "right", paddingRight: 6 },
  discount: { width: COLS.discount, textAlign: "right", paddingRight: 6 },
  netAmount: { width: COLS.netAmount, textAlign: "right", paddingRight: 6 },
  totalLabel: {
    // Spans S.No and Category (8% + 44% = 52%)
    width: "52%",
    paddingLeft: 6,
    textAlign: "left",
  },
  emptyRow: {
    padding: 10,
    textAlign: "center",
    borderBottom: "1pt solid #ccc",
  },
  emptyText: {
    fontSize: 8,
    color: "#777",
    fontStyle: "italic",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
  },
  footerNote: {
    fontSize: 8,
    color: "#666",
  },
});

const formatDateSafe = (dateStr, formatStr = "d MMM y") => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "--" : format(d, formatStr);
};

const formatAmount = (value, fallback = "--") => {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  if (isNaN(num)) return fallback;
  const formatted = addComma(Math.abs(num).toFixed(2));
  return num < 0 ? `-${formatted}` : formatted;
};

const formatCategoryName = (catStr) => {
  if (!catStr) return "Other";
  return catStr
    .toString()
    .trim()
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

const aggregateCategories = (rows) => {
  const categoryMap = new Map();

  (rows || []).forEach((row) => {
    // Strictly include only INVOICE records
    if (
      row.type === "INVOICE" &&
      Array.isArray(row.procedures) &&
      row.procedures.length > 0
    ) {
      row.procedures.forEach((proc) => {
        const rawCat = (proc.category || proc.categoryName || "Other").trim();
        const normalizedKey = rawCat.toLowerCase();
        const displayName = formatCategoryName(rawCat);

        const units =
          Number(
            proc.units != null
              ? proc.units
              : proc.unit != null
              ? proc.unit
              : 1
          ) || 1;
        const rate = Number(proc.rate ?? proc.cost ?? 0) || 0;
        const gross =
          proc.grossAmount != null
            ? Number(proc.grossAmount)
            : proc.gross != null
            ? Number(proc.gross)
            : units * rate;
        const discount = Number(proc.discount) || 0;
        const net =
          proc.netAmount != null
            ? Number(proc.netAmount)
            : proc.afterDiscount != null
            ? Number(proc.afterDiscount)
            : gross - discount;

        if (!categoryMap.has(normalizedKey)) {
          categoryMap.set(normalizedKey, {
            name: displayName,
            totalAmt: 0,
            discount: 0,
            netAmount: 0,
          });
        }

        const entry = categoryMap.get(normalizedKey);
        entry.totalAmt += gross;
        entry.discount += discount;
        entry.netAmount += net;
      });
    }
  });

  return Array.from(categoryMap.values()).sort(
    (a, b) => b.netAmount - a.netAmount
  );
};

const InvoiceSummaryPdf = ({ patient, admission, center, rows }) => {
  const activeCenter =
    admission?.center &&
    typeof admission.center === "object" &&
    admission.center.name
      ? admission.center
      : center && typeof center === "object" && center.name
      ? center
      : patient?.center &&
        typeof patient.center === "object" &&
        patient.center.name
      ? patient.center
      : center || patient?.center || null;

  const admissionDate =
    admission?.addmissionDate ||
    admission?.dateOfAddmission ||
    patient?.addmission?.addmissionDate ||
    patient?.dateOfAddmission;

  const logoSrc = getValidLogoSrc(activeCenter);
  const centerName = activeCenter?.name || "JAGRUTI REHABILITATION CENTRE";
  const centerAddress =
    activeCenter?.address || "center address goes here.";

  const categoryList = aggregateCategories(rows);

  const grandGross = categoryList.reduce((sum, c) => sum + c.totalAmt, 0);
  const grandDiscount = categoryList.reduce((sum, c) => sum + c.discount, 0);
  const grandNet = categoryList.reduce((sum, c) => sum + c.netAmount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER SECTION (Identical to Invoice History) ── */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image src={logoSrc} style={styles.logo} />
          </View>
          <View style={styles.clinicBlock}>
            <Text style={styles.heading}>{centerName}</Text>
            <Text style={{ whiteSpace: "pre-line" }}>{centerAddress}</Text>
          </View>
        </View>

        {/* ── DOCUMENT TITLE ── */}
        <Text style={styles.title}>CATEGORIZED BREAKDOWN STATEMENT</Text>

        {/* ── PATIENT METADATA BAR ── */}
        <View style={styles.patientRow}>
          <Text>
            <Text style={styles.heading}>Patient Name: </Text>
            {patient?.name || "--"}
          </Text>
          <Text>
            <Text style={styles.heading}>UHID: </Text>
            {patient?.id
              ? `${patient.id.prefix || ""}${patient.id.value ?? ""}`
              : "--"}
          </Text>
          <Text>
            <Text style={styles.heading}>Admitted: </Text>
            {formatDateSafe(admissionDate)}
          </Text>
        </View>

        {/* ── SECTION HEADER ── */}
        <Text style={styles.sectionHeader}>CATEGORIZED BREAKDOWN</Text>

        {/* ── CATEGORIZED BREAKDOWN TABLE ── */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.headerRow} fixed>
            <Text style={[styles.sNo, styles.heading]}>#</Text>
            <Text style={[styles.category, styles.heading]}>Category</Text>
            <Text style={[styles.totalAmt, styles.heading]}>Total Amt</Text>
            <Text style={[styles.discount, styles.heading]}>Discount</Text>
            <Text style={[styles.netAmount, styles.heading]}>Net Amount</Text>
          </View>

          {/* Rows */}
          {categoryList.length > 0 ? (
            categoryList.map((cat, idx) => (
              <View key={idx} style={styles.row} wrap={false}>
                <Text style={styles.sNo}>{idx + 1}</Text>
                <Text style={styles.category}>{cat.name}</Text>
                <Text style={styles.totalAmt}>
                  {formatAmount(cat.totalAmt)}
                </Text>
                <Text style={styles.discount}>
                  {cat.discount > 0 ? formatAmount(cat.discount) : "--"}
                </Text>
                <Text style={styles.netAmount}>
                  {formatAmount(cat.netAmount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>
                No categorized invoice procedures found.
              </Text>
            </View>
          )}

          {/* Footer Total Row */}
          <View style={styles.totalsRow} wrap={false}>
            <Text style={[styles.totalLabel, styles.heading]}>Total</Text>
            <Text style={[styles.totalAmt, styles.heading]}>
              {formatAmount(grandGross)}
            </Text>
            <Text style={[styles.discount, styles.heading]}>
              {grandDiscount > 0 ? formatAmount(grandDiscount) : "--"}
            </Text>
            <Text style={[styles.netAmount, styles.heading]}>
              {formatAmount(grandNet)}
            </Text>
          </View>
        </View>

        {/* ── PAGE FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>
            This is a computer generated statement.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceSummaryPdf;
