import { io } from "socket.io-client";
import { api } from "../config";

let socket = null;
let hasConnectedBefore = false;

const handlers = {
  done: new Set(),
  failed: new Set(),
  reconnect: new Set(),
};

const readToken = () => {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

const emitTo = (set, payload) => set.forEach((handler) => handler(payload));

const ensureSocket = () => {
  if (socket) return socket;

  const token = readToken();
  if (!token) return null;

  socket = io(`${api.BASE_URL}/notifications`, {
    path: "/socket/search",
    auth: { token },
    withCredentials: true,
  });

  socket.on("connect", () => {
    if (hasConnectedBefore) emitTo(handlers.reconnect);
    hasConnectedBefore = true;
  });

  socket.on("connect_error", () => {
    const fresh = readToken();
    if (fresh) socket.auth = { token: fresh };
  });

  socket.on("training-upload:done", (payload) => emitTo(handlers.done, payload));
  socket.on("training-upload:failed", (payload) => emitTo(handlers.failed, payload));

  return socket;
};

export const disconnectNotifications = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
  hasConnectedBefore = false;
};

export const subscribeUploadEvents = ({ onDone, onFailed, onReconnect }) => {
  ensureSocket();

  if (onDone) handlers.done.add(onDone);
  if (onFailed) handlers.failed.add(onFailed);
  if (onReconnect) handlers.reconnect.add(onReconnect);

  return () => {
    if (onDone) handlers.done.delete(onDone);
    if (onFailed) handlers.failed.delete(onFailed);
    if (onReconnect) handlers.reconnect.delete(onReconnect);

    if (!handlers.done.size && !handlers.failed.size && !handlers.reconnect.size) {
      disconnectNotifications();
    }
  };
};
