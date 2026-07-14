<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


error_reporting(E_ALL);
ini_set('display_errors', 1);


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once "../config/db.php";


$sql = "
    SELECT 
        gender_id,
        name
    FROM gender
    ORDER BY name ASC
";


$result = $conn->query($sql);


if (!$result) {

    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);

    exit();
}


$genders = [];


while ($row = $result->fetch_assoc()) {

    $genders[] = $row;
}


echo json_encode([
    "status" => "success",
    "data" => $genders
]);


$conn->close();
