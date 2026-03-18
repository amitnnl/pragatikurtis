<?php
include_once '../config/auth_check.php'; // Secure this endpoint
include_once '../cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$stats = [];

// Total Revenue
$query = "SELECT SUM(total_amount) as total_revenue FROM orders WHERE status != 'cancelled'";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['revenue'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'] ?? 0;

// Total Orders
$query = "SELECT COUNT(*) as total_orders FROM orders";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['orders'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_orders'];

// Total Products
$query = "SELECT COUNT(*) as total_products FROM products";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['products'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_products'];

// Total Customers
$query = "SELECT COUNT(*) as total_users FROM users WHERE role = 'customer'";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['users'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_users'];

// Pending Dealer Approvals
$query = "SELECT COUNT(*) as pending_dealers FROM users WHERE role = 'dealer' AND is_approved = 0";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['pending_dealers'] = $stmt->fetch(PDO::FETCH_ASSOC)['pending_dealers'];

// Sales Trend (Last 7 Days)
$trend = [];
for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $query = "SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = ? AND status != 'cancelled'";
    $stmt = $db->prepare($query);
    $stmt->execute([$date]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $trend[] = [
        "day" => date('D', strtotime($date)),
        "total" => (float)($result['total'] ?? 0)
    ];
}
$stats['trend'] = $trend;

// Category Breakdown
$query = "SELECT category, COUNT(*) as count FROM products GROUP BY category";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Top 5 Selling Products
$query = "SELECT p.name, SUM(oi.quantity) as total_sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.name ORDER BY total_sold DESC LIMIT 5";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['top_products'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Order Status Breakdown
$query = "SELECT status, COUNT(*) as count FROM orders GROUP BY status";
$stmt = $db->prepare($query);
$stmt->execute();
$stats['order_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($stats);
?>