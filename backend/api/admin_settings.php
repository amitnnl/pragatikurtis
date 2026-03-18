<?php
// REMOVE auth_check from here because GET should be public
include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Prevent browser caching
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    
    try {
        $query = "SELECT setting_name, setting_value FROM settings";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $settings = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['setting_name']] = $row['setting_value'];
        }
        
        header('Content-Type: application/json');
        echo json_encode($settings);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch settings.']);
    }
    
} else if ($method == 'POST') {
    // Protect the POST method
    $required_role = 'admin';
    include_once '../config/auth_check.php';

    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input, true);
    
    // Log the input for debugging
    error_log("Admin Settings Update Input: " . $raw_input);
    
    if ($data && is_array($data)) {
        try {
            $db->beginTransaction();
            
            $query = "INSERT INTO settings (setting_name, setting_value) VALUES (:name, :value) ON DUPLICATE KEY UPDATE setting_value = :value";
            $stmt = $db->prepare($query);
            
            foreach($data as $name => $value) {
                // Ensure value is a string or null, handle boolean/numbers
                $valStr = (string)$value;
                $stmt->bindParam(':name', $name);
                $stmt->bindParam(':value', $valStr);
                $stmt->execute();
            }
            
            $db->commit();
            echo json_encode(["status" => "success", "message" => "Settings updated successfully"]);
            
        } catch (Exception $e) {
            $db->rollBack();
            error_log("Admin Settings Update Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to save settings: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No valid data provided."]);
    }
}
?>
