import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";

const getName = (file) =>
  (file?.originalName || file?.name || "").toLowerCase();

export const getFileKind = (file) => {
  if (!file) return "none";
  const name = getName(file);
  if (file.type === "application/pdf") return "pdf";
  if (file.type?.startsWith("image/")) return "image";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "word";
  if (
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    file.type === "application/vnd.ms-powerpoint" ||
    file.type?.includes("presentationml")
  ) {
    return "presentation";
  }
  return "unsupported";
};

const LOADING_LABEL = {
  pdf: "Loading PDF...",
  image: "Loading Image...",
  word: "Loading Document...",
  presentation: "Loading Presentation...",
};

const TrainingFileViewer = ({ file, onLoaded }) => {
  const kind = getFileKind(file);
  const [loading, setLoading] = useState(true);

  const handleLoaded = () => {
    setLoading(false);
    if (onLoaded) onLoaded();
  };

  useEffect(() => {
    if (kind === "none" || kind === "unsupported") {
      handleLoaded();
    } else {
      setLoading(true);
    }
  }, [file?.url]);

  if (kind === "none") return null;

  if (kind === "unsupported") {
    return (
      <div className="mb-4 p-4 border rounded text-center">
        <p className="text-muted mb-3">
          Preview not available for this file type.
        </p>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          Download {file.originalName || file.name || "file"}
        </a>
      </div>
    );
  }

  const spinner = loading && (
    <div className="text-center py-5">
      <Spinner color="primary" />
      <p className="text-muted small mt-2">{LOADING_LABEL[kind]}</p>
    </div>
  );

  if (kind === "pdf") {
    return (
      <div className="mb-4">
        {spinner}
        <object
          data={file.url}
          type="application/pdf"
          width="100%"
          height={loading ? "0px" : "700px"}
          style={{ border: "none" }}
          onLoad={handleLoaded}
        >
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
          >
            Open PDF
          </a>
        </object>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div className="mb-4">
        {spinner}
        <img
          src={file.url}
          alt={file.originalName}
          className="img-fluid"
          onLoad={handleLoaded}
          style={{ display: loading ? "none" : "block" }}
        />
      </div>
    );
  }

  const viewerSrc =
    kind === "presentation"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`
      : `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;

  return (
    <div className="mb-4">
      {spinner}
      <iframe
        src={viewerSrc}
        width="100%"
        height={loading ? "0px" : "700px"}
        style={{ border: "none" }}
        onLoad={handleLoaded}
        title={kind === "presentation" ? "Presentation Viewer" : "Document Viewer"}
      />
      <div className="mt-2 text-end">
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          {kind === "presentation" ? "Download Presentation" : "Download Document"}
        </a>
      </div>
    </div>
  );
};

export default TrainingFileViewer;
