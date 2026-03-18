<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php'; // For sanitization

$database = new Database();
$db = $database->getConnection();

// Check if a specific product ID is requested
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $id = (int)Security::sanitize($_GET['id']);
    
    $query = "SELECT p.*, p.variant_images, GROUP_CONCAT(pi.image_url SEPARATOR ',') as gallery_images 
              FROM products p 
              LEFT JOIN product_images pi ON p.id = pi.product_id 
              WHERE p.id = :id
              GROUP BY p.id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        extract($row);
        
        $gallery = !empty($gallery_images) ? explode(',', $gallery_images) : [];
        $main_image = !empty($image) ? $image : (!empty($gallery) ? $gallery[0] : null);

        $product_item = array(
            "id" => $id,
            "name" => $name,
            "description" => $description,
            "price" => $price,
            "dealer_price" => isset($dealer_price) ? $dealer_price : null,
            "category" => $category,
            "fabric" => $fabric,
            "occasion" => $occasion,
            "color" => $color,
            "stock" => $stock,
            "sizes" => $sizes,
            "image" => $main_image,
            "gallery" => $gallery,
            "variant_images" => json_decode($variant_images, true),
            "meta_description" => isset($meta_description) ? $meta_description : ''
        );
        // The frontend expects an array, even for a single product
        echo json_encode([$product_item]);
    } else {
        http_response_code(404);
        echo json_encode([]); // Return empty array if not found
    }
    exit(); // Stop script execution after handling single product
}


// --- Existing logic for fetching multiple products ---

// Initialize query parts
$query = "SELECT p.*, p.variant_images, GROUP_CONCAT(pi.image_url SEPARATOR ',') as gallery_images 
          FROM products p 
          LEFT JOIN product_images pi ON p.id = pi.product_id ";

$count_query = "SELECT COUNT(DISTINCT p.id) FROM products p 
                LEFT JOIN product_images pi ON p.id = pi.product_id ";

$where_clauses = [];
$params = [];
$order_by = "p.created_at DESC"; // Default sort
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

// ... (Keep existing filter logic for search, category, color, fabric, occasion, price) ...

// Handle search term
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $search_term = '%' . Security::sanitize($_GET['search']) . '%';
    $where_clauses[] = "(p.name LIKE :search_term OR p.description LIKE :search_term)";
    $params[':search_term'] = $search_term;
}

// Handle category filter
if (isset($_GET['category']) && !empty($_GET['category'])) {
    $category = Security::sanitize($_GET['category']);
    $where_clauses[] = "p.category = :category";
    $params[':category'] = $category;
}

// Handle color filter
if (isset($_GET['color']) && !empty($_GET['color'])) {
    $color = Security::sanitize($_GET['color']);
    $where_clauses[] = "p.color LIKE :color"; 
    $params[':color'] = '%' . $color . '%';
}

// Handle fabric filter
if (isset($_GET['fabric']) && !empty($_GET['fabric'])) {
    $fabric = Security::sanitize($_GET['fabric']);
    $where_clauses[] = "p.fabric = :fabric";
    $params[':fabric'] = $fabric;
}

// Handle occasion filter
if (isset($_GET['occasion']) && !empty($_GET['occasion'])) {
    $occasion = Security::sanitize($_GET['occasion']);
    $where_clauses[] = "p.occasion = :occasion";
    $params[':occasion'] = $occasion;
}

// Handle price range
if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
    $min_price = (float)Security::sanitize($_GET['min_price']);
    $where_clauses[] = "p.price >= :min_price";
    $params[':min_price'] = $min_price;
}
if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
    $max_price = (float)Security::sanitize($_GET['max_price']);
    $where_clauses[] = "p.price <= :max_price";
    $params[':max_price'] = $max_price;
}

// Construct WHERE clause
if (!empty($where_clauses)) {
    $query .= " WHERE " . implode(" AND ", $where_clauses);
    $count_query .= " WHERE " . implode(" AND ", $where_clauses);
}

// Group By
$query .= " GROUP BY p.id";

// Handle sorting
if (isset($_GET['sort_by']) && !empty($_GET['sort_by'])) {
    switch (Security::sanitize($_GET['sort_by'])) {
        case 'price_asc':
            $order_by = "p.price ASC";
            break;
        case 'price_desc':
            $order_by = "p.price DESC";
            break;
        case 'name_asc':
            $order_by = "p.name ASC";
            break;
        case 'name_desc':
            $order_by = "p.name DESC";
            break;
        case 'oldest':
            $order_by = "p.created_at ASC";
            break;
        case 'newest': // Default already
        default:
            $order_by = "p.created_at DESC";
            break;
    }
}
$query .= " ORDER BY " . $order_by;

// Add pagination
$query .= " LIMIT :limit OFFSET :offset";
$params[':limit'] = $limit;
$params[':offset'] = $offset;

// Prepare and execute statement
$stmt = $db->prepare($query);
foreach ($params as $key => &$val) {
    // Determine PDO parameter type
    $type = PDO::PARAM_STR;
    if (strpos($key, 'price') !== false || strpos($key, 'limit') !== false || strpos($key, 'offset') !== false) {
        $type = PDO::PARAM_INT;
    }
    $stmt->bindParam($key, $val, $type);
}
$stmt->execute();

$products_arr = array();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    
    // Process images from GROUP_CONCAT
    $gallery = !empty($gallery_images) ? explode(',', $gallery_images) : [];
    // Ensure the main image is the first one if available, or fallback
    $main_image = !empty($gallery) ? $gallery[0] : null;

    // If p.image_url exists in table (as extracted variable), use it, otherwise use first from gallery
    // Checking if $image_url is set and not null (from extract)
    $final_image = (isset($image_url) && !empty($image_url)) ? $image_url : $main_image;

    $product_item = array(
        "id" => $id,
        "name" => $name,
        "description" => $description,
        "price" => $price,
        "category" => $category,
        "fabric" => $fabric,
        "occasion" => $occasion,
        "color" => $color,
        "stock" => $stock,
        "sizes" => $sizes,
        "image" => $final_image, 
        "gallery" => $gallery,
        "variant_images" => json_decode($variant_images, true)
    );
    array_push($products_arr, $product_item);
}

// Get total count for pagination
$count_stmt = $db->prepare($count_query);
foreach ($params as $key => &$val) {
    if (strpos($key, 'limit') === false && strpos($key, 'offset') === false) {
        $count_stmt->bindParam($key, $val);
    }
}
$count_stmt->execute();
$total_products = $count_stmt->fetchColumn();


echo json_encode(["products" => $products_arr, "total_products" => $total_products]);
?>