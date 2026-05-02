<?php
include "../config/db.php";
include "../helpers/functions.php";

if (!isset($_GET['id'])) {
    sendResponse("error", "ID required");
}

$id = $_GET['id'];

$stmt = $conn->prepare("SELECT * FROM schools WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse("error", "School not found");
}

sendResponse("success", "School found", $result->fetch_assoc());
?>