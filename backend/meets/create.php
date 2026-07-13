<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Only POST allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['year']) || empty($data['meet_name']) || empty($data['start_date']) || empty($data['end_date'])) {
    echo json_encode(['status' => 'error', 'message' => 'Please provide all meet details']);
    exit();
}

$stmt = $conn->prepare("INSERT INTO meets (year, meet_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param('issss', $data['year'], $data['meet_name'], $data['start_date'], $data['end_date'], $data['status'] ?? 'Upcoming');

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Meet created successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>
