<?php
// Cache-busting comment
// auth_check.php
// This script is meant to be included at the beginning of any protected API endpoint.

include_once __DIR__ . '/../cors.php'; // Adjust path as necessary
include_once __DIR__ . '/security.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Adjust path as necessary
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;

// Default required role(s) - can be a string or an array of strings
// If including this file, you can set $required_role BEFORE including it.
// E.g., $required_role = ['customer', 'admin']; include_once 'auth_check.php';
if (!isset($required_role)) {
    $required_role = 'admin'; // Default to admin if not specified
}

// Get JWT from Authorization header
$authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';

if (empty($authHeader)) {
    // Fallback for some server configurations
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
}

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. No token provided."]);
    exit();
}

// Extract the token (e.g., "Bearer <token>")
list($type, $jwt) = explode(' ', $authHeader, 2);

if ($type !== 'Bearer' || empty($jwt)) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. Invalid token format."]);
    exit();
}

try {
    // Decode JWT using your secret key
    $decoded = JWT::decode($jwt, new Key(Security::$JWT_SECRET_KEY, 'HS256'));

    // Access payload data
    $GLOBALS['decoded_user'] = $decoded->data;
    $user_role = $GLOBALS['decoded_user']->role;

    // Check if user has required role(s)
    if (is_array($required_role)) {
        if (!in_array($user_role, $required_role)) {
            http_response_code(403);
            echo json_encode(["message" => "Access denied. Insufficient privileges. Your role: {$user_role}. Required roles: " . implode(', ', $required_role) . "."]);
            exit();
        }
    } else { // Single role string
        if ($user_role !== $required_role) {
            http_response_code(403);
            echo json_encode(["message" => "Access denied. Insufficient privileges. Your role: {$user_role}. Required role: {$required_role}."]);
            exit();
        }
    }

} catch (ExpiredException $e) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. Token has expired."]);
    exit();
} catch (SignatureInvalidException $e) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. Invalid signature."]);
    exit();
} catch (BeforeValidException $e) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. Token not yet valid."]);
    exit();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. " . $e->getMessage()]);
    exit();
}