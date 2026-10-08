import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {
  continueLesson,
  getLearnState,
} from "../../../../helpers/backend_helper";
import {
  findChapter,
  findLesson,
  getAfterLessonStep,
  getErrorMessage,
  viewFromCurrent,
} from "../../Helpers/learnHelpers";
import AcknowledgePanel from "./AcknowledgePanel";
import ChapterView from "./ChapterView";
import LessonSidebar from "./LessonSidebar";
import LessonView from "./LessonView";
import QuizRunner from "./QuizRunner";
import TrainingFileViewer from "./TrainingFileViewer";

const LockedMessage = ({ text }) => (
  <div className="text-center py-5 border rounded text-muted">
    <i className="ri-lock-line fs-3 d-block mb-2" />
    {text}
  </div>
);

const StructuredTraining = ({
  training,
  canAcknowledge,
  activeTab,
  onAcknowledged,
}) => {
  const [learn, setLearn] = useState(null);
  const [view, setView] = useState({ type: "overview" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [continueLoading, setContinueLoading] = useState(false);

  const load = useCallback(
    async (initial) => {
      try {
        const response = await getLearnState(training._id);
        setLearn(response?.data);
        if (initial) setView(viewFromCurrent(response?.data));
        setLoadError(null);
      } catch (error) {
        setLoadError(getErrorMessage(error, "Failed to load training"));
      } finally {
        setLoading(false);
      }
    },
    [training._id],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const handleContinueLesson = async (lessonId) => {
    try {
      setContinueLoading(true);
      const response = await continueLesson(training._id, lessonId);
      const next = response?.data;
      setLearn(next);
      setView(getAfterLessonStep(next, lessonId).target);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not continue"));
    } finally {
      setContinueLoading(false);
    }
  };

  const handleQuizPassed = (result) => {
    if (result?.learn) setLearn(result.learn);
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center text-muted"
        style={{ minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  if (loadError || !learn) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">{loadError || "Failed to load training"}</p>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => {
            setLoading(true);
            load(true);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const acknowledged = !!learn.acknowledged || activeTab === "acknowledged";

  const renderOverview = () => (
    <div>
      {training.description && (
        <p className="text-muted mb-4" style={{ whiteSpace: "pre-wrap" }}>
          {training.description}
        </p>
      )}
      <TrainingFileViewer file={training.files?.[0]} />
      <button
        className="btn btn-primary"
        onClick={() => setView(viewFromCurrent(learn))}
      >
        {acknowledged || learn.status === "completed"
          ? "Review lessons"
          : "Start learning"}
      </button>
    </div>
  );

  const renderContent = () => {
    if (view.type === "overview") return renderOverview();

    if (acknowledged && (view.type === "quiz" || view.type === "finalExam")) {
      return (
        <AcknowledgePanel
          trainingId={training._id}
          acknowledged
          canAcknowledge={canAcknowledge}
          onAcknowledged={onAcknowledged}
        />
      );
    }

    if (view.type === "acknowledge") {
      if (acknowledged || learn.canAcknowledge) {
        return (
          <AcknowledgePanel
            trainingId={training._id}
            acknowledged={acknowledged}
            canAcknowledge={canAcknowledge}
            onAcknowledged={onAcknowledged}
          />
        );
      }
      return (
        <LockedMessage text="Complete all lessons and the final exam to unlock acknowledgement." />
      );
    }

    if (view.type === "finalExam") {
      if (learn.finalExam?.state === "locked") {
        return <LockedMessage text="Pass every lesson to unlock the final exam." />;
      }
      return (
        <QuizRunner
          key="final-exam"
          trainingId={training._id}
          scope="final"
          title="Final Exam"
          questionCount={learn.finalExamQuestionCount}
          passMark={learn.finalExam?.passMark}
          onPassed={handleQuizPassed}
          renderPassActions={() => (
            <button
              className="btn btn-success btn-sm px-4"
              onClick={() => setView({ type: "acknowledge" })}
            >
              Continue to Acknowledgement
            </button>
          )}
        />
      );
    }

    const lesson = findLesson(learn, view.lessonId);
    if (!lesson) return renderOverview();

    if (lesson.state === "locked") {
      return <LockedMessage text="Pass the previous lesson to unlock this one." />;
    }

    const lessonIndex = learn.lessons.findIndex((item) => item._id === lesson._id);

    if (view.type === "quiz") {
      if (lesson.quiz?.state === "locked") {
        return (
          <LockedMessage text="Complete every chapter in this lesson to unlock its quiz." />
        );
      }
      const after = getAfterLessonStep(learn, lesson._id);
      return (
        <QuizRunner
          key={`quiz-${lesson._id}`}
          trainingId={training._id}
          scope="lesson"
          lessonId={lesson._id}
          title={`Lesson ${lessonIndex + 1} Quiz: ${lesson.name}`}
          questionCount={lesson.questionCount}
          passMark={lesson.quiz?.passMark}
          onPassed={handleQuizPassed}
          renderPassActions={() => (
            <button
              className="btn btn-success btn-sm px-4"
              onClick={() => setView(after.target)}
            >
              {after.label}
            </button>
          )}
        />
      );
    }

    if (view.type === "chapter") {
      const chapter = findChapter(lesson, view.chapterId);
      if (!chapter) return renderOverview();
      if (chapter.state === "locked") {
        return (
          <LockedMessage text="Complete the previous chapter to unlock this one." />
        );
      }
      return (
        <ChapterView
          key={chapter._id}
          trainingId={training._id}
          learn={learn}
          lesson={lesson}
          chapter={chapter}
          onLearnChange={setLearn}
          onNavigate={setView}
        />
      );
    }

    return (
      <LessonView
        lesson={lesson}
        index={lessonIndex}
        onOpenChapter={(chapterId) =>
          setView({ type: "chapter", lessonId: lesson._id, chapterId })
        }
        onStartQuiz={() => setView({ type: "quiz", lessonId: lesson._id })}
        onContinue={() => handleContinueLesson(lesson._id)}
        continueLoading={continueLoading}
      />
    );
  };

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <LessonSidebar
          learn={learn}
          view={view}
          acknowledged={acknowledged}
          onSelect={setView}
        />
      </div>
      <div className="col-lg-9">{renderContent()}</div>
    </div>
  );
};

export default StructuredTraining;
