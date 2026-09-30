import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "reactstrap";
import { acknowledgeTraining } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";

const PASS_THRESHOLD = 80;
const MAX_QUESTIONS = 10;

const QuestionaryTest = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const questionary = state?.questionary || [];
  const trainingName = state?.trainingName || "Training";

  const shuffledQuestionary = useMemo(() => {
    const shuffled = [...questionary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_QUESTIONS);
  }, []);

  const buildAnswers = () =>
    shuffledQuestionary.reduce((acc, q) => {
      acc[q._id] = [];
      return acc;
    }, {});

  const [answers, setAnswers] = useState(buildAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [ackLoading, setAckLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!shuffledQuestionary?.length) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div
          className="card border-0 shadow-sm text-center p-5"
          style={{ maxWidth: 380 }}
        >
          <div className="text-secondary mb-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h6 className="fw-bold mb-1">No questions available</h6>
          <p className="text-muted small mb-4">
            This training has no questionnaire attached.
          </p>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (qId, optId, allowMultiple) => {
    setAnswers((prev) => {
      if (allowMultiple) {
        const current = prev[qId] || [];
        return {
          ...prev,
          [qId]: current.includes(optId)
            ? current.filter((o) => o !== optId)
            : [...current, optId],
        };
      }
      return { ...prev, [qId]: [optId] };
    });
  };

  const allAnswered = shuffledQuestionary.every(
    (q) => (answers[q._id] || []).length > 0,
  );

  const calculateResult = () => {
    let correct = 0;
    shuffledQuestionary.forEach((q) => {
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o._id);
      const selected = answers[q._id] || [];
      if (
        correctIds.length === selected.length &&
        correctIds.every((cid) => selected.includes(cid))
      )
        correct++;
    });
    const percentage = Math.round((correct / shuffledQuestionary.length) * 100);
    return {
      correct,
      total: shuffledQuestionary.length,
      percentage,
      passed: percentage >= PASS_THRESHOLD,
    };
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateResult();
      setResult(res);
      setSubmitted(true);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  const handleRetry = () => {
    setAnswers(buildAnswers());
    setSubmitted(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAcknowledge = async () => {
    try {
      setAckLoading(true);
      await acknowledgeTraining(id, result.percentage);
      toast.success("Acknowledged successfully");
      navigate(-2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to acknowledge");
    } finally {
      setAckLoading(false);
    }
  };

  const getOptionState = (q, opt) => {
    if (!submitted) return "idle";
    const userSelected = (answers[q._id] || []).includes(opt._id);
    if (result?.passed) {
      if (opt.isCorrect) return "correct";
      if (userSelected) return "wrong";
      return "idle";
    }
    if (userSelected) return "selected-fail";
    return "idle";
  };

  const isSelected = (qId, optId) => (answers[qId] || []).includes(optId);

  const answeredCount = shuffledQuestionary.filter(
    (q) => (answers[q._id] || []).length > 0,
  ).length;
  const progressPct = Math.round(
    (answeredCount / shuffledQuestionary.length) * 100,
  );

  const isQCorrect = (q) => {
    const sel = answers[q._id] || [];
    const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o._id);
    return (
      correctIds.length === sel.length &&
      correctIds.every((cid) => sel.includes(cid))
    );
  };

  const optionCardClass = (optState, optSel) => {
    const base =
      "d-flex align-items-center gap-2 w-100 text-start rounded-3 p-2 border";
    if (!submitted) {
      return `${base} ${optSel ? "border-primary bg-primary bg-opacity-10" : "border bg-light"}`;
    }
    if (optState === "correct" && optSel)
      return `${base} border-success bg-success bg-opacity-10`;
    if (optState === "correct" && !optSel)
      return `${base} border-success bg-success bg-opacity-10 opacity-50`;
    if (optState === "wrong")
      return `${base} border-danger bg-danger bg-opacity-10`;
    if (optState === "selected-fail")
      return `${base} border-warning bg-warning bg-opacity-10`;
    return `${base} border bg-light`;
  };

  const optionLetterClass = (optState, optSel) => {
    const base =
      "d-flex align-items-center justify-content-center rounded-2 fw-bold flex-shrink-0";
    const size = { width: 26, height: 26, fontSize: 11 };
    if (!submitted && optSel)
      return { className: `${base} bg-primary text-white`, style: size };
    if (submitted && optState === "correct" && optSel)
      return { className: `${base} bg-success text-white`, style: size };
    if (submitted && optState === "wrong")
      return { className: `${base} bg-danger text-white`, style: size };
    if (submitted && optState === "selected-fail")
      return { className: `${base} bg-warning text-white`, style: size };
    return {
      className: `${base} bg-secondary bg-opacity-25 text-secondary`,
      style: size,
    };
  };

  const qCardBorderColor = (unanswered, qCorrect, qIncorrect) => {
    if (unanswered || qIncorrect) return "#f87171";
    if (qCorrect) return "#4ade80";
    return "#dee2e6";
  };

  return (
    <div
      className="d-flex flex-column bg-light"
      style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
    >
      <div className="bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
            onClick={() => navigate(-1)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="overflow-hidden">
            <div className="fw-bold text-truncate" style={{ fontSize: 14 }}>
              {trainingName}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              {shuffledQuestionary.length} question
              {shuffledQuestionary.length !== 1 ? "s" : ""} &nbsp;&middot;&nbsp;
              Pass at {PASS_THRESHOLD}%
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <small className="text-muted fw-semibold">
            {answeredCount}/{shuffledQuestionary.length}
          </small>
          <div
            className="progress flex-shrink-0"
            style={{ width: 110, height: 6 }}
          >
            <div
              className={`progress-bar ${progressPct === 100 ? "bg-success" : "bg-primary"}`}
              style={{
                width: `${progressPct}%`,
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <small
            className={`fw-semibold ${progressPct === 100 ? "text-success" : "text-muted"}`}
          >
            {progressPct}%
          </small>
        </div>
      </div>

      <div className="p-3">
        {shuffledQuestionary.map((q, qIdx) => {
          const sel = answers[q._id] || [];
          const unanswered = submitted && sel.length === 0;
          const qCorrect = submitted && result?.passed && isQCorrect(q);
          const qIncorrect = submitted && sel.length > 0 && !isQCorrect(q);

          return (
            <div
              key={q._id}
              className="card mb-3"
              style={{
                borderLeft: `3px solid ${qCardBorderColor(unanswered, qCorrect, qIncorrect)}`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge bg-primary bg-opacity-10 text-primary fw-bold"
                      style={{ fontSize: 11, letterSpacing: "0.05em" }}
                    >
                      Q{qIdx + 1}
                    </span>
                    {q.allowMultiple && (
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
                      className={`badge ${isQCorrect(q) ? "bg-success" : "bg-danger"}`}
                      style={{ fontSize: 11 }}
                    >
                      {isQCorrect(q) ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>

                <p
                  className="fw-semibold mb-3"
                  style={{ fontSize: 14, color: "#111827", lineHeight: 1.55 }}
                >
                  {q.question}
                </p>

                <div className="row g-2">
                  {q.options.map((opt, oIdx) => {
                    const optState = getOptionState(q, opt);
                    const optSel = isSelected(q._id, opt._id);
                    const { className: letCls, style: letSty } =
                      optionLetterClass(optState, optSel);

                    return (
                      <div key={opt._id} className="col-12">
                        <button
                          type="button"
                          className={optionCardClass(optState, optSel)}
                          style={{
                            cursor: submitted ? "default" : "pointer",
                            transition: "all 0.12s",
                          }}
                          onClick={() =>
                            !submitted &&
                            handleSelect(q._id, opt._id, q.allowMultiple)
                          }
                        >
                          <span className={letCls} style={letSty}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span
                            className="flex-grow-1"
                            style={{
                              fontSize: 13,
                              color: "#1f2937",
                              lineHeight: 1.4,
                            }}
                          >
                            {opt.text}
                          </span>
                          {submitted && optState === "correct" && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#15803d"
                              strokeWidth="2.8"
                              className="flex-shrink-0 ms-auto"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {submitted &&
                            (optState === "wrong" ||
                              optState === "selected-fail") && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#b91c1c"
                                strokeWidth="2.8"
                                className="flex-shrink-0 ms-auto"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {unanswered && (
                  <div
                    className="d-flex align-items-center gap-1 mt-2 text-danger"
                    style={{ fontSize: 12 }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
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
                    : `${shuffledQuestionary.length - answeredCount} question${shuffledQuestionary.length - answeredCount !== 1 ? "s" : ""} remaining`}
                </small>
                <button
                  className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={!allAnswered || loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" color="light" />
                      Calculating...
                    </>
                  ) : (
                    "Submit answers"
                  )}
                </button>
              </>
            ) : result && result.passed ? (
              <>
                <small className="text-muted">
                  You scored{" "}
                  <strong className="text-success">{result.percentage}%</strong>{" "}
                  &mdash; {result.correct} of {result.total} correct
                </small>
                <button
                  className="btn btn-success btn-sm d-flex align-items-center gap-2 px-4"
                  onClick={handleAcknowledge}
                  disabled={ackLoading}
                >
                  {ackLoading ? (
                    <Spinner size="sm" color="light" />
                  ) : (
                    <>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Acknowledge
                    </>
                  )}
                </button>
              </>
            ) : result && !result.passed ? (
              <>
                <small className="text-muted">
                  You scored{" "}
                  <strong className="text-danger">{result.percentage}%</strong>{" "}
                  &mdash; need {PASS_THRESHOLD}% to pass
                </small>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-4"
                  onClick={handleRetry}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                  </svg>
                  Retake test
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionaryTest;
