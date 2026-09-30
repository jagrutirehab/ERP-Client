const getExcelMimeType = (url = "", originalName = "") => {
  const src = (originalName || url).toLowerCase();
  if (src.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (src.endsWith(".xls")) return "application/vnd.ms-excel";
  if (src.endsWith(".csv")) return "text/csv";
  return null;
};

const getExtension = (url = "", originalName = "") => {
  const src = (originalName || url).toLowerCase();
  const match = src.match(/\.(xlsx|xls|csv|pdf|png|jpg|jpeg|webp|doc|docx)$/i);
  return match ? match[0] : "";
};

export const downloadFile = async (attachment) => {
  if (attachment && attachment.url) {
    const originalName = attachment.originalName || "";
    const ext = getExtension(attachment.url, originalName);
    const forcedMime = getExcelMimeType(attachment.url, originalName);
    const fallbackName = originalName || `download${ext}`;

    try {
      const response = await fetch(attachment.url);
      const rawBlob = await response.blob();
      const blob = forcedMime ? new Blob([rawBlob], { type: forcedMime }) : rawBlob;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fallbackName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.download = fallbackName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
