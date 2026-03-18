<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';
include_once '../config/app.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure banners table exists (Self-healing)
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
    // Check if it's a file upload (multipart/form-data) or JSON (delete/reorder)
    if (isset($_FILES['image'])) {
        $title = $_POST['title'];
        $subtitle = $_POST['subtitle'];
        $link = $_POST['link_url'] ?? '/shop';
        
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $ext = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $file_name = time() . "_banner_" . uniqid() . "." . $ext;
        
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_dir . $file_name)) {
            $image_url = UPLOADS_URL . "/" . $file_name;
            
            $stmt = $db->prepare("INSERT INTO banners (title, subtitle, image_url, link_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $subtitle, $image_url, $link]);
            echo json_encode(["status" => "success", "message" => "Banner uploaded"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Upload failed"]);
        }
    } else {
        $data = json_decode(file_get_contents("php://input"));
        if (isset($data->action) && $data->action == 'delete' && isset($data->id)) {
            $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
            $stmt->execute([$data->id]);
            echo json_encode(["status" => "success"]);
        }
    }
}
?>
