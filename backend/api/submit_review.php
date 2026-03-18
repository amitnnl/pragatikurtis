<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Ensure all required data is present
    if (
        !empty($data->product_id) &&
        !empty($data->user_id) &&
        !empty($data->user_name) &&
        !empty($data->rating) &&
        !empty($data->comment)
    ) {
        // Sanitize inputs
        $product_id = Security::sanitize($data->product_id);
        $user_id = Security::sanitize($data->user_id);
        $user_name = Security::sanitize($data->user_name);
        $rating = Security::sanitize($data->rating);
        $comment = Security::sanitize($data->comment);
        $is_approved = 0; // New reviews are pending approval

        try {
            // Insert the new review into the database
            $query = "INSERT INTO reviews (product_id, user_id, user_name, rating, comment, is_approved) 
                      VALUES (:product_id, :user_id, :user_name, :rating, :comment, :is_approved)";
            $stmt = $db->prepare($query);

            $stmt->bindParam(':product_id', $product_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':user_name', $user_name);
            $stmt->bindParam(':rating', $rating);
            $stmt->bindParam(':comment', $comment);
            $stmt->bindParam(':is_approved', $is_approved);

            if ($stmt->execute()) {
                http_response_code(201); // Created
                echo json_encode(["status" => "success", "message" => "Review submitted successfully and is awaiting approval."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to submit review."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "An internal server error occurred.", "details" => $e->getMessage()]);
        }
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(["status" => "error", "message" => "Missing required review data."]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["status" => "error", "message" => "Only POST requests are allowed."]);
}
?>
