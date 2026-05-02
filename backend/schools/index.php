<?php

require_once "../config/db.php";

header("Content-Type: application/json");

// Fetch data
$sql = "SELECT id, school_name, province, district, city, created_at 
        FROM schools 
        ORDER BY id DESC";

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