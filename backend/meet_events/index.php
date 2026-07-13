<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);




require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";


$user = authenticate();

authorize(
    ['admin', 'meet_manager', 'data_entry_operator'],
    $user
);



/*
====================================================
GET DATA
====================================================
*/

if ($_SERVER['REQUEST_METHOD'] === "GET") {

    // 1. ALWAYS LOAD ALL MEETS FOR THE DROPDOWNS (Do not filter this array by search!)
    $stmt = $conn->prepare(
        "
        SELECT 
            meet_id,
            meet_name,
            year,
            status
        FROM meets
        ORDER BY year DESC
        "
    );
    $stmt->execute();
    $result = $stmt->get_result();
    $meets = [];
    while ($row = $result->fetch_assoc()) {
        $meets[] = $row;
    }


    /*
    ==============================
    LOAD EVENTS DROPDOWN
    ==============================
    */
    $result = $conn->query(
        "
        SELECT
            e.event_id,
            e.event_name,
            e.event_type,
            GROUP_CONCAT(ae.agegroup_id ORDER BY ae.agegroup_id) AS allowed_agegroups
        FROM events e
        LEFT JOIN agegroup_events ae ON e.event_id = ae.event_id
        GROUP BY e.event_id, e.event_name, e.event_type
        ORDER BY e.event_name ASC
        "
    );
    $events = [];
    while ($row = $result->fetch_assoc()) {
        $events[] = [
            "event_id" => (int)$row['event_id'],
            "event_name" => $row['event_name'],
            "event_type" => $row['event_type'],
            "allowed_agegroups" => $row['allowed_agegroups']
        ];
    }


    /*
    ==============================
    SEARCH ASSIGNED EVENTS
    ==============================
    */
    $assignedEvents = [];
    $search = $_GET['search'] ?? "";

    if ($search !== "") {
        $stmt = $conn->prepare(
            "
            SELECT
                e.event_name,
                e.event_type,
                GROUP_CONCAT(DISTINCT ag.group_name ORDER BY ag.group_name SEPARATOR ', ') AS age_groups,
                GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS gender
            FROM meet_events me
            INNER JOIN meets m ON me.meet_id = m.meet_id
            INNER JOIN events e ON me.event_id = e.event_id
            LEFT JOIN age_groups ag ON me.agegroup_id = ag.agegroup_id
            LEFT JOIN gender g ON me.gender_id = g.gender_id
            WHERE m.meet_name LIKE ?
            GROUP BY e.event_id, e.event_name, e.event_type
            ORDER BY e.event_name ASC
            "
        );

        // Using partial wildcard matching lets us catch the full list reliably
        $searchParam = "%" . $search . "%";
        $stmt->bind_param("s", $searchParam);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $assignedEvents[] = [
                "event_name" => $row['event_name'],
                "event_type" => $row['event_type'],
                "age_groups" => $row['age_groups'] ?? "",
                "gender" => $row['gender'] ?? ""
            ];
        }
    }

    echo json_encode([
        "status" => "success",
        "meets" => $meets,
        "events" => $events,
        "assignedEvents" => $assignedEvents
    ]);
    exit();
}




/*
====================================================
POST SAVE ASSIGNMENTS
====================================================
*/

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['meet_id'])) {
        echo json_encode([
            "status" => "error",
            "message" => "Meet is required"
        ]);
        exit();
    }


    $meet_id = (int)$data['meet_id'];
    $event_ids = $data['event_ids'] ?? [];
    $agegroup_ids = $data['agegroup_ids'] ?? [];
    $gender_ids = $data['gender_id'] ?? [];

    $conn->begin_transaction();



    $insertedCount = 0;
    $skippedCount = 0;



    try {
        foreach ($event_ids as $event_id) {
            foreach ($agegroup_ids as $agegroup_id) {
                foreach ($gender_ids as $gender) {

                    // Using INSERT IGNORE blocks duplicates without crashing the script
                    $stmt = $conn->prepare(
                        "
                        INSERT IGNORE INTO meet_events
                        (meet_id, event_id, agegroup_id, gender_id)
                        VALUES
                        (?,?,?,?)
                        "
                    );

                    $event_id = (int)$event_id;
                    $agegroup_id = (int)$agegroup_id;

                    $stmt->bind_param(
                        "iiis",
                        $meet_id,
                        $event_id,
                        $agegroup_id,
                        $gender
                    );

                    $stmt->execute();
                    
                    // affected_rows will be 1 if inserted, 0 if it was a duplicate and ignored
                    if ($stmt->affected_rows > 0) {
                        $insertedCount++;
                    } else {
                        $skippedCount++;
                    }
                }
            }
        }

        $conn->commit();

        // Custom friendly message based on what happened
        if ($insertedCount > 0 && $skippedCount > 0) {
            $msg = "Successfully assigned $insertedCount new events. ($skippedCount skipped as duplicates).";
        } elseif ($insertedCount === 0 && $skippedCount > 0) {
            echo json_encode([
                "status" => "error",
                "message" => "All selected events are already assigned to this meet!"
            ]);
            exit();
        } else {
            $msg = "Events assigned successfully!";
        }

        echo json_encode([
            "status" => "success",
            "message" => $msg
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }

    exit();
}


        