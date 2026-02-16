import { parseISO, isAfter, isEqual, startOfDay } from "date-fns";

export const isPreviewable = (
  file,
  documentDate,
  cutOffDate = "2025-12-30"
) => {
  if (!file?.url) return false;

  const ext = file.url.toLowerCase().split(".").pop();
  const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp"];
  if (IMAGE_EXTS.includes(ext)) return true;

  const EXCEL_EXTS = ["xlsx", "xls"];
  if (EXCEL_EXTS.includes(ext)) return true;

  if (ext === "pdf") {
    if (!documentDate) return false;

    const docDate = startOfDay(
      typeof documentDate === "string"
        ? parseISO(documentDate)
        : new Date(documentDate)
    );

    const cutoff = startOfDay(
      typeof cutOffDate === "string"
        ? parseISO(cutOffDate)
        : cutOffDate
    );

    return isAfter(docDate, cutoff) || isEqual(docDate, cutoff);
  }

  return false;
};

export const getFilePreviewMeta = (
  file,
  documentDate,
  cutOffDate
) => {
  if (!file?.url) {
    return {
      show: false,
      canPreview: false,
      label: "-",
      action: null,
    };
  }

  const canPreview = isPreviewable(file, documentDate, cutOffDate);

  return {
    show: true,
    canPreview,
    label: canPreview ? "Preview" : "Download",
    action: canPreview ? "preview" : "download",
  };
};
