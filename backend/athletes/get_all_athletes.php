<?php
// 🧠 CRITICAL FIX: Trap all early warnings/HTML text before they ruin the JSON!
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. APP CORS CONFIGURATION
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

/* Handle preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

/* Only GET allowed */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "status" => "error",
        "message" => "Only GET method allowed"
    ]);
    exit;
}

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

// Require authentication and admin role for read-all
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

/* SQL QUERY */
$sql = "
    SELECT 
        a.bib_no,
        a.name,
        g.name AS gender,
        a.school_id,
        s.school_name,
        a.agegroup_id,       
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

// Clear out any accidental text/warnings that occurred during connection/includes
ob_clean();

/* Response */
echo json_encode([
    "status" => "success",
    "message" => "All athletes fetched successfully",
    "data" => $athletes
]);
exit;
?>