<?php
//define connection details
$host = "localhost";
$user = "root";
$password = "";
$database = "meet_db";

//create connection,$conn = connection object| new mysqli = create connection to mysql
$conn = new mysqli($host,$user,$password,$database);

//Check if connection failed
if($conn->connect_error){
    die("Database connection failed: ". $conn->connect_error);     //die=stop execution immedietly
}

$conn->set_charset("utf8");
?>