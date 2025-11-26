export const downloadFile = (attachment) => {
  if (attachment && attachment.url) {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.originalName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
