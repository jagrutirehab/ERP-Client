import React from "react";
import { useAccordion } from "../../Helpers/useAccordion";
import LessonCard from "./LessonCard";

const LessonsSection = ({ lessons, isSubmitted, dispatch }) => {
  const [openLessonId, toggleLesson] = useAccordion(
    lessons.map((lesson) => lesson.cid),
    { openFirst: true },
  );

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h6 className="mb-0 fw-semibold">Lessons</h6>
          <small className="text-muted">
            Learners go through lessons in order. A lesson passes when its
            chapters are completed and its quiz (if any) is passed.
          </small>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => dispatch({ type: "ADD_LESSON" })}
        >
          + Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div
          className="text-center py-4 border rounded text-muted"
          style={{ background: "#f8f9fa", fontSize: 13 }}
        >
          No lessons added. Without lessons, learners read the file below and
          take the optional final exam.
        </div>
      ) : (
        lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.cid}
            lesson={lesson}
            index={index}
            total={lessons.length}
            isSubmitted={isSubmitted}
            dispatch={dispatch}
            open={openLessonId === lesson.cid}
            onToggle={toggleLesson}
          />
        ))
      )}
    </div>
  );
};

export default LessonsSection;
