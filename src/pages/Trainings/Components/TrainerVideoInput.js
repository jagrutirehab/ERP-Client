import { useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { VIDEO_EXTENSIONS, formatFileSize, validateMediaFile } from "../Helpers/uploadTrainingForm";
import { readMediaDuration } from "../Helpers/mediaDuration";
import { formatTime } from "../Helpers/learnHelpers";

const ACCEPT = VIDEO_EXTENSIONS.map((extension) => `.${extension}`).join(",");

const STATUS_BADGE = {
    processing: { className: "bg-soft-info text-info", label: "Processing" },
    failed: { className: "bg-soft-danger text-danger", label: "Failed" },
    done: { className: "bg-soft-success text-success", label: "Ready" },
};

const TrainerVideoInput = ({ saved = null, removed = false, pending = null, onPick, onClearPending, onToggleRemove }) => {
    const inputRef = useRef(null);
    const [reading, setReading] = useState(false);

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const result = validateMediaFile(file);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }
        if (result.kind !== "video") {
            toast.error(`${file.name}: only video files (MP4, WebM, MOV) can be added here.`);
            return;
        }

        setReading(true);
        try {
            const durationSec = await readMediaDuration(file, "video");
            onPick({ file, durationSec });
        } catch {
            toast.error(
                `${file.name}: the browser cannot read this video. It may be corrupted or use an unsupported codec (for example HEVC). Re-export it as H.264 MP4.`
            );
        } finally {
            setReading(false);
        }
    };

    const replacing = !!saved && !removed && !!pending;
    const showWarning = !!saved && (removed || !!pending);
    const badge = saved ? STATUS_BADGE[saved.status] || STATUS_BADGE.processing : null;

    return (
        <div className="mt-4" data-testid="trainer-video-input">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase text-muted fw-semibold mb-0" style={{ fontSize: 11, letterSpacing: 1 }}>
                    Video <span className="text-lowercase fw-normal">(optional)</span>
                </h6>
                <button
                    type="button"
                    className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
                    disabled={reading}
                    onClick={() => inputRef.current?.click()}
                >
                    {reading ? <Spinner size="sm" /> : <i className="ri-movie-line" />}
                    {saved && !removed ? "Replace Video" : pending ? "Change Video" : "Add Video"}
                </button>
            </div>

            <input ref={inputRef} type="file" accept={ACCEPT} className="d-none" onChange={handleChange} />

            {showWarning && (
                <div className="alert alert-warning py-2 mb-2" style={{ fontSize: 12 }} role="alert">
                    {replacing || (removed && pending)
                        ? "Saving will delete the current video and upload the new one. If the new upload fails, the old video will not come back."
                        : "Saving will delete the current video. It cannot be restored."}
                </div>
            )}

            {!saved && !pending ? (
                <div className="text-center py-3 border rounded-3 text-muted" style={{ background: "#f8f9fa", fontSize: 12 }}>
                    No video. MP4, WebM or MOV up to 500MB. It uploads in the background after you save.
                </div>
            ) : (
                <div className="border rounded-3 overflow-hidden">
                    {saved && (
                        <div
                            className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                            style={{ fontSize: 13, opacity: removed ? 0.5 : 1 }}
                        >
                            <div className="overflow-hidden">
                                <div className="fw-medium">
                                    Saved video
                                    <span className={`badge ms-1 ${badge.className}`} style={{ fontSize: 10 }}>{badge.label}</span>
                                    {removed && <span className="badge bg-soft-secondary text-secondary ms-1" style={{ fontSize: 10 }}>Will be removed</span>}
                                </div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                                    {saved.originalName} · {formatFileSize(saved.size || 0)}
                                </div>
                            </div>
                            <button type="button" className="btn btn-link btn-sm p-0" onClick={onToggleRemove}>
                                {removed ? "Undo" : "Remove"}
                            </button>
                        </div>
                    )}
                    {pending && (
                        <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ fontSize: 13 }}>
                            <div className="overflow-hidden">
                                <div className="fw-medium">
                                    New video <span className="badge bg-soft-primary text-primary ms-1" style={{ fontSize: 10 }}>Uploads after save</span>
                                </div>
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                                    {pending.file.name} · {formatFileSize(pending.file.size)}
                                    {pending.durationSec ? ` · ${formatTime(pending.durationSec)}` : ""}
                                </div>
                            </div>
                            <button type="button" className="btn-close ms-2" aria-label="Remove" onClick={onClearPending} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainerVideoInput;
