<?php
include "../config/db.php";
include "../helpers/functions.php";

// Allow ONLY POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("error", "Only POST method allowed");
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['school_name']) || !isset($data['province']) || !isset($data['district'])) {
    sendResponse("error", "School name, province, and district are required");
}

// Assign values
$school_name = $data['school_name'];
$province = $data['province'];
$district = $data['district'];
$city = $data['city'] ?? null;

// Insert query
$stmt = $conn->prepare("
INSERT INTO schools (school_name, province, district, city)
VALUES (?, ?, ?, ?)
");

$stmt->bind_param("ssss", $school_name, $province, $district, $city);

// Execute
if ($stmt->execute()) {
    sendResponse("success", "School created successfully", [
        "id" => $stmt->insert_id
    ]);
} else {
    sendResponse("error", "Failed to create school");
}
?>