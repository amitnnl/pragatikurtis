<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';
include_once '../config/app.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure banners table exists
$db->exec("CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255),
  `image_url` VARCHAR(255) NOT NULL,
  `link_url` VARCHAR(255) DEFAULT '/shop',
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($method == 'GET') {
    $query = "SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} else if ($method == 'POST') {

    // Handling JSON requests (delete)
    $input_content = file_get_contents("php://input");
    $data = json_decode($input_content);
    
    if (isset($data->action) && $data->action == 'delete' && isset($data->id)) {
        $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->execute([$data->id]);
        echo json_encode(["status" => "success"]);
        exit;
    }

    // Handling Form-Data requests (add / update)
    $action = $_POST['action'] ?? 'create';
    $title = $_POST['title'] ?? '';
    $subtitle = $_POST['subtitle'] ?? '';
    $link = $_POST['link_url'] ?? '/shop';
    $id = $_POST['id'] ?? null;

    $image_url_to_save = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $ext = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_banner_" . uniqid() . "." . $ext;
        
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_dir . $file_name)) {
            $image_url_to_save = UPLOADS_URL . "/" . $file_name;
        } else {
            echo json_encode(["status" => "error", "message" => "Image Upload failed"]);
            exit;
        }
    }

    if ($action == 'update' && $id) {
        if ($image_url_to_save) {
            $stmt = $db->prepare("UPDATE banners SET title=?, subtitle=?, link_url=?, image_url=? WHERE id=?");
            $stmt->execute([$title, $subtitle, $link, $image_url_to_save, $id]);
        } else {
            $stmt = $db->prepare("UPDATE banners SET title=?, subtitle=?, link_url=? WHERE id=?");
            $stmt->execute([$title, $subtitle, $link, $id]);
        }
        echo json_encode(["status" => "success", "message" => "Banner updated"]);
    } else {
        if (!$image_url_to_save) {
            echo json_encode(["status" => "error", "message" => "Image is required for new banners"]);
            exit;
        }
        $stmt = $db->prepare("INSERT INTO banners (title, subtitle, image_url, link_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $subtitle, $image_url_to_save, $link]);
        echo json_encode(["status" => "success", "message" => "Banner uploaded"]);
    }
}
?>
