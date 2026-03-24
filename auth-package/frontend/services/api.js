const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
let csrfTokenCache = null;
let csrfPromise = null;

const isStateChangingMethod = (method = "GET") =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(String(method).toUpperCase());

async function getCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenCache) return csrfTokenCache;
  if (!forceRefresh && csrfPromise) return csrfPromise;

  csrfPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const data = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : null;
      const token = data?.csrfToken || null;
      if (response.ok && token) {
        csrfTokenCache = token;
      }
      return token;
    } catch {
      return null;
    } finally {
      csrfPromise = null;
    }
  })();

  return csrfPromise;
}

export async function apiRequest(endpoint, options = {}) {
  const timeoutDuration = 30000; // 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
  const method = (options.method || "GET").toUpperCase();

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (isStateChangingMethod(method)) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include", // Important: Include cookies in requests
      headers,
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      if (response.status === 403 && isStateChangingMethod(method)) {
        const refreshed = await getCsrfToken(true);
        if (refreshed) {
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: "include",
            headers: {
              ...headers,
              "x-csrf-token": refreshed,
            },
            signal: controller.signal,
            ...options,
          });

          const retryData = retryResponse.headers.get("content-type")?.includes("application/json")
            ? await retryResponse.json()
            : null;

          if (retryResponse.ok) {
            return retryData;
          }
        }
      }

      throw new Error(data?.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.");
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error("Cannot connect to server. Please check your connection.");
    }
    throw error;
  }
}

