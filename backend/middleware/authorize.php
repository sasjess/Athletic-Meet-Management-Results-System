<?php

function authorize($roles, $user) {

    if (!in_array($user['role'], $roles)) {

        http_response_code(403);

        exit(json_encode([
            "message" => "Access denied"
        ]));
    }
}