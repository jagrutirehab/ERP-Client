import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {
  startQuizAttempt,
  submitQuizAttempt,
} from "../../../../helpers/backend_helper";
import { getErrorMessage, shuffle } from "../../Helpers/learnHelpers";

const buildAnswers = (questions) =>
  questions.reduce((acc, question) => {
    acc[question._id] = [];
    return acc;
  }, {});

const sameSet = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

const optionCardClass = (state, selected, submitted) => {
  const base = "d-flex align-items-center gap-2 w-100 text-start rounded-3 p-2 border";
  if (!submitted) {
    return `${base} ${selected ? "border-primary bg-primary bg-opacity-10" : "border bg-light"}`;
  }
  if (state === "correct" && selected) return `${base} border-success bg-success bg-opacity-10`;
  if (state === "correct") return `${base} border-success bg-success bg-opacity-10 opacity-50`;
  if (state === "wrong") return `${base} border-danger bg-danger bg-opacity-10`;
  if (state === "selected-fail") return `${base} border-warning bg-warning bg-opacity-10`;
  return `${base} border bg-light`;
};

const optionLetterClass = (state, selected, submitted) => {
  const base =
    "d-flex align-items-center justify-content-center rounded-2 fw-bold flex-shrink-0";
  if (!submitted && selected) return `${base} bg-primary text-white`;
  if (submitted && state === "correct" && selected) return `${base} bg-success text-white`;
  if (submitted && state === "wrong") return `${base} bg-danger text-white`;
  if (submitted && state === "selected-fail") return `${base} bg-warning text-white`;
  return `${base} bg-secondary bg-opacity-25 text-secondary`;
};

const QuizRunner = ({
  trainingId,
  scope,
  lessonId,
  title,
  questionCount,
  passMark,
  onPassed,
  renderPassActions,
  onBack,
}) => {
  const [phase, setPhase] = useState("intro");
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitted = phase === "result";
  const questions = attempt?.questions || [];
  const effectivePassMark = result?.passMark ?? attempt?.passMark ?? passMark ?? 80;
  const correctAnswers = result?.passed ? result.correctAnswers || {} : null;

  const handleStart = async () => {
    try {
      setStarting(true);
      const response = await startQuizAttempt(trainingId, {
        scope,
        ...(lessonId ? { lessonId } : {}),
      });
      const data = response?.data;
      setAttempt({
        attemptId: data.attemptId,
        passMark: data.passMark,
        questions: shuffle(data.questions),
      });
      setAnswers(buildAnswers(data.questions));
      setResult(null);
      setPhase("active");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not start the quiz"));
    } finally {
      setStarting(false);
    }
  };

  const handleSelect = (questionId, optionId, allowMultiple) => {
    setAnswers((prev) => {
      if (allowMultiple) {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await submitQuizAttempt(trainingId, {
        attemptId: attempt.attemptId,
        answers,
      });
      const data = response?.data;
      setResult(data);
      setPhase("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (data?.passed && onPassed) onPassed(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not submit the quiz"));
      const status = error?.response?.status;
      if (status >= 400 && status < 500) {
        setAttempt(null);
        setPhase("intro");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter(
    (question) => (answers[question._id] || []).length > 0,
  ).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const progressPct = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const getOptionState = (question, option) => {
    if (!submitted) return "idle";
    const selected = (answers[question._id] || []).includes(option._id);
    if (result?.passed) {
      const correctIds = correctAnswers[question._id] || [];
      if (correctIds.includes(option._id)) return "correct";
      if (selected) return "wrong";
      return "idle";
    }
    return selected ? "selected-fail" : "idle";
  };

  const isQuestionCorrect = (question) => {
    if (!correctAnswers) return false;
    return sameSet(answers[question._id] || [], correctAnswers[question._id] || []);
  };

  const header = (
    <div className="bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div className="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        {onBack && (
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
            onClick={onBack}
          >
            <i className="ri-arrow-left-s-line" />
            Back
          </button>
        )}
        <div className="overflow-hidden">
          <div className="fw-bold text-truncate" style={{ fontSize: 14 }}>
            {title}
          </div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {questions.length || questionCount || 0} question
            {(questions.length || questionCount) !== 1 ? "s" : ""} &nbsp;&middot;&nbsp;
            Pass at {effectivePassMark}%
          </div>
        </div>
      </div>
      {phase === "active" && (
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <small className="text-muted fw-semibold">
            {answeredCount}/{questions.length}
          </small>
          <div className="progress flex-shrink-0" style={{ width: 110, height: 6 }}>
            <div
              className={`progress-bar ${progressPct === 100 ? "bg-success" : "bg-primary"}`}
              style={{ width: `${progressPct}%`, transition: "width 0.2s ease" }}
            />
          </div>
          <small className={`fw-semibold ${progressPct === 100 ? "text-success" : "text-muted"}`}>
            {progressPct}%
          </small>
        </div>
      )}
    </div>
  );

  if (phase === "intro") {
    return (
      <div className="d-flex flex-column bg-light" style={{ flex: 1, minHeight: 0 }}>
        {header}
        <div className="p-4 text-center">
          <div className="card border-0 shadow-sm mx-auto p-4" style={{ maxWidth: 420 }}>
            <h6 className="fw-bold mb-2">Ready to begin?</h6>
            <p className="text-muted small mb-4">
              {questionCount ? `${questionCount} questions. ` : ""}
              You need {effectivePassMark}% to pass. You can retry as many times
              as you need.
            </p>
            <button
              className="btn btn-primary"
              disabled={starting}
              onClick={handleStart}
            >
              {starting ? <Spinner size="sm" color="light" /> : "Start"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column bg-light"
      style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
    >
      {header}

      <div className="p-3">
        {questions.map((question, questionIndex) => {
          const selectedIds = answers[question._id] || [];
          const unanswered = submitted && selectedIds.length === 0;
          const correct = submitted && result?.passed && isQuestionCorrect(question);
          const incorrect =
            submitted && selectedIds.length > 0 && result?.passed && !isQuestionCorrect(question);
          const borderColor =
            unanswered || incorrect ? "#f87171" : correct ? "#4ade80" : "#dee2e6";

          return (
            <div
              key={question._id}
              className="card mb-3"
              style={{ borderLeft: `3px solid ${borderColor}` }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge bg-primary bg-opacity-10 text-primary fw-bold"
                      style={{ fontSize: 11, letterSpacing: "0.05em" }}
                    >
                      Q{questionIndex + 1}
                    </span>
                    {question.allowMultiple && (
                      <span
                        className="badge text-white"
                        style={{ fontSize: 11, background: "#7c3aed" }}
                      >
                        Multiple answers
                      </span>
                    )}
                  </div>
                  {submitted && result?.passed && (
                    <span
                      className={`badge ${correct ? "bg-success" : "bg-danger"}`}
                      style={{ fontSize: 11 }}
                    >
                      {correct ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>

                <p
                  className="fw-semibold mb-3"
                  style={{ fontSize: 14, color: "#111827", lineHeight: 1.55 }}
                >
                  {question.question}
                </p>

                <div className="row g-2">
                  {question.options.map((option, optionIndex) => {
                    const state = getOptionState(question, option);
                    const selected = selectedIds.includes(option._id);

                    return (
                      <div key={option._id} className="col-12">
                        <button
                          type="button"
                          className={optionCardClass(state, selected, submitted)}
                          style={{
                            cursor: submitted ? "default" : "pointer",
                            transition: "all 0.12s",
                          }}
                          onClick={() =>
                            !submitted &&
                            handleSelect(question._id, option._id, question.allowMultiple)
                          }
                        >
                          <span
                            className={optionLetterClass(state, selected, submitted)}
                            style={{ width: 26, height: 26, fontSize: 11 }}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span
                            className="flex-grow-1"
                            style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.4 }}
                          >
                            {option.text}
                          </span>
                          {submitted && state === "correct" && (
                            <i className="ri-check-line text-success ms-auto" />
                          )}
                          {submitted && (state === "wrong" || state === "selected-fail") && (
                            <i className="ri-close-line text-danger ms-auto" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {unanswered && (
                  <div className="mt-2 text-danger" style={{ fontSize: 12 }}>
                    This question was not answered
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="card border-0 bg-white shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3 p-3">
            {!submitted ? (
              <>
                <small className="text-muted">
                  {allAnswered
                    ? "All questions answered — ready to submit"
                    : `${questions.length - answeredCount} question${questions.length - answeredCount !== 1 ? "s" : ""} remaining`}
                </small>
                <button
                  className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" color="light" />
                      Calculating...
                    </>
                  ) : (
                    "Submit answers"
                  )}
                </button>
              </>
            ) : result?.passed ? (
              <>
                <small className="text-muted">
                  You scored <strong className="text-success">{result.percentage}%</strong>
                  {result.correct !== undefined && result.total !== undefined
                    ? ` — ${result.correct} of ${result.total} correct`
                    : ""}
                </small>
                {renderPassActions && renderPassActions(result)}
              </>
            ) : (
              <>
                <small className="text-muted">
                  You scored <strong className="text-danger">{result?.percentage}%</strong>{" "}
                  &mdash; need {effectivePassMark}% to pass
                </small>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-4"
                  disabled={starting}
                  onClick={handleStart}
                >
                  {starting ? <Spinner size="sm" /> : "Retake test"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizRunner;
