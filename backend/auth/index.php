<?php
header("Content-Type: application/json");

require_once "auth_controller.php";

$data = json_decode(file_get_contents("php://input"), true);

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($action === 'login') {
        login($data);
    } 
    elseif ($action === 'register') {
        register($data);
    } 
    else {
        echo json_encode(["error" => "Invalid action"]);
    }

} else {
    echo json_encode(["error" => "Use POST method"]);
}
?>