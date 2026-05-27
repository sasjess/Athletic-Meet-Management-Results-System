<?php
include "../config/db.php";
include "../helpers/functions.php";

header("Content-Type: application/json");
//ALLOW ONLY POST METHOD

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse("error", "Only POST method is allowed");
}

// GET JSON INPUT
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    sendResponse("error", "Invalid input data");
}
//REQUIRED FIELD VALIDATION

$required = [
    'bib_no','event_id','meet_id','agegroup_id',
    'gender_id','stage_id','heat_no','position'
];

foreach ($required as $field) {
    if (!isset($data[$field])) {
        sendResponse("error", "$field is required");
    }
}

/* =========================
   CHECK FOREIGN KEYS
========================= */
$errors = [];

/* CHECK ATHLETE */
$check = $conn->prepare("SELECT bib_no FROM athletes WHERE bib_no=?");
$check->bind_param("i", $data['bib_no']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid bib_no (athlete not found)";
}

/* CHECK EVENT */
$check = $conn->prepare("SELECT event_id FROM events WHERE event_id=?");
$check->bind_param("i", $data['event_id']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid event_id (event not found)";
}

/* CHECK MEET */
$check = $conn->prepare("SELECT meet_id FROM meets WHERE meet_id=?");
$check->bind_param("i", $data['meet_id']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid meet_id (meet not found)";
}

/* CHECK AGE GROUP */
$check = $conn->prepare("SELECT agegroup_id FROM age_groups WHERE agegroup_id=?");
$check->bind_param("i", $data['agegroup_id']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid agegroup_id";
}

/* CHECK GENDER */
$check = $conn->prepare("SELECT gender_id FROM gender WHERE gender_id=?");
$check->bind_param("s", $data['gender_id']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid gender_id";
}

/* CHECK STAGE */
$check = $conn->prepare("SELECT stage_id FROM stages WHERE stage_id=?");
$check->bind_param("i", $data['stage_id']);
$check->execute();
$check->store_result();
if ($check->num_rows == 0) {
    $errors[] = "Invalid stage_id";
}

/* RETURN ALL ERRORS AT ONCE */
if (!empty($errors)) {
    sendResponse("error", $errors);
}

/* =========================
    CHECK DUPLICATE RESULT
========================= */

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
$check->store_result();

if ($check->num_rows > 0) {
    sendResponse("error", "Duplicate result already exists");
}

/* =========================
    CALCULATE POINTS
========================= */

$points = calculatePoints($data['position']);

/* =========================
   INSERT RESULT
========================= */

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
