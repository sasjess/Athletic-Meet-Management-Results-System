<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$bib_no      = $data['bib_no'] ?? null;
$event_id    = $data['event_id'] ?? null;
$lane_number = $data['lane_number'] ?? null;
$heat_number = $data['heat_number'] ?? 1;

if (!$bib_no || !$event_id) {
    echo json_encode(["status" => "error", "message" => "Missing Athlete or Event selections."]);
    exit();
}

/* RULE ENFORCEMENT: Check how many individual events this athlete has already.
  Assumes relay events contain the word 'relay' or you track event_type.
  For simplicity, we check total entries in individual tables.
*/
$count_stmt = $conn->prepare("
    SELECT COUNT(*) as current_events 
    FROM athlete_event ae
    JOIN events e ON ae.event_id = e.event_id
    WHERE ae.bib_no = ? AND LOWER(e.event_name) NOT LIKE '%relay%'
");
$count_stmt->bind_param("i", $bib_no);
$count_stmt->execute();
$count_result = $count_stmt->get_result()->fetch_assoc();

if ($count_result['current_events'] >= 3) {
    echo json_encode([
        "status" => "error", 
        "message" => "Registration Denied: Athlete has already reached the maximum limit of 3 individual events."
    ]);
    exit();
}

/* Insert execution if within legal limits */
$stmt = $conn->prepare("
    INSERT INTO athlete_event (bib_no, event_id, lane_number, heat_number) 
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("iiii", $bib_no, $event_id, $lane_number, $heat_number);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Athlete assigned successfully!"]);
} else {
    if ($conn->errno === 1062) {
        echo json_encode(["status" => "error", "message" => "This athlete is already assigned to this event!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database operation failed."]);
    }
}
exit();