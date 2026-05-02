<?php
include "../config/db.php";
include "../helpers/functions.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    sendResponse("error", "Result ID required");
}

$points = calculatePoints($data['position']);

$stmt = $conn->prepare("
UPDATE results SET
performance_time=?,
performance_distance=?,
position=?,
points=?
WHERE id=?
");

$stmt->bind_param(
    "ddidi",
    $data['performance_time'],
    $data['performance_distance'],
    $data['position'],
    $points,
    $data['id']
);

if ($stmt->execute()) {
    sendResponse("success", "Result updated successfully");
} else {
    sendResponse("error", "Update failed");
}
?>