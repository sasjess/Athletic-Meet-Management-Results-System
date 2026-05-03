<?php

include "../config/db.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Allow only DELETE (or POST for Postman compatibility) */
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "status" => "error",
        "message" => "Only DELETE method allowed"
    ]);
    exit();
}

/* Read JSON input */
$input = json_decode(file_get_contents("php://input"), true);

/* Validate ID */
if (!$input || !isset($input['school_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "school_id is required"
    ]);
    exit();
}

$school_id = (int) $input['school_id'];

/* Check if exists first (optional but good practice) */
$check = $conn->prepare("SELECT school_id FROM schools WHERE school_id = ?");
$check->bind_param("i", $school_id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "School not found"
    ]);
    exit();
}

/* Delete query */
$stmt = $conn->prepare("DELETE FROM schools WHERE school_id = ?");
$stmt->bind_param("i", $school_id);

/* Execute */
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Delete failed: " . $conn->error
    ]);
    exit();
}

echo json_encode([
    "status" => "success",
    "message" => "School deleted successfully"
]);

exit();