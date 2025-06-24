import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://localhost:4010";
// process.env.NODE_ENV === "production" ? undefined : "http://localhost:4010";

export const socket = io(URL);
