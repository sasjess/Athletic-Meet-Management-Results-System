<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "event_model.php";

$data = getAllEvents();

echo json_encode($data);
?>