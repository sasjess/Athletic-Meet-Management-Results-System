<?php
// Simple JWT helper (HS256) - no external libs required
// NOTE: For production use, prefer a well-tested library.

define('JWT_SECRET', 'replace_this_with_a_strong_secret');

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($payload, $expSeconds = 3600) {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload['iat'] = time();
    $payload['exp'] = time() + $expSeconds;

    $segments = [];
    $segments[] = base64url_encode(json_encode($header));
    $segments[] = base64url_encode(json_encode($payload));

    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, JWT_SECRET, true);
    $segments[] = base64url_encode($signature);

    return implode('.', $segments);
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($headerb64, $payloadb64, $sigb64) = $parts;

    $signingInput = $headerb64 . '.' . $payloadb64;
    $expectedSig = base64url_encode(hash_hmac('sha256', $signingInput, JWT_SECRET, true));

    if (!hash_equals($expectedSig, $sigb64)) return false;

    $payload = json_decode(base64url_decode($payloadb64), true);
    if (!$payload) return false;

    if (isset($payload['exp']) && time() > $payload['exp']) return false;

    return $payload;
}

?>
