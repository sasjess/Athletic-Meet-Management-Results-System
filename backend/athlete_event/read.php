<?php
header("Content-Type: application/json");
require_once "../config/db.php";

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