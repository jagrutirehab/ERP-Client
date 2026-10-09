import React from "react";

const StateIcon = ({ state }) => {
  if (state === "locked") return <i className="ri-lock-line text-muted" />;
  if (state === "passed" || state === "completed") {
    return <i className="ri-checkbox-circle-fill text-success" />;
  }
  if (state === "in_progress") {
    return <i className="ri-play-circle-line text-primary" />;
  }
  return <i className="ri-checkbox-blank-circle-line text-muted" />;
};

const SidebarItem = ({ label, state, active, indent, disabled, title, onClick }) => {
  const locked = state === "locked" || !!disabled;
  return (
    <button
      type="button"
      title={title}
      disabled={locked}
      onClick={onClick}
      className={`d-flex align-items-center gap-2 w-100 text-start border-0 rounded px-2 py-1 ${
        active ? "bg-primary bg-opacity-10 text-primary fw-semibold" : "bg-transparent"
      }`}
      style={{
        paddingLeft: indent ? 28 : undefined,
        fontSize: 13,
        opacity: locked ? 0.55 : 1,
        cursor: locked ? "not-allowed" : "pointer",
      }}
    >
      <StateIcon state={state} />
      <span className="text-truncate">{label}</span>
    </button>
  );
};

const LessonSidebar = ({ learn, view, acknowledged, onSelect }) => {
  const acknowledgeState = acknowledged
    ? "completed"
    : learn.canAcknowledge
      ? "available"
      : "locked";

  return (
    <div className="border rounded p-2" style={{ background: "#f8fafc" }}>
      <SidebarItem
        label="Overview"
        state="available"
        active={view.type === "overview"}
        onClick={() => onSelect({ type: "overview" })}
      />

      {learn.lessons.map((lesson, lessonIndex) => (
        <div key={lesson._id} className="mt-2">
          <SidebarItem
            label={`Lesson ${lessonIndex + 1}: ${lesson.name}`}
            state={lesson.state}
            active={view.type === "lesson" && view.lessonId === lesson._id}
            onClick={() => onSelect({ type: "lesson", lessonId: lesson._id })}
          />
          {lesson.chapters.map((chapter, chapterIndex) => (
            <SidebarItem
              key={chapter._id}
              label={`${chapterIndex + 1}. ${chapter.name}`}
              state={lesson.state === "locked" ? "locked" : chapter.state}
              indent
              active={view.type === "chapter" && view.chapterId === chapter._id}
              onClick={() =>
                onSelect({
                  type: "chapter",
                  lessonId: lesson._id,
                  chapterId: chapter._id,
                })
              }
            />
          ))}
          {lesson.hasQuiz && (
            <SidebarItem
              label="Lesson quiz"
              state={lesson.state === "locked" ? "locked" : lesson.quiz?.state}
              indent
              disabled={acknowledged}
              title={acknowledged ? "Completed" : undefined}
              active={view.type === "quiz" && view.lessonId === lesson._id}
              onClick={() => onSelect({ type: "quiz", lessonId: lesson._id })}
            />
          )}
        </div>
      ))}

      {learn.hasFinalExam && (
        <div className="mt-2">
          <SidebarItem
            label="Final exam"
            state={learn.finalExam?.state}
            disabled={acknowledged}
            title={acknowledged ? "Completed" : undefined}
            active={view.type === "finalExam"}
            onClick={() => onSelect({ type: "finalExam" })}
          />
        </div>
      )}

      {learn.declaration?.required && (
        <div className="mt-2">
          <SidebarItem
            label="Declaration"
            state={
              acknowledged || learn.declaration.state === "completed"
                ? "completed"
                : learn.declaration.state === "locked"
                  ? "locked"
                  : "available"
            }
            active={view.type === "declaration"}
            onClick={() => onSelect({ type: "declaration" })}
          />
        </div>
      )}

      <div className="mt-2">
        <SidebarItem
          label="Acknowledgement"
          state={acknowledgeState}
          active={view.type === "acknowledge"}
          onClick={() => onSelect({ type: "acknowledge" })}
        />
      </div>
    </div>
  );
};

export default LessonSidebar;
