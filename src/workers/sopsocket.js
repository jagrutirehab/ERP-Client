import { io } from "socket.io-client";
import config from "../config";

const SOCKET_URL = config.api.API_URL.replace("/api/v1", "").replace(/\/$/, "");

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    path: "/socket/search",
    transports: ["polling", "websocket"],
    withCredentials: true,
});


socket.on("connect", () => {
    console.log("SOP Socket: CONNECTED!", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("SOP Socket: CONNECTION ERROR:", err.message);
});


export const connectSopSocket = () => {
    const profileStr = localStorage.getItem("authUser");


    if (!profileStr) return;

    try {
        const profile = JSON.parse(profileStr);
        const userId = profile?.data?._id;


        if (userId) {
            socket.auth = { userId };
            socket.io.opts.query = { userId };

            if (socket.connected) {
                console.log("Reconnecting to refresh handshake with ID...");
                socket.disconnect().connect();
            } else {
                console.log(`SOP Socket: Opening connection for ${userId}...`);
                socket.connect();
            }
        }
    } catch (err) {
        console.error("SOP Socket: Error parsing profile", err);
    }
};

socket.onAny((event, ...args) => {
    console.log("GLOBAL SOCKET CATCH:", event, args);
});
window.debugSocket = socket;
console.log();
