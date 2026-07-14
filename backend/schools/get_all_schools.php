<?php
include "../config/db.php";
include "../helpers/functions.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["status" => "error", "message" => "Only GET method is allowed"]);
    exit();
}

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

/* Fetch all schools */
$result = $conn->query("SELECT school_id, school_name ,province,district,city FROM schools ORDER BY school_name ASC");

if (!$result) {
    echo json_encode(["status" => "error", "message" => "Query execution failed"]);
    exit();
}

$schools = [];
while ($row = $result->fetch_assoc()) {
    $schools[] = $row;
}

echo json_encode([
    "status" => "success",
    "message" => "Schools retrieved successfully",
    "data" => $schools
]);
exit();