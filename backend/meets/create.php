<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


error_reporting(E_ALL);
ini_set('display_errors', 1);


require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";


// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);
    exit();

}


// Authentication
$user = authenticate();

authorize(
    [
        'admin',
        'meet_manager',
        'data_entry_operator'
    ],
    $user
);



// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    echo json_encode([
        "status" => "error",
        "message" => "Only POST method allowed"
    ]);

    exit();

}



// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);



if (!$data) {

    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input"
    ]);

    exit();

}




// Get values

$year = $data['year'] ?? '';
$meet_name = trim($data['meet_name'] ?? '');
$start_date = $data['start_date'] ?? '';
$end_date = $data['end_date'] ?? '';
$status = $data['status'] ?? 'Upcoming';




// Validation

$errors = [];


if ($year === '' || !is_numeric($year)) {

    $errors[] = "Valid year is required";

}


if ($meet_name === '') {

    $errors[] = "Meet name is required";

}


if ($start_date === '') {

    $errors[] = "Start date is required";

}


if ($end_date === '') {

    $errors[] = "End date is required";

}



$allowed_status = [
    "Upcoming",
    "Ongoing",
    "Completed"
];


if (!in_array($status, $allowed_status)) {

    $errors[] = "Invalid status";

}




if (!empty($errors)) {

    echo json_encode([
        "status" => "error",
        "errors" => $errors
    ]);

    exit();

}





// Insert query

$sql = "
INSERT INTO meets
(
    year,
    meet_name,
    start_date,
    end_date,
    status
)
VALUES
(
    ?,
    ?,
    ?,
    ?,
    ?
)
";



$stmt = $conn->prepare($sql);



if (!$stmt) {

    echo json_encode([
        "status" => "error",
        "message" => "Prepare failed: " . $conn->error
    ]);

    exit();

}




$stmt->bind_param(
    "issss",
    $year,
    $meet_name,
    $start_date,
    $end_date,
    $status
);





// Execute

if ($stmt->execute()) {


    echo json_encode([

        "status" => "success",

        "message" => "Meet created successfully",

        "data" => [

            "meet_id" => $stmt->insert_id

        ]

    ]);



} else {


    echo json_encode([

        "status" => "error",

        "message" => "Database error: " . $stmt->error

    ]);

}



$stmt->close();

$conn->close();


?>