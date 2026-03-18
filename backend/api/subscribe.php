<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->email) && Security::validateEmail($data->email)) {
        $email = Security::sanitize($data->email);

        try {
            $query = "INSERT INTO newsletter_subscriptions (email) VALUES (?)";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute([$email])) {
                echo json_encode(["status" => "success", "message" => "Thank you for subscribing!"]);
            } else {
                // This will likely fail silently on duplicate, which is fine
                echo json_encode(["status" => "success", "message" => "You are already subscribed."]);
            }
        } catch (PDOException $e) {
            // Handle duplicate entry error
            if ($e->getCode() == 23000) {
                 echo json_encode(["status" => "success", "message" => "You are already subscribed."]);
            } else {
                 http_response_code(500);
                 echo json_encode(["status" => "error", "message" => "Could not process subscription."]);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid email provided."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
