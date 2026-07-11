<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    echo json_encode(["error" => "Use DELETE method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($data['event_id'])) {
    echo json_encode(["status" => "error", "message" => "Missing event_id"]);
    exit;
}

$id = $data['event_id'];

$result = deleteEvent($id);

if ($result) {
    echo json_encode(["status" => "success", "message" => "Event deleted"]);
} else {
    echo json_encode(["status" => "error", "message" => "Delete failed"]);
}
?>