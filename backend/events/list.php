<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. DYNAMIC CORS HEADERS FOR PORT 5173
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode(["status" => "error", "message" => "Use GET method"]);
    exit;
}

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

$data = getAllEvents();

// 2. FORMAT UNIFORMLY FOR YOUR FRONTEND LOADER
echo json_encode([
    "status" => "success",
    "message" => "Events retrieved successfully",
    "data" => $data
]);
exit();
?>