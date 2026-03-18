<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/auth_check.php';
include_once '../config/app.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Get all orders with user names and items
    $query = "SELECT o.*, u.name as user_name, u.email as user_email, o.shipping_amount, o.tax_amount, o.tax_details, o.shipping_address_line1, o.shipping_address_line2, o.shipping_city, o.shipping_state, o.shipping_postal_code, o.shipping_country
              FROM orders o 
              LEFT JOIN users u ON o.user_id = u.id 
              ORDER BY o.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $query_items = "SELECT oi.id as order_item_id, oi.product_id, oi.quantity, oi.price, oi.size, oi.color, oi.fabric, p.name, p.hsn_code 
                        FROM order_items oi 
                        JOIN products p ON oi.product_id = p.id 
                        WHERE oi.order_id = ?";
        $stmt_items = $db->prepare($query_items);
        $stmt_items->execute([$order['id']]);
        $order['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($orders);
} else if ($method == 'POST') {
    // Update order status
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->order_id) && !empty($data->status)) {
        // Fetch current order details before updating
        $query_order_details = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?";
        $stmt_order_details = $db->prepare($query_order_details);
        $stmt_order_details->execute([$data->order_id]);
        $order_details = $stmt_order_details->fetch(PDO::FETCH_ASSOC);

        $query = "UPDATE orders SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->order_id);
        
        if ($stmt->execute()) {
            // Send email notification
            if ($order_details && ($order_details['user_email'] || $order_details['guest_email'])) {
                $to_email = $order_details['user_email'] ?: $order_details['guest_email'];
                $to_name = $order_details['user_name'] ?: $order_details['guest_name'];

                $mail = new PHPMailer(true);
                try {
                    $mail->isSMTP();
                    $mail->Host       = 'smtp.example.com';
                    $mail->SMTPAuth   = true;
                    $mail->Username   = 'user@example.com';
                    $mail->Password   = 'secret';
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = 587;

                    $mail->setFrom('no-reply@pragatikurtis.com', 'Pragati Kurtis Updates');
                    $mail->addAddress($to_email, $to_name);
                    $mail->isHTML(true);

                    $subject = "Your Order #{$order_details['id']} Status Update: " . ucfirst($data->status);
                    $body_message = '';

                    switch ($data->status) {
                        case 'processing':
                            $body_message = "Your order is now being processed and prepared for shipment.";
                            break;
                        case 'shipped':
                            $body_message = "Great news! Your order has been shipped. You can track its journey <a href='" . FRONTEND_URL . "/track-order/{$order_details['id']}'>here</a>.";
                            break;
                        case 'delivered':
                            $body_message = "Your order has been delivered! We hope you enjoy your purchase.";
                            break;
                        case 'cancelled':
                            $body_message = "Your order has been cancelled. If you have any questions, please contact us.";
                            break;
                        default:
                            $body_message = "The status of your order has been updated to " . ucfirst($data->status) . ".";
                            break;
                    }

                    $mail->Subject = $subject;
                    $mail->Body    = "
                        <html>
                        <body style='font-family: sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                            <h2 style='color: #4CAF50;'>Order Status Update</h2>
                            <p>Hello " . $to_name . ",</p>
                            <p>{$body_message}</p>
                            <p><strong>Order ID:</strong> #{$order_details['id']}</p>
                            <p><strong>New Status:</strong> " . ucfirst($data->status) . "</p>
                            <p>View your order details: <a href='" . FRONTEND_URL . "/profile?tab=orders'>My Orders</a></p>
                            <p style='margin-top: 30px; font-size: 0.9em; color: #777;'>Thank you for shopping with Pragati Kurtis!</p>
                        </div>
                        </body>
                        </html>
                    ";
                    $mail->send();
                } catch (Exception $e) {
                    error_log("Order status update email could not be sent for order " . $data->order_id . ". Mailer Error: {$mail->ErrorInfo}");
                }
            }

            echo json_encode(["message" => "Status updated", "status" => "success"]);
        } else {
            echo json_encode(["message" => "Update failed", "status" => "error"]);
        }
    }
} else if ($method == 'DELETE') {
    // Delete order
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $query = "DELETE FROM orders WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Order deleted successfully", "status" => "success"]);
        } else {
            echo json_encode(["message" => "Failed to delete order", "status" => "error"]);
        }
    } else {
        echo json_encode(["message" => "Order ID required", "status" => "error"]);
    }
}
?>
