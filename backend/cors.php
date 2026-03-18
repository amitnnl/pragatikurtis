<?php
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();



// backend/cors.php


// --- IMPORTANT SECURITY CONFIGURATION ---
// Define a whitelist of allowed origins.
// Your frontend application's domain MUST be on this list.
$allowed_origins = [
    'http://localhost:5173', // Vite default dev server
    'http://localhost:3000', // Common React dev server
    'https://your-production-frontend-domain.com' // <<< IMPORTANT: Replace with your actual domain before deployment
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Check if the request's origin is in our whitelist
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        // Origin not allowed. Don't send the ACAO header.
        // The browser will block the request.
        // You can log this for debugging if needed:
        // error_log("CORS: Rejected origin: " . $_SERVER['HTTP_ORIGIN']);
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache preflight requests for 1 day
}

// Handle preflight 'OPTIONS' requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    }

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }

    exit(0);
}

// Set default content type for all API responses
header("Content-Type: application/json; charset=UTF-8");
?>
