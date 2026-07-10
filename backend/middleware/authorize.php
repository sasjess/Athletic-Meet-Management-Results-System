<?php

function authorize($roles, $user) {
    if (!is_array($roles) || empty($roles)) {
        http_response_code(403);
        exit(json_encode(["message" => "Access denied"]));
    }

    if (!is_array($user) || !isset($user['role']) || !in_array($user['role'], $roles, true)) {
        http_response_code(403);
        exit(json_encode(["message" => "Access denied"]));
    }
}