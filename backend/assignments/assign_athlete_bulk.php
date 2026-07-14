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
$bib_no               = $data['bib_no'] ?? null;
$meet_id              = $data['meet_id'] ?? null;
$individual_event_ids = $data['individual_event_ids'] ?? [];
$relay_event_ids      = $data['relay_event_ids'] ?? [];

if (!$bib_no) {
    echo json_encode(["status" => "error", "message" => "Missing athlete identity registration value."]);
    exit();
}

if (!$meet_id) {
    echo json_encode(["status" => "error", "message" => "Missing meet_id — cannot register events without an active meet."]);
    exit();
}

// 1. BACKEND SAFETY ENFORCEMENT 
if (count($individual_event_ids) > 3) {
    echo json_encode(["status" => "error", "message" => "Database Rejected: Attempted to link more than 3 individual events."]);
    exit();
}

// Combine all chosen events to write into the database table
$all_event_ids = array_merge($individual_event_ids, $relay_event_ids);

// Use a transaction so it either saves everything cleanly or rolls back on a failure
$conn->begin_transaction();

try {
    // Only clear this athlete's entries for THIS meet — past meets' history stays intact
    $delete_stmt = $conn->prepare("DELETE FROM athlete_event WHERE bib_no = ? AND meet_id = ?");
    $delete_stmt->bind_param("ii", $bib_no, $meet_id);
    $delete_stmt->execute();

    // Loop through and insert each row sequentially
    if (!empty($all_event_ids)) {
        $insert_stmt = $conn->prepare("INSERT INTO athlete_event (bib_no, event_id, meet_id, heat_number) VALUES (?, ?, ?, 1)");
        foreach ($all_event_ids as $event_id) {
            $insert_stmt->bind_param("iii", $bib_no, $event_id, $meet_id);
            $insert_stmt->execute();
        }
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Athlete registration profile updated successfully."]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Transaction processing failed: " . $e->getMessage()]);
}
exit();