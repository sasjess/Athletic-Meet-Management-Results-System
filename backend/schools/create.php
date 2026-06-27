<?php

include "../config/db.php";
include "../helpers/functions.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

$user = authenticate();
authorize(['admin'], $user);

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

/* Read JSON input */
$data = json_decode(file_get_contents("php://input"), true);

/* Check input */
if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input"
    ]);
    exit();
}

/* Assign values */
$school_name = trim($data['school_name'] ?? '');
$province    = trim($data['province'] ?? '');
$district    = trim($data['district'] ?? '');
$city        = trim($data['city'] ?? '');

/* =========================
   VALIDATION
========================= */
$errors = [];

/* Required fields */
if ($school_name === '' || !isValidSchoolName($school_name)) {
    $errors[] = "Invalid school_name (letters and spaces only)";
}

if ($province === '' || !isValidLocation($province)) {
    $errors[] = "Invalid province (letters only)";
}

if ($district === '' || !isValidLocation($district)) {
    $errors[] = "Invalid district (letters only)";
}

/* Optional city */
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
   INSERT QUERY
========================= */
$stmt = $conn->prepare("
    INSERT INTO schools (school_name, province, district, city)
    VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssss", $school_name, $province, $district, $city);

/* Execute */
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to create school: " . $conn->error
    ]);
    exit();
}

/* SUCCESS */
echo json_encode([
    "status" => "success",
    "message" => "School created successfully",
    "data" => [
        "school_id" => $stmt->insert_id
    ]
]);

exit();