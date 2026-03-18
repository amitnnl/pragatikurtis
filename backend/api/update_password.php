<?php
// Define the required role(s) for this endpoint (any authenticated user can update their own password)
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php'; // This includes the decoded_user in GLOBALS

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if current user is trying to update their own password
    $user_id_from_token = $GLOBALS['decoded_user']->id;

    if (
        !empty($data->current_password) &&
        !empty($data->new_password) &&
        !empty($data->confirm_new_password) &&
        ($data->new_password === $data->confirm_new_password)
    ) {
        $current_password = Security::sanitize($data->current_password);
        $new_password = Security::sanitize($data->new_password);

        // Fetch user's current password hash
        $query = "SELECT password_hash FROM users WHERE id = ? LIMIT 0,1";
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id_from_token]);
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user_data && password_verify($current_password, $user_data['password_hash'])) {
            // Update password
            $new_password_hash = password_hash($new_password, PASSWORD_BCRYPT);
            $update_query = "UPDATE users SET password_hash = ? WHERE id = ?";
            $update_stmt = $db->prepare($update_query);

            if ($update_stmt->execute([$new_password_hash, $user_id_from_token])) {
                http_response_code(200);
                echo json_encode(["message" => "Password updated successfully.", "status" => "success"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update password.", "status" => "error"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Current password incorrect.", "status" => "error"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid input. Please provide current password, new password, and confirm new password.", "status" => "error"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed.", "status" => "error"]);
}
?>