<?php

header("Content-Type: application/json");

//require_once "athlete_model.php";
require_once "../helpers/functions.php";
require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);


/* Allow only PUT */
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode([
        "status" => "error",
        "message" => "Only PUT method allowed"
    ]);
    exit;
}

/* Read JSON */
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input"
    ]);
    exit;
}

/* Required fields */
if (
    !isset($data->bib_no) ||
    !isset($data->name) ||
    !isset($data->school_id) ||
    !isset($data->gender_id) ||
    !isset($data->agegroup_id)
) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields"
    ]);
    exit;
}

/* Assign values */
$bib_no      = trim($data->bib_no);
$name        = trim($data->name);
$school_id   = $data->school_id;
$gender_id   = strtoupper(trim($data->gender_id));
$agegroup_id = $data->agegroup_id;

/* =========================
   VALIDATION
========================= */
$errors = [];

if (!preg_match("/^[0-9]+$/", $bib_no)) {
    $errors[] = "Invalid bib number";
}

if (!preg_match("/^[a-zA-Z\s\.\'\-]+$/", $name)) {
    $errors[] = "Invalid athlete name";
}

if (!is_numeric($school_id) || $school_id <= 0) {
    $errors[] = "Invalid school_id";
}

if (!in_array($gender_id, ['M', 'F'])) {
    $errors[] = "Invalid gender_id (must be M or F)";
}

if (!is_numeric($agegroup_id) || $agegroup_id <= 0) {
    $errors[] = "Invalid agegroup_id";
}

/* Return all errors */
if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit;
}

/* =========================
   STEP 1: CHECK IF EXISTS
========================= */
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

/* =========================
   STEP 2: UPDATE
========================= */
$stmt = $conn->prepare("
    UPDATE athletes 
    SET name = ?, school_id = ?, gender_id = ?, agegroup_id = ? 
    WHERE bib_no = ?
");

$stmt->bind_param(
    "sisis",
    $name,
    $school_id,
    $gender_id,
    $agegroup_id,
    $bib_no
);

$stmt->execute();

/* =========================
   STEP 3: RESPONSE
========================= */
if ($stmt->affected_rows > 0) {
    echo json_encode([
        "status" => "success",
        "message" => "Athlete updated successfully"
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "message" => "No changes made (data already up to date)"
    ]);
}

exit;