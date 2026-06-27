<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin'], $user);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["error" => "Use POST method"]);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($data['event_name'], $data['event_type'], $data['gender_id'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$name = $data['event_name'];
$type = $data['event_type'];
$gender_id = $data['gender_id'];

$result = createEvent($name, $type, $gender_id);

if ($result) {
    echo json_encode(["message" => "Event created"]);
} else {
    echo json_encode(["message" => "Insert failed"]);
}
?>