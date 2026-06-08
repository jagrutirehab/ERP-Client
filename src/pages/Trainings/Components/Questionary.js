import React from "react";

const generateId = () => Math.random().toString(36).slice(2, 9);

const emptyOption = () => ({ id: generateId(), text: "", isCorrect: false });
const emptyQuestion = () => ({
  id: generateId(),
  question: "",
  allowMultiple: false,
  options: [emptyOption(), emptyOption()],
});

const Questionary = ({ questionary, onChange, isSubmitted }) => {
  const addQuestion = () => {
    onChange([...questionary, emptyQuestion()]);
  };

  const removeQuestion = (qId) => {
    onChange(questionary.filter((q) => q.id !== qId));
  };

  const updateQuestion = (qId, field, value) => {
    onChange(
      questionary.map((q) => {
        if (q.id !== qId) return q;
        if (field === "allowMultiple" && !value) {
          const firstCorrect = q.options.findIndex((o) => o.isCorrect);
          const resetOptions = q.options.map((o, i) => ({
            ...o,
            isCorrect: i === firstCorrect ? o.isCorrect : false,
          }));
          return { ...q, allowMultiple: false, options: resetOptions };
        }
        return { ...q, [field]: value };
      }),
    );
  };

  const addOption = (qId) => {
    onChange(
      questionary.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, emptyOption()] } : q,
      ),
    );
  };

  const removeOption = (qId, oId) => {
    onChange(
      questionary.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.filter((o) => o.id !== oId) }
          : q,
      ),
    );
  };

  const updateOption = (qId, oId, field, value) => {
    onChange(
      questionary.map((q) => {
        if (q.id !== qId) return q;
        const updatedOptions = q.options.map((o) => {
          if (o.id !== oId) return o;
          return { ...o, [field]: value };
        });
        if (field === "isCorrect" && value && !q.allowMultiple) {
          return {
            ...q,
            options: updatedOptions.map((o) => ({
              ...o,
              isCorrect: o.id === oId,
            })),
          };
        }
        return { ...q, options: updatedOptions };
      }),
    );
  };

  const getQuestionError = (q) => {
    if (!isSubmitted) return null;
    if (!q.question.trim()) return "Question text is required";
    if (q.options.length < 2) return "At least 2 options are required";
    if (q.options.some((o) => !o.text.trim()))
      return "All option texts are required";
    if (!q.options.some((o) => o.isCorrect))
      return "Mark at least one correct answer";
    return null;
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.sectionHeader}>
        <div>
          <p style={styles.sectionTitle}>Questionnaire</p>
          <p style={styles.sectionSub}>
            Minimum 10 questions required &nbsp;&middot;&nbsp;{" "}
            {questionary.length}/10 added
            {questionary.length >= 10 && " ✓"}
          </p>
        </div>
        <button type="button" style={styles.addQBtn} onClick={addQuestion}>
          + Add Question
        </button>
      </div>

      {questionary.length === 0 && (
        <div style={styles.emptyState}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--color-text-tertiary)", marginBottom: 8 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={styles.emptyText}>
            No questions yet. Click "Add Question" to begin.
          </p>
        </div>
      )}

      {questionary.map((q, qIdx) => {
        const error = getQuestionError(q);
        return (
          <div
            key={q.id}
            style={{
              ...styles.questionCard,
              ...(error ? styles.questionCardError : {}),
            }}
          >
            <div style={styles.questionHeader}>
              <span style={styles.questionBadge}>Q{qIdx + 1}</span>
              <button
                type="button"
                style={{ ...styles.removeBtn, opacity: questionary.length <= 10 ? 0.3 : 1, cursor: questionary.length <= 10 ? 'not-allowed' : 'pointer' }}
                onClick={() => questionary.length > 10 && removeQuestion(q.id)}
                title="Remove question"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              style={{
                ...styles.questionInput,
                ...(isSubmitted && !q.question.trim() ? styles.inputError : {}),
              }}
              placeholder="Enter your question..."
              value={q.question}
              onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
            />

            <div style={styles.multipleToggleRow}>
              <label style={styles.toggleLabel}>
                <div
                  style={{
                    ...styles.toggle,
                    ...(q.allowMultiple ? styles.toggleOn : styles.toggleOff),
                  }}
                  onClick={() =>
                    updateQuestion(q.id, "allowMultiple", !q.allowMultiple)
                  }
                  role="switch"
                  aria-checked={q.allowMultiple}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === " " &&
                    updateQuestion(q.id, "allowMultiple", !q.allowMultiple)
                  }
                >
                  <div
                    style={{
                      ...styles.toggleThumb,
                      ...(q.allowMultiple ? styles.toggleThumbOn : {}),
                    }}
                  />
                </div>
                <span style={styles.toggleText}>
                  Multiple correct answers
                  <span style={styles.toggleHint}>
                    {q.allowMultiple
                      ? "(Checkbox — select all that apply)"
                      : "(Radio — one answer only)"}
                  </span>
                </span>
              </label>
            </div>

            <div style={styles.optionsList}>
              {q.options.map((opt, oIdx) => (
                <div key={opt.id} style={styles.optionRow}>
                  <div style={styles.optionIndex}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>

                  <input
                    type="text"
                    style={{
                      ...styles.optionInput,
                      ...(isSubmitted && !opt.text.trim()
                        ? styles.inputError
                        : {}),
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    value={opt.text}
                    onChange={(e) =>
                      updateOption(q.id, opt.id, "text", e.target.value)
                    }
                  />

                  <label
                    style={styles.correctLabel}
                    title={
                      q.allowMultiple
                        ? "Mark as correct"
                        : "Mark as correct answer"
                    }
                  >
                    <input
                      type={q.allowMultiple ? "checkbox" : "radio"}
                      name={`correct-${q.id}`}
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        updateOption(
                          q.id,
                          opt.id,
                          "isCorrect",
                          e.target.checked,
                        )
                      }
                      style={styles.hiddenInput}
                    />
                    <div
                      style={{
                        ...styles.correctIndicator,
                        ...(opt.isCorrect ? styles.correctIndicatorActive : {}),
                      }}
                    >
                      {opt.isCorrect && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.correctText,
                        ...(opt.isCorrect ? styles.correctTextActive : {}),
                      }}
                    >
                      Correct
                    </span>
                  </label>

                  {q.options.length > 2 && (
                    <button
                      type="button"
                      style={styles.removeOptBtn}
                      onClick={() => removeOption(q.id, opt.id)}
                      title="Remove option"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {q.options.length < 6 && (
              <button
                type="button"
                style={styles.addOptBtn}
                onClick={() => addOption(q.id)}
              >
                + Add Option
              </button>
            )}

            {error && <p style={styles.errorText}>{error}</p>}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#212529",
    margin: 0,
  },
  sectionSub: {
    fontSize: 12,
    color: "#6c757d",
    margin: "2px 0 0",
  },
  addQBtn: {
    fontSize: 13,
    fontWeight: 500,
    color: "#0d6efd",
    background: "transparent",
    border: "1px dashed #0d6efd",
    borderRadius: 6,
    padding: "5px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.15s",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    border: "1.5px dashed #dee2e6",
    borderRadius: 8,
    background: "#f8f9fa",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6c757d",
    margin: 0,
  },
  questionCard: {
    background: "#ffffff",
    border: "1px solid #dee2e6",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 12,
    transition: "border-color 0.2s",
  },
  questionCardError: {
    borderColor: "#dc3545",
    background: "#fffafa",
  },
  questionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  questionBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0d6efd",
    background: "#e7f1ff",
    borderRadius: 4,
    padding: "2px 8px",
    letterSpacing: "0.04em",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#adb5bd",
    display: "flex",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
    transition: "color 0.15s",
    lineHeight: 1,
  },
  questionInput: {
    width: "100%",
    fontSize: 14,
    fontWeight: 500,
    color: "#212529",
    border: "1px solid #ced4da",
    borderRadius: 6,
    padding: "8px 12px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  multipleToggleRow: {
    marginBottom: 12,
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    position: "relative",
    flexShrink: 0,
    cursor: "pointer",
    transition: "background 0.2s",
    outline: "none",
  },
  toggleOn: {
    background: "#0d6efd",
  },
  toggleOff: {
    background: "#ced4da",
  },
  toggleThumb: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  },
  toggleThumbOn: {
    transform: "translateX(16px)",
  },
  toggleText: {
    fontSize: 13,
    color: "#495057",
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  toggleHint: {
    color: "#6c757d",
    fontSize: 12,
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 10,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  optionIndex: {
    width: 24,
    height: 24,
    borderRadius: 4,
    background: "#f1f3f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#6c757d",
    flexShrink: 0,
  },
  optionInput: {
    flex: 1,
    fontSize: 13,
    color: "#212529",
    border: "1px solid #ced4da",
    borderRadius: 6,
    padding: "6px 10px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  correctLabel: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    cursor: "pointer",
    userSelect: "none",
    flexShrink: 0,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  correctIndicator: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "1.5px solid #ced4da",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  correctIndicatorActive: {
    background: "#198754",
    borderColor: "#198754",
    color: "#fff",
  },
  correctText: {
    fontSize: 12,
    color: "#adb5bd",
    transition: "color 0.15s",
  },
  correctTextActive: {
    color: "#198754",
    fontWeight: 600,
  },
  removeOptBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#adb5bd",
    display: "flex",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
    flexShrink: 0,
    lineHeight: 1,
    transition: "color 0.15s",
  },
  addOptBtn: {
    fontSize: 12,
    fontWeight: 500,
    color: "#6c757d",
    background: "transparent",
    border: "1px dashed #ced4da",
    borderRadius: 5,
    padding: "4px 10px",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
  errorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 8,
    marginBottom: 0,
  },
};

export default Questionary;
