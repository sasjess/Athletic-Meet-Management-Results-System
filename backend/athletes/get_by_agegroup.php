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

/* Check input */
if (!isset($_GET['agegroup_name'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Age group is required"
    ]);
    exit;
}

$agegroup = trim($_GET['agegroup_name']);

if ($agegroup === '') {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid age group"
    ]);
    exit;
}

/* Search pattern */
$search = "%" . $agegroup . "%";

/* Correct Query */
$stmt = $conn->prepare("
    SELECT 
        a.bib_no,
        a.name,
        ag.group_name AS age_group,
        g.name AS gender,
        s.school_name
    FROM athletes a
    LEFT JOIN gender g ON a.gender_id = g.gender_id
    LEFT JOIN schools s ON a.school_id = s.school_id
    LEFT JOIN age_groups ag ON a.agegroup_id = ag.agegroup_id
    WHERE ag.group_name LIKE ?
    ORDER BY a.bib_no DESC
");

$stmt->bind_param("s", $search);
$stmt->execute();

$result = $stmt->get_result();

$athletes = [];

while ($row = $result->fetch_assoc()) {
    $athletes[] = $row;
}

/* No results */
if (empty($athletes)) {
    echo json_encode([
        "status" => "error",
        "message" => "No athletes found for this age group"
    ]);
    exit;
}

/* Success */
echo json_encode([
    "status" => "success",
    "message" => "Athletes fetched successfully",
    "data" => $athletes
]);

exit;