<?php

$allowedOrigins = [
    'http://localhost:3000',    // React dev server (npm start / vite)
    'http://localhost:5173',    // Vite default port
    'https://yourdomain.com',   // ← replace with your live domain
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Credentials: true');          // Allow session cookies cross-origin
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Preflight — browser sends OPTIONS before the real POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Imports ───────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/auth_model.php';

// Start (or resume) the hardened session
SessionManager::start();


// ── Step 1: Accept POST only ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed. Use POST.', 405);
}


// ── Step 2: Already authenticated? ───────────────────────────────────────────
// React may re-mount and call /login even when the user has an active session.
// Return early instead of forcing a re-login.
if (SessionManager::isLoggedIn()) {
    sendResponse(true, 'Already logged in.', 200, [
        'user' => SessionManager::getUserData(),
    ]);
}


// ── Step 3: Parse the JSON body from React ────────────────────────────────────
$rawBody = file_get_contents('php://input');
$input   = json_decode($rawBody, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
    // Fallback to form-data for Postman testing convenience
    $input = $_POST;
}


// ── Step 4: Validate required fields ─────────────────────────────────────────
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';       // Do NOT trim — spaces are valid in passwords

if ($username === '') {
    sendResponse(false, 'Username is required.', 400);
}

if ($password === '') {
    sendResponse(false, 'Password is required.', 400);
}

// Sanity length checks — prevents absurdly large payloads
if (strlen($username) > 100) {
    sendResponse(false, 'Username must be 100 characters or fewer.', 400);
}

if (strlen($password) > 255) {
    sendResponse(false, 'Password must be 255 characters or fewer.', 400);
}


// ── Step 5: Query the database by username ONLY ───────────────────────────────
// Retrieving the row by username and then verifying the password in PHP is the
// correct pattern. Do NOT add WHERE password = ? — that leaks timing information
// and prevents bcrypt rehashing.
$model = new AuthModel();
$user  = $model->findUserByUsername($username);


// ── Step 6: Check whether the user exists ────────────────────────────────────
// Return the SAME message for "wrong username" and "wrong password" so that
// attackers cannot enumerate valid usernames by observing different errors.
if ($user === null) {
    sendResponse(false, 'Invalid username or password.', 401);
}


// ── Step 7: Check whether the account is active ──────────────────────────────
if (!(bool) $user['is_active']) {
    sendResponse(false, 'This account has been deactivated. Please contact the system administrator.', 403);
}


// ── Step 8: Role gate — this endpoint is for admins only ─────────────────────
if ($user['role'] !== 'admin') {
    sendResponse(false, 'Access denied. Administrator privileges are required.', 403);
}


// ── Step 9: Verify password with password_verify() ────────────────────────────
// password_verify() is:
//   ✅ Constant-time (immune to timing attacks)
//   ✅ Designed for bcrypt hashes produced by password_hash()
//   ❌ Never use == or === to compare passwords or hashes
if (!password_verify($password, $user['password'])) {
    sendResponse(false, 'Invalid username or password.', 401);
}


// ── Step 10: Transparent hash upgrade ────────────────────────────────────────
// If the bcrypt cost has been raised since this password was last hashed,
// silently re-hash it now while we still have the plain-text password in memory.
// The user never notices — their login just stays secure automatically.
if (password_needs_rehash($user['password'], PASSWORD_BCRYPT, ['cost' => 12])) {
    $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $model->updatePasswordHash((int) $user['id'], $newHash);
}


// ── Step 11: Persist the session ─────────────────────────────────────────────
// setUser() internally calls session_regenerate_id() to prevent session fixation.
SessionManager::setUser($user);

// Record the login timestamp for audit purposes
$model->recordLogin((int) $user['id']);


// ── Step 12: Return success to React ─────────────────────────────────────────
// Never return the password hash. Return only safe, display-ready fields.
sendResponse(true, 'Login successful.', 200, [
    'user' => [
        'id'        => (int) $user['id'],
        'username'  => $user['username'],
        'full_name' => $user['full_name'],
        'role'      => $user['role'],
    ],
]);