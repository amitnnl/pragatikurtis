<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$setting_name = isset($_GET['name']) ? $_GET['name'] : '';

if (empty($setting_name)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Setting name is required.']);
    exit;
}

try {
    $query = "SELECT setting_value FROM settings WHERE setting_name = :name";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $setting_name);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row && isset($row['setting_value'])) {
        echo json_encode(['setting_value' => $row['setting_value']]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Setting not found.']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An internal server error occurred.', 'error_details' => $e->getMessage()]);
}
?>
