<?php
require_once "../config/db.php";

function createEvent($name, $type, $gender_id) {
    global $conn;

    $stmt = $conn->prepare(
        "INSERT INTO events (event_name, event_type, gender_id) VALUES (?, ?, ?)"
    );
    $stmt->bind_param("sss", $name, $type, $gender_id);

    return $stmt->execute();
}

function getAllEvents() {
    global $conn;

    $sql = "SELECT e.*, g.name AS gender_name
            FROM events e
            JOIN gender g ON e.gender_id = g.gender_id
            ORDER BY e.event_id DESC";

    $result = $conn->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    return $data;
}

function updateEvent($id, $name, $type, $gender_id) {
    global $conn;

    $stmt = $conn->prepare(
        "UPDATE events SET event_name=?, event_type=?, gender_id=? WHERE event_id=?"
    );
    $stmt->bind_param("sssi", $name, $type, $gender_id, $id);

    return $stmt->execute();
}

function deleteEvent($id) {
    global $conn;

    $stmt = $conn->prepare("DELETE FROM events WHERE event_id=?");
    $stmt->bind_param("i", $id);

    return $stmt->execute();
}
?>