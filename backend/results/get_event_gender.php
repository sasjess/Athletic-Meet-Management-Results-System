<?php
include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


   //ALLOW ONLY GET METHOD

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}


   //VALIDATE INPUT

if (!isset($_GET['event_id']) || !isset($_GET['gender_id'])) {
    sendResponse("error", "event_id and gender_id are required");
}

$event_id = $_GET['event_id'];
$gender_id = $_GET['gender_id'];


   //GET FILTERED RESULTS

$stmt = $conn->prepare("
SELECT 
    r.*,
    a.name AS athlete_name,
    e.event_name
FROM results r
JOIN athletes a ON r.bib_no = a.bib_no
JOIN events e ON r.event_id = e.event_id
WHERE r.event_id = ? AND r.gender_id = ?
");

$stmt->bind_param("is", $event_id, $gender_id);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}


   //RESPONSE

echo json_encode([
    "status" => "success",
    "event_id" => $event_id,
    "gender_id" => $gender_id,
    "count" => count($data),
    "data" => $data
]);
?>