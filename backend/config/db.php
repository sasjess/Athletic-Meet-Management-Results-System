<?php
// db.php

$host = "localhost";
$user = "root";
$password = "";
$database = "meet_db";

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// Set charset (important for consistency)
$conn->set_charset("utf8mb4");
?>