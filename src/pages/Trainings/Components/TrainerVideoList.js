import { useState } from "react";
import MediaPlayerModal from "./AllTrainings/MediaPlayerModal";

const BADGES = {
    processing: { className: "bg-soft-info text-info", label: "Processing" },
    failed: { className: "bg-soft-danger text-danger", label: "Failed" },
};

const TrainerVideoList = ({ videos }) => {
    const [playing, setPlaying] = useState(null);

    if (!videos?.length) return null;

    return (
        <>
            <div className="d-flex flex-wrap gap-2 mt-2">
                {videos.map((video, i) => {
                    const badge = BADGES[video.status];
                    return (
                        <div
                            key={video._id || i}
                            className="d-flex align-items-center gap-2 border rounded-2 px-2 py-1"
                            style={{ fontSize: 12, background: "#fff", maxWidth: 360 }}
                        >
                            <i className="ri-movie-line text-muted" />
                            <span className="text-truncate" title={video.originalName}>
                                {video.originalName || `Video ${i + 1}`}
                            </span>
                            {badge && (
                                <span className={`badge ${badge.className}`} style={{ fontSize: 10 }} title={video.error || undefined}>
                                    {badge.label}
                                </span>
                            )}
                            {video.status === "done" && video.url && (
                                <button
                                    type="button"
                                    className="btn btn-soft-primary btn-sm py-0 px-2"
                                    onClick={() => setPlaying({ kind: "video", url: video.url, originalName: video.originalName })}
                                >
                                    <i className="ri-play-fill me-1" />
                                    Play
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <MediaPlayerModal media={playing} isOpen={!!playing} onClose={() => setPlaying(null)} />
        </>
    );
};

export default TrainerVideoList;
