<?php
require_once "user_model.php";
require_once "jwt_helper.php";
require_once "../config/db.php";

// 🔐 LOGIN
function login($data) {

    if (!isset($data['username']) || !isset($data['password'])) {
        echo json_encode(["error" => "Missing fields"]);
        return;
    }

    $user = getUserByUsername($data['username']);

    if (!$user) {
        echo json_encode(["error" => "User not found"]);
        return;
    }

    if (!password_verify($data['password'], $user['password'])) {
        echo json_encode(["error" => "Invalid password"]);
        return;
    }

    $token = generateJWT($user);

    echo json_encode([
        "message" => "Login successful",
        "token" => $token,
        "role" => $user['role']
    ]);
    exit;
}


// 🆕 REGISTER (AUTO HASH)
function register($data) {
    global $conn;

    if (!isset($data['username'], $data['password'], $data['role'])) {
        echo json_encode(["error" => "Missing fields"]);
        //return;
        exit;
    }

    $username = $data['username'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT); // ✅ HASH HERE
    $role = $data['role'];

    $allowed_roles = ['admin','meet_manager','data_entry_operator'];
    if (!in_array($role, $allowed_roles)) {
        echo json_encode(["error" => "Invalid role"]);
        return;
    }

    $sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $password, $role);

   if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully"
    ]);
    } else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
    exit;
}
}
?>