// frontend/src/api/auth.js

const BASE_URL = "http://localhost/backend/auth";

// ── Login ──────────────────────────────────────────────────────
export async function loginRequest(username, password) {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: "POST",
    credentials: "include",        // ← REQUIRED for session cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// ── Logout ─────────────────────────────────────────────────────
export async function logoutRequest() {
  const res = await fetch(`${BASE_URL}/logout.php`, {
    method: "POST",
    credentials: "include",        // ← REQUIRED for session cookie
  });
  return res.json();
}