<?php
include "../config/db.php";
include "../helpers/functions.php";

if (!isset($_GET['id'])) {
    sendResponse("error", "ID required");
}

$id = $_GET['id'];

$stmt = $conn->prepare("DELETE FROM schools WHERE id=?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    sendResponse("success", "School deleted");
} else {
    sendResponse("error", "Delete failed");
}
?>