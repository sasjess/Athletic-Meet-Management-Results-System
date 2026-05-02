<?php
// backend/auth/logout.php
// ─────────────────────────────────────────────────────────────────────────────
// Endpoint : POST /backend/auth/logout.php
// Consumer : React frontend
// Action   : Destroys the PHP session and clears the session cookie.
//
// React usage:
//   await fetch('/backend/auth/logout.php', {
//     method: 'POST',
//     credentials: 'include',   // ← required so the session cookie is sent
//   });
//   // Then redirect to /login
//
// Response (200 — always):
//   { "success": true, "message": "Goodbye, admin. You have been logged out." }
// ─────────────────────────────────────────────────────────────────────────────


// ── CORS — must match login.php exactly ──────────────────────────────────────
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yourdomain.com',    // ← replace with your live domain
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Imports ───────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/session.php';

// Resume the existing session so we can read and then destroy it
SessionManager::start();

// ── POST only ─────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed. Use POST.', 405);
}

// ── Capture the username before destroying the session ───────────────────────
// Once destroy() runs, $_SESSION is empty, so read first.
$username = SessionManager::getUsername();
$wasLoggedIn = SessionManager::isLoggedIn();

// ── Destroy session: wipes server-side data + expires the cookie ──────────────
SessionManager::destroy();

// ── Respond ───────────────────────────────────────────────────────────────────
// Always return 200, even if the user was not logged in.
// React should redirect to /login regardless.
if ($wasLoggedIn && $username) {
    sendResponse(true, "Goodbye, {$username}. You have been logged out.", 200);
} else {
    sendResponse(true, 'Logged out successfully.', 200);
}