<?php
include "../config/db.php";

$sql = "
SELECT r.*, a.name AS athlete_name, e.event_name
FROM results r
JOIN athletes a ON r.bib_no = a.bib_no
JOIN events e ON r.event_id = e.event_id
";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>