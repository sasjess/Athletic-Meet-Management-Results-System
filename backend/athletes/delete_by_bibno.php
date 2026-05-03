<?php

header("Content-Type: application/json");

require_once "../config/db.php";

/* Only DELETE allowed */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "status" => "error",
        "message" => "Only DELETE method allowed"
    ]);
    exit;
}

/* Read input */
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->bib_no)) {
    echo json_encode([
        "status" => "error",
        "message" => "bib_no is required"
    ]);
    exit;
}

$bib_no = $data->bib_no;

/* Validate */
if (!is_numeric($bib_no) || $bib_no <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid bib_no"
    ]);
    exit;
}

/* Check if exists */
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

/* Delete */
$stmt = $conn->prepare("DELETE FROM athletes WHERE bib_no = ?");
$stmt->bind_param("i", $bib_no);
$stmt->execute();

/* Response */
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