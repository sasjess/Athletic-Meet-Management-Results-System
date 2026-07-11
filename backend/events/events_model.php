<?php
require_once "../config/db.php";

function createEvent($name, $type, $gender_id, $agegroup_id) {

    global $conn;


    $stmt = $conn->prepare(
        "INSERT INTO events
        (event_name,event_type,gender_id,agegroup_id)
        VALUES (?,?,?,?)"
    );


    if(!$stmt){
        return false;
    }


    $stmt->bind_param(
        "sssi",
        $name,
        $type,
        $gender_id,
        $agegroup_id
    );


    return $stmt->execute();

}

function getAllEvents() {
    global $conn;

    $sql = "
        SELECT
            e.event_id,
            e.event_name,
            e.event_type,
            e.gender_id,
            e.agegroup_id,
            g.name AS gender_name,
            ag.group_name AS age_group
        FROM events e
        LEFT JOIN gender g
            ON e.gender_id = g.gender_id
        LEFT JOIN age_groups ag
            ON e.agegroup_id = ag.agegroup_id
        ORDER BY
            ag.agegroup_id ASC,
            g.name ASC,
            e.event_name ASC
    ";

    $result = $conn->query($sql);

    $data = [];

    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }

    return $data;
}

function updateEvent($id, $name, $type, $gender_id, $agegroup_id) {
    global $conn;

    $conn->begin_transaction();

    $stmt = $conn->prepare(
        "UPDATE events SET event_name=?, event_type=? WHERE event_id=?"
    );
    $stmt->bind_param("ssi", $name, $type, $id);
    if (!$stmt->execute()) {
        $conn->rollback();
        return false;
    }
    $stmt->close();

    $stmt = $conn->prepare(
        "UPDATE gender_events SET gender_id=? WHERE event_id=?"
    );
    $stmt->bind_param("si", $gender_id, $id);
    if (!$stmt->execute() || $stmt->affected_rows === 0) {
        $stmt->close();
        $stmt = $conn->prepare(
            "INSERT INTO gender_events (event_id, gender_id) VALUES (?, ?)"
        );
        $stmt->bind_param("is", $id, $gender_id);
        if (!$stmt->execute()) {
            $conn->rollback();
            return false;
        }
    }
    $stmt->close();

    $stmt = $conn->prepare(
        "UPDATE agegroup_events SET agegroup_id=? WHERE event_id=?"
    );
    $stmt->bind_param("ii", $agegroup_id, $id);
    if (!$stmt->execute() || $stmt->affected_rows === 0) {
        $stmt->close();
        $stmt = $conn->prepare(
            "INSERT INTO agegroup_events (agegroup_id, event_id) VALUES (?, ?)"
        );
        $stmt->bind_param("ii", $agegroup_id, $id);
        if (!$stmt->execute()) {
            $conn->rollback();
            return false;
        }
    }
    $stmt->close();

    $conn->commit();
    return true;
}

function deleteEvent($id) {
    global $conn;

    $stmt = $conn->prepare("DELETE FROM events WHERE event_id=?");
    $stmt->bind_param("i", $id);

    return $stmt->execute();
}
?>