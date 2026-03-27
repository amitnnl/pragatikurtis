<?php
include_once __DIR__ . '/../cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/app.php';

require_once __DIR__ . '/../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Disable HTML errors
ini_set('display_errors', 0);
error_reporting(0);

// This script should be run via a CRON Job daily.
// It finds carts older than 24 hours that haven't been notified yet.

try {
    $database = new Database();
    $db = $database->getConnection();

    // Find carts updated more than 24 hours ago, and not yet notified
    $query = "SELECT * FROM abandoned_carts WHERE last_updated < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND notified = 0";
    $stmt = $db->query($query);
    $carts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sentCount = 0;

    foreach ($carts as $cart) {
        $email = $cart['user_email'];
        $cart_items = json_decode($cart['cart_data'], true);

        if (empty($cart_items) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }

        // Send Email
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.example.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER') ?: 'user@example.com';
            $mail->Password   = getenv('SMTP_PASS') ?: 'secret';
            $mail->SMTPSecure = getenv('SMTP_SECURE') === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = getenv('SMTP_PORT') ?: 587;

            $from_email = getenv('SMTP_FROM_EMAIL') ?: 'no-reply@pragatikurtis.com';
            $mail->setFrom($from_email, 'Pragati Kurtis');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'You left something behind! 🛒';

            $body = "<div style='font-family: Arial, sans-serif; text-align: center; color: #333;'>";
            $body .= "<h2>We noticed you left some beautiful items in your cart...</h2>";
            $body .= "<p>Don't miss out! Your items are waiting for you.</p>";
            $body .= "<hr style='margin: 20px 0; border: 0; border-top: 1px solid #eee;'/>";
            foreach ($cart_items as $item) {
                $body .= "<p><strong>" . htmlspecialchars($item['name']) . "</strong> - ₹" . htmlspecialchars($item['price']) . "</p>";
            }
            $body .= "<br><a href='" . FRONTEND_URL . "/checkout' style='background: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Complete Your Purchase</a>";
            $body .= "</div>";

            $mail->Body = $body;
            $mail->send();

            // Mark as notified
            $upd = $db->prepare("UPDATE abandoned_carts SET notified = 1 WHERE id = ?");
            $upd->execute([$cart['id']]);

            $sentCount++;
        } catch (Exception $e) {
            error_log("Failed to send abandoned cart email to $email. " . $e->getMessage());
        }
    }

    echo json_encode(["status" => "success", "message" => "Sent $sentCount abandoned cart emails."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
