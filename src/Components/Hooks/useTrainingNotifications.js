import { useEffect } from "react";
import { toast } from "react-toastify";
import { subscribeUploadEvents } from "../../helpers/notificationSocket";
import { applyServerStatus, pollNow } from "../../helpers/trainingUploader";

export const useTrainingNotifications = () => {
  useEffect(
    () =>
      subscribeUploadEvents({
        onDone: (payload) => {
          const result = applyServerStatus({
            uploadId: payload.uploadId,
            status: "done",
          });
          if (result === "unknown") {
            toast.success(`"${payload.originalName}" is ready`);
          }
        },
        onFailed: (payload) => {
          const result = applyServerStatus({
            uploadId: payload.uploadId,
            status: "failed",
            error: payload.error,
          });
          if (result === "unknown") {
            toast.error(
              `"${payload.originalName}" could not be processed. ${payload.error || ""}`.trim(),
            );
          }
        },
        onReconnect: () => {
          pollNow();
        },
      }),
    [],
  );
};

export default useTrainingNotifications;
