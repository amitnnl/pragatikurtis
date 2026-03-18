<?php
// Define the required role(s) for this endpoint
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php';

include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if it's a return request
    if (!empty($data->order_id) && !empty($data->reason)) {
        // In a real app, you might have a separate 'returns' table. 
        // For simplicity, we'll update the order status to 'return_requested' and store the reason in a note or separate field.
        // Let's assume we just update status for now.
        
        $query = "UPDATE orders SET status = 'return_requested' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->order_id);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Return requested successfully", "status" => "success"]);
        } else {
            echo json_encode(["message" => "Failed to request return", "status" => "error"]);
        }
    }
}
?>
