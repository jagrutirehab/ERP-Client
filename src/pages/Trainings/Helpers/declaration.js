export const DECLARATION_MAX_BYTES = 20 * 1024 * 1024;
export const DECLARATION_ACCEPT = "application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const DECLARATION_ERROR_TYPE = "The declaration must be a PDF or a Word (.docx) file.";
export const DECLARATION_ERROR_SIZE = "The declaration file must be 20MB or smaller.";

export const SOURCE_LABELS = {
  employee_name: "Employee name",
  employee_id: "Employee ID",
  center_manager_name: "Center manager name",
  designation: "Designation",
  department: "Department",
  signature: "Signature",
};

export const AUTO_SOURCES = ["employee_name", "employee_id", "center_manager_name", "designation", "department"];

export const sourceLabel = (value) => SOURCE_LABELS[value] || value;

export const MIN_BOX_WIDTH = 0.02;
export const MIN_BOX_HEIGHT = 0.008;
export const DEFAULT_SIGNATURE_HEIGHT_PT = 28;

export const detectFormat = (name = "") => {
  const lower = String(name).toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return null;
};

export const validateDeclarationFile = (file) => {
  if (!file) return null;
  if (!detectFormat(file.name)) return DECLARATION_ERROR_TYPE;
  if (file.size > DECLARATION_MAX_BYTES) return DECLARATION_ERROR_SIZE;
  return null;
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const newSignatureBox = (page) => ({
  id: "signature",
  page,
  x: 0.06,
  y: 0.86,
  width: 0.3,
  height: 0.07,
  source: "signature",
});

export const normalizeBox = (box) => {
  const width = clamp(box.width, MIN_BOX_WIDTH, 1);
  const height = clamp(box.height, MIN_BOX_HEIGHT, 1);
  return {
    ...box,
    width,
    height,
    x: clamp(box.x, 0, 1 - width),
    y: clamp(box.y, 0, 1 - height),
  };
};

export const emptyPlacements = (format) =>
  format === "docx"
    ? { targets: [], signatureMode: "inline", signatureHeightPt: DEFAULT_SIGNATURE_HEIGHT_PT }
    : { boxes: [] };

export const defaultPlacements = (format, pageCount) =>
  format === "docx"
    ? emptyPlacements("docx")
    : { boxes: [newSignatureBox(Math.max(pageCount || 1, 1))] };

export const hasSignature = (placements) =>
  !!placements &&
  ((placements.boxes || []).some((box) => box.source === "signature") ||
    (placements.targets || []).some((target) => target.source === "signature"));

export const formatSigned = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : "";
