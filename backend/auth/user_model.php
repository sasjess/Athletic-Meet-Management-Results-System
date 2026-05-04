<?php
require_once "../config/db.php";

function getUserByUsername($username) {
    global $conn;

    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();

    return $stmt->get_result()->fetch_assoc();
}
?>