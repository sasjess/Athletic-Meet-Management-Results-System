<?php
require_once "jwt_helper.php";

function checkAuth($requiredRole = null) {
    //$headers = getallheaders();
    $headers = apache_request_headers();
    
    if (!isset($headers['Authorization'])) {
        echo json_encode(["error" => "No token"]);
        exit;
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);
    $decoded = verifyJWT($token);

    if (!$decoded) {
        echo json_encode(["error" => "Invalid token"]);
        exit;
    }

    // ✅ Role check
    if ($requiredRole && $decoded['role'] !== $requiredRole) {
        echo json_encode(["error" => "Access denied"]);
        exit;
    }

    return $decoded;
}
?>