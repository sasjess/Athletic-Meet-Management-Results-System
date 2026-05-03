<?php
//athletes
function createAthlete($bib_no, $name, $school_id, $gender_id, $agegroup_id){
    global $conn;

    $sql = "INSERT INTO athletes (bib_no, name, school_id, gender_id, agegroup_id)
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);  #$stmt is a prepared statement object used to safely execute SQL queries in PHP
    $stmt->bind_param("isisi", $bib_no, $name, $school_id, $gender_id, $agegroup_id);

    return $stmt->execute();
}

//update athletes
function updateAthlete($bib_no, $name, $school_id, $gender_id, $agegroup_id) {
    global $conn;

    $sql = "UPDATE athletes 
            SET name=?, school_id=?, gender_id=?, agegroup_id=? 
            WHERE bib_no=?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sissi", $name, $school_id, $gender_id, $agegroup_id, $bib_no);   //It connects values to the ? placeholders in the SQL query, ensuring that the data is properly escaped and preventing SQL injection attacks.

    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        return ["status" => "updated"];
    } else {
        return ["status" => "not_found_or_no_change"];
    }
}


function calculatePoints($position) {
    if ($position == 1) return 10;
    if ($position == 2) return 7;
    if ($position == 3) return 5;
    return 0;
}
function isValidSchoolName($value) {
    return preg_match("/^[a-zA-Z0-9\s\.\'\-]+$/", $value);
}
function isValidLocation($value) {
    return preg_match("/^[a-zA-Z\s]+$/", $value);
}


function sendResponse($status, $message, $data = null)
{
    header("Content-Type: application/json");

    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}
?>