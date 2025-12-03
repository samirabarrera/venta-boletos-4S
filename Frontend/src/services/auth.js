const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/usarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Login failed (${res.status})`);
  }

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.user) {
    localStorage.setItem("usuario", JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
