import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PayslipPdf from "../../../utils/paySlipPdf";

export const EMPTY_VALUE = "--";

export const hasDisplayValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

export const displayValue = (value) =>
  hasDisplayValue(value) ? String(value) : EMPTY_VALUE;

export const displayMoney = (value) => {
  if (!hasDisplayValue(value)) return EMPTY_VALUE;
  const amount = Number(value);
  return Number.isFinite(amount) ? `Rs. ${amount.toLocaleString("en-IN")}` : EMPTY_VALUE;
};

export const displayPercent = (value) => {
  if (!hasDisplayValue(value)) return EMPTY_VALUE;
  const percent = Number(value);
  return Number.isFinite(percent) ? `${percent.toLocaleString("en-IN")}%` : EMPTY_VALUE;
};

export const monthLabel = (row) => {
  if (row?.month && row?.year) return `${row.month} ${row.year}`;
  if (row?.payPeriodEnd) {
    return new Date(row.payPeriodEnd).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return EMPTY_VALUE;
};

const sanitizeFileName = (value) =>
  displayValue(value)
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "_");

export const buildPayslipFileName = (row) => {
  const employeeName = sanitizeFileName(row?.employeeName || row?.employeeCode || "Employee");
  const month = sanitizeFileName(monthLabel(row).replace(" ", "_") || "Month");
  return `${employeeName}_${month}_Payslip.pdf`;
};

export const downloadPayslipPdf = async (row) => {
  const blob = await pdf(<PayslipPdf row={row} />).toBlob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = buildPayslipFileName(row);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadPayslipPdfById = async (payslipId, payslips = []) => {
  const payslip = payslips.find((item) => item?._id === payslipId);
  if (!payslip) {
    throw new Error("Payslip not found");
  }

  return downloadPayslipPdf(payslip);
};

export const useDebouncedValue = (value, delay = 450) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const readStickyFilters = (key, fallback) => {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch (error) {
    return fallback;
  }
};

export const writeStickyFilters = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Session storage can be unavailable in private browsing; filters still work in memory.
  }
};
