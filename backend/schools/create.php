<?php
include "../config/db.php";
include "../helpers/functions.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['school_name'])) {
    sendResponse("error", "School name required");
}

$school_name = $data['school_name'];
$location = $data['location'] ?? null;

$stmt = $conn->prepare("INSERT INTO schools (school_name, location) VALUES (?, ?)");
$stmt->bind_param("ss", $school_name, $location);

if ($stmt->execute()) {
    sendResponse("success", "School created", ["id" => $stmt->insert_id]);
} else {
    sendResponse("error", "Failed to create school");
}
?>