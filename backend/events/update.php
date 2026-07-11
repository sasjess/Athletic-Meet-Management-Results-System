<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

if ($_SERVER["REQUEST_METHOD"] !== "PUT") {
    echo json_encode(["error" => "Use PUT method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($data['event_id'], $data['event_name'], $data['event_type'], $data['gender_id'], $data['agegroup_id'])) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

$id = $data['event_id'];
$name = $data['event_name'];
$type = $data['event_type'];
$gender_id = $data['gender_id'];
$agegroup_id = $data['agegroup_id'];

$result = updateEvent($id, $name, $type, $gender_id, $agegroup_id);

if ($result) {
    echo json_encode(["status" => "success", "message" => "Event updated"]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed"]);
}
?>