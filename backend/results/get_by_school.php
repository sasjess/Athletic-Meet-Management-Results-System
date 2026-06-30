<?php
include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/* =========================
   ALLOW ONLY GET METHOD
========================= */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

/* =========================
   VALIDATE INPUT
========================= */
if (!isset($_GET['school_name'])) {
    sendResponse("error", "school_name is required");
}

$school_name = $_GET['school_name'];

/* =========================
   GET RESULTS
========================= */
$stmt = $conn->prepare("\nSELECT 
    r.*, 
    a.name AS athlete_name, 
    s.name AS school_name, 
    e.event_name
FROM results r
JOIN athletes a ON r.bib_no = a.bib_no
JOIN schools s ON a.school_id = s.school_id
JOIN events e ON r.event_id = e.event_id
WHERE s.name LIKE CONCAT('%', ?, '%')");

$stmt->bind_param("s", $school_name);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

/* =========================
   RESPONSE
========================= */
echo json_encode([
    "status" => "success",
    "school_name" => $school_name,
    "count" => count($data),
    "data" => $data
]);
?>