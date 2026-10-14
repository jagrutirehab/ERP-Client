import React from "react";
import { formatBytes, formatDuration } from "../../Helpers/adminTrainingHelpers";

const KIND_ICON = {
  video: "ri-movie-line",
  audio: "ri-music-2-line",
  file: "ri-file-line",
};

const MEDIA_STATUS = {
  processing: { text: "Processing", className: "bg-soft-warning text-warning" },
  pending: { text: "Pending", className: "bg-soft-warning text-warning" },
  failed: { text: "Failed", className: "bg-soft-danger text-danger" },
  done: { text: "Ready", className: "bg-soft-success text-success" },
};

const AttachmentRow = ({ item, kind, onPlay, onView }) => {
  const isMedia = kind === "video" || kind === "audio";
  const status = isMedia ? MEDIA_STATUS[item.status] || MEDIA_STATUS.pending : null;
  const ready = !isMedia || item.status === "done";

  return (
    <div
      className="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2"
      style={{ background: "#fff", fontSize: 13 }}
    >
      <div className="d-flex align-items-center gap-2 overflow-hidden">
        <i className={KIND_ICON[kind]} style={{ fontSize: 16 }} />
        <div className="overflow-hidden">
          <div className="text-truncate fw-medium" title={item.originalName}>
            {item.originalName}
          </div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {isMedia ? (kind === "video" ? "Video" : "Audio") : "File"}
            {item.durationSec ? ` · ${formatDuration(item.durationSec)}` : ""}
            {item.size ? ` · ${formatBytes(item.size)}` : ""}
          </div>
          {item.status === "failed" && item.error && (
            <div className="text-danger" style={{ fontSize: 11 }}>
              {item.error}
            </div>
          )}
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
        {status && (
          <span className={`badge ${status.className}`} style={{ fontSize: 10 }}>
            {status.text}
          </span>
        )}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          disabled={!ready}
          onClick={() => (isMedia ? onPlay(item) : onView(item))}
        >
          {isMedia ? "Play" : "View"}
        </button>
      </div>
    </div>
  );
};

export default AttachmentRow;
