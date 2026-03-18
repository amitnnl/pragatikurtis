<?php
// Define the required role(s) for this endpoint
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php';

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!empty($data->rfq_id) && !empty($data->user_id)) {
        try {
            $db->beginTransaction();

            // 1. Fetch RFQ details
            $stmt = $db->prepare("SELECT * FROM rfqs WHERE id = ? AND user_id = ?");
            $stmt->execute([$data->rfq_id, $data->user_id]);
            $rfq = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$rfq || $rfq['status'] !== 'quoted') {
                throw new Exception("Invalid RFQ or RFQ not quoted yet.");
            }

            // 2. Fetch RFQ items
            $stmt_items = $db->prepare("SELECT ri.*, p.price as original_price, p.stock FROM rfq_items ri JOIN products p ON ri.product_id = p.id WHERE ri.rfq_id = ?");
            $stmt_items->execute([$data->rfq_id]);
            $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

            // 3. Check for stock availability
            foreach ($items as $item) {
                if ($item['stock'] < $item['quantity']) {
                    throw new Exception("Product " . $item['product_id'] . " is out of stock.");
                }
            }

            // 4. Create Order with a 'checkout-pending' status
            $query_order = "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'checkout-pending')";
            $stmt_order = $db->prepare($query_order);
            $stmt_order->execute([$rfq['user_id'], $rfq['total_amount']]);
            $order_id = $db->lastInsertId();

            // 5. Insert Order Items
            $query_oi = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
            $stmt_oi = $db->prepare($query_oi);

            foreach ($items as $item) {
                $stmt_oi->execute([$order_id, $item['product_id'], $item['quantity'], $item['offered_price']]);
            }

            // 6. Update RFQ status
            $stmt_update = $db->prepare("UPDATE rfqs SET status = 'accepted' WHERE id = ?");
            $stmt_update->execute([$data->rfq_id]);

            $db->commit();
            echo json_encode(["status" => "success", "message" => "Quote accepted. Proceed to checkout.", "order_id" => $order_id]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid input."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>