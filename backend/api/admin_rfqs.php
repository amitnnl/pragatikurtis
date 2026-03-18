<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';
include_once '../config/app.php';

require_once '../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

if ($method == 'GET') {
    // Get all RFQs
    $query = "SELECT r.*, u.name as user_name, u.email as user_email FROM rfqs r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $rfqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rfqs as &$rfq) {
        $query_items = "SELECT ri.*, p.name, p.image_url, p.price as current_price FROM rfq_items ri JOIN products p ON ri.product_id = p.id WHERE ri.rfq_id = ?";
        $stmt_items = $db->prepare($query_items);
        $stmt_items->execute([$rfq['id']]);
        $rfq['items'] = $stmt_items->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($rfqs);
} else if ($method == 'POST') {
    // Update RFQ status or Quote price
    if (!empty($data->rfq_id)) {
        // Fetch RFQ details before update for email
        $query_rfq_details = "SELECT r.*, u.name as user_name, u.email as user_email FROM rfqs r LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?";
        $stmt_rfq_details = $db->prepare($query_rfq_details);
        $stmt_rfq_details->execute([$data->rfq_id]);
        $rfq_details = $stmt_rfq_details->fetch(PDO::FETCH_ASSOC);

        if (isset($data->items)) {
            // Updating offered prices
            foreach ($data->items as $item) {
                $query = "UPDATE rfq_items SET offered_price = ? WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$item->offered_price, $item->id]);
            }
        }
        
        if (!empty($data->status)) {
            $query = "UPDATE rfqs SET status = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$data->status, $data->rfq_id]);
            $rfq_details['status'] = $data->status; // Update status in details for email
        }

        if (!empty($data->total_amount)) {
            $query = "UPDATE rfqs SET total_amount = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$data->total_amount, $data->rfq_id]);
            $rfq_details['total_amount'] = $data->total_amount; // Update total for email
        }

        // Send email notification
        if ($rfq_details && ($rfq_details['user_email'] || $rfq_details['guest_email'])) {
            $to_email = $rfq_details['user_email'] ?: $rfq_details['guest_email'];
            $to_name = $rfq_details['user_name'] ?: $rfq_details['guest_name'];

            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host       = 'smtp.example.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'user@example.com';
                $mail->Password   = 'secret';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                $mail->setFrom('no-reply@pragatikurtis.com', 'Pragati Kurtis RFQ');
                $mail->addAddress($to_email, $to_name);
                $mail->isHTML(true);

                $subject = "Your RFQ #{$rfq_details['id']} Status Update: " . ucfirst($rfq_details['status']);
                $body_message = '';
                $action_link = '';

                $items_html = "";
                $query_items = "SELECT ri.*, p.name FROM rfq_items ri JOIN products p ON ri.product_id = p.id WHERE ri.rfq_id = ?";
                $stmt_items = $db->prepare($query_items);
                $stmt_items->execute([$rfq_details['id']]);
                $rfq_items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

                foreach ($rfq_items as $item) {
                    $items_html .= "<tr><td style='padding: 5px; border-bottom: 1px solid #eee;'>{$item['name']} (x{$item['quantity']})</td><td style='padding: 5px; border-bottom: 1px solid #eee; text-align: right;'>₹" . number_format($item['offered_price'], 2) . "</td></tr>";
                }

                if ($rfq_details['status'] === 'quoted') {
                    $body_message = "Your Request for Quote #{$rfq_details['id']} has been reviewed and a quote has been provided.";
                    $action_link = "<p>View your quote and accept: <a href='" . FRONTEND_URL . "/profile?tab=rfqs' style='color: #1a73e8; text-decoration: none;'>My Quote Requests</a></p>";
                } else if ($rfq_details['status'] === 'rejected') {
                    $body_message = "Your Request for Quote #{$rfq_details['id']} has been rejected. Please contact us for more details.";
                } else {
                    $body_message = "The status of your Request for Quote #{$rfq_details['id']} has been updated to " . ucfirst($rfq_details['status']) . ".";
                }

                $mail->Subject = $subject;
                $mail->Body    = "
                    <html>
                    <body style='font-family: sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                        <h2 style='color: #4CAF50;'>RFQ Status Update</h2>
                        <p>Hello " . $to_name . ",</p>
                        <p>{$body_message}</p>
                        <p><strong>RFQ ID:</strong> #{$rfq_details['id']}</p>
                        <p><strong>New Status:</strong> " . ucfirst($rfq_details['status']) . "</p>
                        
                        <h3 style='border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;'>Quote Details</h3>
                        <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                            <thead>
                                <tr>
                                    <th style='padding: 8px; border-bottom: 1px solid #eee; text-align: left;'>Item</th>
                                    <th style='padding: 8px; border-bottom: 1px solid #eee; text-align: right;'>Offered Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                " . $items_html . "
                                <tr style='font-weight: bold; background-color: #f9f9f9;'><td style='padding: 8px; text-align: right;'>Total Quote:</td><td style='padding: 8px; text-align: right;'>₹" . number_format($rfq_details['total_amount'], 2) . "</td></tr>
                            </tbody>
                        </table>
                        {$action_link}
                        <p style='margin-top: 30px; font-size: 0.9em; color: #777;'>Thank you for your interest in Pragati Kurtis!</p>
                    </div>
                    </body>
                    </html>
                ";
                $mail->send();
            } catch (Exception $e) {
                error_log("RFQ status update email could not be sent for RFQ " . $data->rfq_id . ". Mailer Error: {$mail->ErrorInfo}");
            }
        }

        echo json_encode(["status" => "success", "message" => "RFQ updated"]);
    }
} else if ($method == 'DELETE') {
    if (isset($_GET['id'])) {
        $query = "DELETE FROM rfqs WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$_GET['id']]);
        echo json_encode(["status" => "success"]);
    }
}
?>
