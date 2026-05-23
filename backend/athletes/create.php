<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "../helpers/functions.php";
require_once "../config/db.php";
//require_once "athlete_model.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Only POST */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "status" => "error",
        "message" => "Only POST method allowed"
    ]);
    exit();
}

/* Read JSON */
$data = json_decode(file_get_contents("php://input"), true);

/* Check JSON */
if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input"
    ]);
    exit;
}

/* Extract values */
$bib_no      = trim($data['bib_no'] ?? '');
$name        = trim($data['name'] ?? '');
$school_id   = $data['school_id'] ?? null;
$gender_id   = $data['gender_id'] ?? null;
$agegroup_id = $data['agegroup_id'] ?? null;

/* =========================
   VALIDATION
========================= */
$errors = [];

/* Bib number (must be numeric) */
if ($bib_no === '' || !preg_match("/^[0-9]+$/", $bib_no)) {
    $errors[] = "Invalid bib number (numbers only)";
}

/* Name (letters + space + . ' -) */
if ($name === '' || !preg_match("/^[a-zA-Z\s\.\'\-]+$/", $name)) {
    $errors[] = "Invalid athlete name";
}

/* Validate IDs (must be numeric and > 0) */
if (!is_numeric($school_id) || $school_id <= 0) {
    $errors[] = "Invalid school_id";
}

/* Gender validation (CHAR(1)) */
if ($gender_id === '' || !in_array($gender_id, ['M', 'F'])) {
    $errors[] = "Invalid gender_id (must be M or F)";
}

if (!is_numeric($agegroup_id) || $agegroup_id <= 0) {
    $errors[] = "Invalid agegroup_id";
}

/* Return ALL errors */
if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit;
}

/* =========================
   INSERT
========================= */
$result = createAthlete($bib_no, $name, $school_id, $gender_id, $agegroup_id);

/* Response */
if ($result) {
    echo json_encode([
        "status" => "success",
        "message" => "Athlete created successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Insert failed"
    ]);
}

exit;