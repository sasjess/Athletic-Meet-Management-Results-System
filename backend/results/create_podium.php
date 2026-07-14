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
$heat_no = (int)($data['heat_no'] ?? 1);

$conn->begin_transaction();

try {
    foreach ($data['results'] as $row) {
        $bib_no = (int)$row['bib_no'];
        $position = (int)$row['position']; // Automatically mapped via position index from React (1, 2, 3)
        $points = (float)$row['points'];
        
        $perf_time = isset($row['performance_time']) ? (float)$row['performance_time'] : null;
        $perf_dist = isset($row['performance_distance']) ? (float)$row['performance_distance'] : null;

        // Automatically infer the correct gender constraint based on the student's background configuration details
        $gender_query = "SELECT gender FROM athletes WHERE bib_no = ? LIMIT 1";
        $g_stmt = $conn->prepare($gender_query);
        $g_stmt->bind_param("i", $bib_no);
        $g_stmt->execute();
        $g_res = $g_stmt->get_result()->fetch_assoc();
        $gender_id = $g_res ? $g_res['gender'] : 'M'; // Fallback safe variable fallback flag

        // Deduplicate: ensure an athlete cannot have two concurrent placements in the identical phase tier configuration
        $del = $conn->prepare("DELETE FROM results WHERE meet_id = ? AND event_id = ? AND agegroup_id = ? AND stage_id = ? AND position = ?");
        $del->bind_param("iiiii", $meet_id, $event_id, $agegroup_id, $stage_id, $position);
        $del->execute();

        $stmt = $conn->prepare("
            INSERT INTO results 
            (bib_no, event_id, meet_id, agegroup_id, gender_id, performance_time, performance_distance, stage_id, heat_no, position, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "iiiiisddiid",
            $bib_no, $event_id, $meet_id, $agegroup_id, $gender_id,
            $perf_time, $perf_dist, $stage_id, $heat_no, $position, $points
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