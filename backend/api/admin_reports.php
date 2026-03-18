<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $reportType = isset($_GET['report_type']) ? $_GET['report_type'] : 'overall_sales';
    $dateRange = isset($_GET['range']) ? $_GET['range'] : 'alltime';

    // --- Query Conditions ---
    $queryParams = [];
    $revenueConditions = ["status != 'cancelled'"];
    if ($dateRange === 'today') {
        $revenueConditions[] = "DATE(created_at) = CURDATE()";
    } elseif ($dateRange === 'last7days') {
        $revenueConditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } elseif ($dateRange === 'last30days') {
        $revenueConditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }
    $revenueWhereClause = " WHERE " . implode(' AND ', $revenueConditions);

    if ($reportType === 'sales_by_product') {
        $query = "
            SELECT p.id, p.name, SUM(oi.quantity) as total_quantity, SUM(oi.price * oi.quantity) as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            " . str_replace('created_at', 'o.created_at', $revenueWhereClause) . "
            GROUP BY p.id, p.name
            ORDER BY total_revenue DESC
        ";
        $stmt = $db->prepare($query);
        $stmt->execute($queryParams);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        exit;

    } else if ($reportType === 'top_customers') {
        $query = "
            SELECT u.id, u.name, u.email, COUNT(o.id) as total_orders, SUM(o.total_amount) as total_spent
            FROM users u
            JOIN orders o ON u.id = o.user_id
            " . str_replace('created_at', 'o.created_at', $revenueWhereClause) . "
            GROUP BY u.id, u.name, u.email
            ORDER BY total_spent DESC
            LIMIT 20
        ";
        $stmt = $db->prepare($query);
        $stmt->execute($queryParams);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        exit;

    } else { // 'overall_sales'
        // Conditions for total orders (all statuses, but filter by date)
        $orderConditions = [];
        if ($dateRange === 'today') {
            $orderConditions[] = "DATE(created_at) = CURDATE()";
        } elseif ($dateRange === 'last7days') {
            $orderConditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        } elseif ($dateRange === 'last30days') {
            $orderConditions[] = "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        }
        $orderWhereClause = empty($orderConditions) ? "" : " WHERE " . implode(' AND ', $orderConditions);

        // --- Queries ---
        $queryRevenue = "SELECT SUM(total_amount) as totalRevenue FROM orders" . $revenueWhereClause;
        $stmtRevenue = $db->prepare($queryRevenue);
        $stmtRevenue->execute($queryParams);
        $totalRevenue = $stmtRevenue->fetch(PDO::FETCH_ASSOC)['totalRevenue'] ?? 0;

        $queryOrders = "SELECT COUNT(*) as totalOrders FROM orders" . $orderWhereClause;
        $stmtOrders = $db->prepare($queryOrders);
        $stmtOrders->execute($queryParams);
        $totalOrders = $stmtOrders->fetch(PDO::FETCH_ASSOC)['totalOrders'] ?? 0;

        $averageOrderValue = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;

        // --- Sales Trend ---
        $grouping = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        if ($dateRange == 'today') $grouping = "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')";

        $queryTrend = "SELECT " . $grouping . " as date_group, SUM(total_amount) as dailyRevenue FROM orders " . $revenueWhereClause . " GROUP BY date_group ORDER BY date_group ASC";
        $stmtTrend = $db->prepare($queryTrend);
        $stmtTrend->execute($queryParams);
        $rawTrendData = $stmtTrend->fetchAll(PDO::FETCH_ASSOC);

        // Date processing logic... (remains the same)
        $currentDate = new DateTime();
        $startDateTime = new DateTime();
        switch ($dateRange) {
            case 'today': $startDateTime->setTime(0,0,0); $endDateTime = clone $currentDate; $endDateTime->setTime($currentDate->format('H'),0,0); break;
            case 'last7days': $startDateTime->sub(new DateInterval('P6D'))->setTime(0,0,0); $endDateTime = clone $currentDate; $endDateTime->setTime(23,59,59); break;
            case 'last30days': $startDateTime->sub(new DateInterval('P29D'))->setTime(0,0,0); $endDateTime = clone $currentDate; $endDateTime->setTime(23,59,59); break;
            default:
                $queryFirstOrder = "SELECT MIN(created_at) as first_date FROM orders";
                $stmtFirstOrder = $db->prepare($queryFirstOrder);
                $stmtFirstOrder->execute();
                $firstOrderDate = $stmtFirstOrder->fetch(PDO::FETCH_ASSOC)['first_date'];
                if ($firstOrderDate) { $startDateTime = new DateTime($firstOrderDate); $startDateTime->setTime(0,0,0); } else { $startDateTime = clone $currentDate; }
                $endDateTime = clone $currentDate; $endDateTime->setTime(23,59,59); break;
        }
        $intervalStep = ($dateRange === 'today') ? new DateInterval('PT1H') : new DateInterval('P1D');
        $period = new DatePeriod($startDateTime, $intervalStep, $endDateTime);
        $salesDataMap = [];
        foreach($rawTrendData as $row) { $salesDataMap[$row['date_group']] = (float)$row['dailyRevenue']; }
        $salesTrend = [];
        foreach ($period as $dt) {
            $key = ($dateRange === 'today') ? $dt->format('Y-m-d H:00:00') : $dt->format('Y-m-d');
            $displayLabel = ($dateRange === 'today') ? $dt->format('H:00') : $dt->format('M d');
            $salesTrend[] = ['label' => $displayLabel, 'revenue' => $salesDataMap[$key] ?? 0];
        }

        header('Content-Type: application/json');
        echo json_encode([
            "totalRevenue" => $totalRevenue,
            "totalOrders" => $totalOrders,
            "averageOrderValue" => $averageOrderValue,
            "salesTrend" => $salesTrend
        ]);
    }
}
?>
