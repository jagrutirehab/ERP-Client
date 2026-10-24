import { useSyncExternalStore } from "react";
import {
  cancelUpload,
  clearFinished,
  dismissUpload,
  getSnapshot,
  retryUpload,
  subscribe,
} from "../../helpers/trainingUploader";

export const useTrainingUploads = () => {
  const uploads = useSyncExternalStore(subscribe, getSnapshot);

  const activeCount = uploads.filter(
    (item) =>
      item.phase === "queued" ||
      item.phase === "sending" ||
      item.phase === "processing",
  ).length;

  return {
    uploads,
    activeCount,
    cancelUpload,
    retryUpload,
    dismissUpload,
    clearFinished,
  };
};

export default useTrainingUploads;
