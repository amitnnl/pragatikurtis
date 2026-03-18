<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET' && isset($_GET['id'])) {
    $order_id = Security::sanitize($_GET['id']);

    try {
        $query = "SELECT o.*, u.name as user_name, u.email as user_email
                  FROM orders o
                  LEFT JOIN users u ON o.user_id = u.id
                  WHERE o.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$order_id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($order) {
            $query_items = "SELECT oi.quantity, oi.price, oi.size, oi.color, oi.fabric, p.name, p.image_url 
                            FROM order_items oi 
                            JOIN products p ON oi.product_id = p.id 
                            WHERE oi.order_id = ?";
            $stmt_items = $db->prepare($query_items);
            $stmt_items->execute([$order['id']]);
            $order['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($order);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Order not found."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid request. Please provide an order ID."]);
}
?>
