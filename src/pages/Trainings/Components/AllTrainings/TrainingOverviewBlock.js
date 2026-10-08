import React, { useState } from "react";
import { formatBytes, formatDate, getAudienceLabels } from "../../Helpers/adminTrainingHelpers";
import Collapsible from "../UploadTraining/Collapsible";
import QuestionAnswerList from "./QuestionAnswerList";

const Tile = ({ icon, label, value }) => (
  <div className="border rounded p-3 text-center" style={{ background: "#f8fafc", minWidth: 120, flex: "1 1 120px" }}>
    <i className={`${icon} text-primary`} style={{ fontSize: 18 }} />
    <div className="fw-bold" style={{ fontSize: 20 }}>{value}</div>
    <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
  </div>
);

const TrainingOverviewBlock = ({ content, onViewFile }) => {
  const [showExam, setShowExam] = useState(false);
  const { totals, finalExam } = content;
  const examTitle = content.hasLessons ? "Final exam" : "Quiz";

  return (
    <div>
      <div className="border rounded p-3 mb-3">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
          <div>
            <h5 className="fw-bold mb-1">{content.trainingName}</h5>
            <div className="d-flex align-items-center flex-wrap gap-2 text-muted" style={{ fontSize: 12 }}>
              <span>By {content.author?.name || "—"}</span>
              <span>·</span>
              <span>{formatDate(content.createdAt)}</span>
              {content.repeatFrequency && (
                <>
                  <span>·</span>
                  <span>Repeats every {content.repeatFrequency} days</span>
                </>
              )}
              <span>·</span>
              <span>Current cycle {content.cycle}</span>
            </div>
          </div>
          <span className={`badge ${content.status === "active" ? "bg-success" : "bg-secondary"}`}>
            {content.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="d-flex flex-wrap gap-1 mb-3">
          {getAudienceLabels(content).map((label) => (
            <span key={label} className="badge bg-soft-primary text-primary" style={{ fontSize: 11 }}>
              {label}
            </span>
          ))}
        </div>

        {content.description ? (
          <p style={{ whiteSpace: "pre-wrap" }} className="mb-3">
            {content.description}
          </p>
        ) : (
          <p className="text-muted small mb-3">No description.</p>
        )}

        <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
          Training file
        </p>
        {content.files.length === 0 ? (
          <p className="text-muted small mb-0">No file attached.</p>
        ) : (
          content.files.map((file) => (
            <div
              key={file._id}
              className="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2"
              style={{ fontSize: 13 }}
            >
              <span className="d-flex align-items-center gap-2 overflow-hidden">
                <i className="ri-file-line" />
                <span className="text-truncate">{file.originalName}</span>
                <span className="text-muted flex-shrink-0">{formatBytes(file.size)}</span>
              </span>
              <button type="button" className="btn btn-outline-primary btn-sm flex-shrink-0" onClick={() => onViewFile(file)}>
                View file
              </button>
            </div>
          ))
        )}
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Tile icon="ri-book-open-line" label="Lessons" value={totals.lessons} />
        <Tile icon="ri-list-check-2" label="Chapters" value={totals.chapters} />
        <Tile icon="ri-movie-line" label="Audio / video" value={totals.media} />
        <Tile icon="ri-attachment-2" label="Chapter files" value={totals.files} />
        <Tile icon="ri-questionnaire-line" label="Lesson quiz questions" value={totals.lessonQuizQuestions} />
        <Tile icon="ri-award-line" label={`${examTitle} questions`} value={finalExam.questionCount} />
      </div>

      <div className="border rounded">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={showExam}
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ cursor: "pointer", background: showExam ? "#f3e8ff" : "#faf5ff" }}
          onClick={() => setShowExam(!showExam)}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setShowExam(!showExam);
            }
          }}
        >
          <div>
            <span className="fw-semibold">{examTitle}</span>
            <span className="text-muted ms-2" style={{ fontSize: 12 }}>
              {finalExam.questionCount} question{finalExam.questionCount !== 1 ? "s" : ""} · pass at {content.passPercentage}%
            </span>
          </div>
          <span className="text-primary" style={{ fontSize: 12 }}>
            {showExam ? "Hide questions and answers" : "Show questions and answers"}
          </span>
        </div>
        <Collapsible open={showExam}>
          <div className="p-3">
            {!content.hasLessons && finalExam.questionCount > 0 && (
              <p className="text-muted small">
                Learners are shown a random 10 of these questions on each attempt.
              </p>
            )}
            <QuestionAnswerList questions={finalExam.questions} />
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default TrainingOverviewBlock;
