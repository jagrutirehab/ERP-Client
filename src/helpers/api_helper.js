import axios from "axios";
import { api } from "../config";
import history from "../Routes/HistoryRoute";

// ✅ Main Axios setup (unchanged)
axios.defaults.baseURL = api.API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

let token = null;
try {
  const persistRoot = JSON.parse(localStorage.getItem("persist:root"));
  const userState = persistRoot?.User;
  const user = userState ? JSON.parse(userState).user : null;
  token = user?.token || null;
} catch (e) {
  console.log(" Could not parse persisted user token:", e);
}

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
} else {
  delete axios.defaults.headers.common["Authorization"];
}

// ✅ Main API response interceptor
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

// ✅ Optional token setter
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

// ✅ Separate Axios instance for AUTH_SERVICE_URL
const authAxios = axios.create({
  baseURL: api.AUTH_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Automatically set token for authAxios
if (token) {
  authAxios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

// ✅ Optional interceptor for authAxios (optional)
authAxios.interceptors.response.use(
  (response) => (response.data ? response.data : response),
  (error) => {
    console.error("❌ Auth API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(
      error?.response?.data || { message: "Auth service error!" }
    );
  }
);

// ✅ Reusable API client (for main API_URL)
class APIClient {
  get = (url, params) => {
    let response;
    let paramKeys = [];

    if (params) {
      Object.keys(params).forEach((key) => {
        paramKeys.push(`${key}=${params[key]}`);
      });

      const queryString = paramKeys.length > 0 ? paramKeys.join("&") : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };

  create = (url, data, headers) => {
    return axios.post(url, data, headers);
  };

  update = (url, data) => {
    return axios.patch(url, data);
  };

  put = (url, data, headers) => {
    return axios.put(url, data, headers);
  };

  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}

// ✅ Auth API client (for AUTH_SERVICE_URL)
class AuthAPIClient {
  get = (url, config = {}) => authAxios.get(url, config);
  post = (url, data, config = {}) => authAxios.post(url, data, config);
  put = (url, data, config = {}) => authAxios.put(url, data, config);
  patch = (url, data, config = {}) => authAxios.patch(url, data, config);
  delete = (url, config = {}) => authAxios.delete(url, { ...config });
}

// ✅ Get logged-in user
const getLoggedinUser = () => {
  try {
    const persistRoot = JSON.parse(localStorage.getItem("persist:root"));
    const userState = persistRoot?.User;
    const user = userState ? JSON.parse(userState).user : null;
    return user;
  } catch (e) {
    console.warn("Could not parse persisted user data:", e);
    return null;
  }
};

export { APIClient, AuthAPIClient, setAuthorization, getLoggedinUser };
