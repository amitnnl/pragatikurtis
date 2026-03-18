<?php
// Include CORS headers
require_once '../cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Handle GET requests (fetch reviews for a product)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['product_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Product ID not provided."]);
        exit();
    }
    $product_id = intval($_GET['product_id']);

    $query = "SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = :product_id AND r.is_approved = 1 ORDER BY r.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':product_id', $product_id);
    $stmt->execute();

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($reviews);
}

// Handle POST requests (create a new review)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Authenticate user
    $required_role = ['customer', 'admin']; // Customers and admins can leave reviews
    require_once '../config/auth_check.php';
    
    // Get the user ID from the decoded JWT token
    $user_id = $GLOBALS['decoded_user']->id;

    $data = json_decode(file_get_contents("php://input"));

    if (
        !isset($data->product_id) ||
        !isset($data->rating) ||
        !isset($data->comment)
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required review data."]);
        exit();
    }

    $query = "INSERT INTO reviews (product_id, user_id, rating, comment, is_approved) VALUES (:product_id, :user_id, :rating, :comment, :is_approved)";
    $stmt = $db->prepare($query);

    // Sanitize and bind
    $product_id = htmlspecialchars(strip_tags($data->product_id));
    $rating = htmlspecialchars(strip_tags($data->rating));
    $comment = htmlspecialchars(strip_tags($data->comment));
    $is_approved = 0; // New reviews typically require approval

    $stmt->bindParam(':product_id', $product_id);
    $stmt->bindParam(':user_id', $user_id); // From auth_check.php
    $stmt->bindParam(':rating', $rating);
    $stmt->bindParam(':comment', $comment);
    $stmt->bindParam(':is_approved', $is_approved);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Review created successfully, awaiting approval."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to create review."]);
    }
}
?>