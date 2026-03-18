<?php
// Define the required role(s) for this endpoint
$required_role = ['customer', 'admin', 'dealer'];
include_once '../config/auth_check.php';

include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

// Ensure table exists (Self-healing)
$create_table_query = "
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255),
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `is_default` BOOLEAN DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";
$db->exec($create_table_query);

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"));

switch ($method) {
    case 'GET':
        if (isset($_GET['user_id'])) {
            $user_id = Security::sanitize($_GET['user_id']);
            $query = "SELECT * FROM addresses WHERE user_id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$user_id]);
            $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($addresses);
        }
        break;

    case 'POST':
        if (!empty($data->user_id) && !empty($data->address_line1) && !empty($data->city)) {
            $user_id = Security::sanitize($data->user_id);
            $address_line1 = Security::sanitize($data->address_line1);
            $address_line2 = Security::sanitize($data->address_line2 ?? '');
            $city = Security::sanitize($data->city);
            $state = Security::sanitize($data->state);
            $postal_code = Security::sanitize($data->postal_code);
            $country = Security::sanitize($data->country ?? 'India');

            $query = "INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$user_id, $address_line1, $address_line2, $city, $state, $postal_code, $country])) {
                echo json_encode(["status" => "success", "message" => "Address added successfully."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to add address."]);
            }
        }
        break;

    case 'PUT':
        if (!empty($data->id) && !empty($data->address_line1)) {
            $id = Security::sanitize($data->id);
            $address_line1 = Security::sanitize($data->address_line1);
            $address_line2 = Security::sanitize($data->address_line2 ?? '');
            $city = Security::sanitize($data->city);
            $state = Security::sanitize($data->state);
            $postal_code = Security::sanitize($data->postal_code);
            $country = Security::sanitize($data->country ?? 'India');
            
            $query = "UPDATE addresses SET address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$address_line1, $address_line2, $city, $state, $postal_code, $country, $id])) {
                echo json_encode(["status" => "success", "message" => "Address updated successfully."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update address."]);
            }
        } else if (isset($data->id) && isset($data->is_default)) {
            // Handle setting default address
            $user_id = Security::sanitize($data->user_id);
            $address_id = Security::sanitize($data->id);

            $db->beginTransaction();
            // First, set all other addresses for this user to not be default
            $query_reset = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
            $stmt_reset = $db->prepare($query_reset);
            $stmt_reset->execute([$user_id]);

            // Then, set the specified address as default
            $query_set = "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?";
            $stmt_set = $db->prepare($query_set);
            if ($stmt_set->execute([$address_id, $user_id])) {
                $db->commit();
                echo json_encode(["status" => "success", "message" => "Default address updated."]);
            } else {
                $db->rollBack();
                echo json_encode(["status" => "error", "message" => "Failed to set default address."]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = Security::sanitize($_GET['id']);
            $query = "DELETE FROM addresses WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Address deleted successfully."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete address."]);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed."]);
        break;
}
?>
