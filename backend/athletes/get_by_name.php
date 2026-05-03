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

/* Check name */
if (!isset($_GET['name'])) {
    echo json_encode([
        "status" => "error",
        "message" => "name is required"
    ]);
    exit;
}

$name = trim($_GET['name']);

if ($name === '') {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid name"
    ]);
    exit;
}

/* Add wildcard for search */
$search = "%" . $name . "%";

/* Query */
$stmt = $conn->prepare("
    SELECT 
        a.bib_no,
        a.name,
        g.name AS gender,
        a.school_id,
        s.school_name,
        ag.group_name AS age_group
    FROM athletes a
    LEFT JOIN gender g ON a.gender_id = g.gender_id
    LEFT JOIN schools s ON a.school_id = s.school_id
    LEFT JOIN age_groups ag ON a.agegroup_id = ag.agegroup_id
    WHERE a.name LIKE ?
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
        "message" => "No athletes found with this name"
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