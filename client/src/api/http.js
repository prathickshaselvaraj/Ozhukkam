const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const TOKEN_KEY = "ozh_token";
const USER_KEY = "ozh_user";

export async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

export { API_BASE };