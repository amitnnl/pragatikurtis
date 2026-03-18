<?php
// Define the required role(s) for this endpoint
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php';

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

if ($method == 'POST') {
    // Submit RFQ
    if (!empty($data->items) && (!empty($data->user_id) || !empty($data->guest_email))) {
        try {
            $db->beginTransaction();

            $user_id = isset($data->user_id) ? (int)$data->user_id : null;
            $guest_name = isset($data->guest_name) ? Security::sanitize($data->guest_name) : null;
            $guest_email = isset($data->guest_email) ? Security::sanitize($data->guest_email) : null;
            $guest_phone = isset($data->guest_phone) ? Security::sanitize($data->guest_phone) : null;

            $query = "INSERT INTO rfqs (user_id, guest_name, guest_email, guest_phone, status) VALUES (?, ?, ?, ?, 'pending')";
            $stmt = $db->prepare($query);
            $stmt->execute([$user_id, $guest_name, $guest_email, $guest_phone]);
            $rfq_id = $db->lastInsertId();

            $query_item = "INSERT INTO rfq_items (rfq_id, product_id, quantity) VALUES (?, ?, ?)";
            $stmt_item = $db->prepare($query_item);

            foreach ($data->items as $item) {
                $stmt_item->execute([$rfq_id, $item->id, $item->quantity]);
            }

            $db->commit();
            echo json_encode(["status" => "success", "message" => "RFQ submitted successfully", "rfq_id" => $rfq_id]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Incomplete data"]);
    }
} else if ($method == 'GET') {
    // Get user RFQs
    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $query = "SELECT * FROM rfqs WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $rfqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rfqs as &$rfq) {
            $query_items = "SELECT ri.*, p.name, p.image_url FROM rfq_items ri JOIN products p ON ri.product_id = p.id WHERE ri.rfq_id = ?";
            $stmt_items = $db->prepare($query_items);
            $stmt_items->execute([$rfq['id']]);
            $rfq['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);
        }
        echo json_encode($rfqs);
    }
}
?>
