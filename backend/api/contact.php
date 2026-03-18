<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!empty($data->email) && !empty($data->message) && !empty($data->phone)) {
        $name = Security::sanitize($data->first_name . ' ' . $data->last_name);
        $email = Security::sanitize($data->email);
        $phone = Security::sanitize($data->phone); // Sanitize the phone number
        $message = Security::sanitize($data->message);

        $query = "INSERT INTO contact_inquiries (name, email, phone, message) VALUES (:name, :email, :phone, :message)";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone); // Bind the phone number
        $stmt->bindParam(':message', $message);

       if ($stmt->execute()) {
            $mail = new PHPMailer(true);
            try {
                //Server settings
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';  // Your SMTP server
                $mail->SMTPAuth   = true;
                $mail->Username   = 'user@example.com';  // Your SMTP username
                $mail->Password   = 'secret';        // Your SMTP password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                //Recipients
                $mail->setFrom('from@example.com', 'Pragati Kurtis Contact');
                $mail->addAddress('amitnnl81@gmail.com', 'Admin');

                // Content
                $mail->isHTML(false);
                $mail->Subject = 'New Contact Inquiry';
                $body = "You have received a new contact inquiry:\n\n";
                $body .= "Name: $name\n";
                $body .= "Email: $email\n";
                $body .= "Phone: $phone\n"; // Include phone in email
                $body .= "Message:\n$message\n";
                $mail->Body    = $body;

                $mail->send();
                echo json_encode(["status" => "success", "message" => "Thank you for contacting us! We will get back to you shortly."]);
            } catch (Exception $e) {
                // Log the error, but don't expose it to the user
                error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
                echo json_encode(["status" => "success", "message" => "Thank you for contacting us! We've received your message and will get back to you shortly."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Unable to submit your inquiry. Please try again later."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Please fill in all required fields."]);
    }
}
?>
