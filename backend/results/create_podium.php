<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
require_once "../config/db.php";
require_once "../middleware/auth.php";

$user = authenticate(); // Validates active login structure tokens

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['meet_id']) || empty($data['event_id']) || empty($data['results'])) {
    echo json_encode(["status" => "error", "message" => "Incomplete request validation profile parameters missing."]);
    exit();
}

$meet_id = (int)$data['meet_id'];
$event_id = (int)$data['event_id'];
$agegroup_id = (int)$data['agegroup_id'];
$stage_id = (int)($data['stage_id'] ?? 1);

// // Handle nullable heat_no: converts empty value/string to true NULL for database
// $heat_no = isset($data['heat_no']) && $data['heat_no'] !== "" ? (int)$data['heat_no'] : null;

// Grab gender_id directly from the request payload sent by the frontend form
$gender_id = $data['gender_id'] ?? 'M'; 

$conn->begin_transaction();

try {
    foreach ($data['results'] as $row) {
        $bib_no = (int)$row['bib_no'];
        $position = (int)$row['position']; // 1, 2, or 3
        
        // 1. AUTOMATICALLY CALCULATE POINTS BASED ON POSITION
        switch ($position) {
            case 1:
                $points = 10.00;
                break;
            case 2:
                $points = 7.00;
                break;
            case 3:
                $points = 5.00;
                break;
            default:
                $points = 0.00;
                break;
        }
        
        // Parse performance inputs safely
        $perf_time = isset($row['performance_time']) && $row['performance_time'] !== null ? (float)$row['performance_time'] : null;
        $perf_dist = isset($row['performance_distance']) && $row['performance_distance'] !== null ? (float)$row['performance_distance'] : null;

        // Deduplicate: ensure an athlete cannot have two concurrent placements in the identical configuration
        $del = $conn->prepare("DELETE FROM results WHERE meet_id = ? AND event_id = ? AND agegroup_id = ? AND stage_id = ? AND position = ?");
        $del->bind_param("iiiii", $meet_id, $event_id, $agegroup_id, $stage_id, $position);
        $del->execute();

        // Ensure target column uses the correct name 'gender_id'
        $stmt = $conn->prepare("
            INSERT INTO results 
            (bib_no, event_id, meet_id, agegroup_id, gender_id, performance_time, performance_distance, stage_id, position, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        // Bind parameter mappings (Types: i = integer, s = string, d = double)
        $stmt->bind_param(
            "iiiiisddid",
            $bib_no, 
            $event_id, 
            $meet_id, 
            $agegroup_id, 
            $gender_id,
            $perf_time, 
            $perf_dist, 
            $stage_id, 
            $position, 
            $points // Pass computed points variable
        );
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Podium records captured completely!"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
exit();