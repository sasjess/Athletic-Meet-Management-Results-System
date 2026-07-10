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

/* =========================
   ALLOW ONLY GET METHOD
========================= */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

/* =========================
   GET RESULTS
========================= */
$sql = "
SELECT 
    r.*,
    a.name AS athlete_name,
    e.event_name
FROM results r
JOIN athletes a ON r.bib_no = a.bib_no
JOIN events e ON r.event_id = e.event_id
";

$result = $conn->query($sql);

if (!$result) {
    sendResponse("error", "Database query failed");
}

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

/* =========================
   RESPONSE
========================= */
echo json_encode([
    "status" => "success",
    "count" => count($data),
    "data" => $data
]);
?>