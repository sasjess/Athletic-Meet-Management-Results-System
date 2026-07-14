<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin:*");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


error_reporting(E_ALL);
ini_set('display_errors', 1);



if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {

    http_response_code(200);
    exit();
}



require_once "../config/db.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";



$user = authenticate();

authorize(
    [
        "admin",
        "meet_manager",
        "data_entry_operator"
    ],
    $user
);



if ($_SERVER['REQUEST_METHOD'] != "POST") {

    echo json_encode([

        "status" => "error",
        "message" => "Only POST allowed"

    ]);

    exit();
}




$data = json_decode(
    file_get_contents("php://input"),
    true
);



if (!$data) {

    echo json_encode([

        "status" => "error",
        "message" => "Invalid JSON"

    ]);

    exit();
}




$school_name = trim($data['school_name'] ?? '');
$province = trim($data['province'] ?? '');
$district = trim($data['district'] ?? '');
$city = trim($data['city'] ?? '');
$gender_id = $data['gender_id'] ?? '';



$errors = [];



if ($school_name == "")
    $errors[] = "School name required";


if ($province == "")
    $errors[] = "Province required";


if ($district == "")
    $errors[] = "District required";


if ($gender_id == "")
    $errors[] = "Gender required";



if (!empty($errors)) {


    echo json_encode([

        "status" => "error",
        "errors" => $errors

    ]);


    exit();
}




$stmt = $conn->prepare(

    "INSERT INTO schools
(
school_name,
province,
district,
city,
gender_id
)

VALUES
(?,?,?,?,?)"

);



if (!$stmt) {

    echo json_encode([

        "status" => "error",
        "message" => $conn->error

    ]);

    exit();
}



$stmt->bind_param(

    "sssss",

    $school_name,
    $province,
    $district,
    $city,
    $gender_id

);




if ($stmt->execute()) {


    echo json_encode([

        "status" => "success",

        "message" => "School created successfully",

        "data" => [

            "school_id" => $stmt->insert_id

        ]

    ]);
} else {


    echo json_encode([

        "status" => "error",

        "message" => $stmt->error

    ]);
}
