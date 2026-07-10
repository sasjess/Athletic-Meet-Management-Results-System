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
   VALIDATE INPUT
========================= */
if (!isset($_GET['bib_no'])) {
    sendResponse("error", "bib_no is required");
}

$bib_no = $_GET['bib_no'];

/* =========================
   GET RESULTS
========================= */
$stmt = $conn->prepare("
SELECT * 
FROM results 
WHERE bib_no = ?
");

$stmt->bind_param("i", $bib_no);
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
    "bib_no" => $bib_no,
    "count" => count($data),
    "data" => $data
]);
?>