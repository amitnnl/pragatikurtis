<?php
include_once '../config/auth_check.php';
include_once '../cors.php';
include_once '../config/database.php';

// It is highly recommended to add session-based admin authentication here.
// For now, we are proceeding without it to match the existing pattern.

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    try {
        $query = "SELECT id, name, email, phone, message, created_at FROM contact_inquiries ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode($inquiries);
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'An internal server error occurred.']);
    }
} else if ($method == 'DELETE') {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        try {
            $query = "DELETE FROM contact_inquiries WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['status' => 'success', 'message' => 'Inquiry deleted successfully.']);
                } else {
                    http_response_code(404);
                    echo json_encode(['status' => 'error', 'message' => 'Inquiry not found.']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to delete inquiry.']);
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'An internal server error occurred.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Inquiry ID is required.']);
    }
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
