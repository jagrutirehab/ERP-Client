import React, { useRef, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import { uploadDetailAdmissionAudio } from "../../../../helpers/backend_helper";
import { DetailHistoryClearContext } from "./DetailHistoryClearContext";

const RecordingTab = ({
  patient,
  center,
  isGenerating,
  generationProgress,
  onStartGeneration,
  onAbortGeneration,
  setFormStep,
  nextStep,
  uploadedAudio,
  setUploadedAudio,
  hasGenerated,
  onClearForm: propOnClearForm,
  onCheckDraftConflict,
}) => {
  const context = useContext(DetailHistoryClearContext);
  const onClear = propOnClearForm || context?.onClearForm;

  // Dual Input Mode: "upload" | "record"
  const [inputMode, setInputMode] = useState("upload");

  // File Upload State
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

  // Browser Live Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const allowedExt = ["mp3", "wav", "webm", "ogg", "aac", "mpeg", "m4a"];

  // Cleanup Web Audio & Visualizer
  const cleanupVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Stop active media stream tracks
  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cleanupVisualizer();
    setIsRecording(false);
  };

  // Lifecycle Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      stopMediaStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared Upload to S3 Helper
  const uploadAudioFile = async (file, sourceType = "uploaded") => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatusText("Uploading audio to S3...");

      const formData = new FormData();
      formData.append("audio", file);
      formData.append("sourceType", sourceType);
      if (patient?._id) formData.append("patient", patient._id);
      if (center) formData.append("center", center);

      const response = await uploadDetailAdmissionAudio(formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
            setUploadStatusText(`Uploading to S3 (${percent}%)...`);
          }
        },
      });
      const payload = response?.payload || response?.data || response;

      if (payload?.url) {
        setUploadedAudio({
          url: payload.url,
          path: payload.path,
          name: payload.name || file.name,
          originalName: payload.originalName || file.name,
          size: payload.size || file.size,
          type: payload.type || file.type,
          mimetype: payload.type || file.type,
          duration: payload.duration || payload.audioDetails?.duration || 0,
          sourceType:
            payload.audioDetails?.sourceType || payload.sourceType || sourceType,
          uploadedAt: payload.audioDetails?.uploadedAt || new Date(),
        });
        toast.success("Audio uploaded to S3 successfully!");
      } else {
        throw new Error(response?.message || "Failed to upload audio to S3");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Audio upload error:", err);
      toast.error(err.message || "Failed to upload audio file");
      setUploadedAudio(null);
      setAudioPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText("");
    }
  };

  // File Input Handler (Upload Mode)
  const handleFileChange = async (e) => {
    if (onCheckDraftConflict && onCheckDraftConflict()) {
      if (e.target) e.target.value = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase().trim();
    const isAudio =
      file.type.startsWith("audio/") ||
      (file.type === "video/webm" && ext === "webm") ||
      (file.type === "" && allowedExt.includes(ext)) ||
      allowedExt.includes(ext);

    if (!isAudio || !allowedExt.includes(ext)) {
      toast.error(
        "Only valid audio files allowed (.mp3, .wav, .webm, .ogg, .aac, .m4a, .mpeg)"
      );
      if (e.target) e.target.value = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setAudioPreviewUrl(preview);
    await uploadAudioFile(file, "uploaded");
  };

  // Setup Canvas Visualizer for Live Recording
  const setupVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext("2d");
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = "#f8fafc";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          canvasCtx.fillStyle = "#2563eb"; // Vibrant blue
          canvasCtx.fillRect(
            x,
            canvas.height - barHeight,
            barWidth - 2,
            barHeight
          );
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      // Visualizer is an enhancement; recording still continues
    }
  };

  // Start Live Browser Recording
  const handleStartRecording = async () => {
    if (onCheckDraftConflict && onCheckDraftConflict()) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopMediaStream();
        const blobType = mimeType || recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        if (audioBlob.size === 0) return;

        const ext = blobType.includes("mp4")
          ? "m4a"
          : blobType.includes("ogg")
            ? "ogg"
            : "webm";
        const audioFile = new File(
          [audioBlob],
          `browser-recording-${Date.now()}.${ext}`,
          { type: blobType }
        );

        const preview = URL.createObjectURL(audioBlob);
        setAudioPreviewUrl(preview);

        await uploadAudioFile(audioFile, "recorded");
      };

      setupVisualizer(stream);
      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Microphone error:", err);
      toast.error(
        "Could not access microphone. Please ensure microphone permissions are granted."
      );
    }
  };

  // Stop Live Browser Recording
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Exclusive State Mode Switch
  const handleModeChange = async (newMode) => {
    if (isGenerating || isRecording || newMode === inputMode) return;

    if (newMode === "upload") {
      // Clear browser recording state
      stopMediaStream();
      if (uploadedAudio?.path) {
        await onAbortGeneration(false);
      }
      setUploadedAudio(null);
      setAudioPreviewUrl(null);
      setRecordingSeconds(0);
      setInputMode("upload");
    } else if (newMode === "record") {
      // Clear file upload state
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (uploadedAudio?.path) {
        await onAbortGeneration(false);
      }
      setUploadedAudio(null);
      setAudioPreviewUrl(null);
      setRecordingSeconds(0);
      setInputMode("record");
    }
  };

  // Remove Audio & Abort
  const handleRemoveAudio = async () => {
    if (isGenerating) return;
    if (uploadedAudio?.path) {
      await onAbortGeneration(false);
    }
    setUploadedAudio(null);
    setAudioPreviewUrl(null);
    setRecordingSeconds(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="recording-tab-wrapper py-2">
      <Card className="border shadow-sm mb-4">
        <CardBody className="p-4">
          <div className="mb-3">
            <h5 className="card-title mb-1 text-primary d-flex align-items-center gap-2">
              <i className="ri-mic-line fs-4"></i>
              AI-Powered Audio Recording & Detail History Auto-Fill
            </h5>
            <p className="text-muted small mb-0">
              Upload an audio file or record directly in your browser to automatically populate all sections of the Detail History form.
            </p>
          </div>

          <Alert fade={false} color="light" className="border d-flex align-items-center gap-2 mb-4 py-2">
            <i className="ri-information-line fs-5 text-info"></i>
            <span className="small text-muted">
              Audio input is <strong>non-mandatory</strong> with no file size limit.
              Long audio files are automatically segmented and processed.
              You may also skip directly to manual entry using the &quot;Next&quot; button.
            </span>
          </Alert>

          {/* Mode Selection Toggle */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-bold me-2">Audio Input Mode:</span>
              <div className="btn-group" role="group">
                <Button
                  type="button"
                  color={inputMode === "upload" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handleModeChange("upload")}
                  disabled={isGenerating || isRecording}
                >
                  <i className="ri-upload-cloud-line me-1"></i> Upload Audio File
                </Button>
                <Button
                  type="button"
                  color={inputMode === "record" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handleModeChange("record")}
                  disabled={isGenerating || isRecording}
                >
                  <i className="ri-mic-line me-1"></i> Record in Browser
                </Button>
              </div>
            </div>
          </div>

          {/* Mode 1: File Upload Area */}
          {inputMode === "upload" && (
            <div className="mb-4 p-3 bg-light rounded border">
              <label className="form-label fw-bold">Select Audio File from Device</label>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  style={{ maxWidth: "450px" }}
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.mpeg"
                  onClick={(e) => {
                    if (onCheckDraftConflict && onCheckDraftConflict()) {
                      e.preventDefault();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                  onChange={handleFileChange}
                  disabled={isUploading || isGenerating}
                />

                {isUploading && (
                  <div className="d-flex flex-column gap-1 text-primary mt-2">
                    <div className="d-flex align-items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span className="small fw-semibold">
                        {uploadStatusText ||
                          `Uploading to S3... ${uploadProgress > 0 ? `${uploadProgress}%` : ""}`}
                      </span>
                    </div>
                    {uploadProgress > 0 && (
                      <div
                        className="progress"
                        style={{ height: "6px", width: "100%", maxWidth: "350px" }}
                      >
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {uploadedAudio && !isUploading && (
                  <Button
                    color="outline-danger"
                    size="sm"
                    onClick={handleRemoveAudio}
                    disabled={isGenerating}
                  >
                    <i className="ri-delete-bin-line me-1"></i> Remove
                  </Button>
                )}
              </div>
              <small className="text-muted d-block mt-2">
                Supported formats: MP3, WAV, WEBM, OGG, AAC, MPEG, M4A (No file size limit)
              </small>
            </div>
          )}

          {/* Mode 2: Live Browser Audio Recorder Area */}
          {inputMode === "record" && (
            <div className="mb-4 p-3 bg-light rounded border">
              <label className="form-label fw-bold d-block">Record Audio in Browser</label>

              {!isRecording && !uploadedAudio && (
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Button
                    color="danger"
                    size="md"
                    className="d-flex align-items-center gap-2 px-4 py-2"
                    onClick={handleStartRecording}
                    disabled={isUploading || isGenerating}
                  >
                    <i className="ri-mic-fill fs-5"></i> Start Recording
                  </Button>
                  <span className="text-muted small">
                    Click to start recording your clinical consultation using your microphone.
                  </span>
                </div>
              )}

              {isRecording && (
                <div>
                  <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                    <Badge color="danger" className="d-flex align-items-center gap-1 px-3 py-2 fs-6">
                      <span
                        className="spinner-grow spinner-grow-sm me-1 text-light"
                        role="status"
                        style={{ width: "10px", height: "10px" }}
                      ></span>
                      Recording: {formatTime(recordingSeconds)}
                    </Badge>

                    <Button
                      color="dark"
                      size="md"
                      className="d-flex align-items-center gap-2 px-4 py-2"
                      onClick={handleStopRecording}
                    >
                      <i className="ri-stop-circle-fill fs-5 text-danger"></i> Stop Recording
                    </Button>
                  </div>

                  {/* Real-time Audio Waveform Visualizer */}
                  <div className="p-2 bg-white rounded border" style={{ maxWidth: "450px" }}>
                    <canvas
                      ref={canvasRef}
                      width={430}
                      height={45}
                      style={{ width: "100%", height: "45px", display: "block" }}
                    />
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="d-flex flex-column align-items-center gap-1 text-primary my-3">
                  <div className="d-flex align-items-center gap-2">
                    <Spinner size="sm" color="primary" />
                    <span className="small fw-semibold">
                      {uploadStatusText ||
                        `Finalizing and uploading recording... ${uploadProgress > 0 ? `${uploadProgress}%` : ""}`}
                    </span>
                  </div>
                  {uploadProgress > 0 && (
                    <div
                      className="progress"
                      style={{ height: "6px", width: "100%", maxWidth: "250px" }}
                    >
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {uploadedAudio && !isRecording && !isUploading && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <Button
                    color="outline-secondary"
                    size="sm"
                    onClick={handleStartRecording}
                    disabled={isGenerating}
                  >
                    <i className="ri-refresh-line me-1"></i> Record Again
                  </Button>
                  <Button
                    color="outline-danger"
                    size="sm"
                    onClick={handleRemoveAudio}
                    disabled={isGenerating}
                  >
                    <i className="ri-delete-bin-line me-1"></i> Discard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Audio Card & Player */}
          {uploadedAudio && (
            <Card className="bg-light border mb-4">
              <CardBody className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="ri-file-music-line fs-4 text-primary"></i>
                    <div>
                      <div className="fw-semibold text-dark">
                        {uploadedAudio.originalName || uploadedAudio.name}
                      </div>
                      <small className="text-muted">
                        Size: {formatFileSize(uploadedAudio.size)} | Ready for AI analysis
                      </small>
                    </div>
                  </div>
                  <Badge color="success" className="px-2 py-1">
                    <i className="ri-check-line me-1"></i> Ready
                  </Badge>
                </div>

                {audioPreviewUrl && (
                  <div className="mt-2">
                    <audio
                      src={audioPreviewUrl}
                      controls
                      className="w-100"
                      style={{ height: "40px" }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Generate Button & Generation State (Hidden once AI generation completes successfully) */}
          {uploadedAudio && !isGenerating && !hasGenerated && (
            <div className="mb-4 text-center p-3 bg-light rounded border">
              <p className="mb-2 text-muted small">
                Audio is ready. Click below to begin background chunking, transcription, and Detail History auto-fill.
              </p>
              <Button
                color="primary"
                size="md"
                className="px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                onClick={onStartGeneration}
              >
                <i className="ri-sparkling-fill fs-5"></i>
                Generate Detail History
              </Button>
            </div>
          )}

          {/* Active Generation Progress Card */}
          {isGenerating && (
            <Card className="border-primary shadow-sm mb-4">
              <CardBody className="p-4 text-center">
                <div className="mb-3">
                  <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
                </div>
                <h6 className="fw-bold text-primary mb-1">
                  AI Auto-Fill in Progress
                </h6>
                <p className="text-muted small mb-3">
                  {generationProgress?.message || "Analyzing audio chunks and mapping fields..."}
                </p>

                {generationProgress?.percent > 0 && (
                  <div className="progress mb-3" style={{ height: "8px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      role="progressbar"
                      style={{ width: `${generationProgress.percent}%` }}
                      aria-valuenow={generationProgress.percent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                )}

                <div className="d-flex justify-content-center">
                  <Button
                    color="outline-danger"
                    size="sm"
                    onClick={() => onAbortGeneration(true)}
                  >
                    <i className="ri-close-circle-line me-1"></i> Cancel & Abort
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Completion Banner */}
          {hasGenerated && !isGenerating && (
            <Alert fade={false} color="success" className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-2">
                <i className="ri-checkbox-circle-line fs-4 text-success"></i>
                <div>
                  <div className="fw-bold">AI Extraction Complete!</div>
                  <div className="small">
                    Form fields have been populated. Please review each tab and confirm on the final &quot;Special Requirements&quot; tab.
                  </div>
                </div>
              </div>
              <Button
                color="success"
                size="sm"
                onClick={() => setFormStep(nextStep)}
              >
                Review Form <i className="ri-arrow-right-line ms-1"></i>
              </Button>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Navigation Footer */}
      <Row className="mt-3">
        <Col xs={12}>
          <div className="d-flex justify-content-end align-items-center gap-2">
            {onClear && (
              <Button
                type="button"
                color="outline-danger"
                size="sm"
                onClick={onClear}
                disabled={isGenerating || isRecording}
                title="Clear all form fields and saved draft"
              >
                <i className="ri-delete-bin-line me-1"></i> Clear Form
              </Button>
            )}
            <Button
              color="success"
              size="sm"
              className="text-white px-4"
              onClick={() => setFormStep(nextStep)}
              disabled={isGenerating || isRecording}
              title={isGenerating ? "Navigation is locked while AI is generating" : "Proceed to Chief Complaints"}
            >
              Next <i className="ri-arrow-right-line ms-1"></i>
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

RecordingTab.propTypes = {
  patient: PropTypes.object,
  center: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isGenerating: PropTypes.bool.isRequired,
  generationProgress: PropTypes.object,
  onStartGeneration: PropTypes.func.isRequired,
  onAbortGeneration: PropTypes.func.isRequired,
  setFormStep: PropTypes.func.isRequired,
  nextStep: PropTypes.string.isRequired,
  uploadedAudio: PropTypes.object,
  setUploadedAudio: PropTypes.func.isRequired,
  hasGenerated: PropTypes.bool,
  onClearForm: PropTypes.func,
  onCheckDraftConflict: PropTypes.func,
};

export default RecordingTab;
