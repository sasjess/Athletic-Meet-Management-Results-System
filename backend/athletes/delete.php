<?php
header("Content-Type: application/json");

require_once "athlete_model.php";

$data = json_decode(file_get_contents("php://input"), true);

// 🔒 validate JSON
if (!$data || !isset($data['bib_no'])) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$bib_no = $data['bib_no'];
$result = deleteAthlete($bib_no);


if ($result["status"] == "deleted") {
    echo json_encode(["message" => "Athlete deleted"]);
} else {
    echo json_encode(["error" => "Athlete not found or already deleted"]);
}
?>