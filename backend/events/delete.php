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

if (!isset($data['event_id'])) {
    echo json_encode(["error" => "Missing event_id"]);
    exit;
}

$id = $data['event_id'];

$result = deleteEvent($id);

if ($result) {
    echo json_encode(["message" => "Event deleted"]);
} else {
    echo json_encode(["message" => "Delete failed"]);
}
?>