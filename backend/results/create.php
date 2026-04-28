<?php
require_once("result_model.php");
require_once("../config/db.php");

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$model = new ResultModel($conn);
$response = $model->create($data);

echo json_encode($response);