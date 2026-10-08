import { toast } from "react-toastify";
import {
  getMyTrainingUploads,
  getTrainingUploadStatus,
  uploadTrainingFile,
} from "./backend_helper";

const MAX_CONCURRENT = 2;
const MAX_NETWORK_RETRIES = 1;
const POLL_INTERVAL_MS = 8000;

let items = [];
let snapshot = [];
let pollTimer = null;
let rehydrated = false;
const listeners = new Set();

const createId = () => Math.random().toString(36).slice(2, 11);

const toPublic = (item) => ({
  id: item.id,
  name: item.name,
  size: item.size,
  kind: item.kind,
  trainingName: item.trainingName,
  phase: item.phase,
  progress: item.progress,
  error: item.error,
  uploadId: item.uploadId,
  canRetry: !!item.file,
});

const isSending = (item) => item.phase === "queued" || item.phase === "sending";

const poll = async () => {
  const waiting = items.filter((item) => item.phase === "processing" && item.uploadId);
  await Promise.all(
    waiting.map(async (item) => {
      try {
        const response = await getTrainingUploadStatus(item.uploadId);
        const data = response?.data;
        if (data && data.status !== "processing") {
          applyServerStatus({
            uploadId: data.uploadId,
            status: data.status,
            error: data.error,
          });
        }
      } catch {
        return;
      }
    }),
  );
};

const ensurePolling = () => {
  const needed = items.some((item) => item.phase === "processing" && item.uploadId);
  if (needed && !pollTimer) {
    pollTimer = setInterval(poll, POLL_INTERVAL_MS);
  } else if (!needed && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

const publish = () => {
  snapshot = items.map(toPublic);
  listeners.forEach((listener) => listener());
  ensurePolling();
};

const update = (id, patch) => {
  if (!items.some((item) => item.id === id)) return;
  items = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
  publish();
};

const send = async (item) => {
  const controller = new AbortController();
  update(item.id, { phase: "sending", progress: 0, error: null, controller });

  try {
    const response = await uploadTrainingFile(
      item.file,
      item.kind,
      {
        trainingId: item.trainingId,
        chapterId: item.chapterId,
        ...(item.durationSec ? { durationSec: item.durationSec } : {}),
      },
      {
        signal: controller.signal,
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.min(Math.round((event.loaded * 100) / event.total), 99);
          const current = items.find((entry) => entry.id === item.id);
          if (current && current.progress !== progress) update(item.id, { progress });
        },
      },
    );

    update(item.id, {
      phase: "processing",
      progress: 100,
      uploadId: response?.data?.uploadId,
      controller: null,
    });
  } catch (error) {
    if (error?.code === "ERR_CANCELED") {
      update(item.id, { phase: "cancelled", controller: null });
    } else if (!error?.response && item.retries < MAX_NETWORK_RETRIES) {
      update(item.id, { phase: "queued", retries: item.retries + 1, controller: null });
    } else {
      update(item.id, {
        phase: "failed",
        controller: null,
        error: error?.response?.data?.message || "Network problem. Please retry.",
      });
    }
  } finally {
    pump();
  }
};

const pump = () => {
  const sending = items.filter((item) => item.phase === "sending").length;
  const slots = MAX_CONCURRENT - sending;
  if (slots <= 0) return;
  items
    .filter((item) => item.phase === "queued")
    .slice(0, slots)
    .forEach(send);
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => snapshot;

export const enqueueTrainingUploads = (entries) => {
  if (!entries.length) return [];

  const added = entries.map((entry) => ({
    id: createId(),
    file: entry.file,
    name: entry.file.name,
    size: entry.file.size,
    kind: entry.kind,
    trainingId: entry.trainingId,
    chapterId: entry.chapterId,
    trainingName: entry.trainingName || "",
    durationSec: entry.durationSec,
    phase: "queued",
    progress: 0,
    error: null,
    uploadId: null,
    retries: 0,
    controller: null,
  }));

  items = [...items, ...added];
  publish();
  pump();
  return added.map((item) => item.id);
};

export const cancelUpload = (id) => {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  if (item.controller) {
    item.controller.abort();
  } else if (item.phase === "queued") {
    update(id, { phase: "cancelled" });
  }
};

export const retryUpload = (id) => {
  const item = items.find((entry) => entry.id === id);
  if (!item || !item.file) return;
  if (item.phase !== "failed" && item.phase !== "cancelled") return;
  update(id, { phase: "queued", progress: 0, error: null, uploadId: null, retries: 0 });
  pump();
};

export const dismissUpload = (id) => {
  const item = items.find((entry) => entry.id === id);
  if (!item || isSending(item)) return;
  items = items.filter((entry) => entry.id !== id);
  publish();
};

export const clearFinished = () => {
  items = items.filter((item) => item.phase !== "done" && item.phase !== "cancelled");
  publish();
};

export const applyServerStatus = ({ uploadId, status, error }) => {
  const item = items.find((entry) => entry.uploadId === uploadId);
  if (!item) return "unknown";

  if (status === "done" && item.phase !== "done") {
    update(item.id, { phase: "done", progress: 100, error: null });
    toast.success(`"${item.name}" is ready`);
    return "updated";
  }

  if (status === "failed" && item.phase !== "failed") {
    update(item.id, { phase: "failed", error: error || "Processing failed" });
    toast.error(`"${item.name}" could not be processed. ${error || ""}`.trim());
    return "updated";
  }

  return "duplicate";
};

export const pollNow = () => poll();

export const rehydrateUploads = async () => {
  if (rehydrated) return;
  rehydrated = true;

  try {
    const response = await getMyTrainingUploads({ status: "processing" });
    const known = new Set(items.map((item) => item.uploadId).filter(Boolean));
    const recovered = (response?.data || [])
      .filter((upload) => !known.has(upload.uploadId))
      .map((upload) => ({
        id: createId(),
        file: null,
        name: upload.originalName,
        size: upload.size,
        kind: upload.kind,
        trainingName: "",
        phase: "processing",
        progress: 100,
        error: null,
        uploadId: upload.uploadId,
        retries: 0,
        controller: null,
      }));

    if (recovered.length) {
      items = [...items, ...recovered];
      publish();
    }
  } catch {
    rehydrated = false;
  }
};
