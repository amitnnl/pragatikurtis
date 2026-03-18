<?php
// Cache-busting comment
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

require_once '../vendor/autoload.php';
use Razorpay\Api\Api;

$database = new Database();
$db = $database->getConnection();

$keyId = Security::$RAZORPAY_KEY_ID;
$keySecret = Security::$RAZORPAY_KEY_SECRET;

if (empty($keyId) || empty($keySecret) || $keyId === 'rzp_test_YOUR_KEY_ID' || $keySecret === 'YOUR_KEY_SECRET') {
    error_log("Razorpay API keys are not configured. Please update backend/config/security.php.");
    http_response_code(500);
    echo json_encode(["message" => "Razorpay API keys are not configured.", "status" => "error"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = file_get_contents("php://input");
    $webhookBody = json_decode($data, true);

    // Verify webhook signature
    $webhookSignature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
    
    // Check if signature is empty, if so, it's not a valid Razorpay webhook call
    if (empty($webhookSignature)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Webhook signature not found.']);
        exit();
    }

    $api = new Api($keyId, $keySecret);

    try {
        $api->utility->verifyWebhookSignature($data, $webhookSignature, $keySecret);

        // Webhook signature is valid
        $event = $webhookBody['event'];

        // Handle specific events
        if ($event === 'payment.authorized' || $event === 'payment.captured') {
            $payment = $webhookBody['payload']['payment']['entity'];
            $orderId = $payment['order_id']; // Razorpay Order ID
            $razorpayPaymentId = $payment['id'];
            $status = $payment['status'];

            // Find the order in your database by Razorpay Order ID
            $query = "SELECT id FROM orders WHERE razorpay_order_id = ? LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->execute([$orderId]);
            $localOrder = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($localOrder) {
                // Update your local order status and payment_id
                $updateQuery = "UPDATE orders SET status = ?, payment_id = ?, payment_method = 'razorpay' WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                // Map Razorpay status to your internal status (e.g., 'captured' -> 'processing')
                $newStatus = ($status === 'captured') ? 'processing' : 'pending'; 
                $updateStmt->execute([$newStatus, $razorpayPaymentId, $localOrder['id']]);

                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Payment processed and order updated.']);
            } else {
                error_log("Razorpay Webhook: Order not found in DB for Razorpay Order ID: " . $orderId);
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Order not found in database.']);
            }
        } else {
            // Handle other events or ignore
            http_response_code(200); // Still return 200 for unhandled events to prevent re-delivery attempts
            echo json_encode(['status' => 'success', 'message' => 'Event received but not handled: ' . $event]);
        }

    } catch (Exception $e) {
        error_log("Razorpay Webhook Signature Verification Failed: " . $e->getMessage());
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Webhook signature verification failed.']);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed.", "status" => "error"]);
}
?>