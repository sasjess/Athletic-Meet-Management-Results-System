<?php
header("Content-Type: application/json");
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$sql = "INSERT INTO athlete_event (bib_no, event_id)
        VALUES (?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii",
    $data['bib_no'],
    $data['event_id']
);

if ($stmt->execute()) {
    echo json_encode(["message" => "Athlete assigned to event"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>