<?php
require_once "auth_middleware.php";

$user = checkAuth("data_entry_operator");

echo json_encode(["message" => "Welcome Data Entry Operator"]);
?>