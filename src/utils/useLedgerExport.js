import { useCallback } from "react";
import ExcelJS from "exceljs";

const formatINRPlain = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);

const fmtDateShort = (dateStr) => {
  try {
    if (!dateStr || dateStr.length !== 10) return dateStr ?? "";
    const date = new Date(dateStr + "T00:00:00Z");
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "";
  }
};

const buildFilename = (startDate, endDate) =>
  `Ledger_Report_${startDate}_to_${endDate}.xlsx`;

const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
};

const getDates = (start, end) => {
  const arr = [];
  let curr = start;
  while (curr <= end) {
    arr.push(curr);
    curr = addDays(curr, 1);
  }
  return arr;
};

export const useLedgerExport = ({ startBusinessDate, endBusinessDate }) => {
  const exportToExcel = useCallback(async (allData) => {
    const payload = Array.isArray(allData) ? allData : [];
    if (!payload.length || !startBusinessDate || !endBusinessDate) return;

    const dates = getDates(startBusinessDate, endBusinessDate);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ledger Report", {
      views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
    });

    sheet.columns = [
      { header: "Center", key: "center", width: 25 },
      ...dates.map((d) => ({
        header: fmtDateShort(d),
        key: d,
        width: 18,
      })),
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });
    sheet.getCell("A1").alignment = { horizontal: "left" };

    for (const centerData of payload) {
      if (!centerData?.center?._id) continue;

      const recordsMap = Object.fromEntries(
        (centerData.records || [])
          .filter((r) => r?.businessDate)
          .map((r) => [r.businessDate, r.openingBalance])
      );

      const row = { center: centerData.center.title };

      for (const d of dates) {
        row[d] = recordsMap[d] !== undefined ? formatINRPlain(recordsMap[d]) : "—";
      }

      sheet.addRow(row);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildFilename(startBusinessDate, endBusinessDate);
    a.click();
    URL.revokeObjectURL(url);
  }, [startBusinessDate, endBusinessDate]);

  return { exportToExcel };
};