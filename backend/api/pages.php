<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"));

switch ($method) {
    case 'GET':
        if (isset($_GET['slug'])) {
            $slug = Security::sanitize($_GET['slug']);
            $query = "SELECT * FROM pages WHERE page_slug = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$slug]);
            $page = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($page) {
                echo json_encode($page);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Page not found."]);
            }
        }
        break;

    case 'POST': // Using POST for simplicity to handle updates
        if (!empty($data->page_slug) && isset($data->content)) {
            $slug = Security::sanitize($data->page_slug);
            $title = Security::sanitize($data->page_title);
            $content = $data->content; // Avoid sanitizing HTML content to allow rich text

            // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both create and update
            $query = "INSERT INTO pages (page_slug, page_title, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE page_title = VALUES(page_title), content = VALUES(content)";
            $stmt = $db->prepare($query);

            if ($stmt->execute([$slug, $title, $content])) {
                echo json_encode(["status" => "success", "message" => "Page content updated successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to update page content."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Incomplete data."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed."]);
        break;
}
?>