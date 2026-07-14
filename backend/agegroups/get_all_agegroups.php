<?php
include "../config/db.php";
include "../helpers/functions.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// Authenticate and authorize users
$user = authenticate();
authorize(['admin', 'meet_manager', 'data_entry_operator'], $user);

/* Fetch all age groups using your exact database schema */
$query = "SELECT agegroup_id, group_name FROM age_groups ORDER BY agegroup_id ASC";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "Query execution failed: " . $conn->error
    ]);
    exit();
}

$agegroups = [];
while ($row = $result->fetch_assoc()) {
    $agegroups[] = $row;
}

echo json_encode([
    "status" => "success",
    "message" => "Age groups retrieved successfully",
    "data" => $agegroups
]);
exit();