<?php
require_once("result_model.php");
require_once("../config/db.php");

header("Content-Type: application/json");

$model = new ResultModel($conn);
$results = $model->getAll();

echo json_encode([
    "success" => true,
    "data" => $results
]);