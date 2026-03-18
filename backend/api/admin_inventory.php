<?php
include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST' && !empty($data->id) && !empty($data->action)) {
    if ($data->action == 'restock') {
        $amount = $data->amount ?? 10;
        $query = "UPDATE products SET stock = stock + :amount WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Restocked successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to restock"]);
        }
    }
}
?>
