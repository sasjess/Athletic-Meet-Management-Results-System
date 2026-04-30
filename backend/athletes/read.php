<?php
header("Content-Type: application/json");

require_once "athlete_model.php";

$athletes = getAthletes();

echo json_encode($athletes);
?>