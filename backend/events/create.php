<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. MATCH YOUR FIXED APP CORS CONFIGURATION EXACTLY
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

// Authentication
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "status"=>"error",
        "message"=>"Only POST allowed"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "status"=>"error",
        "message"=>"Invalid JSON"
    ]);
    exit;
}

if (empty($data['event_name']) || empty($data['event_type'])) {
    echo json_encode([
        "status"=>"error",
        "message"=>"Missing required fields"
    ]);
    exit;
}

// 2. STANDARDIZE THE FORMAT OF EVENT TYPE
// Forces "relay", "RELAY", or "relay " into "Relay" to match strict SQL definitions
$raw_type = trim((string)$data['event_type']);
$clean_type = ucfirst(strtolower($raw_type)); // Converts 'relay' -> 'Relay'

$gender_id = $data['gender_id'] ?? [];
$agegroup_ids = $data['agegroup_id'] ?? $data['agegroup_ids'] ?? [];

if (!is_array($gender_id)) {
    $gender_id = array_filter([trim((string) $gender_id)], 'strlen');
}

if (!is_array($agegroup_ids)) {
    $agegroup_ids = array_filter([trim((string) $agegroup_ids)], 'strlen');
}

$gender_id = array_values(array_unique(array_map('strval', $gender_id)));
$agegroup_ids = array_values(array_unique(array_map('intval', $agegroup_ids)));

if (empty($gender_id)) {
    echo json_encode([
        "status"=>"error",
        "message"=>"Please select at least one gender"
    ]);
    exit;
}

if (empty($agegroup_ids)) {
    echo json_encode([
        "status"=>"error",
        "message"=>"Please select at least one age group"
    ]);
    exit;
}

// 3. SEND NORMALIZED INPUT DATA INTO DB INTERFACE LAYER
$result = createEvent(
    trim((string)$data['event_name']),
    $clean_type, // Passes the explicitly capitalized type string
    $gender_id,
    $agegroup_ids
);

if ($result) {
    echo json_encode([
        "status"=>"success",
        "message"=>"Event created successfully"
    ]);
} else {
    echo json_encode([
        "status"=>"error",
        "message"=>"Database insert failed. Please ensure your database ENUM allows 'Relay'."
    ]);
}
exit;
?>