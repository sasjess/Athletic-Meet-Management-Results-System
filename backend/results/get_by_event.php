<?php
include "../config/db.php";

if (!isset($_GET['event_id'])) {
    echo json_encode(["error" => "event_id required"]);
    exit;
}

$event_id = $_GET['event_id'];

$stmt = $conn->prepare("SELECT * FROM results WHERE event_id=?");
$stmt->bind_param("i", $event_id);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>