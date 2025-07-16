import axios from "axios";
import { api } from "../config";
import history from "../Routes/HistoryRoute";
import { toast } from "react-toastify";
axios.defaults.baseURL = api.API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = "include";
const authUser = localStorage.getItem("authUser");
const token = authUser ? JSON.parse(authUser).token : null;

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
} else {
  toast.error("⚠️ No token found, Authorization header not set");
}

axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      logout: error?.response?.data?.logout,
    });
    if (error?.response?.data?.logout) {
      history.replace("/logout");
    }
    return Promise.reject(
      error?.response?.data || { message: "Something went wrong!" }
    );
  }
);
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  get = (url, params) => {
    let response;

    let paramKeys = [];

    if (params) {
      Object.keys(params).map((key) => {
        paramKeys.push(key + "=" + params[key]);
        return paramKeys;
      });

      const queryString =
        paramKeys && paramKeys.length ? paramKeys.join("&") : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };
  /**
   * post given data to url
   */
  create = (url, data, headers) => {
    return axios.post(url, data, headers);
  };
  /**
   * Updates on certain data
   */
  update = (url, data) => {
    return axios.patch(url, data);
  };
  /**
   * Updates whole data
   */
  put = (url, data, headers) => {
    return axios.put(url, data, headers);
  };
  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}

const getLoggedinUser = () => {
  const user = localStorage.getItem("authUser");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };
