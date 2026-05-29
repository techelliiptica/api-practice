import axios from "axios";

const USERS_API_BASE_URL = import.meta.env.VITE_USERS_API_BASE_URL || "http://localhost:4000/api";
const PRODUCTS_API_BASE_URL = import.meta.env.VITE_PRODUCTS_API_BASE_URL || "http://localhost:4001/api";

function createApi(baseURL) {
  const instance = axios.create({ baseURL, timeout: 15000 });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("um_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const traceId = crypto?.randomUUID?.() ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    config.headers["x-client-trace-id"] = traceId;
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const message = err?.response?.data?.error?.message || err?.message || "Request failed";
      err.userMessage = message;
      return Promise.reject(err);
    }
  );

  return instance;
}

export const usersApi = createApi(USERS_API_BASE_URL);
export const productsApi = createApi(PRODUCTS_API_BASE_URL);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Very small retry utility (useful for random failure toggle).
async function retry(fn, { retries = 2, baseDelayMs = 250 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      const isRetryable =
        !status || (status >= 500 && status <= 599) || status === 503;

      if (!isRetryable || attempt === retries) break;
      await sleep(baseDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastErr;
}

export const apiWithRetry = {
  get(url, config) {
    return retry(() => usersApi.get(url, config));
  },
  post(url, data, config) {
    return retry(() => usersApi.post(url, data, config));
  },
  put(url, data, config) {
    return retry(() => usersApi.put(url, data, config));
  },
  delete(url, config) {
    return retry(() => usersApi.delete(url, config));
  }
};

export const productsApiWithRetry = {
  get(url, config) {
    return retry(() => productsApi.get(url, config));
  }
};

