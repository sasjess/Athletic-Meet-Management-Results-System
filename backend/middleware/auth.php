<?php

require_once __DIR__ . '/../helpers/jwt.php';

function authenticate() {

    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        exit(json_encode(["message" => "No token"]));
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);

    $user = verifyJWT($token);

    if (!$user) {
        http_response_code(401);
        exit(json_encode(["message" => "Invalid token"]));
    }

    return $user;
}