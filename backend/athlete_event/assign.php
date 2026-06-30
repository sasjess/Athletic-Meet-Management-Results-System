<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Use POST method"]);
    exit;
}

// require admin to assign
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

$data = json_decode(file_get_contents("php://input"), true);

$sql = "INSERT INTO athlete_event (bib_no, event_id)
        VALUES (?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii",
    $data['bib_no'],
    $data['event_id']
);

if ($stmt->execute()) {
    echo json_encode(["message" => "Athlete assigned to event"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>