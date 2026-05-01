<?php
header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "message" => "Athletics Management API is running",
    "modules" => [
        "athletes",
        "events",
        "results"
    ]
]);
?>