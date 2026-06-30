<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode(["error" => "Use GET method"]);
    exit;
}

// Only admin can list all events
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

$data = getAllEvents();

echo json_encode($data);
?>