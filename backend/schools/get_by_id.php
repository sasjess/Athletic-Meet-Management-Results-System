<?php

include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/* Handle preflight request */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Allow only GET */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "status" => "error",
        "message" => "Only GET method is allowed"
    ]);
    exit();
}

/* Validate school_id */
if (!isset($_GET['school_id']) || empty($_GET['school_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "school_id is required"
    ]);
    exit();
}

$school_id = (int) $_GET['school_id'];

/* Prepare query */
$stmt = $conn->prepare("
    SELECT school_id, school_name, province, district, city, created_at 
    FROM schools 
    WHERE school_id = ?
");

$stmt->bind_param("i", $school_id);

if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Query execution failed"
    ]);
    exit();
}

$result = $stmt->get_result();

/* Check result */
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "No school found for this ID"
    ]);
    exit();
}

$data = $result->fetch_assoc();

echo json_encode([
    "status" => "success",
    "message" => "School found successfully",
    "data" => $data
]);

exit();