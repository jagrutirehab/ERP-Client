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

// 9 columns, total = 100%
// Date:10 | Type:16 | TotalAmt:11 | Discount:10 | Refund:9 | Invoice:10 | Payment:10 | Deposit:10 | BalDue:14
const COLS = {
  date: "10%",
  type: "16%",
  totalAmount: "11%",
  discount: "10%",
  refund: "9%",
  invoice: "10%",
  payment: "10%",
  deposit: "10%",
  balance: "14%",
};

const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
    paddingTop: 3,
    paddingBottom: 3,
    fontSize: 7.5,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
    borderTop: "1pt solid black",
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: "#f2f2f2",
    fontSize: 7.5,
  },
  totalsRow: {
    flexDirection: "row",
    borderTop: "1pt solid black",
    borderBottom: "1pt solid black",
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 7.5,
    backgroundColor: "#f2f2f2",
  },
  date: { width: COLS.date, paddingLeft: 3 },
  type: { width: COLS.type, paddingLeft: 3 },
  totalAmount: { width: COLS.totalAmount, textAlign: "right", paddingRight: 4 },
  discount: { width: COLS.discount, textAlign: "right", paddingRight: 4 },
  refund: { width: COLS.refund, textAlign: "right", paddingRight: 4 },
  invoice: { width: COLS.invoice, textAlign: "right", paddingRight: 4 },
  payment: { width: COLS.payment, textAlign: "right", paddingRight: 4 },
  deposit: { width: COLS.deposit, textAlign: "right", paddingRight: 4 },
  balance: { width: COLS.balance, textAlign: "right", paddingRight: 3 },
  heading: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
  },
  debit: { color: "#b02a2a" },
  credit: { color: "#1f7a3f" },
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
});

const formatDateSafe = (dateStr) => {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "--" : format(d, "d MMM y");
};

// Positive → plain (e.g. 1,900), negative → minus sign (e.g. -320), null/undefined → "--"
const formatAmount = (value, fallback = "--") => {
  if (value == null || value === "") return fallback;
  const num = Number(value);
  if (isNaN(num)) return fallback;
  const formatted = addComma(Math.abs(num).toFixed(2));
  return num < 0 ? `-${formatted}` : formatted;
};

const balanceStyle = (value, styles) => {
  const n = Number(value) || 0;
  if (n < 0) return styles.debit;
  if (n > 0) return styles.credit;
  return {};
};

const Table = ({ rows, totals }) => {
  const rowList = rows || [];
  const currentBalanceDue =
    totals?.currentBalanceDue != null
      ? Number(totals.currentBalanceDue)
      : totals?.finalBalanceDue != null
      ? Number(totals.finalBalanceDue)
      : rowList.length
      ? Number(rowList[0].balanceDue) || 0
      : 0;

  // Compute column totals for the footer
  const totalAmountSum = totals?.totalAmount ?? 0;
  const totalDiscountSum = totals?.totalDiscount ?? 0;
  const totalRefundSum = totals?.totalRefundedAmount ?? 0;
  const totalInvoiceSum = totals?.totalPayable ?? totals?.payableAmount ?? 0;
  const totalPaymentSum =
    totals?.totalAdvancePayments ?? totals?.totalPaid ?? 0;
  // Deposit column total in footer: net mathematical sum of that column
  // (Sum of all positive deposits) - (Sum of all converted deposit deductions)
  const totalDepositSum =
    totals?.netDeposit != null
      ? totals.netDeposit
      : rowList.reduce((sum, r) => sum + (Number(r.depositDisplay) || 0), 0);

  return (
    <View style={styles.table}>
      {/* ── HEADER ── */}
      <View style={styles.headerRow} fixed>
        <Text style={[styles.date, styles.heading]}>Date</Text>
        <Text style={[styles.type, styles.heading]}>Type</Text>
        <Text style={[styles.totalAmount, styles.heading]}>Total Amt</Text>
        <Text style={[styles.discount, styles.heading]}>Discount</Text>
        <Text style={[styles.refund, styles.heading]}>Refund</Text>
        <Text style={[styles.invoice, styles.heading]}>Invoice</Text>
        <Text style={[styles.payment, styles.heading]}>Payment</Text>
        <Text style={[styles.deposit, styles.heading]}>Deposit</Text>
        <Text style={[styles.balance, styles.heading]}>Balance Due</Text>
      </View>

      {/* ── DATA ROWS ── */}
      {rowList.map((row, index) => {
        const isInvoiceOrRefund =
          row.type === "INVOICE" || row.type === "REFUND";

        // Total Amount: only for invoices/refunds (gross cost); "--" for deposits and advance payments
        const totalAmountText = isInvoiceOrRefund
          ? formatAmount(row.amount)
          : "--";

        // Discount: only on invoices/refunds
        const discountText =
          isInvoiceOrRefund && row.discount && row.discount > 0
            ? formatAmount(row.discount)
            : "--";

        // Refund: only when a refund amount exists
        const refundText =
          row.refund && row.refund > 0 ? formatAmount(row.refund) : "--";

        // Invoice column: net payable (gross - discount) for invoices/refunds; "--" elsewhere
        const invoiceText = isInvoiceOrRefund
          ? formatAmount(row.payable ?? (row.amount || 0) - (row.discount || 0))
          : "--";

        // Payment column: advance payment or write-off amount (positive); "--" elsewhere
        const paymentText =
          row.type === "ADVANCE_PAYMENT" || row.type === "WRITE_OFF"
            ? formatAmount(Math.abs(row.payable ?? row.amount ?? 0))
            : "--";

        // Deposit column:
        //   • DEPOSIT row: ALWAYS positive in GREEN (#1f7a3f)
        //   • ADVANCE_PAYMENT row (when converted from deposit): deduction as NEGATIVE in RED (#b02a2a) with minus sign
        //   • Other advance payments / invoices / etc. → "--"
        let depositText = "--";
        let depositStyle = {};
        if (row.type === "DEPOSIT") {
          const val = Math.abs(
            row.depositDisplay ?? row.depositAmount ?? row.amount ?? 0
          );
          depositText = formatAmount(val);
          depositStyle = val > 0 ? styles.credit : {};
        } else if (
          row.type === "ADVANCE_PAYMENT" &&
          (row.fromDepositConversion ||
            (row.depositDisplay != null && Number(row.depositDisplay) < 0))
        ) {
          const deduction = Math.abs(
            row.depositDisplay ?? row.payable ?? row.amount ?? 0
          );
          depositText = formatAmount(-deduction);
          depositStyle = styles.debit;
        }

        return (
          <View
            style={styles.row}
            key={row.billId || index}
            wrap={false}
          >
            <Text style={styles.date}>{formatDateSafe(row.date)}</Text>
            <Text style={styles.type}>
              {row.typeLabel}
              {row.billNumber ? ` (${row.billNumber})` : ""}
            </Text>
            <Text style={styles.totalAmount}>{totalAmountText}</Text>
            <Text style={styles.discount}>{discountText}</Text>
            <Text style={styles.refund}>{refundText}</Text>
            <Text style={styles.invoice}>{invoiceText}</Text>
            <Text
              style={[
                styles.payment,
                row.type === "ADVANCE_PAYMENT" && paymentText !== "--"
                  ? styles.credit
                  : {},
              ]}
            >
              {paymentText}
            </Text>
            <Text style={[styles.deposit, depositStyle]}>
              {depositText}
            </Text>
            <Text
              style={[
                styles.balance,
                balanceStyle(row.balanceDue, styles),
              ]}
            >
              {formatAmount(row.balanceDue, "0.00")}
            </Text>
          </View>
        );
      })}

      {/* ── TOTALS FOOTER ROW ── */}
      <View style={styles.totalsRow} wrap={false}>
        <Text style={[styles.date, styles.heading]}></Text>
        <Text style={[styles.type, styles.heading]}>Totals</Text>
        <Text style={[styles.totalAmount, styles.heading]}>
          {formatAmount(totalAmountSum)}
        </Text>
        <Text style={[styles.discount, styles.heading]}>
          {formatAmount(totalDiscountSum)}
        </Text>
        <Text style={[styles.refund, styles.heading]}>
          {formatAmount(totalRefundSum)}
        </Text>
        <Text style={[styles.invoice, styles.heading]}>
          {formatAmount(totalInvoiceSum)}
        </Text>
        <Text style={[styles.payment, styles.heading]}>
          {formatAmount(totalPaymentSum)}
        </Text>
        <Text
          style={[
            styles.deposit,
            styles.heading,
            totalDepositSum > 0
              ? styles.credit
              : totalDepositSum < 0
              ? styles.debit
              : {},
          ]}
        >
          {formatAmount(totalDepositSum)}
        </Text>
        <View style={styles.balance}>
          <Text
            style={[
              styles.heading,
              balanceStyle(currentBalanceDue, styles),
              { textAlign: "right" },
            ]}
          >
            {formatAmount(currentBalanceDue, "0.00")}
          </Text>
          <Text
            style={[
              balanceStyle(currentBalanceDue, styles),
              { fontSize: 6, textAlign: "right", marginTop: 1 },
            ]}
          >
            (Current Balance)
          </Text>
        </View>
      </View>

      {/* ── FLOATING SUMMARY BOX ── */}
      <View style={styles.summaryContainer} wrap={false}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Invoices Payable</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(totalInvoiceSum)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Discount</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(totalDiscountSum)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Refunded Amount</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(totalRefundSum)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Advance Payments</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(totalPaymentSum)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Deposits</Text>
            <Text style={styles.summaryValue}>
              {formatAmount(totalDepositSum)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Balance Due</Text>
            <Text
              style={[
                styles.summaryValue,
                balanceStyle(currentBalanceDue, styles),
              ]}
            >
              {formatAmount(currentBalanceDue, "0.00")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Table;
