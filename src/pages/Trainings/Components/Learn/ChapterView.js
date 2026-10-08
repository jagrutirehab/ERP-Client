import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { completeChapter } from "../../../../helpers/backend_helper";
import {
  getChapterRequirements,
  getErrorMessage,
  resolveNextStep,
} from "../../Helpers/learnHelpers";
import AudioPlayer from "./AudioPlayer";
import ChapterFiles from "./ChapterFiles";
import VideoPlayer from "./VideoPlayer";

const Requirement = ({ done, text }) => (
  <div className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
    <i
      className={
        done
          ? "ri-checkbox-circle-fill text-success"
          : "ri-checkbox-blank-circle-line text-muted"
      }
    />
    <span className={done ? "text-success" : "text-muted"}>{text}</span>
  </div>
);

const ChapterView = ({
  trainingId,
  learn,
  lesson,
  chapter,
  onLearnChange,
  onNavigate,
}) => {
  const [completing, setCompleting] = useState(false);

  const videos = chapter.media.filter((item) => item.kind === "video");
  const audios = chapter.media.filter((item) => item.kind === "audio");
  const requirements = getChapterRequirements(chapter);
  const done = chapter.state === "completed";
  const ready = done || (chapter.canComplete ?? requirements.met);
  const hasRequirements = requirements.videosTotal + requirements.filesTotal > 0;
  const next = resolveNextStep(learn, lesson._id, chapter._id);

  const handleNext = async () => {
    if (done) {
      onNavigate(next.target);
      return;
    }

    try {
      setCompleting(true);
      const response = await completeChapter(trainingId, chapter._id);
      const updated = response?.data;
      onLearnChange(updated);
      onNavigate(resolveNextStep(updated, lesson._id, chapter._id).target);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not complete this chapter"));
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-1">
        <h5 className="fw-bold mb-0">{chapter.name}</h5>
        {done && <span className="badge bg-success">Completed</span>}
      </div>
      <p className="text-muted mb-3" style={{ fontSize: 12 }}>
        {lesson.name}
      </p>

      {chapter.description && (
        <p className="mb-4" style={{ whiteSpace: "pre-wrap" }}>
          {chapter.description}
        </p>
      )}

      {videos.length > 0 && (
        <div className="mb-4">
          <p
            className="text-uppercase text-muted fw-semibold mb-2"
            style={{ fontSize: 11, letterSpacing: 1 }}
          >
            Videos (watch fully to continue)
          </p>
          {videos.map((video) => (
            <VideoPlayer
              key={video._id}
              trainingId={trainingId}
              video={video}
              onLearnChange={onLearnChange}
            />
          ))}
        </div>
      )}

      {audios.length > 0 && (
        <div className="mb-4">
          <p
            className="text-uppercase text-muted fw-semibold mb-2"
            style={{ fontSize: 11, letterSpacing: 1 }}
          >
            Audio (optional)
          </p>
          {audios.map((audio) => (
            <AudioPlayer key={audio._id} audio={audio} />
          ))}
        </div>
      )}

      {chapter.files.length > 0 && (
        <div className="mb-4">
          <p
            className="text-uppercase text-muted fw-semibold mb-2"
            style={{ fontSize: 11, letterSpacing: 1 }}
          >
            Files (open every file to continue)
          </p>
          <ChapterFiles
            trainingId={trainingId}
            chapterId={chapter._id}
            files={chapter.files}
            onLearnChange={onLearnChange}
          />
        </div>
      )}

      {hasRequirements && !done && (
        <div className="border rounded p-3 mb-3" style={{ background: "#f8fafc" }}>
          {requirements.videosTotal > 0 && (
            <Requirement
              done={requirements.videosDone === requirements.videosTotal}
              text={`Videos watched: ${requirements.videosDone} of ${requirements.videosTotal}`}
            />
          )}
          {requirements.filesTotal > 0 && (
            <Requirement
              done={requirements.filesOpened === requirements.filesTotal}
              text={`Files opened: ${requirements.filesOpened} of ${requirements.filesTotal}`}
            />
          )}
        </div>
      )}

      {ready ? (
        <button
          className="btn btn-primary px-4"
          disabled={completing}
          onClick={handleNext}
        >
          {completing ? <Spinner size="sm" /> : next.label}
        </button>
      ) : (
        <small className="text-muted">
          Finish the items above to move on.
        </small>
      )}
    </div>
  );
};

export default ChapterView;
