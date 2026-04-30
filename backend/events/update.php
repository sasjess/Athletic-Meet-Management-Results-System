<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "event_model.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($data['event_id'], $data['event_name'], $data['event_type'], $data['gender_id'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$id = $data['event_id'];
$name = $data['event_name'];
$type = $data['event_type'];
$gender_id = $data['gender_id'];

$result = updateEvent($id, $name, $type, $gender_id);

if ($result) {
    echo json_encode(["message" => "Event updated"]);
} else {
    echo json_encode(["message" => "Update failed"]);
}
?>