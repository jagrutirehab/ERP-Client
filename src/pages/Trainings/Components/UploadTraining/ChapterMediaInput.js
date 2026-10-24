import React from "react";
import { toast } from "react-toastify";
import {
  MEDIA_ACCEPT,
  formatFileSize,
  newId,
  validateMediaFile,
} from "../../Helpers/uploadTrainingForm";
import { readMediaDuration } from "../../Helpers/mediaDuration";
import { formatTime } from "../../Helpers/learnHelpers";

const isSameFile = (a, b) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const ChapterMediaInput = ({ media, onChange }) => {
  const handleChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";

    const accepted = [];
    for (const file of selected) {
      const result = validateMediaFile(file);
      if (!result.ok) {
        toast.error(result.error);
        continue;
      }

      const duplicate =
        media.some((item) => isSameFile(item.file, file)) ||
        accepted.some((item) => isSameFile(item.file, file));
      if (duplicate) continue;

      let durationSec;
      try {
        durationSec = await readMediaDuration(file, result.kind);
      } catch {
        if (result.kind === "video") {
          toast.error(
            `${file.name}: the browser cannot read this video. It may be corrupted or use an unsupported codec (for example HEVC). Re-export it as H.264 MP4.`,
          );
          continue;
        }
      }

      accepted.push({ id: newId(), file, kind: result.kind, durationSec });
    }

    if (accepted.length > 0) onChange([...media, ...accepted]);
  };

  return (
    <div className="mb-3">
      <label className="form-label">Audio / Video</label>
      <input
        type="file"
        multiple
        className="form-control"
        accept={MEDIA_ACCEPT}
        onChange={handleChange}
      />
      <small className="text-muted d-block mt-1">
        Video: MP4, WebM, MOV (max 500MB) · Audio: MP3, WAV, AAC, M4A, OGG (max
        150MB). Videos must be watched fully by learners; audio is optional.
      </small>
      {media.length > 0 && (
        <div className="border rounded mt-2">
          {media.map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
              style={{ fontSize: 13 }}
            >
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <i
                  className={
                    item.kind === "video" ? "ri-movie-line" : "ri-music-2-line"
                  }
                />
                <span className="text-truncate">{item.file.name}</span>
                <span className="text-muted flex-shrink-0">
                  {formatFileSize(item.file.size)}
                  {item.durationSec ? ` · ${formatTime(item.durationSec)}` : ""}
                </span>
                <span
                  className="badge bg-soft-secondary text-secondary flex-shrink-0"
                  style={{ fontSize: 10 }}
                >
                  {item.kind}
                </span>
              </div>
              <button
                type="button"
                className="btn-close ms-2"
                aria-label="Remove"
                onClick={() =>
                  onChange(media.filter((entry) => entry.id !== item.id))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChapterMediaInput;
