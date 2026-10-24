import React from "react";

const AudioPlayer = ({ audio }) => (
  <div className="border rounded p-3 mb-2">
    <div className="d-flex align-items-center gap-2 mb-2">
      <i className="ri-music-2-line" />
      <span className="fw-semibold text-truncate" style={{ fontSize: 14 }}>
        {audio.originalName}
      </span>
      <span className="badge bg-soft-secondary text-secondary">Optional</span>
    </div>
    <audio
      src={audio.url}
      controls
      preload="metadata"
      controlsList="nodownload"
      className="w-100"
    />
  </div>
);

export default AudioPlayer;
