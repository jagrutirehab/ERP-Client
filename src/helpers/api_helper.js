import axios from "axios";
import { api } from "../config";
import history from "../Routes/HistoryRoute";

console.log(api, "api");

// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = "include";

// content type
const authUser = localStorage.getItem("authUser");
console.log("🔍 Auth user from localStorage:", authUser);

const token = authUser ? JSON.parse(authUser).token : null;
console.log("🔑 Token from localStorage:", token ? "Found" : "Not found");

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  console.log("✅ Authorization header set");
} else {
  console.log("⚠️ No token found, Authorization header not set");
}

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    console.log("✅ API Response:", response.config.url, response.status);
    return response.data ? response.data : response;
  },
  function (error) {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      logout: error?.response?.data?.logout,
    });

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // let message;
    // switch (error.status) {
    //   case 500:
    //     message = "Internal Server Error";
    //     break;
    //   case 401:
    //     message = "Invalid credentials";
    //     break;
    //   case 404:
    //     message = "Sorry! the data you are looking for could not be found";
    //     break;
    //   default:
    //     message = error.message || error;
    // }
    if (error?.response?.data?.logout) {
      console.log("🚫 Logout flag detected, redirecting to /logout");
      history.replace("/logout");
    }
    return Promise.reject(
      error?.response?.data || { message: "Something went wrong!" }
    );
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */
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
