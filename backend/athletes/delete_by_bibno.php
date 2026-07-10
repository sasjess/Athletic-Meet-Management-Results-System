<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "status" => "error",
        "message" => "Only POST method allowed"
    ]);
    exit;
}

$user = authenticate();
authorize(['admin', 'meet_manager', 'data_entry_operator'], $user);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['bib_no'])) {
    echo json_encode([
        "status" => "error",
        "message" => "bib_no required"
    ]);
    exit;
}

$bib_no = (int) $data['bib_no'];

$check = $conn->prepare("SELECT bib_no FROM athletes WHERE bib_no = ?");
$check->bind_param("i", $bib_no);
$check->execute();
$result = $check->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Athlete not found"
    ]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM athletes WHERE bib_no = ?");
$stmt->bind_param("i", $bib_no);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        "status" => "success",
        "message" => "Athlete deleted successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Delete failed"
    ]);
}

exit;