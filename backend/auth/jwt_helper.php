<?php
function generateJWT($user) {
    $payload = [
        "user_id" => $user['id'],
        "username" => $user['username'],
        "role" => $user['role'],   // ✅ ADD THIS
        "exp" => time() + 3600
    ];

    return base64_encode(json_encode($payload));
}

function verifyJWT($token) {
    $decoded = json_decode(base64_decode($token), true);

    if (!$decoded || $decoded['exp'] < time()) {
        return false;
    }

    return $decoded;
}
?>