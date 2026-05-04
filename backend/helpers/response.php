<?php
// backend/helpers/response.php

function sendResponse(bool $success, string $message, int $httpCode = 200, array $data = []): void {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=UTF-8');

    $body = [
        'success'   => $success,
        'message'   => $message,
        'timestamp' => date('c'),
    ];

    if (!empty($data)) {
        $body['data'] = $data;
    }

    echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}