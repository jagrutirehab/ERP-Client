import React, { useEffect } from "react";
import { socket } from "../workers/sopsocket";
import { toast } from "react-toastify";

console.log("FILE READ: SOPAlertListener.jsx is loaded");

const SOPAlertListener = () => {
  console.log("RENDER: SOPAlertListener component is rendering");

  useEffect(() => {
    console.log("MOUNT: SOP Listener is now active. Status:", socket.connected);

    socket.onAny((eventName, ...args) => {
      console.log(`[SOP] EVENT: ${eventName}`, args);
    });

    socket.on("NEW_SOP_ALERT", (alert) => {
      console.log("ALERT PAYLOAD RECEIVED:", alert);
      toast.error(`[${alert.severity}] ${alert.message}`);
    });

    return () => {
      socket.offAny();
      socket.off("NEW_SOP_ALERT");
    };
  }, []);

  return null;
};

export default SOPAlertListener;