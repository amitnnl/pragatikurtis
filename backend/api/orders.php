<?php
include_once '../cors.php';

// Define the required role(s) for this endpoint
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php';

require_once '../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Place Order
    // Removed user_id check as it can be null for guest orders
    if (!empty($data->cart) && !empty($data->total_amount)) {
        try {
            $db->beginTransaction();

            // 1. Check Stock Availability FIRST
            foreach ($data->cart as $item) {
                $check_stock = "SELECT stock, name FROM products WHERE id = ?";
                $stmt_check = $db->prepare($check_stock);
                $stmt_check->execute([$item->id]);
                $product = $stmt_check->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    throw new Exception("Product with ID " . $item->id . " not found.");
                }

                if ($product['stock'] < $item->quantity) {
                    throw new Exception("Product '" . $product['name'] . "' is out of stock or low inventory.");
                }
            }
            
            // Sanitize all incoming data
            $user_id = isset($data->user_id) ? (int) $data->user_id : null;
            $guest_name = isset($data->guest_name) ? Security::sanitize($data->guest_name) : null;
            $guest_email = isset($data->guest_email) ? Security::sanitize($data->guest_email) : null;
            $shipping_address_line1 = isset($data->shipping_address_line1) ? Security::sanitize($data->shipping_address_line1) : null;
            $shipping_address_line2 = isset($data->shipping_address_line2) ? Security::sanitize($data->shipping_address_line2) : null;
            $shipping_city = isset($data->shipping_city) ? Security::sanitize($data->shipping_city) : null;
            $shipping_state = isset($data->shipping_state) ? Security::sanitize($data->shipping_state) : null;
            $shipping_postal_code = isset($data->shipping_postal_code) ? Security::sanitize($data->shipping_postal_code) : null;
            $shipping_country = isset($data->shipping_country) ? Security::sanitize($data->shipping_country) : null;
            $total_amount = $data->total_amount;
            $payment_method = isset($data->payment_method) ? Security::sanitize($data->payment_method) : 'cod';
            $payment_id = isset($data->payment_id) ? Security::sanitize($data->payment_id) : null;
            $shipping_amount = isset($data->shipping_amount) ? $data->shipping_amount : 0;
            $tax_amount = isset($data->tax_amount) ? $data->tax_amount : 0;
            $razorpay_order_id = isset($data->razorpay_order_id) ? Security::sanitize($data->razorpay_order_id) : null;


            // Calculate GST Breakdown
            $company_state = "Maharashtra"; // Standardize this
            $customer_state = $shipping_state;
            $tax_details = [];
            
            if ($customer_state && strtolower($customer_state) === strtolower($company_state)) {
                $tax_details = [
                    "type" => "intra",
                    "cgst" => $tax_amount / 2,
                    "sgst" => $tax_amount / 2,
                    "cgst_rate" => 9, // Assuming 18% total
                    "sgst_rate" => 9
                ];
            } else {
                $tax_details = [
                    "type" => "inter",
                    "igst" => $tax_amount,
                    "igst_rate" => 18
                ];
            }
            $tax_details_json = json_encode($tax_details);

            // 2. Insert into orders table
            $query = "INSERT INTO orders (user_id, guest_name, guest_email, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, total_amount, shipping_amount, tax_amount, tax_details, status, payment_method, payment_id, razorpay_order_id) VALUES (:user_id, :guest_name, :guest_email, :shipping_address_line1, :shipping_address_line2, :shipping_city, :shipping_state, :shipping_postal_code, :shipping_country, :total, :shipping, :tax, :tax_details, 'pending', :payment_method, :payment_id, :razorpay_order_id)";
            $stmt = $db->prepare($query);

            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindParam(':guest_name', $guest_name);
            $stmt->bindParam(':guest_email', $guest_email);
            $stmt->bindParam(':shipping_address_line1', $shipping_address_line1);
            $stmt->bindParam(':shipping_address_line2', $shipping_address_line2);
            $stmt->bindParam(':shipping_city', $shipping_city);
            $stmt->bindParam(':shipping_state', $shipping_state);
            $stmt->bindParam(':shipping_postal_code', $shipping_postal_code);
            $stmt->bindParam(':shipping_country', $shipping_country);
            $stmt->bindParam(':total', $total_amount);
            $stmt->bindParam(':shipping', $shipping_amount);
            $stmt->bindParam(':tax', $tax_amount);
            $stmt->bindParam(':tax_details', $tax_details_json);
            $stmt->bindParam(':payment_method', $payment_method);
            $stmt->bindParam(':payment_id', $payment_id);
            $stmt->bindParam(':razorpay_order_id', $razorpay_order_id);
            $stmt->execute();
            
            $order_id = $db->lastInsertId();

            // 3. Insert Items & Decrement Stock
            $query_item = "INSERT INTO order_items (order_id, product_id, quantity, price, size, color, fabric) VALUES (:order_id, :product_id, :quantity, :price, :size, :color, :fabric)";
            $stmt_item = $db->prepare($query_item);

            $update_stock = "UPDATE products SET stock = stock - :qty WHERE id = :pid";
            $stmt_stock = $db->prepare($update_stock);

            $log_inventory = "INSERT INTO inventory_history (product_id, quantity_change, reason, order_id) VALUES (:pid, :qty_change, 'new_order', :order_id)";
            $stmt_log = $db->prepare($log_inventory);

            foreach ($data->cart as $item) {
                // Insert Item with Variants
                $size = $item->selectedSize ?? 'M';
                $color = $item->selectedColor ?? null;
                $fabric = $item->selectedFabric ?? null;

                $stmt_item->bindParam(':order_id', $order_id);
                $stmt_item->bindParam(':product_id', $item->id);
                $stmt_item->bindParam(':quantity', $item->quantity);
                $stmt_item->bindParam(':price', $item->price);
                $stmt_item->bindParam(':size', $size);
                $stmt_item->bindParam(':color', $color);
                $stmt_item->bindParam(':fabric', $fabric);
                $stmt_item->execute();

                // Decrease Stock
                $stmt_stock->bindParam(':qty', $item->quantity);
                $stmt_stock->bindParam(':pid', $item->id);
                $stmt_stock->execute();
                
                // Log Inventory Change
                $quantity_change = -$item->quantity;
                $stmt_log->bindParam(':pid', $item->id);
                $stmt_log->bindParam(':qty_change', $quantity_change);
                $stmt_log->bindParam(':order_id', $order_id);
                $stmt_log->execute();
            }

            // Send Order Confirmation Email
            if (filter_var($guest_email, FILTER_VALIDATE_EMAIL)) {
                $mail = new PHPMailer(true);
                try {
                    //Server settings
                    $mail->isSMTP();
                    $mail->Host       = 'smtp.gmail.com';  // Set the SMTP server to send through
                    $mail->SMTPAuth   = true;
                    $mail->Username   = 'user@example.com'; // SMTP username
                    $mail->Password   = 'secret';           // SMTP password
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = 587;

                    //Recipients
                    $mail->setFrom('from@example.com', 'Pragati Kurtis Order');
                    $mail->addAddress($guest_email, $guest_name);

                    // Content
                    $mail->isHTML(true);
                    $mail->Subject = 'Your Order Confirmation - #' . $order_id;
                    $email_body = "<h1>Order Confirmation - #{$order_id}</h1>";
                    $email_body .= "<p>Dear {$guest_name},</p>";
                    $email_body .= "<p>Thank you for your order! Your order #{$order_id} has been placed successfully and is currently <b>pending</b>.</p>";
                    
                    // Product List
                    $email_body .= "<h2>Order Details:</h2>";
                    $email_body .= "<table border='1' cellpadding='10' cellspacing='0' width='100%'>";
                    $email_body .= "<thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>";
                    foreach($data->cart as $item) {
                        $email_body .= "<tr><td>{$item->name} ({$item->selectedSize})</td><td>{$item->quantity}</td><td>₹{$item->price}</td></tr>";
                    }
                    $email_body .= "</tbody></table>";

                    $email_body .= "<p>Total Amount: ₹{$total_amount}</p>";
                    $email_body .= "<p>Shipping Address: {$shipping_address_line1}, {$shipping_city}, {$shipping_state} {$shipping_postal_code}</p>";
                    $email_body .= "<p>We will notify you once your order has been shipped.</p>";
                    $email_body .= "<p>Thank you,<br>Pragati Kurtis Team</p>";

                    $mail->Body    = $email_body;

                    $mail->send();
                    // error_log("Order confirmation email sent to: " . $guest_email);
                } catch (Exception $e) {
                    error_log("Order confirmation email could not be sent. Mailer Error: {$mail->ErrorInfo}");
                }
            }


            $db->commit();
            echo json_encode(["status" => "success", "message" => "Order placed successfully!", "order_id" => $order_id]);
        } catch (Exception $e) {
            $db->rollBack();
            error_log("Order placement failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Order placement failed: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Cart and total amount are required."]);
    }
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // This block handles fetching order data
    // Handle request for a single detailed order
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $order_id = Security::sanitize($_GET['id']);

        $query_order = "SELECT o.*, u.name as user_full_name, u.email as user_email_registered
                        FROM orders o 
                        LEFT JOIN users u ON o.user_id = u.id
                        WHERE o.id = :order_id";
        $stmt_order = $db->prepare($query_order);
        $stmt_order->bindParam(':order_id', $order_id, PDO::PARAM_INT);
        $stmt_order->execute();
        $order = $stmt_order->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Order not found.']);
            exit();
        }

        // Fetch order items
        $query_items = "SELECT oi.*, p.name as product_name, p.image as product_image
                        FROM order_items oi
                        JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = :order_id";
        $stmt_items = $db->prepare($query_items);
        $stmt_items->bindParam(':order_id', $order_id, PDO::PARAM_INT);
        $stmt_items->execute();
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        // Add items to the order array
        $order['items'] = $items;

        http_response_code(200);
        echo json_encode($order);
        exit();

    } else if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
        // Handle request for a list of orders for a specific user with detailed items
        $user_id = (int) $_GET['user_id'];
        $query = "SELECT id, total_amount, status, created_at, guest_name, guest_email, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) { // Use & to modify the array elements directly
            $query_items = "SELECT oi.*, p.name as product_name, p.image as product_image
                            FROM order_items oi
                            JOIN products p ON oi.product_id = p.id
                            WHERE oi.order_id = :order_id";
            $stmt_items = $db->prepare($query_items);
            $stmt_items->bindParam(':order_id', $order['id'], PDO::PARAM_INT);
            $stmt_items->execute();
            $order['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);
        }
        unset($order); // Break the reference with the last element

        echo json_encode($orders);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'User ID is required.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
