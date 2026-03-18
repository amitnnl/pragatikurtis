<?php
include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!empty($data->code) && !empty($data->amount)) {
        $code = strtoupper(trim($data->code));
        $amount = $data->amount;
        $today = date('Y-m-d');

        $query = "SELECT * FROM coupons WHERE code = :code AND is_active = 1 AND expires_at >= :today";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->bindParam(':today', $today);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($amount < $coupon['min_order_amount']) {
                echo json_encode(["status" => "error", "message" => "Minimum order of ₹" . $coupon['min_order_amount'] . " required."]);
                exit;
            }

            $discount = 0;
            if ($coupon['discount_type'] == 'percentage') {
                $discount = ($amount * $coupon['value']) / 100;
            } else {
                $discount = $coupon['value'];
            }

            // Cap discount to order value
            if ($discount > $amount) {
                $discount = $amount;
            }

            echo json_encode([
                "status" => "success", 
                "message" => "Coupon Applied!", 
                "discount" => $discount,
                "new_total" => $amount - $discount
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid or expired coupon."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Enter a coupon code."]);
    }
}
?>
