<?php

require_once "../config/db.php";
require_once "../helpers/functions.php";


header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

// Fetch data
$sql = "SELECT school_id, school_name, province, district, city, created_at 
        FROM schools 
        ORDER BY school_id DESC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "Query failed: " . $conn->error
    ]);
    exit();
}

$schools = [];

while ($row = $result->fetch_assoc()) {
    $schools[] = $row;
}

// FINAL OUTPUT (no sendResponse, no risk)
echo json_encode([
    "status" => "success",
    "message" => "Schools fetched successfully",
    "data" => $schools
]);

exit();
?>