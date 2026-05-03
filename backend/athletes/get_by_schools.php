<?php

header("Content-Type: application/json");

require_once "../config/db.php";

/* Only GET allowed */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "status" => "error",
        "message" => "Only GET method allowed"
    ]);
    exit;
}

/* Check school_id */
if (!isset($_GET['school_id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "school_id is required"
    ]);
    exit;
}

$school_id = $_GET['school_id'];

/* Validate school_id */
if (!is_numeric($school_id) || $school_id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid school_id"
    ]);
    exit;
}

/* Query */
$stmt = $conn->prepare("
    SELECT 
        a.bib_no,
        a.name,
        g.name AS gender,
        s.school_name,
        ag.group_name AS age_group
    FROM athletes a
    LEFT JOIN gender g ON a.gender_id = g.gender_id
    LEFT JOIN schools s ON a.school_id = s.school_id
    LEFT JOIN age_groups ag ON a.agegroup_id = ag.agegroup_id
    WHERE a.school_id = ?
    ORDER BY a.bib_no DESC
");

$stmt->bind_param("i", $school_id);
$stmt->execute();

$result = $stmt->get_result();

$athletes = [];

while ($row = $result->fetch_assoc()) {
    $athletes[] = $row;
}

/* If no data found */
if (empty($athletes)) {
    echo json_encode([
        "status" => "error",
        "message" => "No athletes found for this school"
    ]);
    exit;
}

/* Success response */
echo json_encode([
    "status" => "success",
    "message" => "Athletes fetched successfully",
    "data" => $athletes
]);

exit;