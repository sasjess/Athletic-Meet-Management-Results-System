<?php

require_once "../config/db.php";
require_once "../helpers/jwt.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'];
$password = $data['password'];

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->execute([$username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {

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
    echo json_encode([
        "success" => false,
        "message" => "Invalid credentials"
    ]);
}