<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user = authenticate();
authorize(['admin', 'meet_manager', 'data_entry_operator'], $user);

$sql = "SELECT meet_id, year, meet_name, start_date, end_date, status FROM meets ORDER BY year DESC, meet_name ASC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
