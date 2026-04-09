<?php
include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure categories table exists (in case it hasn't been accessed from admin yet)
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
    $query = "SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // If empty, insert the default hardcoded ones to start with so the page isn't blank
    if (empty($categories)) {
        $defaults = [
            ['name' => 'Afghani Suits', 'image_url' => '/banners/Afghani-Suits.jpg', 'slug' => 'Afghani Suits'],
            ['name' => 'Straight Suits', 'image_url' => '/banners/Straight-Suit.jpeg', 'slug' => 'Straight Suits'],
            ['name' => 'Anarkali Suits', 'image_url' => '/banners/Anarkali-Suit.jpeg', 'slug' => 'Anarkali Suits'],
            ['name' => 'Gown / Dresses', 'image_url' => '/banners/Gown-Dresses.jpeg', 'slug' => 'Gown/Dresses'],
            ['name' => 'Sharara Suits', 'image_url' => '/banners/Sharara-Suit.jpg', 'slug' => 'Sharara Suits']
        ];
        
        $insertQuery = "INSERT INTO categories (name, image_url, slug) VALUES (?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        
        foreach ($defaults as $cat) {
            $insertStmt->execute([$cat['name'], $cat['image_url'], $cat['slug']]);
        }
        
        // Refetch
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode($categories);
}
?>
