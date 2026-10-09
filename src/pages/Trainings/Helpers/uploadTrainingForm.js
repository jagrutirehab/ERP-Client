import { validateDeclarationFile, hasSignature } from "./declaration";

export const MIN_FINAL_EXAM_QUESTIONS = 20;
export const MIN_LESSON_QUIZ_QUESTIONS = 5;
export const DEFAULT_PASS_PERCENTAGE = 80;

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
export const MAX_AUDIO_SIZE = 150 * 1024 * 1024;
export const MAX_FILE_SIZE = 500 * 1024 * 1024;


export const OUTER_FILE_ACCEPT =
  "image/*, application/pdf, .doc, .docx, .ppt, .pptx";
export const OUTER_FILE_ERROR =
  "Invalid file type! Only Images, PDFs, Word docs and PowerPoint files are allowed.";

export const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
export const AUDIO_EXTENSIONS = ["mp3", "wav", "aac", "m4a", "ogg"];
export const MEDIA_ACCEPT = [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS]
  .map((ext) => `.${ext}`)
  .join(",");

const OUTER_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx"];

export const newId = () => Math.random().toString(36).slice(2, 11);

export const getExtension = (fileName = "") => {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index + 1).toLowerCase();
};

export const formatFileSize = (bytes = 0) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const isAllowedOuterFile = (file) =>
  file.type.startsWith("image/") ||
  OUTER_EXTENSIONS.includes(getExtension(file.name));

export const validateMediaFile = (file) => {
  const extension = getExtension(file.name);

  if (extension === "avi" || extension === "mkv") {
    return {
      ok: false,
      error: `${file.name}: AVI and MKV are not supported. Use MP4, WebM or MOV for video.`,
    };
  }

  if (VIDEO_EXTENSIONS.includes(extension)) {
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        ok: false,
        error: `${file.name}: video must be 500MB or smaller (this one is ${formatFileSize(file.size)}).`,
      };
    }
    return { ok: true, kind: "video" };
  }

  if (AUDIO_EXTENSIONS.includes(extension)) {
    if (file.size > MAX_AUDIO_SIZE) {
      return {
        ok: false,
        error: `${file.name}: audio must be 150MB or smaller (this one is ${formatFileSize(file.size)}).`,
      };
    }
    return { ok: true, kind: "audio" };
  }

  return {
    ok: false,
    error: `${file.name}: unsupported format. Video: MP4, WebM, MOV. Audio: MP3, WAV, AAC, M4A, OGG.`,
  };
};

export const emptyQuestion = () => ({
  id: newId(),
  question: "",
  allowMultiple: false,
  options: [
    { id: newId(), text: "", isCorrect: false },
    { id: newId(), text: "", isCorrect: false },
  ],
});

export const emptyChapter = () => ({
  cid: newId(),
  name: "",
  description: "",
  media: [],
  files: [],
});

export const emptyLesson = () => ({
  cid: newId(),
  name: "",
  description: "",
  questionary: [],
  chapters: [],
});

export const emptyTraining = () => ({
  trainingName: "",
  description: "",
  positions: [],
  repeatFrequency: "",
  file: null,
  declaration: null,
  declarationPlacements: null,
  questionary: [],
  lessons: [],
});

const moveItem = (list, index, direction) => {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const updateLessonById = (state, lessonId, updater) => ({
  ...state,
  lessons: state.lessons.map((lesson) =>
    lesson.cid === lessonId ? updater(lesson) : lesson,
  ),
});

export const trainingReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "TOGGLE_POSITION":
      return {
        ...state,
        positions: state.positions.includes(action.position)
          ? state.positions.filter((position) => position !== action.position)
          : [...state.positions, action.position],
      };

    case "SET_POSITIONS":
      return { ...state, positions: action.positions };

    case "SET_FILE":
      return { ...state, file: action.file };

    case "SET_QUESTIONARY":
      return { ...state, questionary: action.questionary };

    case "ADD_LESSON":
      return { ...state, lessons: [...state.lessons, emptyLesson()] };

    case "REMOVE_LESSON":
      return {
        ...state,
        lessons: state.lessons.filter((lesson) => lesson.cid !== action.lessonId),
      };

    case "MOVE_LESSON": {
      const index = state.lessons.findIndex(
        (lesson) => lesson.cid === action.lessonId,
      );
      return {
        ...state,
        lessons: moveItem(state.lessons, index, action.direction),
      };
    }

    case "UPDATE_LESSON":
      return updateLessonById(state, action.lessonId, (lesson) => ({
        ...lesson,
        ...action.patch,
      }));

    case "ADD_CHAPTER":
      return updateLessonById(state, action.lessonId, (lesson) => ({
        ...lesson,
        chapters: [...lesson.chapters, emptyChapter()],
      }));

    case "REMOVE_CHAPTER":
      return updateLessonById(state, action.lessonId, (lesson) => ({
        ...lesson,
        chapters: lesson.chapters.filter(
          (chapter) => chapter.cid !== action.chapterId,
        ),
      }));

    case "MOVE_CHAPTER":
      return updateLessonById(state, action.lessonId, (lesson) => {
        const index = lesson.chapters.findIndex(
          (chapter) => chapter.cid === action.chapterId,
        );
        return {
          ...lesson,
          chapters: moveItem(lesson.chapters, index, action.direction),
        };
      });

    case "UPDATE_CHAPTER":
      return updateLessonById(state, action.lessonId, (lesson) => ({
        ...lesson,
        chapters: lesson.chapters.map((chapter) =>
          chapter.cid === action.chapterId
            ? { ...chapter, ...action.patch }
            : chapter,
        ),
      }));

    case "RESET":
      return emptyTraining();

    default:
      return state;
  }
};

export const isQuestionValid = (question) =>
  question.question.trim() !== "" &&
  question.options.length >= 2 &&
  question.options.every((option) => option.text.trim() !== "") &&
  question.options.some((option) => option.isCorrect);

export const isQuestionaryValid = (questionary, minQuestions) => {
  if (questionary.length === 0) return true;
  if (questionary.length < minQuestions) return false;
  return questionary.every(isQuestionValid);
};

export const getChapterErrors = (chapter) => ({
  name: chapter.name.trim() === "",
});

export const getLessonErrors = (lesson) => {
  const invalidChapters = lesson.chapters.filter(
    (chapter) => getChapterErrors(chapter).name,
  ).length;
  const name = lesson.name.trim() === "";
  const quiz = !isQuestionaryValid(
    lesson.questionary,
    MIN_LESSON_QUIZ_QUESTIONS,
  );

  return { name, quiz, invalidChapters, any: name || quiz || invalidChapters > 0 };
};

export const isTrainingValid = (training) =>
  training.trainingName.trim() !== "" &&
  training.positions.length > 0 &&
  training.file !== null &&
  validateDeclarationFile(training.declaration) === null &&
  (!training.declaration || hasSignature(training.declarationPlacements)) &&
  isQuestionaryValid(training.questionary, MIN_FINAL_EXAM_QUESTIONS) &&
  training.lessons.every((lesson) => !getLessonErrors(lesson).any);

const serializeQuestionary = (questionary) =>
  questionary.map((question) => ({
    question: question.question,
    allowMultiple: question.allowMultiple,
    options: question.options.map((option) => ({
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  }));

const serializeLessons = (lessons) =>
  lessons.map((lesson) => ({
    name: lesson.name.trim(),
    description: lesson.description.trim(),
    passPercentage: DEFAULT_PASS_PERCENTAGE,
    questionary: serializeQuestionary(lesson.questionary),
    chapters: lesson.chapters.map((chapter) => ({
      name: chapter.name.trim(),
      description: chapter.description.trim(),
    })),
  }));

export const buildTrainingFormData = (training) => {
  const formData = new FormData();

  formData.append("trainings[0][trainingName]", training.trainingName.trim());
  formData.append("trainings[0][positions]", JSON.stringify(training.positions));
  formData.append(
    "trainings[0][repeatFrequency]",
    training.repeatFrequency || "",
  );

  if (training.description.trim() !== "") {
    formData.append("trainings[0][description]", training.description.trim());
  }

  if (training.questionary.length > 0) {
    formData.append(
      "trainings[0][questionary]",
      JSON.stringify(serializeQuestionary(training.questionary)),
    );
  }

  if (training.lessons.length > 0) {
    formData.append(
      "trainings[0][lessons]",
      JSON.stringify(serializeLessons(training.lessons)),
    );
  }

  formData.append("file_0", training.file);

  if (training.declaration) {
    formData.append("declaration_0", training.declaration);
    formData.append("trainings[0][declarationPlacements]", JSON.stringify(training.declarationPlacements));
  }

  return formData;
};

export const countSelectedFiles = (training) =>
  training.lessons.reduce(
    (total, lesson) =>
      total +
      lesson.chapters.reduce(
        (sum, chapter) => sum + chapter.media.length + chapter.files.length,
        0,
      ),
    0,
  );

export const collectUploads = (training, created) => {
  const uploads = [];

  training.lessons.forEach((lesson, lessonIndex) => {
    lesson.chapters.forEach((chapter, chapterIndex) => {
      const chapterId = created?.lessons?.[lessonIndex]?.chapters?.[chapterIndex]?._id;
      if (!chapterId) return;

      const base = {
        trainingId: created._id,
        chapterId,
        trainingName: training.trainingName.trim(),
      };

      chapter.media.forEach((item) =>
        uploads.push({
          ...base,
          file: item.file,
          kind: item.kind,
          durationSec: item.durationSec,
        }),
      );
      chapter.files.forEach((item) =>
        uploads.push({ ...base, file: item.file, kind: "file" }),
      );
    });
  });

  return uploads;
};
