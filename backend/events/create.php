<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Methods: POST, OPTIONS");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once "events_model.php";
require_once "../middleware/auth.php";
require_once "../middleware/authorize.php";


// Authentication
$user = authenticate();

authorize(
    ['admin','meet_manager','data_entry_operator'],
    $user
);



if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "status"=>"error",
        "message"=>"Only POST allowed"
    ]);

    exit;
}



$data = json_decode(
    file_get_contents("php://input"),
    true
);



if (!$data) {

    echo json_encode([
        "status"=>"error",
        "message"=>"Invalid JSON"
    ]);

    exit;
}



if (
    empty($data['event_name']) ||
    empty($data['event_type']) ||
    empty($data['gender_id']) ||
    empty($data['agegroup_id'])
) {

    echo json_encode([
        "status"=>"error",
        "message"=>"Missing required fields"
    ]);

    exit;
}



$result = createEvent(
    $data['event_name'],
    $data['event_type'],
    $data['gender_id'],
    $data['agegroup_id']
);



if($result){

    echo json_encode([
        "status"=>"success",
        "message"=>"Event created successfully"
    ]);

}
else{

    echo json_encode([
        "status"=>"error",
        "message"=>"Database insert failed"
    ]);

}

?>