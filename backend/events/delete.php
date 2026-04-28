<?php
require 'db.php';

$id = $_GET['id'];

$stmt = $conn->prepare("DELETE FROM events WHERE event_id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "Deleted successfully";
} else {
    echo "Error deleting";
}
?>