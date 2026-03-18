<?php
// backend/config/app.php

// Define the environment
define('APP_ENV', 'development'); // Change to 'production' on deployment

// Define frontend URL for emails and redirects
if (APP_ENV === 'production') {
    define('FRONTEND_URL', 'https://your-production-domain.com'); // UPDATE THIS
} else {
    define('FRONTEND_URL', 'http://localhost:5173');
}

// Define backend URL for uploads and API
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'];

// Detect if running in a subdirectory (like /pragatikurties) or root
// This regex tries to find the path up to 'backend'
$script_path = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
// Example script path: /pragatikurties/backend/api
// We want base path: /pragatikurties

// Adjust this logic based on your actual deployment folder structure
// For XAMPP default: /pragatikurties
// For Production root: /
$script_path = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])); // e.g., /pragatikurties/backend/api

// Find the position of '/backend' in the script path
$backend_pos = strpos($script_path, '/backend');

if ($backend_pos !== false) {
    // Extract the part before '/backend'
    $base_path_calculated = substr($script_path, 0, $backend_pos);
} else {
    // Fallback if /backend isn't found (e.g., if backend is at root)
    $base_path_calculated = ''; 
}

if (APP_ENV === 'production') {
    define('BASE_PATH', ''); // Empty for root, or define based on production setup
} else {
    define('BASE_PATH', $base_path_calculated); 
}

define('BACKEND_URL', $protocol . "://" . $host . BASE_PATH . "/backend");
define('UPLOADS_URL', BACKEND_URL . "/uploads");
define('UPLOADS_DIR', __DIR__ . '/../uploads'); // Absolute path for file operations

?>