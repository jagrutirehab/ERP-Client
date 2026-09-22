import axios from "axios";
import { api } from "../config";
const reportsMakerAxios = axios.create({
  baseURL: api.REPORTS_MAKER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
reportsMakerAxios.defaults.withCredentials = true;
reportsMakerAxios.defaults.withXSRFToken = true;

const microUser = localStorage.getItem("micrologin");
const microToken = microUser ? JSON.parse(microUser).token : null;
if (microToken) {
  reportsMakerAxios.defaults.headers.common["Authorization"] = "Bearer " + microToken;
}

reportsMakerAxios.interceptors.response.use(
  (response) => (response.data ? response.data : response),
  (error) => {
    console.error("❌ Reports Maker API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      noResponseReceived: !error.response,
    });
    return Promise.reject(
      error.response?.data || { message: error.message || "Reports Maker service error!" }
    );
  }
);

export const getActiveReports = () => reportsMakerAxios.get("/reports/active");

export const runReport = (reportKey) =>
  reportsMakerAxios.get(`/reports/run/${reportKey}`); 

export const getScripts = () => reportsMakerAxios.get("/scripts");

export const runScript = (scriptName) =>
  reportsMakerAxios.post(`/run/${scriptName}`);

export const getScriptHistory = (scriptName, limit = 50) =>
  reportsMakerAxios.get(`/history/script/${scriptName}`, { params: { limit } });

export const getAllHistory = (limit = 100) => reportsMakerAxios.get(`/history/${limit}`);
