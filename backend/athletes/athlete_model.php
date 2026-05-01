<?php
require_once "../config/db.php";

function createAthlete($bib_no, $name, $school_id, $gender_id, $agegroup_id){
    global $conn;

    $sql = "INSERT INTO athletes (bib_no, name, school_id, gender_id, agegroup_id)
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);  #$stmt is a prepared statement object used to safely execute SQL queries in PHP
    $stmt->bind_param("isisi", $bib_no, $name, $school_id, $gender_id, $agegroup_id);

    return $stmt->execute();
}
/* READ */

function getAthletes() {
    global $conn;

    $sql = "SELECT * FROM athletes";
    $result = $conn->query($sql);

    $athletes = [];

    while ($row = $result->fetch_assoc()) {
        $athletes[] = $row;
    }

    return $athletes;}
    


/* UPDATE */
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

/* DELETE */
function deleteAthlete($bib_no) {
    global $conn;

    $sql = "DELETE FROM athletes WHERE bib_no=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $bib_no);

    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        return ["status" => "deleted"];
    } else {
        return ["status" => "not_found"];
    }
}






?>