import React from "react";
import { StyleSheet, View, Text, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

import Roboto from "../../../../assets/fonts/Roboto-Bold.ttf";
import addComma from "../../../../utils/addComma";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: Roboto,
      fontWeight: "heavy",
    },
  ],
});

// 11 columns, total = 100%
// S.No:3% | InvoiceNo:9% | InvoiceDate:9.5% | Category:11.5% | Description:17% | Period:17% | Units:4% | Rate:7% | TotalAmt:7% | Discount:7% | NetAmount:8%
const COLS = {
  sNo: "3%",
  invoiceNo: "9%",
  invoiceDate: "9.5%",
  category: "11.5%",
  description: "17%",
  servicePeriod: "17%",
  units: "4%",
  rate: "7%",
  totalAmt: "7%",
  discount: "7%",
  netAmount: "8%",
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    width: "100%",
  },
  sectionTitleRow: {
    borderBottom: "1.5pt solid #2a5c8a",
    paddingBottom: 3,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
    fontSize: 9,
    color: "#2a5c8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  table: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderTop: "1pt solid black",
    borderBottom: "1pt solid black",
    paddingTop: 3.5,
    paddingBottom: 3.5,
    fontSize: 7.5,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
    paddingTop: 3,
    paddingBottom: 3,
    fontSize: 7.5,
  },
  totalsRow: {
    flexDirection: "row",
    borderTop: "1pt solid black",
    borderBottom: "1pt solid black",
    backgroundColor: "#f2f2f2",
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 7.5,
  },
  sNo: { width: COLS.sNo, textAlign: "center" },
  invoiceNo: {
    width: COLS.invoiceNo,
    textAlign: "left",
    paddingLeft: 3,
  },
  invoiceDate: {
    width: COLS.invoiceDate,
    textAlign: "left",
    paddingLeft: 3,
  },
  category: {
    width: COLS.category,
    textAlign: "left",
    paddingLeft: 3,
    textTransform: "capitalize",
  },
  description: {
    width: COLS.description,
    textAlign: "left",
    paddingLeft: 3,
    textTransform: "capitalize",
  },
  servicePeriod: { width: COLS.servicePeriod, textAlign: "center" },
  units: { width: COLS.units, textAlign: "right", paddingRight: 3 },
  rate: { width: COLS.rate, textAlign: "right", paddingRight: 3 },
  totalAmt: { width: COLS.totalAmt, textAlign: "right", paddingRight: 3 },
  discount: { width: COLS.discount, textAlign: "right", paddingRight: 3 },
  netAmount: { width: COLS.netAmount, textAlign: "right", paddingRight: 3 },
  totalLabel: {
    // Spans S.No through Rate (3 + 9 + 9.5 + 11.5 + 17 + 17 + 4 + 7 = 78%)
    width: "78%",
    paddingLeft: 6,
    textAlign: "left",
  },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  summaryContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: "50%",
    border: "1pt solid #ccc",
    backgroundColor: "#f9f9f9",
    padding: 8,
  },
  summaryHeaderRow: {
    borderBottom: "1pt solid #ddd",
    paddingBottom: 3,
    marginBottom: 4,
  },
  summaryHeaderTitle: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: "heavy",
    color: "#2a5c8a",
    textTransform: "uppercase",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2.5,
  },
  summaryLabel: {
    fontSize: 8.5,
    color: "#333",
  },
  summaryValue: {
    fontSize: 8.5,
    fontFamily: "Roboto",
    fontWeight: "heavy",
    textAlign: "right",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1pt solid #ccc",
    paddingTop: 3.5,
    marginTop: 3,
  },
});

const formatDateSafe = (dateStr) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "--" : format(d, "d MMM y");
};

const formatAmount = (value, fallback = "--") => {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  if (isNaN(num)) return fallback;
  const formatted = addComma(Math.abs(num).toFixed(2));
  return num < 0 ? `-${formatted}` : formatted;
};

const formatServicePeriod = (proc) => {
  const cat = String(proc?.category || proc?.categoryName || "")
    .trim()
    .toLowerCase();
  const isRoomOrBed = cat.includes("room") || cat.includes("bed");
  if (isRoomOrBed && (proc?.fromDate || proc?.toDate)) {
    const from = formatDateSafe(proc.fromDate);
    const to = formatDateSafe(proc.toDate);
    if (from !== "--" && to !== "--") {
      return `${from} - ${to}`;
    }
    if (from !== "--") return from;
    if (to !== "--") return to;
  }
  return "--";
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

const ProcedureBreakdownTable = ({ rows }) => {
  const rowList = rows || [];

  // Flatten all procedures strictly from INVOICE records
  // (Deposit, Advance Payment, and Write Off records are explicitly excluded)
  const flattenedProcedures = [];
  rowList.forEach((row) => {
    if (
      row.type === "INVOICE" &&
      Array.isArray(row.procedures) &&
      row.procedures.length > 0
    ) {
      const invoiceFormattedDate = formatDateSafe(row.date || row.billDate);
      row.procedures.forEach((proc) => {
        flattenedProcedures.push({
          ...proc,
          invoiceNo: row.billNumber || "--",
          invoiceDate: invoiceFormattedDate,
        });
      });
    }
  });

  if (flattenedProcedures.length === 0) {
    return null;
  }

  // Calculate table grand totals
  const grandGross = flattenedProcedures.reduce(
    (sum, p) =>
      sum +
      (Number(p.grossAmount) ||
        Number(p.units || 0) * Number(p.rate || 0) ||
        0),
    0
  );
  const grandDiscount = flattenedProcedures.reduce(
    (sum, p) => sum + (Number(p.discount) || 0),
    0
  );
  const grandNet = flattenedProcedures.reduce(
    (sum, p) =>
      sum +
      Number(
        p.netAmount != null
          ? p.netAmount
          : (p.grossAmount || 0) - (p.discount || 0)
      ),
    0
  );

  // Category aggregation for the summary block
  const categoryMap = new Map();
  flattenedProcedures.forEach((proc) => {
    const rawCat = (proc.category || proc.categoryName || "Other").trim();
    const normalizedKey = rawCat.toLowerCase();
    const displayName = formatCategoryName(rawCat);
    const net =
      Number(
        proc.netAmount != null
          ? proc.netAmount
          : (proc.grossAmount || 0) - (proc.discount || 0)
      ) || 0;

    if (!categoryMap.has(normalizedKey)) {
      categoryMap.set(normalizedKey, { name: displayName, total: 0 });
    }
    categoryMap.get(normalizedKey).total += net;
  });

  const categoryList = Array.from(categoryMap.values()).sort(
    (a, b) => b.total - a.total
  );
  const categoryGrandTotal = categoryList.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <View style={styles.container}>
      {/* ── SECTION TITLE ── */}
      <View style={styles.sectionTitleRow} wrap={false}>
        <Text style={styles.sectionTitle}>
          Itemized Services & Procedure Breakdown
        </Text>
      </View>

      {/* ── UNIFIED TABLE ── */}
      <View style={styles.table}>
        {/* Column Headers */}
        <View style={styles.headerRow} fixed>
          <Text style={[styles.sNo, styles.heading]}>#</Text>
          <Text style={[styles.invoiceNo, styles.heading]}>Invoice No</Text>
          <Text style={[styles.invoiceDate, styles.heading]}>Invoice Date</Text>
          <Text style={[styles.category, styles.heading]}>Category</Text>
          <Text style={[styles.description, styles.heading]}>
            Procedure / Service Description
          </Text>
          <Text style={[styles.servicePeriod, styles.heading]}>
            Service Period (From - To)
          </Text>
          <Text style={[styles.units, styles.heading]}>Units</Text>
          <Text style={[styles.rate, styles.heading]}>Rate</Text>
          <Text style={[styles.totalAmt, styles.heading]}>Total Amt</Text>
          <Text style={[styles.discount, styles.heading]}>Discount</Text>
          <Text style={[styles.netAmount, styles.heading]}>Net Amount</Text>
        </View>

        {/* Data Rows */}
        {flattenedProcedures.map((proc, index) => {
          const units =
            proc.units != null
              ? proc.units
              : proc.unit != null
              ? proc.unit
              : 1;
          const rate = proc.rate ?? proc.cost ?? 0;
          const grossAmount =
            proc.grossAmount != null
              ? proc.grossAmount
              : Number(units) * Number(rate);
          const discount = Number(proc.discount) || 0;
          const netAmount =
            proc.netAmount != null ? proc.netAmount : grossAmount - discount;

          return (
            <View key={proc._id || index} style={styles.row} wrap={false}>
              <Text style={styles.sNo}>{index + 1}</Text>
              <Text style={styles.invoiceNo}>{proc.invoiceNo}</Text>
              <Text style={styles.invoiceDate}>{proc.invoiceDate}</Text>
              <Text style={styles.category}>
                {formatCategoryName(proc.category || proc.categoryName)}
              </Text>
              <View style={styles.description}>
                <Text>
                  {proc.name ||
                    proc.procedureName ||
                    proc.slot ||
                    proc.title ||
                    "--"}
                </Text>
                {proc.comments &&
                  proc.comments !== proc.name &&
                  proc.comments !== proc.slot && (
                    <Text style={{ fontSize: 6, color: "#666" }}>
                      {proc.comments}
                    </Text>
                  )}
              </View>
              <Text style={styles.servicePeriod}>
                {formatServicePeriod(proc)}
              </Text>
              <Text style={styles.units}>{units}</Text>
              <Text style={styles.rate}>{formatAmount(rate)}</Text>
              <Text style={styles.totalAmt}>{formatAmount(grossAmount)}</Text>
              <Text style={styles.discount}>
                {discount > 0 ? formatAmount(discount) : "--"}
              </Text>
              <Text style={styles.netAmount}>{formatAmount(netAmount)}</Text>
            </View>
          );
        })}

        {/* Totals Footer Row: spans leading columns (# through Rate = 78%), then Total Amt, Discount, Net Amount */}
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

      {/* ── CATEGORY SUMMARY CARD ── */}
      <View style={styles.summaryContainer} wrap={false}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeaderRow}>
            <Text style={styles.summaryHeaderTitle}>Category Summary</Text>
          </View>
          {categoryList.map((cat, idx) => (
            <View key={idx} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{cat.name}</Text>
              <Text style={styles.summaryValue}>{formatAmount(cat.total)}</Text>
            </View>
          ))}
          <View style={styles.summaryTotalRow}>
            <Text style={[styles.summaryLabel, styles.heading]}>Total</Text>
            <Text style={[styles.summaryValue, styles.heading]}>
              {formatAmount(categoryGrandTotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProcedureBreakdownTable;
