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
if (!isset($_GET['event_id'])) {
    sendResponse("error", "event_id is required");
}

$event_id = $_GET['event_id'];

/* =========================
   GET RESULTS
========================= */
$stmt = $conn->prepare("
SELECT * 
FROM results 
WHERE event_id = ?
");

$stmt->bind_param("i", $event_id);
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
    "event_id" => $event_id,
    "count" => count($data),
    "data" => $data
]);
?>