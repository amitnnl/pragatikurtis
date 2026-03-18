<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch reviews, optionally filtered by product_id or for moderation
        $query = "SELECT r.*, p.name as product_name, u.name as user_name
                  FROM reviews r
                  JOIN products p ON r.product_id = p.id
                  JOIN users u ON r.user_id = u.id ";
        $params = [];

        if (isset($_GET['product_id']) && !empty($_GET['product_id'])) {
            $query .= " WHERE r.product_id = :product_id AND r.is_approved = 1"; // For public display, only approved reviews
            $params[':product_id'] = Security::sanitize($_GET['product_id']);
        } else {
            // Default: Fetch all reviews for moderation (no approval filter)
            // This is the original admin behavior
        }
        
        $query .= " ORDER BY r.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($reviews);
        break;

    case 'POST':
        // Approve a review
        $data = json_decode(file_get_contents("php://input"));
        if (isset($data->id) && isset($data->is_approved)) {
            $id = Security::sanitize($data->id);
            $is_approved = (int)$data->is_approved; // Cast to integer (0 or 1)

            $query = "UPDATE reviews SET is_approved = ? WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$is_approved, $id])) {
                echo json_encode(["status" => "success", "message" => "Review status updated."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update review status."]);
            }
        }
        break;

    case 'DELETE':
        // Delete a review
        if (isset($_GET['id'])) {
            $id = Security::sanitize($_GET['id']);
            $query = "DELETE FROM reviews WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Review deleted."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete review."]);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed."]);
        break;
}
?>