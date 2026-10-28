import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { compressImage } from "./imageCompress";
import { errText, useBusy } from "./assetUi";

export const MAX_TAG_PHOTOS = 1;
export const MAX_ASSET_PHOTOS = 5;

const KIND_LABEL = { asset: "Asset photo", tag: "Tag photo" };

// ---------- lightbox: a simple big view of the saved photos ----------
export const PhotoLightbox = ({ photos, index, onClose, onIndex }) => {
  const open = index !== null && index !== undefined && photos[index];
  return (
    <Modal isOpen={!!open} toggle={onClose} centered>
      <ModalBody className="p-2 text-center" style={{ background: "#111" }}>
        {open && (
          <>
            <img
              src={photos[index].url}
              alt={KIND_LABEL[photos[index].kind] || "Photo"}
              style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
            />
            <div className="d-flex align-items-center justify-content-between mt-2 px-2">
              <Button color="light" size="sm" disabled={index <= 0} onClick={() => onIndex(index - 1)}>
                ‹ Previous
              </Button>
              <span className="text-white small">
                {KIND_LABEL[photos[index].kind] || "Photo"} · {index + 1} of {photos.length}
              </span>
              <Button color="light" size="sm" disabled={index >= photos.length - 1} onClick={() => onIndex(index + 1)}>
                Next ›
              </Button>
            </div>
            <Button color="light" className="mt-2" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

// ---------- the picker ----------
// Take a photo with the camera (on a phone) or choose one from the gallery, see a thumbnail, remove
// it, then upload. Each photo is shrunk in the browser first. Several photos can be added in turn.
//   onUpload(file, kind) -> Promise : saves one photo ("asset" or "tag"); it should reject if it fails
//   existingTag / existingAsset     : photos already saved for this verification (they count towards the limit)
//   onUploaded(kind)                : called after each photo was saved
//   manualUpload={false}            : no "Upload" button; the screen sends the photos itself (ref.uploadAll) after it saved
//   hideDone                        : do not keep showing a photo once it is saved (the screen shows the saved ones itself)
//   onSummary({ ready, failed, uploading, done }) : so the screen can tell if anything is still waiting
const PhotoPicker = forwardRef(({ onUpload, existingTag = 0, existingAsset = 0, onUploaded, onSummary, hideDone = false, manualUpload = true, disabled = false }, ref) => {
  const handleAuthError = useAuthError();
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const nextId = useRef(1);
  const [kind, setKind] = useState("asset");
  const [items, setItems] = useState([]); // { id, kind, blob, previewUrl, status: ready|uploading|done|failed, error }
  const [problem, setProblem] = useState("");
  const [preparing, setPreparing] = useState(0);
  const [progress, setProgress] = useState("");
  const [uploading, runUpload] = useBusy();
  const itemsRef = useRef([]);
  itemsRef.current = items;

  // free the thumbnail memory when the picker goes away
  useEffect(
    () => () => {
      itemsRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    },
    [],
  );

  useEffect(() => {
    if (!onSummary) return;
    const count = (s) => items.filter((i) => i.status === s).length;
    onSummary({ ready: count("ready"), failed: count("failed"), uploading: count("uploading") + preparing, done: count("done") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, preparing]);

  // a photo that is already saved is counted by the screen (existingTag / existingAsset), not here
  const staged = (k) => items.filter((i) => i.kind === k && i.status !== "done").length;
  const room = (k) => (k === "tag" ? MAX_TAG_PHOTOS - existingTag - staged("tag") : MAX_ASSET_PHOTOS - existingAsset - staged("asset"));

  const addFiles = async (fileList) => {
    setProblem("");
    const files = Array.from(fileList || []);
    let added = 0; // photos added in this round (the screen has not redrawn yet)
    for (const file of files) {
      if (room(kind) - added <= 0) {
        const msg = kind === "tag" ? "Only one tag photo can be added" : `At most ${MAX_ASSET_PHOTOS} asset photos can be added`;
        setProblem(msg);
        toast.error(msg);
        break;
      }
      setPreparing((n) => n + 1);
      try {
        const blob = await compressImage(file);
        const id = nextId.current++;
        setItems((list) => [...list, { id, kind, blob, previewUrl: URL.createObjectURL(blob), status: "ready", error: "" }]);
        added += 1;
      } catch (error) {
        setProblem(error.message);
        toast.error(error.message);
      } finally {
        setPreparing((n) => n - 1);
      }
    }
  };

  const onPick = (e) => {
    const files = e.target.files;
    addFiles(files).finally(() => {
      e.target.value = ""; // so the same photo can be chosen again
    });
  };

  const removeItem = (id) =>
    setItems((list) => {
      const gone = list.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return list.filter((i) => i.id !== id);
    });

  const patch = (id, change) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...change } : i)));

  const sendOne = async (item) => {
    patch(item.id, { status: "uploading", error: "" });
    try {
      const file = new File([item.blob], "photo.jpg", { type: "image/jpeg" });
      await onUpload(file, item.kind);
      patch(item.id, { status: "done" });
      if (onUploaded) onUploaded(item.kind);
      return true;
    } catch (error) {
      if (handleAuthError(error)) return false;
      patch(item.id, { status: "failed", error: errText(error, "The photo could not be uploaded.") });
      return false;
    }
  };

  // Uploads every photo that is waiting. Resolves to how many failed (the others are saved).
  const uploadAll = () =>
    runUpload(async () => {
      const todo = itemsRef.current.filter((i) => i.status === "ready" || i.status === "failed");
      let failures = 0;
      for (let n = 0; n < todo.length; n++) {
        setProgress(`Uploading ${n + 1} of ${todo.length}...`);
        if (!(await sendOne(todo[n]))) failures += 1;
      }
      setProgress("");
      return failures;
    });

  // the screen can ask for the photos to be uploaded (for example right after it saved the verification)
  useImperativeHandle(ref, () => ({
    uploadAll,
    hasWaiting: () => itemsRef.current.some((i) => i.status === "ready" || i.status === "failed"),
  }));

  const retryOne = (item) =>
    runUpload(async () => {
      setProgress("Uploading 1 of 1...");
      await sendOne(item);
      setProgress("");
    });

  const waiting = items.filter((i) => i.status === "ready" || i.status === "failed").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const locked = disabled || uploading;

  return (
    <div>
      {/* which photo is being added */}
      <div className="d-flex gap-2 mb-2">
        {["asset", "tag"].map((k) => (
          <button
            key={k}
            type="button"
            disabled={locked}
            onClick={() => setKind(k)}
            style={{
              flex: 1,
              minHeight: 36,
              borderRadius: 10,
              border: `1.5px solid ${kind === k ? "#4f46e5" : "#e5e7eb"}`,
              background: kind === k ? "#eef2ff" : "#fff",
              color: kind === k ? "#4f46e5" : "#495057",
              fontWeight: 600,
            }}
          >
            {KIND_LABEL[k]} <span className="small" style={{ opacity: 0.7 }}>({k === "tag" ? `max ${MAX_TAG_PHOTOS}` : `max ${MAX_ASSET_PHOTOS}`})</span>
          </button>
        ))}
      </div>

      {/* the two buttons: camera (opens the camera on a phone) and gallery */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Button color="primary" disabled={locked || room(kind) <= 0} onClick={() => cameraRef.current && cameraRef.current.click()}>
          <i className="bx bx-camera me-1"></i> Take photo
        </Button>
        <Button color="light" disabled={locked || room(kind) <= 0} onClick={() => galleryRef.current && galleryRef.current.click()}>
          <i className="bx bx-image me-1"></i> Choose from gallery
        </Button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onPick} />
        <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onPick} />
      </div>

      {preparing > 0 && <div className="text-muted small mb-2">Preparing photo...</div>}
      {problem && <div className="text-danger small mb-2">{problem}</div>}

      {/* thumbnails of the photos chosen */}
      {items.some((i) => !(hideDone && i.status === "done")) && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {items.filter((i) => !(hideDone && i.status === "done")).map((item) => (
            <div key={item.id} style={{ width: 104 }}>
              <div style={{ position: "relative", width: 104, height: 104, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                <img src={item.previewUrl} alt={KIND_LABEL[item.kind]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {item.status === "uploading" && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)" }} className="d-flex align-items-center justify-content-center small fw-semibold">
                    Uploading...
                  </div>
                )}
                {item.status === "done" && (
                  <div style={{ position: "absolute", right: 4, bottom: 4, background: "#12b76a", color: "#fff", borderRadius: 999, padding: "0 8px", fontSize: 12, fontWeight: 600 }}>
                    Saved
                  </div>
                )}
                {(item.status === "ready" || item.status === "failed") && !uploading && (
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => removeItem(item.id)}
                    style={{ position: "absolute", top: 4, right: 4, width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 18, lineHeight: "28px" }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="small text-muted text-center">{KIND_LABEL[item.kind]}</div>
              {item.status === "failed" && (
                <div className="text-center">
                  <div className="text-danger" style={{ fontSize: 11 }}>{item.error}</div>
                  <Button size="sm" color="danger" outline disabled={locked} onClick={() => retryOne(item)}>
                    Retry
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {waiting > 0 && manualUpload && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button color="success" disabled={locked || preparing > 0} onClick={uploadAll}>
            {uploading ? progress || "Uploading..." : failed > 0 ? `Upload ${waiting} photo(s) again` : `Upload ${waiting} photo(s)`}
          </Button>
        </div>
      )}
    </div>
  );
});

export default PhotoPicker;
