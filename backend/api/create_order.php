<?php
// Cache-busting comment
require_once '../vendor/autoload.php';
use Razorpay\Api\Api;

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
    if (!empty($data->amount)) {
        try {
            $keyId = Security::$RAZORPAY_KEY_ID;
            $keySecret = Security::$RAZORPAY_KEY_SECRET;

            if (empty($keyId) || empty($keySecret) || $keyId === 'rzp_test_YOUR_KEY_ID' || $keySecret === 'YOUR_KEY_SECRET') {
                throw new Exception("Razorpay API keys are not configured. Please update backend/config/security.php.");
            }

            $api = new Api($keyId, $keySecret);

            $orderData = [
                'receipt'         => 'rcptid_' . uniqid(),
                'amount'          => $data->amount * 100, // Amount in paisa
                'currency'        => 'INR',
                'payment_capture' => 1 // Auto capture payment
            ];

            $razorpayOrder = $api->order->create($orderData);
            
            echo json_encode([
                "message" => "Razorpay Order created successfully",
                "status" => "success",
                "order_id" => $razorpayOrder['id'],
                "amount" => $razorpayOrder['amount'],
                "currency" => $razorpayOrder['currency'],
                "key_id" => $keyId
            ]);

        } catch (Exception $e) {
            error_log("Razorpay Order Creation Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Failed to create Razorpay Order: " . $e->getMessage(), "status" => "error"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Amount is required.", "status" => "error"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed.", "status" => "error"]);
}
?>