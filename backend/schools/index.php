<?php

require_once "../config/db.php";
require_once "../helpers/functions.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

// Require admin to fetch all schools
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

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