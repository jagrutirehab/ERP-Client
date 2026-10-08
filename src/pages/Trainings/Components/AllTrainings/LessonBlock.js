import React, { useState } from "react";
import Collapsible from "../UploadTraining/Collapsible";
import AttachmentRow from "./AttachmentRow";
import QuestionAnswerList from "./QuestionAnswerList";

const SectionLabel = ({ children }) => (
  <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
    {children}
  </p>
);

const ChapterCard = ({ chapter, index, onPlayMedia, onViewFile }) => {
  const empty = chapter.media.length === 0 && chapter.files.length === 0;

  return (
    <div className="border rounded p-3 mb-2" style={{ borderLeft: "3px solid #22c55e", background: "#fff" }}>
      <div className="d-flex align-items-center gap-2 mb-1">
        <span className="fw-semibold" style={{ fontSize: 14 }}>
          Chapter {index + 1}: {chapter.name}
        </span>
        {chapter.media.length > 0 && (
          <span className="badge bg-soft-info text-info" style={{ fontSize: 10 }}>
            {chapter.media.length} media
          </span>
        )}
        {chapter.files.length > 0 && (
          <span className="badge bg-soft-success text-success" style={{ fontSize: 10 }}>
            {chapter.files.length} file{chapter.files.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {chapter.description && (
        <p className="text-muted mb-2" style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>
          {chapter.description}
        </p>
      )}
      {empty ? (
        <p className="text-muted small mb-0">No attachments in this chapter.</p>
      ) : (
        <>
          {chapter.media.map((item) => (
            <AttachmentRow key={item._id} item={item} kind={item.kind} onPlay={onPlayMedia} />
          ))}
          {chapter.files.map((item) => (
            <AttachmentRow key={item._id} item={item} kind="file" onView={onViewFile} />
          ))}
        </>
      )}
    </div>
  );
};

const LessonBlock = ({ lesson, index, open, onToggle, onPlayMedia, onViewFile }) => {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="border rounded mb-3" style={{ borderLeft: "4px solid #3b82f6" }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ cursor: "pointer", background: open ? "#dbeafe" : "#eff6ff", transition: "background 250ms ease" }}
        onClick={() => onToggle(lesson._id)}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onToggle(lesson._id);
          }
        }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <span className="fw-semibold">Lesson {index + 1}</span>
          <span className="text-muted text-truncate">{lesson.name}</span>
          <span className="badge bg-soft-primary text-primary flex-shrink-0" style={{ fontSize: 10 }}>
            {lesson.chapters.length} chapter{lesson.chapters.length !== 1 ? "s" : ""}
          </span>
          <span className="badge bg-soft-secondary text-secondary flex-shrink-0" style={{ fontSize: 10 }}>
            {lesson.questionCount > 0 ? `${lesson.questionCount} quiz questions` : "no quiz"}
          </span>
        </div>
      </div>

      <Collapsible open={open}>
        <div className="p-3">
          {lesson.description ? (
            <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>{lesson.description}</p>
          ) : (
            <p className="text-muted small mb-3">No lesson description.</p>
          )}

          <SectionLabel>Chapters in Lesson {index + 1}</SectionLabel>
          {lesson.chapters.length === 0 ? (
            <p className="text-muted small">This lesson has no chapters.</p>
          ) : (
            <div style={{ borderLeft: "2px solid #bfdbfe", paddingLeft: 12, marginLeft: 6 }}>
              {lesson.chapters.map((chapter, chapterIndex) => (
                <ChapterCard
                  key={chapter._id}
                  chapter={chapter}
                  index={chapterIndex}
                  onPlayMedia={onPlayMedia}
                  onViewFile={onViewFile}
                />
              ))}
            </div>
          )}

          <div className="border rounded mt-3" style={{ background: "#f8fafc" }}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={showQuiz}
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ cursor: "pointer" }}
              onClick={() => lesson.questionCount > 0 && setShowQuiz(!showQuiz)}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  if (lesson.questionCount > 0) setShowQuiz(!showQuiz);
                }
              }}
            >
              <div>
                <span className="fw-semibold">Lesson {index + 1} Quiz</span>
                <span className="text-muted ms-2" style={{ fontSize: 12 }}>
                  {lesson.questionCount > 0
                    ? `${lesson.questionCount} questions · pass at ${lesson.passPercentage}%`
                    : "No quiz for this lesson"}
                </span>
              </div>
              {lesson.questionCount > 0 && (
                <span className="text-primary" style={{ fontSize: 12 }}>
                  {showQuiz ? "Hide questions and answers" : "Show questions and answers"}
                </span>
              )}
            </div>
            <Collapsible open={showQuiz}>
              <div className="p-3">
                <QuestionAnswerList questions={lesson.questionary} />
              </div>
            </Collapsible>
          </div>
        </div>
      </Collapsible>
    </div>
  );
};

export default LessonBlock;
