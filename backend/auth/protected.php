<?php
header("Content-Type: application/json");

require_once "auth_middleware.php";

$user = checkAuth("admin");

echo json_encode(["message" => "Welcome Admin"]);

?>