const API_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Si no es JSON, lo dejamos como texto
    data = { message: text };
  }

  if (!res.ok) {
    const msg = data?.message || `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
