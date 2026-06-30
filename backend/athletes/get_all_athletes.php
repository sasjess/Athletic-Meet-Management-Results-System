<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Only GET allowed */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "status" => "error",
        "message" => "Only GET method allowed"
    ]);
    exit;
}

// Require authentication and admin role for read-all
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

/* Query - NO FILTER */
$sql = "
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
    ORDER BY a.bib_no DESC
";

$result = $conn->query($sql);

/* Check query */
if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => "Query failed: " . $conn->error
    ]);
    exit;
}

$athletes = [];

/* Fetch data */
while ($row = $result->fetch_assoc()) {
    $athletes[] = $row;
}

/* Response */
echo json_encode([
    "status" => "success",
    "message" => "All athletes fetched successfully",
    "data" => $athletes
]);

exit;