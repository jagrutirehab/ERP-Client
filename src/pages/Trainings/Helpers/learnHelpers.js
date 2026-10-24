export const ALLOWED_RATES = [1, 1.5, 2];
export const MAX_PLAYBACK_RATE = 2;
export const SEEK_TOLERANCE_SEC = 0.75;
export const NATURAL_ADVANCE_FACTOR = 1.25;
export const SKIP_BACK_SEC = 10;

export const shuffle = (list, random = Math.random) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pad = (value) => String(value).padStart(2, "0");

export const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
};

export const normalizeRate = (rate) => (ALLOWED_RATES.includes(rate) ? rate : 1);

export const clampSeekTarget = (target, allowedMax) =>
  Math.max(0, Math.min(target, allowedMax));

export const isForwardSeekBlocked = (target, allowedMax) =>
  target > allowedMax + SEEK_TOLERANCE_SEC;

export const evaluateTimeUpdate = ({
  lastTime,
  currentTime,
  elapsedMs,
  rate,
  allowedMax,
}) => {
  if (currentTime <= allowedMax + SEEK_TOLERANCE_SEC) {
    return { allowedMax: Math.max(allowedMax, currentTime), jumped: false };
  }
  const elapsedSec = Math.max(elapsedMs, 0) / 1000;
  const maxNaturalAdvance =
    elapsedSec * normalizeRate(rate) * NATURAL_ADVANCE_FACTOR +
    SEEK_TOLERANCE_SEC;
  if (currentTime - lastTime > maxNaturalAdvance) {
    return { allowedMax, jumped: true };
  }
  return { allowedMax: Math.max(allowedMax, currentTime), jumped: false };
};

export const getVideoBackupKey = (userId, mediaId) =>
  `training-video-position:${userId}:${mediaId}`;

export const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("authUser");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.data?._id || parsed?.data?.id || parsed?._id || "anonymous";
  } catch {
    return "anonymous";
  }
};

export const readVideoBackup = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.positionSec === "number" ? parsed : null;
  } catch {
    return null;
  }
};

export const writeVideoBackup = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ...value, savedAt: Date.now() }));
  } catch {
    return;
  }
};

export const clearVideoBackup = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
};

export const pickResumePosition = ({
  serverPositionSec = 0,
  backup = null,
  durationSec = 0,
}) => {
  const limit = durationSec > 0 ? Math.max(durationSec - 1, 0) : Infinity;
  if (serverPositionSec > 0) {
    return { positionSec: Math.min(serverPositionSec, limit), source: "server" };
  }
  if (backup && backup.positionSec > 0) {
    return { positionSec: Math.min(backup.positionSec, limit), source: "backup" };
  }
  return { positionSec: 0, source: "none" };
};

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const isNetworkError = (error) => !error?.response;

export const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent || "");

export const findLesson = (learn, lessonId) =>
  learn?.lessons?.find((lesson) => lesson._id === lessonId) || null;

export const findChapter = (lesson, chapterId) =>
  lesson?.chapters?.find((chapter) => chapter._id === chapterId) || null;

export const findMediaInLearn = (learn, mediaId) => {
  for (const lesson of learn?.lessons || []) {
    for (const chapter of lesson.chapters || []) {
      const media = chapter.media?.find((item) => item._id === mediaId);
      if (media) return media;
    }
  }
  return null;
};

export const needsDeclaration = (learn) =>
  !!learn?.declaration?.required && learn.declaration.state !== "completed";

export const getFinalStepTarget = (learn) =>
  needsDeclaration(learn) ? { type: "declaration" } : { type: "acknowledge" };

export const getAfterLessonStep = (learn, lessonId) => {
  const index = learn.lessons.findIndex((lesson) => lesson._id === lessonId);
  const nextLesson = learn.lessons[index + 1];

  if (nextLesson) {
    return {
      target: { type: "lesson", lessonId: nextLesson._id },
      label: `Go to Lesson ${index + 2}`,
    };
  }
  if (learn.hasFinalExam) {
    return { target: { type: "finalExam" }, label: "Take Final Exam" };
  }
  return {
    target: getFinalStepTarget(learn),
    label: needsDeclaration(learn)
      ? "Continue to Declaration"
      : "Continue to Acknowledgement",
  };
};

export const resolveNextStep = (learn, lessonId, chapterId) => {
  const lesson = findLesson(learn, lessonId);
  if (!lesson) return { target: { type: "overview" }, label: "Back to Overview" };

  const chapterIndex = lesson.chapters.findIndex(
    (chapter) => chapter._id === chapterId,
  );
  const nextChapter = lesson.chapters[chapterIndex + 1];

  if (nextChapter) {
    return {
      target: { type: "chapter", lessonId, chapterId: nextChapter._id },
      label: "Go to Next Chapter",
    };
  }
  if (lesson.hasQuiz) {
    return { target: { type: "quiz", lessonId }, label: "Take Lesson Quiz" };
  }
  return getAfterLessonStep(learn, lessonId);
};

export const viewFromCurrent = (learn) => {
  const current = learn?.current;
  if (!current) return { type: "overview" };

  switch (current.stage) {
    case "chapter":
      return current.chapterId
        ? { type: "chapter", lessonId: current.lessonId, chapterId: current.chapterId }
        : { type: "lesson", lessonId: current.lessonId };
    case "lesson_quiz":
      return { type: "quiz", lessonId: current.lessonId };
    case "final_exam":
      return { type: "finalExam" };
    case "completed":
      return getFinalStepTarget(learn);
    default:
      return { type: "overview" };
  }
};

export const getChapterRequirements = (chapter) => {
  const videos = (chapter?.media || []).filter((item) => item.kind === "video");
  const files = chapter?.files || [];
  const videosDone = videos.filter((item) => item.completed).length;
  const filesOpened = files.filter((item) => item.opened).length;

  return {
    videosTotal: videos.length,
    videosDone,
    filesTotal: files.length,
    filesOpened,
    met: videosDone === videos.length && filesOpened === files.length,
  };
};

export const getFirstOpenChapter = (lesson) =>
  lesson?.chapters?.find(
    (chapter) => chapter.state !== "completed" && chapter.state !== "locked",
  ) || null;
