<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/db.php";
require_once "../helpers/jwt.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
    exit;
}

$sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $username);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
$stmt->close();

$isPasswordValid = false;
$isLegacyPlain = false;

if ($user) {
    if (password_verify($password, $user['password'])) {
        $isPasswordValid = true;
    } elseif ($password === $user['password']) {
        $isPasswordValid = true;
        $isLegacyPlain = true;
    }
}

if ($user && $isPasswordValid) {
    if ($isLegacyPlain) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $update->bind_param('si', $newHash, $user['id']);
        $update->execute();
        $update->close();
    }

    $payload = [
        "id" => $user['id'],
        "username" => $user['username'],
        "role" => $user['role']
    ];

    $token = generateJWT($payload);

    echo json_encode([
        "success" => true,
        "token" => $token,
        "user" => $payload
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
}