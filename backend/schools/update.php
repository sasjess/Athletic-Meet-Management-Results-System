<?php
include "../config/db.php";
include "../helpers/functions.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    sendResponse("error", "ID required");
}

$id = $data['id'];
$school_name = $data['school_name'] ?? null;
$location = $data['location'] ?? null;

$stmt = $conn->prepare("
UPDATE schools SET 
school_name = ?, 
location = ?
WHERE id = ?
");

$stmt->bind_param("ssi", $school_name, $location, $id);

if ($stmt->execute()) {
    sendResponse("success", "School updated");
} else {
    sendResponse("error", "Update failed");
}
?>