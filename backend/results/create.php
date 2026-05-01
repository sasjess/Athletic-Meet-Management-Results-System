<?php
include "../config/db.php";
include "../helpers/functions.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    sendResponse("error", "Invalid input data");
}

// check duplicate result
$check = $conn->prepare("
SELECT id FROM results 
WHERE bib_no=? AND event_id=? AND meet_id=? AND stage_id=?
");

$check->bind_param(
    "iiii",
    $data['bib_no'],
    $data['event_id'],
    $data['meet_id'],
    $data['stage_id']
);

$check->execute();

if ($check->get_result()->num_rows > 0) {
    sendResponse("error", "Duplicate result already exists");
}

// calculate points
$points = calculatePoints($data['position']);

// insert
$stmt = $conn->prepare("
INSERT INTO results 
(bib_no, event_id, meet_id, agegroup_id, gender_id, performance_time, performance_distance, stage_id, heat_no, position, points)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "iiiisddiiid",
    $data['bib_no'],
    $data['event_id'],
    $data['meet_id'],
    $data['agegroup_id'],
    $data['gender_id'],
    $data['performance_time'],
    $data['performance_distance'],
    $data['stage_id'],
    $data['heat_no'],
    $data['position'],
    $points
);

if ($stmt->execute()) {
    sendResponse("success", "Result added successfully");
} else {
    sendResponse("error", "Failed to insert result");
}
?>