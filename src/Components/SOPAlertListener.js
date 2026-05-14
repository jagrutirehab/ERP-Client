import { useEffect, useRef } from "react";
import { socket } from "../workers/sopsocket";
import { toast } from "react-toastify";
import { getUnreadSopAlerts, markSopAlertRead } from "../helpers/backend_helper";

const showAlert = (alert) => {
  if (!alert?._id) return;
  toast.error(`[${alert.severity}] ${alert.message}`, {
    toastId: alert._id,                 // dedupes if the same alert arrives twice
    autoClose: false,                   // user must acknowledge
    onClose: () => {
      markSopAlertRead(alert._id).catch(() => { /* best-effort */ });
    },
  });
};

const fetchMissed = async () => {
  try {
    const res = await getUnreadSopAlerts();
    const alerts = res?.data?.data || [];
    alerts.forEach(showAlert);
  } catch (err) {
    console.error("[SOP] Failed to fetch unread alerts:", err?.message || err);
  }
};

const SOPAlertListener = () => {
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    // Initial pull when the component mounts (covers the "logged in already
    // and just loaded the page" case).
    if (!fetchedOnceRef.current) {
      fetchedOnceRef.current = true;
      fetchMissed();
    }

    // Re-pull every time the socket (re)connects — catches anything fired
    // while the connection was down.
    const onConnect = () => fetchMissed();

    socket.on("connect", onConnect);

    socket.on("NEW_SOP_ALERT", (alert) => {
      showAlert(alert);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("NEW_SOP_ALERT");
    };
  }, []);

  return null;
};

export default SOPAlertListener;
