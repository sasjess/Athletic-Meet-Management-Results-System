<?php
require_once "../config/db.php";

function createEvent($name, $type, $gender_id, $agegroup_ids) {

    global $conn;

    if (empty($gender_id) || empty($agegroup_ids)) {
        return false;
    }

    $conn->begin_transaction();

    // Insert main event
    $stmt = $conn->prepare(
        "INSERT INTO events 
        (event_name, event_type)
        VALUES (?, ?)"
    );


    $stmt->bind_param(
        "ss",
        $name,
        $type
    );


    if(!$stmt->execute()){
        $conn->rollback();
        return false;
    }


    // Get created event id
    $event_id = $conn->insert_id;

    foreach($gender_id as $gender_id){

        $genderStmt = $conn->prepare(
            "INSERT INTO gender_events
            (event_id, gender_id)
            VALUES (?, ?)"
        );

        $genderStmt->bind_param(
            "is",
            $event_id,
            $gender_id
        );

        if(!$genderStmt->execute()){
            $conn->rollback();
            return false;
        }

    }

    // Insert age groups
    foreach($agegroup_ids as $agegroup_id){

        $ageStmt = $conn->prepare(
            "INSERT INTO agegroup_events
            (event_id, agegroup_id)
            VALUES (?, ?)"
        );


        $ageStmt->bind_param(
            "ii",
            $event_id,
            $agegroup_id
        );


        if(!$ageStmt->execute()){
            $conn->rollback();
            return false;
        }

    }

    $conn->commit();
    return true;
}
function getAllEvents($meetId = null) {
    global $conn;

    $sql = "
        SELECT
            e.event_id,
            e.event_name,
            e.event_type,
            ge.gender_id AS event_gender_id,
            ge_gender.name AS event_gender_name,
            ag.agegroup_id,
            ag.group_name AS age_group
        FROM events e
    ";

    // Only join through meet_events when a specific meet is requested
    if ($meetId !== null) {
        $sql .= " INNER JOIN meet_events me ON me.event_id = e.event_id ";
    }

    $sql .= "
        LEFT JOIN gender_events ge
            ON ge.event_id = e.event_id
        LEFT JOIN gender ge_gender
            ON ge_gender.gender_id = ge.gender_id
        LEFT JOIN agegroup_events ae
            ON ae.event_id = e.event_id
        LEFT JOIN age_groups ag
            ON ag.agegroup_id = ae.agegroup_id
    ";

    if ($meetId !== null) {
        $sql .= " WHERE me.meet_id = ? ";
    }

    $sql .= "
        ORDER BY
            e.event_name ASC,
            ag.agegroup_id ASC,
            ge_gender.name ASC
    ";

    if ($meetId !== null) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $meetId);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }

    $data = [];
    $eventsById = [];

    while($row = $result->fetch_assoc()){
        $eventId = (int) $row['event_id'];

        if (!isset($eventsById[$eventId])) {
            $eventsById[$eventId] = [
                'event_id' => $eventId,
                'event_name' => $row['event_name'],
                'event_type' => $row['event_type'],
                'gender_id' => [],
                'gender_names' => [],
                'agegroup_ids' => [],
                'age_groups' => []
            ];
        }

        if (!empty($row['event_gender_id'])) {
            $genderId = (string) $row['event_gender_id'];
            if (!in_array($genderId, $eventsById[$eventId]['gender_id'], true)) {
                $eventsById[$eventId]['gender_id'][] = $genderId;
            }

            if (!empty($row['event_gender_name']) && !in_array($row['event_gender_name'], $eventsById[$eventId]['gender_names'], true)) {
                $eventsById[$eventId]['gender_names'][] = $row['event_gender_name'];
            }
        }

        if (!empty($row['agegroup_id'])) {
            $agegroupId = (int) $row['agegroup_id'];
            if (!in_array($agegroupId, $eventsById[$eventId]['agegroup_ids'], true)) {
                $eventsById[$eventId]['agegroup_ids'][] = $agegroupId;
            }

            if (!empty($row['age_group']) && !in_array($row['age_group'], $eventsById[$eventId]['age_groups'], true)) {
                $eventsById[$eventId]['age_groups'][] = $row['age_group'];
            }
        }
    }

    return array_values($eventsById);
}
function updateEvent($id, $name, $type, $gender_id, $agegroup_ids) {
    global $conn;

    if (empty($gender_id) || empty($agegroup_ids)) {
        return false;
    }

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

    $deleteGenderStmt = $conn->prepare("DELETE FROM gender_events WHERE event_id=?");
    $deleteGenderStmt->bind_param("i", $id);
    if (!$deleteGenderStmt->execute()) {
        $conn->rollback();
        return false;
    }
    $deleteGenderStmt->close();

    foreach ($gender_id as $gender_id) {
        $insertGenderStmt = $conn->prepare(
            "INSERT INTO gender_events (event_id, gender_id) VALUES (?, ?)"
        );
        $insertGenderStmt->bind_param("is", $id, $gender_id);
        if (!$insertGenderStmt->execute()) {
            $conn->rollback();
            return false;
        }
        $insertGenderStmt->close();
    }

    $deleteAgeGroupStmt = $conn->prepare("DELETE FROM agegroup_events WHERE event_id=?");
    $deleteAgeGroupStmt->bind_param("i", $id);
    if (!$deleteAgeGroupStmt->execute()) {
        $conn->rollback();
        return false;
    }
    $deleteAgeGroupStmt->close();

    foreach ($agegroup_ids as $agegroup_id) {
        $insertAgeGroupStmt = $conn->prepare(
            "INSERT INTO agegroup_events (agegroup_id, event_id) VALUES (?, ?)"
        );
        $insertAgeGroupStmt->bind_param("ii", $agegroup_id, $id);
        if (!$insertAgeGroupStmt->execute()) {
            $conn->rollback();
            return false;
        }
        $insertAgeGroupStmt->close();
    }

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