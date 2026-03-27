<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->email) && isset($data->cart)) {
        try {
            $email = Security::sanitize($data->email);
            $cart_json = json_encode($data->cart);

            // Check if cart exists for email
            $stmt = $db->prepare("SELECT id FROM abandoned_carts WHERE user_email = ?");
            $stmt->execute([$email]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                if (empty($data->cart)) {
                    // Cart emptied (e.g., successful checkout), remove from abandoned carts
                    $del = $db->prepare("DELETE FROM abandoned_carts WHERE user_email = ?");
                    $del->execute([$email]);
                } else {
                    // Update existing cart
                    $upd = $db->prepare("UPDATE abandoned_carts SET cart_data = ?, notified = 0, last_updated = CURRENT_TIMESTAMP WHERE user_email = ?");
                    $upd->execute([$cart_json, $email]);
                }
            } else if (!empty($data->cart)) {
                // Insert new cart
                $ins = $db->prepare("INSERT INTO abandoned_carts (user_email, cart_data) VALUES (?, ?)");
                $ins->execute([$email, $cart_json]);
            }

            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>
