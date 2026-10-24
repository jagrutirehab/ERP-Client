import Cookies from "js-cookie";
import { api } from "../config";

const readToken = () => {
  try {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
};

export const postKeepalive = async (path, body) => {
  const headers = { "Content-Type": "application/json" };

  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const xsrfToken = Cookies.get("XSRF-TOKEN");
  if (xsrfToken) headers["X-XSRF-TOKEN"] = xsrfToken;

  const response = await fetch(`${api.API_URL}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    keepalive: true,
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed");
    error.response = { status: response.status, data: payload };
    throw error;
  }

  return payload;
};
