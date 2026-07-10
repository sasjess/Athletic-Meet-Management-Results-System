<?php

require_once __DIR__ . '/../helpers/jwt.php';

function authenticate() {
    $headers = getallheaders();
    $authHeader = null;

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!$authHeader || !preg_match('/^Bearer\s+(\S+)$/', $authHeader, $matches)) {
        http_response_code(401);
        exit(json_encode(["message" => "No token provided"]));
    }

    $token = $matches[1];
    $user = verifyJWT($token);

    if (!$user) {
        http_response_code(401);
        exit(json_encode(["message" => "Invalid or expired token"]));
    }

    return $user;
}