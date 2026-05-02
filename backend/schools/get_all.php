<?php
include "../config/db.php";
include "../helpers/functions.php";

$result = $conn->query("SELECT * FROM schools ORDER BY id DESC");

$schools = [];

while ($row = $result->fetch_assoc()) {
    $schools[] = $row;
}

sendResponse("success", "Schools fetched", $schools);
?>