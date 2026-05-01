<?php
include "../config/db.php";

if (!isset($_GET['bib_no'])) {
    echo json_encode(["error" => "bib_no required"]);
    exit;
}

$bib_no = $_GET['bib_no'];

$stmt = $conn->prepare("SELECT * FROM results WHERE bib_no=?");
$stmt->bind_param("i", $bib_no);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>