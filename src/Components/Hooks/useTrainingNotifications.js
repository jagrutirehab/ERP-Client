import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  subscribeTrainingEvents,
  subscribeUploadEvents,
} from "../../helpers/notificationSocket";
import {
  bumpAssigned,
  bumpCompletion,
  fetchTrainingNotificationSummary,
} from "../../store/features/trainingNotification/trainingNotificationSlice";
import { applyServerStatus, pollNow } from "../../helpers/trainingUploader";

export const useTrainingNotifications = () => {
  const dispatch = useDispatch();
  const centerAccess = useSelector((state) => state.User?.centerAccess);
  const cntrs = (centerAccess || []).join(",");

  useEffect(() => {
    dispatch(fetchTrainingNotificationSummary(cntrs));
  }, [dispatch, cntrs]);

  useEffect(
    () =>
      subscribeTrainingEvents({
        onAssigned: (payload) => {
          dispatch(bumpAssigned());
          toast.info(`New training assigned: ${payload.trainingName}`);
        },
        onCompleted: (payload) => {
          dispatch(bumpCompletion(payload.trainingId));
          toast.success(`${payload.employeeName} completed "${payload.trainingName}"`);
          dispatch(fetchTrainingNotificationSummary(cntrs));
        },
        onReconnect: () => {
          dispatch(fetchTrainingNotificationSummary(cntrs));
        },
      }),
    [dispatch, cntrs],
  );

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
