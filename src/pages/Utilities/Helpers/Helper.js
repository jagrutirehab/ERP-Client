export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export const FILE_ACCEPT = ".pdf,.docx,.jpg,.jpeg,.png";

export const INVALID_FILE_MESSAGE =
  "Only PDF, DOCX, JPG, JPEG, and PNG files are allowed";

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateNewFiles = (files) => {
  const valid = [];
  const errors = [];

  files.forEach((file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`${file.name}: ${INVALID_FILE_MESSAGE}`);
    } else {
      valid.push(file);
    }
  });

  return { valid, errors };
};
