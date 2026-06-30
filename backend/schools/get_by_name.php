<?php

include "../config/db.php";
include "../helpers/functions.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

/* Handle OPTIONS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* Only GET */
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["status" => "error", "message" => "Only GET allowed"]);
    exit();
}

// require admin to search schools
$user = authenticate();
authorize(['admin','meet_manager','data_entry_operator'], $user);

/* SEARCH BY NAME */
if (isset($_GET['q'])) {

    $q = $_GET['q'];

    $stmt = $conn->prepare("
        SELECT school_id, school_name, province, district, city, created_at
        FROM schools
        WHERE school_name LIKE CONCAT('%', ?, '%')
        ORDER BY school_name ASC
    ");

    $stmt->bind_param("s", $q);
    $stmt->execute();

    $result = $stmt->get_result();

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
    exit();
}

/* DEFAULT */
echo json_encode([
    "status" => "error",
    "message" => "Provide search query"
]);
exit();