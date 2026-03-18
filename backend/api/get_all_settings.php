<?php
// backend/api/get_all_settings.php

include_once '../cors.php'; 
include_once '../config/database.php'; // Include database connection

header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT setting_name, setting_value FROM settings";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $settings = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Automatically decode JSON strings if they are stored as such
        $decodedValue = json_decode($row['setting_value'], true);
        if (json_last_error() === JSON_ERROR_NONE && $decodedValue !== null) {
            $settings[$row['setting_name']] = $decodedValue;
        } else {
            $settings[$row['setting_name']] = $row['setting_value'];
        }
    }
    
    echo json_encode($settings);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Failed to fetch settings from database.',
        'exception_message' => $e->getMessage()
    ]);
}
?>