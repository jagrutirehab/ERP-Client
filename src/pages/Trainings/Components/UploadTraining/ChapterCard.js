import React from "react";
import Collapsible from "./Collapsible";
import { getChapterErrors } from "../../Helpers/uploadTrainingForm";
import ChapterMediaInput from "./ChapterMediaInput";
import ChapterFileInput from "./ChapterFileInput";

const SectionLabel = ({ children }) => (
  <p
    className="text-uppercase text-muted fw-semibold mb-2"
    style={{ fontSize: 11, letterSpacing: 1 }}
  >
    {children}
  </p>
);

const ChapterCard = ({
  lessonId,
  chapter,
  index,
  total,
  isSubmitted,
  dispatch,
  open,
  onToggle,
}) => {
  const nameError = isSubmitted && getChapterErrors(chapter).name;

  const update = (patch) =>
    dispatch({
      type: "UPDATE_CHAPTER",
      lessonId,
      chapterId: chapter.cid,
      patch,
    });

  const move = (direction) =>
    dispatch({
      type: "MOVE_CHAPTER",
      lessonId,
      chapterId: chapter.cid,
      direction,
    });

  const remove = () =>
    dispatch({ type: "REMOVE_CHAPTER", lessonId, chapterId: chapter.cid });

  const stop = (handler) => (e) => {
    e.stopPropagation();
    handler();
  };

  const chapterLabel = chapter.name.trim() || `Chapter ${index + 1}`;

  const handleHeaderKey = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(chapter.cid);
    }
  };

  return (
    <div
      className="border rounded mb-2"
      style={{
        borderColor: nameError ? "#dc3545" : undefined,
        borderLeft: `3px solid ${nameError ? "#dc3545" : "#22c55e"}`,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{
          cursor: "pointer",
          background: open ? "#eef2ff" : "#f8fafc",
          transition: "background 250ms ease",
        }}
        onClick={() => onToggle(chapter.cid)}
        onKeyDown={handleHeaderKey}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <span className="fw-semibold" style={{ fontSize: 13 }}>
            Chapter {index + 1}
          </span>
          <span className="text-muted text-truncate" style={{ fontSize: 13 }}>
            {chapter.name}
          </span>
          {chapter.media.length > 0 && (
            <span
              className="badge bg-soft-info text-info flex-shrink-0"
              style={{ fontSize: 10 }}
            >
              {chapter.media.length} media
            </span>
          )}
          {chapter.files.length > 0 && (
            <span
              className="badge bg-soft-success text-success flex-shrink-0"
              style={{ fontSize: 10 }}
            >
              {chapter.files.length} file{chapter.files.length !== 1 ? "s" : ""}
            </span>
          )}
          {nameError && (
            <span className="badge bg-danger flex-shrink-0" style={{ fontSize: 10 }}>
              Name required
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light text-danger flex-shrink-0"
          onClick={stop(remove)}
          title="Remove chapter"
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>

      <Collapsible open={open}>
        <div className="p-3">
          <SectionLabel>Chapter details</SectionLabel>

          <div className="mb-3">
            <label className="form-label">Chapter Name *</label>
            <input
              type="text"
              className="form-control"
              value={chapter.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            {nameError && (
              <small className="text-danger d-block mt-2">
                Chapter name is required
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Chapter Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={chapter.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="border rounded p-3" style={{ background: "#f8fafc" }}>
            <SectionLabel>Uploads for this chapter: {chapterLabel}</SectionLabel>
            <ChapterMediaInput
              media={chapter.media}
              onChange={(media) => update({ media })}
            />
            <ChapterFileInput
              files={chapter.files}
              onChange={(files) => update({ files })}
            />
          </div>

          <div className="d-flex align-items-center gap-2 mt-3">
            <span className="text-muted" style={{ fontSize: 12 }}>
              Chapter order
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light"
              disabled={index === 0}
              onClick={() => move(-1)}
            >
              Move up
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light"
              disabled={index === total - 1}
              onClick={() => move(1)}
            >
              Move down
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
};

export default React.memo(ChapterCard);
