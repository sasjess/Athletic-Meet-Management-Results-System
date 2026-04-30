<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

require_once "events_model.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode(["error" => "Use GET method"]);
    exit;
}

$data = getAllEvents();

echo json_encode($data);
?>