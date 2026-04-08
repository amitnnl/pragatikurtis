<?php
include_once '../cors.php';
require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Create table if not exists (tracks unique IPs)
$createTableSql = "CREATE TABLE IF NOT EXISTS site_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$db->exec($createTableSql);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    
    // Insert IP if not exists (using IGNORE for unique constraint)
    $stmt = $db->prepare("INSERT IGNORE INTO site_visitors (ip_address) VALUES (:ip)");
    $stmt->bindParam(':ip', $ip);
    $stmt->execute();
    
    // Get total unique visitors based on IPs
    $countStmt = $db->query("SELECT COUNT(*) as total FROM site_visitors");
    $row = $countStmt->fetch(PDO::FETCH_ASSOC);
    $total_visitors = $row['total'];
    
    // We can also let it act purely as an incrementer without unique IP tracking,
    // but tracking unique IPs gives an accurate number of actual visitors.
    echo json_encode(["status" => "success", "count" => $total_visitors]);
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>
