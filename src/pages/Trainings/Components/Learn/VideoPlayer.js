import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  completeLearnVideo,
  saveVideoPosition,
} from "../../../../helpers/backend_helper";
import {
  ALLOWED_RATES,
  SEEK_TOLERANCE_SEC,
  SKIP_BACK_SEC,
  clampSeekTarget,
  evaluateTimeUpdate,
  findMediaInLearn,
  formatTime,
  getCurrentUserId,
  getErrorMessage,
  getVideoBackupKey,
  isForwardSeekBlocked,
  isIOS,
  isNetworkError,
  normalizeRate,
  pickResumePosition,
  readVideoBackup,
  writeVideoBackup,
} from "../../Helpers/learnHelpers";

const BLOCKED_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

const KEY_SEEK_SEC = 5;

const VideoPlayer = ({ trainingId, video, onLearnChange }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const allowedMaxRef = useRef(
    video.completed ? Infinity : video.furthestSec || 0,
  );
  const lastTimeRef = useRef(0);
  const lastWallRef = useRef(Date.now());
  const positionRef = useRef(video.positionSec || 0);
  const interactedRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const hiddenPauseRef = useRef(false);
  const pendingCompleteRef = useRef(false);
  const skippedAheadRef = useRef(false);
  const draggingRef = useRef(false);
  const completingRef = useRef(false);
  const noticeTimerRef = useRef(null);
  const persistRef = useRef(null);
  const finishRef = useRef(null);
  const tokenRef = useRef(video.token);

  const [backupKey] = useState(() =>
    getVideoBackupKey(getCurrentUserId(), video._id),
  );
  const [duration, setDuration] = useState(video.durationSec || 0);
  const [currentTime, setCurrentTime] = useState(video.positionSec || 0);
  const [allowedPct, setAllowedPct] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(!!video.completed);
  const [completing, setCompleting] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState(false);

  const showFullscreen =
    !isIOS() && typeof document !== "undefined" && document.fullscreenEnabled;

  useEffect(() => {
    if (video.completed) {
      setCompleted(true);
      allowedMaxRef.current = Infinity;
    }
  }, [video.completed]);

  const showNotice = (text) => {
    setNotice(text);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(""), 3500);
  };

  const getFurthest = () =>
    Number.isFinite(allowedMaxRef.current)
      ? allowedMaxRef.current
      : videoRef.current?.duration || video.durationSec || 0;

  const updateAllowedPct = (mediaDuration) => {
    const total = mediaDuration || duration;
    if (!total) return;
    setAllowedPct(
      Number.isFinite(allowedMaxRef.current)
        ? Math.min((allowedMaxRef.current / total) * 100, 100)
        : 100,
    );
  };

  const persistPosition = async (state, positionOverride) => {
    if (!interactedRef.current && positionOverride === undefined) return null;

    const element = videoRef.current;
    const positionSec =
      positionOverride !== undefined
        ? positionOverride
        : element
          ? element.currentTime
          : positionRef.current;

    writeVideoBackup(backupKey, { positionSec, furthestSec: getFurthest() });

    if (!tokenRef.current) return null;

    try {
      const response = await saveVideoPosition(trainingId, video._id, {
        token: tokenRef.current,
        positionSec,
        state,
      });
      return response?.data || null;
    } catch {
      return null;
    }
  };
  persistRef.current = persistPosition;

  const seekTo = (target) => {
    const element = videoRef.current;
    if (!element) return;
    const clamped = clampSeekTarget(target, allowedMaxRef.current);
    lastTimeRef.current = clamped;
    lastWallRef.current = Date.now();
    positionRef.current = clamped;
    element.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const seekFree = (target) => {
    const element = videoRef.current;
    if (!element) return;
    const bounded = Math.min(Math.max(target, 0), duration || target);
    if (bounded > element.currentTime + SEEK_TOLERANCE_SEC) {
      skippedAheadRef.current = true;
    } else if (bounded <= SEEK_TOLERANCE_SEC) {
      skippedAheadRef.current = false;
    }
    seekTo(bounded);
  };

  const finishVideo = async () => {
    if (!tokenRef.current || completingRef.current) return;
    completingRef.current = true;
    setCompleting(true);
    try {
      const response = await completeLearnVideo(trainingId, video._id, {
        token: tokenRef.current,
      });
      pendingCompleteRef.current = false;
      allowedMaxRef.current = Infinity;
      setCompleted(true);
      const refreshed = findMediaInLearn(response?.data, video._id);
      if (refreshed?.token) tokenRef.current = refreshed.token;
      if (response?.data) onLearnChange(response.data);
      if (!video.completed) toast.success("Video completed");
    } catch (error) {
      if (isNetworkError(error)) {
        pendingCompleteRef.current = true;
        showNotice("You are offline. Completion will be saved when you reconnect.");
      } else if (!video.completed) {
        toast.error(getErrorMessage(error, "Could not record video completion"));
      }
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  };
  finishRef.current = finishVideo;

  const handleLoadedMetadata = async () => {
    const element = videoRef.current;
    if (!element) return;

    const mediaDuration = Number.isFinite(element.duration)
      ? element.duration
      : video.durationSec || 0;
    setDuration(mediaDuration);

    const resume = pickResumePosition({
      serverPositionSec: video.positionSec || 0,
      backup: readVideoBackup(backupKey),
      durationSec: mediaDuration,
    });

    if (resume.source === "backup" && resume.positionSec > allowedMaxRef.current) {
      const saved = await persistPosition("reconnect", resume.positionSec);
      if (saved && typeof saved.furthestSec === "number") {
        allowedMaxRef.current = Math.max(allowedMaxRef.current, saved.furthestSec);
      }
    }

    seekTo(Math.min(resume.positionSec, allowedMaxRef.current));
    updateAllowedPct(mediaDuration);
  };

  const handlePlay = () => {
    interactedRef.current = true;
    setPlaying(true);
    lastWallRef.current = Date.now();
    lastTimeRef.current = videoRef.current ? videoRef.current.currentTime : 0;
  };

  const handlePause = () => {
    setPlaying(false);
    if (hiddenPauseRef.current) return;
    const element = videoRef.current;
    if (element && !element.ended) persistPosition("paused");
  };

  const handleTimeUpdate = () => {
    const element = videoRef.current;
    if (!element) return;

    const now = Date.now();
    const result = evaluateTimeUpdate({
      lastTime: lastTimeRef.current,
      currentTime: element.currentTime,
      elapsedMs: now - lastWallRef.current,
      rate: element.playbackRate,
      allowedMax: allowedMaxRef.current,
    });

    if (result.jumped) {
      showNotice("You can't skip ahead. Watch the video to continue.");
      seekTo(Math.min(lastTimeRef.current, allowedMaxRef.current));
      return;
    }

    allowedMaxRef.current = result.allowedMax;
    lastTimeRef.current = element.currentTime;
    lastWallRef.current = now;
    positionRef.current = element.currentTime;
    setCurrentTime(element.currentTime);
    updateAllowedPct();
  };

  const handleSeeking = () => {
    const element = videoRef.current;
    if (!element || !Number.isFinite(allowedMaxRef.current)) return;
    if (isForwardSeekBlocked(element.currentTime, allowedMaxRef.current)) {
      showNotice("You can't skip ahead. Watch the video to continue.");
      seekTo(allowedMaxRef.current);
    }
  };

  const handleRateChange = () => {
    const element = videoRef.current;
    if (!element) return;
    const normalized = normalizeRate(element.playbackRate);
    if (normalized !== element.playbackRate) element.playbackRate = normalized;
    setRate(normalized);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (completed && skippedAheadRef.current) {
      skippedAheadRef.current = false;
      return;
    }
    finishVideo();
  };

  const togglePlay = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  };

  const changeRate = (nextRate) => {
    if (videoRef.current) videoRef.current.playbackRate = nextRate;
  };

  const toggleMute = () => {
    const element = videoRef.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
  };

  const skipBack = () => {
    const element = videoRef.current;
    if (element) seekTo(Math.max(0, element.currentTime - SKIP_BACK_SEC));
  };

  const handleBarClick = (event) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const target = ratio * duration;

    if (isForwardSeekBlocked(target, allowedMaxRef.current)) {
      showNotice("You can only go back or stay within what you have already watched.");
      return;
    }
    seekTo(target);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  };

  const getBarTarget = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    return ratio * duration;
  };

  const handleBarPointerDown = (event) => {
    if (!completed || !duration) return;
    draggingRef.current = true;
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    seekFree(getBarTarget(event));
  };

  const handleBarPointerMove = (event) => {
    if (draggingRef.current) seekFree(getBarTarget(event));
  };

  const handleBarPointerUp = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (event) => {
    if (completed && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      const element = videoRef.current;
      if (element) {
        const step = event.key === "ArrowRight" ? KEY_SEEK_SEC : -KEY_SEEK_SEC;
        seekFree(element.currentTime + step);
      }
    } else if (BLOCKED_KEYS.includes(event.key)) {
      event.preventDefault();
    } else if (event.key === " " || event.key === "k") {
      event.preventDefault();
      togglePlay();
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      const element = videoRef.current;
      if (!element) return;

      if (document.hidden) {
        wasPlayingRef.current = !element.paused && !element.ended;
        if (wasPlayingRef.current) {
          hiddenPauseRef.current = true;
          element.pause();
        }
        persistRef.current("hidden");
      } else if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        hiddenPauseRef.current = false;
        element.play().catch(() => {});
      }
    };

    const handlePageHide = () => persistRef.current("unload");

    const handleOnline = () => {
      if (pendingCompleteRef.current) finishRef.current();
      persistRef.current("reconnect");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("online", handleOnline);
      clearTimeout(noticeTimerRef.current);
      persistRef.current("unmount");
    };
  }, []);

  const playedPct = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <i className="ri-movie-line" />
        <span className="fw-semibold text-truncate" style={{ fontSize: 14 }}>
          {video.originalName}
        </span>
        {completed ? (
          <span className="badge bg-success">Watched</span>
        ) : (
          <span className="badge bg-soft-danger text-danger">Required</span>
        )}
        {video.watchAttempts > 0 && (
          <span className="text-muted" style={{ fontSize: 11 }}>
            Watched {video.watchAttempts} time{video.watchAttempts !== 1 ? "s" : ""}
          </span>
        )}
        {completing && (
          <span className="text-muted" style={{ fontSize: 11 }}>
            Saving...
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="border rounded overflow-hidden bg-dark"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: "none" }}
      >
        <video
          ref={videoRef}
          src={video.url}
          className="w-100"
          style={{ maxHeight: 480, background: "#000", display: "block" }}
          preload="metadata"
          playsInline
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          onContextMenu={(event) => event.preventDefault()}
          onClick={togglePlay}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onRateChange={handleRateChange}
          onEnded={handleEnded}
          onError={() => setLoadError(true)}
        />

        <div className="px-2 py-2" style={{ background: "#111827" }}>
          <div
            onClick={handleBarClick}
            onPointerDown={handleBarPointerDown}
            onPointerMove={handleBarPointerMove}
            onPointerUp={handleBarPointerUp}
            onPointerCancel={handleBarPointerUp}
            style={{
              position: "relative",
              height: 8,
              background: "#374151",
              borderRadius: 4,
              cursor: "pointer",
              marginBottom: 8,
              touchAction: completed ? "none" : undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${allowedPct}%`,
                background: "#6b7280",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${playedPct}%`,
                background: "#3b82f6",
                borderRadius: 4,
              }}
            />
          </div>

          <div
            className="d-flex align-items-center gap-2 text-white flex-wrap"
            style={{ fontSize: 12 }}
          >
            <button type="button" className="btn btn-sm btn-dark" onClick={togglePlay}>
              <i className={playing ? "ri-pause-fill" : "ri-play-fill"} />
            </button>
            <button type="button" className="btn btn-sm btn-dark" onClick={skipBack}>
              <i className="ri-replay-10-line" /> {SKIP_BACK_SEC}s
            </button>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="ms-auto d-flex align-items-center gap-1">
              {ALLOWED_RATES.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`btn btn-sm ${rate === option ? "btn-primary" : "btn-dark"}`}
                  onClick={() => changeRate(option)}
                >
                  {option}x
                </button>
              ))}
              <button type="button" className="btn btn-sm btn-dark" onClick={toggleMute}>
                <i className={muted ? "ri-volume-mute-line" : "ri-volume-up-line"} />
              </button>
              {showFullscreen && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={toggleFullscreen}
                >
                  <i className="ri-fullscreen-line" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <small className="text-warning d-block mt-2">
          <i className="ri-information-line me-1" />
          {notice}
        </small>
      )}
      {loadError && (
        <small className="text-danger d-block mt-2">
          This video could not be loaded. Please try again later.
        </small>
      )}
    </div>
  );
};

export default VideoPlayer;
