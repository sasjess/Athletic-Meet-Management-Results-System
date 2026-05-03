<?php

include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Allow only POST */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "status" => "error",
        "message" => "Only POST method allowed"
    ]);
    exit();
}

/* Read JSON input */
$input = json_decode(file_get_contents("php://input"), true);

/* Check input */
if (!$input || !isset($input['school_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "school_id is required"
    ]);
    exit();
}

/* Assign values */
$school_id   = (int) $input['school_id'];
$school_name = trim($input['school_name'] ?? '');
$province    = trim($input['province'] ?? '');
$district    = trim($input['district'] ?? '');
$city        = trim($input['city'] ?? '');

/* =========================
   COLLECT ALL ERRORS
========================= */
$errors = [];


/* Validate school_name */
if ($school_name === '' || !isValidSchoolName($school_name)) {
    $errors[] = "Invalid school_name (letters and spaces only)";
}

/* Validate province */
if ($province === '' || !isValidLocation($province)) {
    $errors[] = "Invalid province (letters only)";
}

/* Validate district */
if ($district === '' || !isValidLocation($district)) {
    $errors[] = "Invalid district (letters only)";
}

/* Validate city (optional) */
if ($city !== '' && !isValidLocation($city)) {
    $errors[] = "Invalid city (letters only)";
}

/* RETURN ALL ERRORS */
if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);
    exit();
}

/* =========================
   UPDATE QUERY
========================= */
$stmt = $conn->prepare("
    UPDATE schools 
    SET school_name = ?, province = ?, district = ?, city = ?
    WHERE school_id = ?
");

$stmt->bind_param("ssssi", $school_name, $province, $district, $city, $school_id);

/* Execute */
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Update failed: " . $conn->error
    ]);
    exit();
}

/* Check update */
if ($stmt->affected_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "No changes made or school not found"
    ]);
    exit();
}

/* SUCCESS */
echo json_encode([
    "status" => "success",
    "message" => "School updated successfully"
]);

exit();