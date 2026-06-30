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

// Only admin can view assignments
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

$sql = "SELECT ae.*, a.name, e.event_name
        FROM athlete_event ae
        JOIN athletes a ON ae.bib_no = a.bib_no
        JOIN events e ON ae.event_id = e.event_id";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>