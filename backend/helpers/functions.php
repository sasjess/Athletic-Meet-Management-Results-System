<?php

function calculatePoints($position) {
    if ($position == 1) return 10;
    if ($position == 2) return 7;
    if ($position == 3) return 5;
    return 0;
}



function sendResponse($status, $message, $data = null)
{
    header("Content-Type: application/json");

    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}
?>