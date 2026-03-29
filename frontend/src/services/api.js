const resolveBackendBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    const isGoodwillDomain =
      host === "goodwilledu.in" ||
      host === "www.goodwilledu.in" ||
      host.endsWith(".goodwilledu.in");

    // Force the canonical API host on production domain to avoid stale env mismatches.
    if (isGoodwillDomain) {
      return "https://api.goodwilledu.in";
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return "http://localhost:5000";
};

export const BACKEND_BASE_URL = resolveBackendBaseUrl();
const isDev = import.meta.env.DEV;

let csrfTokenCache = null;
let csrfTokenPromise = null;

const isStateChangingMethod = (method = "GET") =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(String(method).toUpperCase());

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
};

export async function getCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenCache) {
    return csrfTokenCache;
  }

  if (!forceRefresh && csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = (async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/csrf-token`, {
        method: "GET",
        credentials: "include",
      });

      const data = await parseJsonSafely(response);
      const token = data?.csrfToken || null;

      if (response.ok && token) {
        csrfTokenCache = token;
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
}

export async function apiRequest(endpoint, options = {}) {
  // Create AbortController for timeout
  // Longer timeout for form submissions (5 minutes)
  const isFormSubmission =
    options.method === "POST" &&
    (endpoint.includes("/tutor-profile") || endpoint.includes("/tutor-requests"));
  const timeoutDuration = isFormSubmission ? 300000 : 30000; // 5 min for forms, 30 sec for others

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  const method = (options.method || "GET").toUpperCase();
  const isStateChanging = isStateChangingMethod(method);

  const startTime = Date.now();
  if (isDev) {
    console.log(`API Request: ${method} ${endpoint}`);
  }

  try {
    // FIX FOR BRAVE/PRIVACY BROWSERS: Use stored token if available (for third-party cookie blocking)
    const baseHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Check for token in storage (fallback for privacy browsers that block third-party cookies)
    const storedToken = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
    if (storedToken) {
      baseHeaders.Authorization = `Bearer ${storedToken}`;
    }

    if (isStateChanging) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        baseHeaders["x-csrf-token"] = csrfToken;
      }
    }

    const runFetch = (headers) =>
      fetch(`${BACKEND_BASE_URL}${endpoint}`, {
        credentials: "include", // Important: Include cookies in requests
        headers,
        signal: controller.signal,
        ...options,
      });

    let response = await runFetch(baseHeaders);

    if (isDev && endpoint.includes("/auth/login")) {
      console.log("Login response received - cookie should be set automatically by browser");
    }

    let data = await parseJsonSafely(response);

    // If CSRF token has rotated/expired, refresh and retry once.
    if (
      response.status === 403 &&
      isStateChanging &&
      (data?.message?.toLowerCase().includes("csrf") ||
        data?.message?.toLowerCase().includes("security token"))
    ) {
      const refreshedToken = await getCsrfToken(true);
      if (refreshedToken) {
        const retryHeaders = { ...baseHeaders, "x-csrf-token": refreshedToken };
        response = await runFetch(retryHeaders);
        data = await parseJsonSafely(response);
      }
    }

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    if (isDev) {
      console.log(`API Response: ${endpoint} (${duration}ms)`);
    }

    if (!response.ok) {
      // Don't log 401 errors for /auth/verify (expected when not logged in)
      const isAuthVerify = endpoint.includes("/auth/verify");
      const isUnauthorized = response.status === 401;

      if (!(isAuthVerify && isUnauthorized)) {
        console.error(`API Error: ${endpoint} - ${data?.message || response.statusText}`);
      }
      throw new Error(data?.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // Don't log expected 401 errors for auth verification
    const isAuthVerify = endpoint.includes("/auth/verify");
    const isUnauthorized = error.message && error.message.includes("Not authenticated");

    if (!(isAuthVerify && isUnauthorized)) {
      console.error(`API Request Failed: ${endpoint} (${duration}ms)`, error);
    }

    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error("Cannot connect to server. Please make sure the backend is running.");
    }
    throw error;
  }
}
