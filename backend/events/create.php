<?php
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $event_name = $_POST['event_name'];
    $event_type = $_POST['event_type'];
    $gender = $_POST['gender'];

    $stmt = $conn->prepare("INSERT INTO events (event_name, event_type, gender) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $event_name, $event_type, $gender);

    if ($stmt->execute()) {
        echo "Event created successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}
?>