import axios from "axios";

/* Fake transport. Installed on axios.defaults BEFORE api_helper is loaded so
 * that authAxios (created via axios.create) inherits it too. */
let handle = () => ({ status: 200, data: {} });
let calls = [];

const adapter = (config) => {
  calls.push(config.url);
  const { status, data } = handle(config);
  const response = {
    data,
    status,
    statusText: "",
    headers: {},
    config,
    request: {},
  };
  if (status >= 200 && status < 300) return Promise.resolve(response);

  const err = new Error(`Request failed with status code ${status}`);
  err.config = config;
  err.response = response;
  err.isAxiosError = true;
  return Promise.reject(err);
};

axios.defaults.adapter = adapter;

// eslint-disable-next-line import/first
const { APIClient, ensureCsrf } = require("../api_helper");

const api = new APIClient();
const CSRF_COOKIE = "XSRF-TOKEN";

const setCookie = (v) => {
  document.cookie = `${CSRF_COOKIE}=${v}; path=/`;
};
const clearCookies = () => {
  document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter(Boolean)
    .forEach((n) => {
      document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
};

const csrfInvalid = {
  status: 400,
  data: { error: true, code: "CSRF_INVALID", message: "Bad Request" },
};
const countOf = (fragment) =>
  calls.filter((u) => u.includes(fragment)).length;

beforeEach(() => {
  calls = [];
  clearCookies();
  localStorage.clear();
  localStorage.setItem("authUser", JSON.stringify({ token: "jwt-123" }));
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("CSRF recovery", () => {
  // The exact reported bug: valid JWT in localStorage, CSRF cookies evicted by
  // the browser. Previously this logged the user out.
  it("re-mints the token and replays the request when CSRF cookies were evicted", async () => {
    handle = (config) => {
      if (config.url.includes("/csrf-token")) {
        setCookie("fresh-token");
        return { status: 200, data: { success: true } };
      }
      return document.cookie.includes(CSRF_COOKIE)
        ? { status: 200, data: { payload: "patients" } }
        : csrfInvalid;
    };

    const result = await api.get("/patients");

    expect(result).toEqual({ payload: "patients" });
    expect(countOf("/csrf-token")).toBe(1);
    expect(countOf("/patients")).toBe(2); // original + replay
    // The session must survive.
    expect(localStorage.getItem("authUser")).toBeTruthy();
  });

  // Recovery must be invisible to callers: an empty-bodied response that had to
  // be replayed should look exactly like one that never failed.
  it("replays to the same result a healthy request would return", async () => {
    const body = { items: [], total: 0 };
    handle = (config) => {
      if (config.url.includes("/csrf-token")) {
        setCookie("fresh-token");
        return { status: 200, data: { success: true } };
      }
      return document.cookie.includes(CSRF_COOKIE)
        ? { status: 200, data: body }
        : csrfInvalid;
    };

    const recovered = await api.get("/empty");
    expect(countOf("/empty")).toBe(2); // original + replay
    expect(countOf("/csrf-token")).toBe(1);

    // Baseline: identical request, CSRF already healthy.
    calls = [];
    const baseline = await api.get("/empty");

    expect(recovered).toEqual(baseline);
    expect(countOf("/csrf-token")).toBe(0);
  });

  it("keeps the user signed in when the retry also fails", async () => {
    handle = (config) =>
      config.url.includes("/csrf-token")
        ? { status: 200, data: { success: true } }
        : csrfInvalid;

    await expect(api.get("/patients")).rejects.toMatchObject({
      code: "CSRF_INVALID",
    });
    expect(localStorage.getItem("authUser")).toBeTruthy();
  });

  it("keeps the user signed in when /csrf-token itself is down", async () => {
    handle = (config) =>
      config.url.includes("/csrf-token")
        ? { status: 500, data: { error: true } }
        : csrfInvalid;

    await expect(api.get("/patients")).rejects.toBeDefined();
    expect(localStorage.getItem("authUser")).toBeTruthy();
  });

  it("retries a request only once", async () => {
    handle = (config) =>
      config.url.includes("/csrf-token")
        ? { status: 200, data: { success: true } }
        : csrfInvalid;

    await expect(api.get("/patients")).rejects.toBeDefined();
    expect(countOf("/patients")).toBe(2);
  });

  it("de-dupes concurrent recoveries into a single /csrf-token call", async () => {
    handle = (config) => {
      if (config.url.includes("/csrf-token")) {
        setCookie("fresh-token");
        return { status: 200, data: { success: true } };
      }
      return document.cookie.includes(CSRF_COOKIE)
        ? { status: 200, data: { ok: config.url } }
        : csrfInvalid;
    };

    await Promise.all([api.get("/a"), api.get("/b"), api.get("/c")]);

    expect(countOf("/csrf-token")).toBe(1);
  });

  it("does not retry an ordinary 400 when the CSRF cookie is present", async () => {
    setCookie("valid-token");
    handle = () => ({
      status: 400,
      data: { error: true, message: "Name is required" },
    });

    await expect(api.get("/patients")).rejects.toMatchObject({
      message: "Name is required",
    });
    expect(countOf("/patients")).toBe(1);
    expect(countOf("/csrf-token")).toBe(0);
  });
});

describe("session termination", () => {
  it("still logs out when the JWT has genuinely expired", async () => {
    setCookie("valid-token");
    handle = () => ({
      status: 401,
      data: { logout: true, message: "Session expired!" },
    });

    await expect(api.get("/patients")).rejects.toBeDefined();
    expect(localStorage.getItem("authUser")).toBeNull();
  });
});

describe("ensureCsrf", () => {
  it("mints a token when the cookie is missing", async () => {
    handle = () => {
      setCookie("fresh-token");
      return { status: 200, data: { success: true } };
    };

    await expect(ensureCsrf()).resolves.toBe(true);
    expect(countOf("/csrf-token")).toBe(1);
  });

  it("skips the round-trip when a token is already present", async () => {
    setCookie("existing-token");

    await expect(ensureCsrf()).resolves.toBe(true);
    expect(countOf("/csrf-token")).toBe(0);
  });

  it("resolves false instead of throwing when the auth service is down", async () => {
    handle = () => ({ status: 500, data: { error: true } });

    await expect(ensureCsrf()).resolves.toBe(false);
  });
});
