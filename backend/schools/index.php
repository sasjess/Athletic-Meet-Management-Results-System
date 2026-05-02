<?php
include "../config/db.php";
include "../helpers/functions.php";

// Allow ONLY GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse("error", "Only GET method is allowed");
}

// Run query
$result = $conn->query("SELECT * FROM schools ORDER BY id DESC");

// Check query success
if (!$result) {
    sendResponse("error", "Database query failed");
}

$schools = [];

// Fetch data
while ($row = $result->fetch_assoc()) {
    $schools[] = $row;
}

// Response
sendResponse("success", "Schools fetched successfully", $schools);
?>