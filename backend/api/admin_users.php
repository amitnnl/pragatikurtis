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
    if (isset($_GET['id'])) {
        // Get single user
        $query = "SELECT id, name, email, phone, role, is_approved, company_name, gst_number FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        // Get all users
        $query = "SELECT id, name, email, phone, role, is_approved, company_name, gst_number, created_at FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} else if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->action)) {
        if ($data->action == 'add_user') {
            // Add new user
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $query = "INSERT INTO users (name, email, phone, role, is_approved, company_name, gst_number, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$data->name, $data->email, $data->phone, $data->role, $data->is_approved, $data->company_name, $data->gst_number, $password_hash])) {
                echo json_encode(["status" => "success", "message" => "User added successfully"]);
            }
        } else if ($data->action == 'update_user') {
            // Update existing user
            $query = "UPDATE users SET name = ?, email = ?, phone = ?, role = ?, is_approved = ?, company_name = ?, gst_number = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$data->name, $data->email, $data->phone, $data->role, $data->is_approved, $data->company_name, $data->gst_number, $data->id])) {
                if (!empty($data->password)) {
                    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
                    $query_pass = "UPDATE users SET password_hash = ? WHERE id = ?";
                    $stmt_pass = $db->prepare($query_pass);
                    $stmt_pass->execute([$password_hash, $data->id]);
                }
                echo json_encode(["status" => "success", "message" => "User updated successfully"]);
            }
        } else if ($data->action == 'update_status') {
            // Approve/Disapprove user
            $query_user = "SELECT id, name, email, role, is_approved FROM users WHERE id = ?";
            $stmt_user = $db->prepare($query_user);
            $stmt_user->execute([$data->id]);
            $user_details = $stmt_user->fetch(PDO::FETCH_ASSOC);

            $query = "UPDATE users SET is_approved = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$data->is_approved, $data->id])) {
                // Send email if dealer account is approved
                if ($user_details['role'] === 'dealer' && $user_details['is_approved'] == 0 && $data->is_approved == 1) {
                    $mail = new PHPMailer(true);
                    try {
                        $mail->isSMTP();
                        $mail->Host       = 'smtp.example.com';
                        $mail->SMTPAuth   = true;
                        $mail->Username   = 'user@example.com';
                        $mail->Password   = 'secret';
                        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                        $mail->Port       = 587;

                        $mail->setFrom('no-reply@pragatikurtis.com', 'Pragati Kurtis');
                        $mail->addAddress($user_details['email'], $user_details['name']);
                    $mail->isHTML(true);
                    $mail->Subject = 'Your Dealer Account is Approved';
                    $mail->Body    = "
                        <h2>Congratulations, " . $data->name . "!</h2>
                        <p>Your dealer account application for Pragati Kurtis has been <strong>approved</strong>.</p>
                        <p>You can now log in to access exclusive dealer pricing and bulk ordering features.</p>
                        <p>Log in now to explore: <a href='" . FRONTEND_URL . "/login' style='color: #1a73e8; text-decoration: none;'>Go to Login</a></p>
                        <br>
                        <p>Welcome to the family!</p>
                    ";
                        $mail->send();
                    } catch (Exception $e) {
                        error_log("Dealer approval email could not be sent to {$user_details['email']}. Mailer Error: {$mail->ErrorInfo}");
                    }
                }
                echo json_encode(["status" => "success", "message" => "User status updated"]);
            }
        } else if ($data->action == 'change_role') {
            // Change user role
            $query = "UPDATE users SET role = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$data->role, $data->id])) {
                echo json_encode(["status" => "success", "message" => "User role updated"]);
            }
        }
    }
} else if ($method == 'DELETE') {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        if ($stmt->execute([$_GET['id']])) {
            echo json_encode(["status" => "success"]);
        }
    }
}
?>
