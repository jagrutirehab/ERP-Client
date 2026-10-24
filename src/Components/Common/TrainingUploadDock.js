import React, { useEffect, useState } from "react";
import { useTrainingUploads } from "../Hooks/useTrainingUploads";
import { rehydrateUploads } from "../../helpers/trainingUploader";

const KIND_ICON = {
  video: "ri-movie-line",
  audio: "ri-music-2-line",
  file: "ri-file-line",
};

const formatSize = (bytes = 0) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const PhaseLabel = ({ item }) => {
  if (item.phase === "queued") return <span className="text-muted">Waiting…</span>;
  if (item.phase === "sending") return <span className="text-primary">Sending {item.progress}%</span>;
  if (item.phase === "processing") return <span className="text-info">Processing…</span>;
  if (item.phase === "done") return <span className="text-success">Ready</span>;
  if (item.phase === "cancelled") return <span className="text-muted">Cancelled</span>;
  return <span className="text-danger">{item.error || "Failed"}</span>;
};

const TrainingUploadDock = () => {
  const {
    uploads,
    activeCount,
    cancelUpload,
    retryUpload,
    dismissUpload,
    clearFinished,
  } = useTrainingUploads();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    rehydrateUploads();
  }, []);

  if (uploads.length === 0) return null;

  const hasFinished = uploads.some(
    (item) => item.phase === "done" || item.phase === "cancelled",
  );

  return (
    <div
      className="shadow border rounded bg-white"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: 340,
        maxWidth: "calc(100vw - 32px)",
        zIndex: 1080,
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
        style={{ cursor: "pointer", background: "#f8fafc" }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="fw-semibold" style={{ fontSize: 13 }}>
          <i className="ri-upload-cloud-2-line me-2" />
          {activeCount > 0 ? `Uploading ${activeCount} file${activeCount !== 1 ? "s" : ""}` : "Uploads"}
        </div>
        <div className="d-flex align-items-center gap-2">
          {hasFinished && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-muted"
              style={{ fontSize: 12 }}
              onClick={(event) => {
                event.stopPropagation();
                clearFinished();
              }}
            >
              Clear
            </button>
          )}
          <i className={collapsed ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
        </div>
      </div>

      {!collapsed && (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {uploads.map((item) => (
            <div key={item.id} className="px-3 py-2 border-bottom" style={{ fontSize: 12 }}>
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <i className={KIND_ICON[item.kind] || "ri-file-line"} />
                  <span className="text-truncate fw-medium" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-muted flex-shrink-0">{formatSize(item.size)}</span>
                </div>
                <div className="d-flex align-items-center gap-1 flex-shrink-0">
                  {(item.phase === "queued" || item.phase === "sending") && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-danger"
                      onClick={() => cancelUpload(item.id)}
                    >
                      Cancel
                    </button>
                  )}
                  {(item.phase === "failed" || item.phase === "cancelled") && item.canRetry && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => retryUpload(item.id)}
                    >
                      Retry
                    </button>
                  )}
                  {item.phase !== "queued" && item.phase !== "sending" && (
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: 9 }}
                      aria-label="Dismiss"
                      onClick={() => dismissUpload(item.id)}
                    />
                  )}
                </div>
              </div>
              {item.trainingName && (
                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                  {item.trainingName}
                </div>
              )}
              {item.phase === "sending" && (
                <div className="progress mt-1" style={{ height: 4 }}>
                  <div className="progress-bar" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              <div className="mt-1">
                <PhaseLabel item={item} />
                {item.phase === "failed" && !item.canRetry && (
                  <span className="text-muted"> Select the file again to retry.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingUploadDock;
