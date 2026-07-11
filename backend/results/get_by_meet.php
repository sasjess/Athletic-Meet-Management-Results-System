<?php
include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

if (!isset($_GET['meet_id'])) {
    sendResponse("error", "meet_id is required");
}

$meet_id = (int) $_GET['meet_id'];

$sql = "
SELECT 
    r.id,
    r.bib_no,
    a.name AS athlete_name,
    s.school_name,
    e.event_name,
    r.performance_time,
    r.performance_distance,
    r.points,
    r.position,
    r.created_at,
    m.meet_name,
    m.year
FROM results r
JOIN athletes a ON r.bib_no = a.bib_no
LEFT JOIN schools s ON a.school_id = s.school_id
JOIN events e ON r.event_id = e.event_id
JOIN meets m ON r.meet_id = m.meet_id
WHERE r.meet_id = ?
ORDER BY e.event_name ASC, r.position ASC, r.points DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $meet_id);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

sendResponse("success", "Results loaded", $data);
