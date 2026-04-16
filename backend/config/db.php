<?php
#give databse connection details
$conn = new mysqli("localhost","root","","meet_db");

if ($conn->connect_error){
    die("Connection failed:".$conn->connect_error);  #if connection fails--stop everything and show error

}
?>