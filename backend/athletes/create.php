<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "athlete_model.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

if (!isset($data['bib_no'], $data['name'], $data['school_id'], $data['gender_id'], $data['agegroup_id'])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$bib_no = $data['bib_no'];
$name = $data['name'];
$school_id = $data['school_id'];
$gender_id = $data['gender_id'];
$agegroup_id = $data['agegroup_id'];

$result = createAthlete($bib_no, $name, $school_id, $gender_id, $agegroup_id);

if ($result) {
    echo json_encode(["message" => "Athlete created"]);
} else {
    echo json_encode(["message" => "Insert failed"]);
}

?>