import React from "react";
import { Spinner } from "reactstrap";
import { getFirstOpenChapter } from "../../Helpers/learnHelpers";

const chapterBadge = (state) => {
  if (state === "completed") return { text: "Completed", className: "bg-success" };
  if (state === "in_progress") return { text: "In progress", className: "bg-primary" };
  if (state === "locked") return { text: "Locked", className: "bg-secondary" };
  return { text: "Not started", className: "bg-light text-dark border" };
};

const LessonView = ({
  lesson,
  index,
  onOpenChapter,
  onStartQuiz,
  onContinue,
  continueLoading,
}) => {
  const passed = lesson.state === "passed";
  const firstOpen = getFirstOpenChapter(lesson);
  const hasChapters = lesson.chapters.length > 0;
  const quizState = lesson.quiz?.state;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-1">
        <h5 className="fw-bold mb-0">
          Lesson {index + 1}: {lesson.name}
        </h5>
        {passed && <span className="badge bg-success">Passed</span>}
      </div>

      {lesson.description && (
        <p className="text-muted mb-4" style={{ whiteSpace: "pre-wrap" }}>
          {lesson.description}
        </p>
      )}

      {hasChapters && (
        <div className="mb-4">
          <p
            className="text-uppercase text-muted fw-semibold mb-2"
            style={{ fontSize: 11, letterSpacing: 1 }}
          >
            Chapters
          </p>
          {lesson.chapters.map((chapter, chapterIndex) => {
            const badge = chapterBadge(chapter.state);
            return (
              <div
                key={chapter._id}
                className="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2"
              >
                <div className="overflow-hidden">
                  <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>
                    {chapterIndex + 1}. {chapter.name}
                  </div>
                  {chapter.description && (
                    <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                      {chapter.description}
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span className={`badge ${badge.className}`} style={{ fontSize: 10 }}>
                    {badge.text}
                  </span>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    disabled={chapter.state === "locked"}
                    onClick={() => onOpenChapter(chapter._id)}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
          {!passed && firstOpen && (
            <button
              className="btn btn-primary btn-sm mt-1"
              onClick={() => onOpenChapter(firstOpen._id)}
            >
              {lesson.state === "in_progress" ? "Continue lesson" : "Start lesson"}
            </button>
          )}
        </div>
      )}

      {lesson.hasQuiz && (
        <div className="border rounded p-3 mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div className="fw-semibold" style={{ fontSize: 14 }}>
                Lesson quiz
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {lesson.questionCount} questions
                {lesson.quiz?.attemptCount > 0 &&
                  ` · ${lesson.quiz.attemptCount} attempt${lesson.quiz.attemptCount !== 1 ? "s" : ""} · best ${lesson.quiz.bestPercentage}%`}
              </div>
            </div>
            {quizState === "passed" ? (
              <span className="badge bg-success">Passed</span>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                disabled={quizState !== "available"}
                onClick={onStartQuiz}
              >
                {quizState === "available" ? "Take Quiz" : "Complete all chapters first"}
              </button>
            )}
          </div>
        </div>
      )}

      {!hasChapters && !lesson.hasQuiz && !passed && (
        <button
          className="btn btn-primary"
          disabled={continueLoading}
          onClick={onContinue}
        >
          {continueLoading ? <Spinner size="sm" /> : "Continue"}
        </button>
      )}
    </div>
  );
};

export default LessonView;
