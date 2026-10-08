import React from "react";

const QuestionAnswerList = ({ questions }) => {
  if (!questions?.length) {
    return <p className="text-muted small mb-0">No questions added.</p>;
  }

  return (
    <div>
      {questions.map((question, index) => (
        <div key={question._id} className="border rounded p-3 mb-2" style={{ background: "#fff" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="badge bg-primary bg-opacity-10 text-primary fw-bold"
              style={{ fontSize: 11 }}
            >
              Q{index + 1}
            </span>
            {question.allowMultiple && (
              <span className="badge text-white" style={{ fontSize: 10, background: "#7c3aed" }}>
                Multiple answers
              </span>
            )}
          </div>
          <p className="fw-semibold mb-2" style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
            {question.question}
          </p>
          <div className="d-flex flex-column gap-1">
            {question.options.map((option, optionIndex) => (
              <div
                key={option._id}
                className={`d-flex align-items-center gap-2 rounded px-2 py-1 border ${
                  option.isCorrect
                    ? "border-success bg-success bg-opacity-10"
                    : "bg-light"
                }`}
                style={{ fontSize: 13 }}
              >
                <span
                  className={`d-inline-flex align-items-center justify-content-center rounded fw-bold flex-shrink-0 ${
                    option.isCorrect ? "bg-success text-white" : "bg-secondary bg-opacity-25 text-secondary"
                  }`}
                  style={{ width: 22, height: 22, fontSize: 11 }}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="flex-grow-1">{option.text}</span>
                {option.isCorrect && (
                  <span className="text-success fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                    <i className="ri-check-line" /> Correct answer
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionAnswerList;
