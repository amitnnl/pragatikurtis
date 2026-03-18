<?php
// Cache-busting comment
require_once '../vendor/autoload.php';
use Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';
include_once '../config/app.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($data->action)) {
    if ($data->action == 'register') {
        if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
            // Sanitize inputs
            $name = Security::sanitize($data->name);
            $email = Security::sanitize($data->email);
            $phone = !empty($data->phone) ? Security::sanitize($data->phone) : null;
            $company_name = !empty($data->company_name) ? Security::sanitize($data->company_name) : null;
            $gst_number = !empty($data->gst_number) ? Security::sanitize($data->gst_number) : null;
            
            // Determine role: if company details provided, pending dealer (or dealer), else customer
            // For simplicity, we'll set them as 'dealer' but set approved=0 if B2B.
            $is_dealer = ($company_name || $gst_number);
            $role = $is_dealer ? 'dealer' : 'customer';
            $is_approved = $is_dealer ? 0 : 1;

            if (!Security::validateEmail($email)) {
                echo json_encode(["message" => "Invalid email format", "status" => "error"]);
                exit;
            }

            $query = "INSERT INTO users (name, email, password_hash, role, is_approved, phone, company_name, gst_number) VALUES (:name, :email, :password_hash, :role, :is_approved, :phone, :company_name, :gst_number)";
            $stmt = $db->prepare($query);

            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password_hash", $password_hash);
            $stmt->bindParam(":role", $role);
            $stmt->bindParam(":is_approved", $is_approved);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":company_name", $company_name);
            $stmt->bindParam(":gst_number", $gst_number);

            try {
                if ($stmt->execute()) {
                    $user_id = $db->lastInsertId();
                    
                    // Fetch the created user to return to frontend
                    $query_user = "SELECT id, name, email, role, phone, company_name, gst_number FROM users WHERE id = ?";
                    $stmt_user = $db->prepare($query_user);
                    $stmt_user->execute([$user_id]);
                    $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

                    // Send Welcome Email
                    $mail = new PHPMailer(true);
                    try {
                        $mail->isSMTP();
                        $mail->Host       = getenv('SMTP_HOST');
                        $mail->SMTPAuth   = true;
                        $mail->Username   = getenv('SMTP_USER');
                        $mail->Password   = getenv('SMTP_PASS');
                        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: PHPMailer::ENCRYPTION_STARTTLS;
                        $mail->Port       = getenv('SMTP_PORT') ?: 587;

                        $mail->setFrom(getenv('SMTP_FROM_EMAIL') ?: 'no-reply@example.com', getenv('SMTP_FROM_NAME') ?: 'Pragati Kurtis');
                        $mail->addAddress($email, $name);
                        $mail->isHTML(true);
                        $mail->Subject = 'Welcome to Pragati Kurtis!';
                        $mail->Body    = "
                            <html>
                            <body style='font-family: sans-serif; line-height: 1.6; color: #333;'>
                            <div style='max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                                <h2 style='color: #4CAF50;'>Welcome, {$name}!</h2>
                                <p>Thank you for registering with Pragati Kurtis. We are excited to have you as part of our community.</p>
                                <p>You can now explore our exquisite collection of Kurtis, Gowns, Suit Sets, and more.</p>
                                <p>Start shopping now: <a href='" . FRONTEND_URL . "/shop' style='color: #1a73e8; text-decoration: none;'>Explore Our Collection</a></p>
                                <p style='margin-top: 30px; font-size: 0.9em; color: #777;'>If you have any questions, feel free to contact our support team.</p>
                            </div>
                            </body>
                            </html>
                        ";
                        $mail->send();
                    } catch (Exception $e) {
                        error_log("Welcome email could not be sent to {$email}. Mailer Error: {$mail->ErrorInfo}");
                    }
                    echo json_encode(["message" => "User created successfully", "status" => "success", "user" => $user]);
                } else {
                    echo json_encode(["message" => "Unable to create user.", "status" => "error"]);
                }
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) { // Duplicate entry
                    echo json_encode(["message" => "Email already exists.", "status" => "error"]);
                } else {
                    echo json_encode(["message" => "System error: " . $e->getMessage(), "status" => "error"]);
                }
            }
        }
    } else if ($data->action == 'login') {
        if (!empty($data->email) && !empty($data->password)) {
            $email = Security::sanitize($data->email);
            
            $query = "SELECT id, name, email, password_hash, role, phone, company_name, gst_number FROM users WHERE email = ? LIMIT 0,1";
            $stmt = $db->prepare($query);
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($data->password, $user['password_hash'])) {
                // Generate JWT
                $issuer = FRONTEND_URL; // Your domain
                $audience = FRONTEND_URL; // Your frontend domain
                $issuedAt = time();
                $expirationTime = $issuedAt + 3600; // JWT valid for 1 hour (3600 seconds)

                $token = array(
                   "iss" => $issuer,
                   "aud" => $audience,
                   "iat" => $issuedAt,
                   "exp" => $expirationTime,
                   "data" => array(
                       "id" => $user['id'],
                       "name" => $user['name'],
                       "email" => $user['email'],
                       "role" => $user['role']
                   )
                );
                
                $jwt = JWT::encode($token, Security::$JWT_SECRET_KEY, 'HS256');

                unset($user['password_hash']);
                echo json_encode(["message" => "Login successful", "status" => "success", "user" => $user, "jwt" => $jwt]);
            } else {
                http_response_code(401);
                
                // Debugging: Check if the hash is truncated in the DB
                $debug_info = [
                    'message' => 'Invalid credentials',
                    'status' => 'error',
                    'debug' => [
                        'password_received' => $data->password,
                        'hash_from_db' => $user ? $user['password_hash'] : 'User not found.',
                        'hash_length' => $user ? strlen($user['password_hash']) : 0,
                        'expected_hash_length' => 60
                    ]
                ];
                echo json_encode($debug_info);
            }
        }
    } else if ($data->action == 'forgot_password') {
        if (!empty($data->email)) {
            $email = Security::sanitize($data->email);

            $query = "SELECT id FROM users WHERE email = ? LIMIT 0,1";
            $stmt = $db->prepare($query);
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() > 0) {
                // Generate a secure token
                $token = random_bytes(32);
                $token_hash = hash('sha256', $token);
                $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hour from now

                $query_insert = "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)";
                $stmt_insert = $db->prepare($query_insert);

                if ($stmt_insert->execute([$email, $token_hash, $expires_at])) {
                    // Send email with PHPMailer
                    $reset_link = FRONTEND_URL . "/reset-password?token=" . bin2hex($token);
                    
                    $mail = new PHPMailer(true);
                    try {
                        // Using the same SMTP settings as in contact.php
                        $mail->isSMTP();
                        $mail->Host       = getenv('SMTP_HOST');
                        $mail->SMTPAuth   = true;
                        $mail->Username   = getenv('SMTP_USER');
                        $mail->Password   = getenv('SMTP_PASS');
                        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: PHPMailer::ENCRYPTION_STARTTLS;
                        $mail->Port       = getenv('SMTP_PORT') ?: 587;

                        $mail->setFrom(getenv('SMTP_FROM_EMAIL') ?: 'no-reply@example.com', getenv('SMTP_FROM_NAME') ?: 'Pragati Kurtis');
                        $mail->addAddress($email);

                        $mail->isHTML(true);
                        $mail->Subject = 'Password Reset Request';
                        $mail->Body    = "Hello,<br><br>Please click the following link to reset your password:<br><a href='{$reset_link}'>{$reset_link}</a><br><br>This link will expire in 1 hour.<br><br>If you did not request a password reset, please ignore this email.";
                        
                        $mail->send();

                    } catch (Exception $e) {
                        // Log error but don't expose details
                        error_log("Password reset email could not be sent. Mailer Error: {$mail->ErrorInfo}");
                    }
                }
            }
            
            // Always return a success message to prevent user enumeration
            echo json_encode(["status" => "success", "message" => "If an account with that email exists, a password reset link has been sent."]);
        }
    } else if ($data->action == 'reset_password') {
        if (!empty($data->token) && !empty($data->password)) {
            $token_from_url = hex2bin(Security::sanitize($data->token));
            $token_hash = hash('sha256', $token_from_url);

            $query = "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() LIMIT 0,1";
            $stmt = $db->prepare($query);
            $stmt->execute([$token_hash]);
            $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($reset_request) {
                $email = $reset_request['email'];
                $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
                
                $update_query = "UPDATE users SET password_hash = ? WHERE email = ?";
                $update_stmt = $db->prepare($update_query);
                
                if ($update_stmt->execute([$password_hash, $email])) {
                    // Delete the used token
                    $delete_query = "DELETE FROM password_resets WHERE email = ?";
                    $delete_stmt = $db->prepare($delete_query);
                    $delete_stmt->execute([$email]);

                    echo json_encode(["status" => "success", "message" => "Password has been successfully reset. You can now log in."]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to update password."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid or expired reset token."]);
            }
        }
    }
} else {
    echo json_encode(["message" => "Invalid request"]);
}
?>