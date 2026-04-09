<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';
include_once '../config/app.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure categories table exists
$db->exec("CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($method == 'GET') {
    $query = "SELECT * FROM categories ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} else if ($method == 'POST') {

    $input_content = file_get_contents("php://input");
    $data = json_decode($input_content);
    
    if (isset($data->action) && $data->action == 'delete' && isset($data->id)) {
        $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$data->id]);
        echo json_encode(["status" => "success"]);
        exit;
    }
    
    if (isset($data->action) && $data->action == 'toggle' && isset($data->id)) {
        $stmt = $db->prepare("UPDATE categories SET is_active = ? WHERE id = ?");
        $stmt->execute([$data->is_active, $data->id]);
        echo json_encode(["status" => "success"]);
        exit;
    }

    $action = $_POST['action'] ?? 'create';
    $name = $_POST['name'] ?? '';
    // Generate a simple slug if not provided, or use the exact name as slug (as used currently)
    $slug = $_POST['slug'] ?? $name; 
    $id = $_POST['id'] ?? null;
    $display_order = $_POST['display_order'] ?? 0;

    $image_url_to_save = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $ext = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_category_" . uniqid() . "." . $ext;
        
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_dir . $file_name)) {
            $image_url_to_save = UPLOADS_URL . "/" . $file_name;
        } else {
            echo json_encode(["status" => "error", "message" => "Image Upload failed"]);
            exit;
        }
    }

    if ($action == 'update' && $id) {
        if ($image_url_to_save) {
            $stmt = $db->prepare("UPDATE categories SET name=?, slug=?, image_url=?, display_order=? WHERE id=?");
            $stmt->execute([$name, $slug, $image_url_to_save, $display_order, $id]);
        } else {
            $stmt = $db->prepare("UPDATE categories SET name=?, slug=?, display_order=? WHERE id=?");
            $stmt->execute([$name, $slug, $display_order, $id]);
        }
        echo json_encode(["status" => "success", "message" => "Category updated"]);
    } else {
        if (!$image_url_to_save) {
            echo json_encode(["status" => "error", "message" => "Image is required for new categories"]);
            exit;
        }
        $stmt = $db->prepare("INSERT INTO categories (name, slug, image_url, display_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $slug, $image_url_to_save, $display_order]);
        echo json_encode(["status" => "success", "message" => "Category added"]);
    }
}
?>
