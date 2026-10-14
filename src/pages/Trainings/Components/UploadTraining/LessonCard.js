import React from "react";
import Questionary from "../Questionary";
import {
  MIN_LESSON_QUIZ_QUESTIONS,
  getLessonErrors,
} from "../../Helpers/uploadTrainingForm";
import { useAccordion } from "../../Helpers/useAccordion";
import ChapterCard from "./ChapterCard";
import Collapsible from "./Collapsible";

const LessonCard = ({
  lesson,
  index,
  total,
  isSubmitted,
  dispatch,
  open,
  onToggle,
}) => {
  const [openChapterId, toggleChapter] = useAccordion(
    lesson.chapters.map((chapter) => chapter.cid),
  );
  const errors = getLessonErrors(lesson);
  const showErrors = isSubmitted && errors.any;

  const update = (patch) =>
    dispatch({ type: "UPDATE_LESSON", lessonId: lesson.cid, patch });

  const move = (direction) =>
    dispatch({ type: "MOVE_LESSON", lessonId: lesson.cid, direction });

  const remove = () =>
    dispatch({ type: "REMOVE_LESSON", lessonId: lesson.cid });

  const stop = (handler) => (e) => {
    e.stopPropagation();
    handler();
  };

  const handleHeaderKey = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(lesson.cid);
    }
  };

  return (
    <div
      className="border rounded mb-3"
      style={{
        borderColor: showErrors ? "#dc3545" : undefined,
        borderLeft: `4px solid ${showErrors ? "#dc3545" : "#3b82f6"}`,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{
          cursor: "pointer",
          background: open ? "#dbeafe" : "#eff6ff",
          transition: "background 250ms ease",
        }}
        onClick={() => onToggle(lesson.cid)}
        onKeyDown={handleHeaderKey}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <span className="fw-semibold">Lesson {index + 1}</span>
          <span className="text-muted text-truncate">{lesson.name}</span>
          <span
            className="badge bg-soft-primary text-primary flex-shrink-0"
            style={{ fontSize: 10 }}
          >
            {lesson.chapters.length} chapter{lesson.chapters.length !== 1 ? "s" : ""}
          </span>
          <span
            className="badge bg-soft-secondary text-secondary flex-shrink-0"
            style={{ fontSize: 10 }}
          >
            {lesson.questionary.length > 0
              ? `${lesson.questionary.length} quiz questions`
              : "no quiz"}
          </span>
          {showErrors && (
            <span className="badge bg-danger flex-shrink-0" style={{ fontSize: 10 }}>
              Needs attention
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light text-danger flex-shrink-0"
          onClick={stop(remove)}
          title="Remove lesson"
        >
          <i className="ri-delete-bin-line" />
        </button>
      </div>

      <Collapsible open={open}>
        <div className="p-3">
          <div className="mb-3">
            <label className="form-label">Lesson Name *</label>
            <input
              type="text"
              className="form-control"
              value={lesson.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            {isSubmitted && errors.name && (
              <small className="text-danger d-block mt-2">
                Lesson name is required
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Lesson Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={lesson.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <p
                className="text-uppercase text-muted fw-semibold mb-0"
                style={{ fontSize: 11, letterSpacing: 1 }}
              >
                Chapters in Lesson {index + 1}
              </p>
              <button
                type="button"
                className="btn btn-soft-primary btn-sm"
                onClick={() =>
                  dispatch({ type: "ADD_CHAPTER", lessonId: lesson.cid })
                }
              >
                + Add Chapter
              </button>
            </div>
            {lesson.chapters.length === 0 ? (
              <div
                className="text-center py-3 border rounded text-muted"
                style={{ background: "#f8f9fa", fontSize: 12 }}
              >
                No chapters. A lesson can have only a quiz or just a
                description.
              </div>
            ) : (
              <div style={{ borderLeft: "2px solid #bfdbfe", paddingLeft: 12, marginLeft: 6 }}>
                {lesson.chapters.map((chapter, chapterIndex) => (
                  <ChapterCard
                    key={chapter.cid}
                    lessonId={lesson.cid}
                    chapter={chapter}
                    index={chapterIndex}
                    total={lesson.chapters.length}
                    isSubmitted={isSubmitted}
                    dispatch={dispatch}
                    open={openChapterId === chapter.cid}
                    onToggle={toggleChapter}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border rounded p-3" style={{ background: "#f8fafc" }}>
            <Questionary
              title={`Lesson ${index + 1} Quiz`}
              optional
              minQuestions={MIN_LESSON_QUIZ_QUESTIONS}
              questionary={lesson.questionary}
              onChange={(questionary) => update({ questionary })}
              isSubmitted={isSubmitted}
            />
          </div>

          <div className="d-flex align-items-center gap-2 mt-3">
            <span className="text-muted" style={{ fontSize: 12 }}>
              Lesson order
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

export default React.memo(LessonCard);
