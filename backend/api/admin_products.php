<?php
// backend/api/admin_products.php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/app.php'; // Import App Config

// Disable HTML errors to keep JSON clean
ini_set('display_errors', 0);
error_reporting(0);

include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to safely get POST data
function getParam($key, $default = '') {
    return isset($_POST[$key]) ? $_POST[$key] : $default;
}

try {
    if ($method == 'GET') {
        // --- READ PRODUCTS with Filters, Search, and Sorting ---
        $whereClauses = [];
        $params = [];

        // Search
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $searchTerm = '%' . $_GET['search'] . '%';
            $whereClauses[] = "(p.name LIKE :searchTerm OR p.description LIKE :searchTerm)";
            $params[':searchTerm'] = $searchTerm;
        }

        // ID Filter
        if (isset($_GET['id'])) {
            $whereClauses[] = "p.id = :id";
            $params[':id'] = $_GET['id'];
        }

        // Category Filter
        if (isset($_GET['category']) && $_GET['category'] !== 'All') {
            $whereClauses[] = "p.category = :category";
            $params[':category'] = $_GET['category'];
        }

        // Price Range Filter
        if (isset($_GET['min_price']) && isset($_GET['max_price'])) {
            $whereClauses[] = "p.price BETWEEN :minPrice AND :maxPrice";
            $params[':minPrice'] = $_GET['min_price'];
            $params[':maxPrice'] = $_GET['max_price'];
        }

        // Fabric Filter
        if (isset($_GET['fabric']) && $_GET['fabric'] !== 'All') {
            $whereClauses[] = "p.fabric = :fabric";
            $params[':fabric'] = $_GET['fabric'];
        }

        // Color Filter
        if (isset($_GET['color']) && $_GET['color'] !== 'All') {
            $whereClauses[] = "p.color LIKE :color"; // Use LIKE for partial match in comma-separated string
            $params[':color'] = '%' . $_GET['color'] . '%';
        }
        
        $whereSql = '';
        if (!empty($whereClauses)) {
            $whereSql = " WHERE " . implode(' AND ', $whereClauses);
        }

        // Sorting
        $sortBy = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
        $sortOrder = isset($_GET['sort_order']) ? strtoupper($_GET['sort_order']) : 'DESC';

        // Validate sort_by to prevent SQL injection
        $allowedSortBy = ['name', 'price', 'created_at'];
        if (!in_array($sortBy, $allowedSortBy)) {
            $sortBy = 'created_at';
        }
        // Validate sort_order
        if (!in_array($sortOrder, ['ASC', 'DESC'])) {
            $sortOrder = 'DESC';
        }

        $orderBySql = " ORDER BY " . $sortBy . " " . $sortOrder;

        $query = "
            SELECT p.*, r.avg_rating, r.review_count
            FROM products p
            LEFT JOIN (
                SELECT 
                    product_id, 
                    AVG(rating) as avg_rating, 
                    COUNT(id) as review_count 
                FROM reviews 
                WHERE is_approved = 1 
                GROUP BY product_id
            ) r ON p.id = r.product_id
        " . $whereSql . $orderBySql;
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Eager load gallery images to solve N+1 problem
        $product_ids = array_column($products, 'id');
        $gallery_images = [];

        if (!empty($product_ids)) {
            $ids_placeholder = implode(',', array_fill(0, count($product_ids), '?'));
            $query_images = "SELECT product_id, image_url FROM product_images WHERE product_id IN ($ids_placeholder)";
            $stmt_images = $db->prepare($query_images);
            $stmt_images->execute($product_ids);
            
            while ($row = $stmt_images->fetch(PDO::FETCH_ASSOC)) {
                $gallery_images[$row['product_id']][] = $row['image_url'];
            }
        }

        foreach ($products as &$p) {
            $p['gallery'] = isset($gallery_images[$p['id']]) ? $gallery_images[$p['id']] : [];
            $p['image'] = $p['image_url']; // For frontend compatibility
        }
        
        ob_clean();
        echo json_encode($products);

        } else if ($method == 'POST') {

            // --- CREATE / UPDATE PRODUCT ---

    

            // Helper function to validate image files

            function validateImageFile($file) {

                // Check for upload errors

                if ($file['error'] !== UPLOAD_ERR_OK) {

                    throw new Exception("File upload error with code: " . $file['error']);

                }

                // Check file size (5MB limit)

                if ($file['size'] > 5 * 1024 * 1024) {

                    throw new Exception("File is too large. Maximum size is 5MB.");

                }

                // Check MIME type

                $finfo = new finfo(FILEINFO_MIME_TYPE);

                $mime_type = $finfo->file($file['tmp_name']);

                $allowed_types = [

                    'image/jpeg' => 'jpg',

                    'image/png' => 'png',

                    'image/gif' => 'gif',

                    'image/webp' => 'webp'

                ];

                if (!isset($allowed_types[$mime_type])) {

                    throw new Exception("Invalid file type '$mime_type'. Only JPG, PNG, GIF, and WEBP are allowed.");

                }

                return $allowed_types[$mime_type]; // Return the correct extension

            }

    

            $id = getParam('id');

            $name = getParam('name');

            $price = getParam('price', 0);

            $dealer_price = getParam('dealer_price', null);

            $hsn_code = getParam('hsn_code');

            $category = getParam('category');

            $fabric = getParam('fabric');

            $occasion = getParam('occasion');

            $color = getParam('color');

            $stock = getParam('stock', 0);

            $sizes = getParam('sizes');

            $description = getParam('description');

            $meta_title = getParam('meta_title');

            $meta_description = getParam('meta_description');

            $image_url = getParam('image_url');

            

            $old_stock = 0;

            $product_id = $id;

    

            if ($id) {

                // Fetch old stock before update

                $stmt_old = $db->prepare("SELECT stock FROM products WHERE id = ?");

                $stmt_old->execute([$id]);

                $old_stock_row = $stmt_old->fetch(PDO::FETCH_ASSOC);

                if ($old_stock_row) {

                    $old_stock = $old_stock_row['stock'];

                }

            }

    

            // 1. Handle Main Image

            if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {

                $ext = validateImageFile($_FILES['image']); // Validate and get extension

                $target_dir = "../uploads/";

                if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);

                $file_name = time() . "_main_" . uniqid() . "." . $ext;

                if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_dir . $file_name)) {

                    $image_url = UPLOADS_URL . "/" . $file_name;

                } else {

                    throw new Exception("Failed to move uploaded main image.");

                }

            }

    

            if ($id) {

                // UPDATE

                $sql = "UPDATE products SET name=:name, price=:price, dealer_price=:dealer_price, hsn_code=:hsn_code, category=:category, fabric=:fabric, occasion=:occasion, color=:color, stock=:stock, sizes=:sizes, description=:description, meta_title=:meta_title, meta_description=:meta_description, image_url=:image_url WHERE id=:id";

                $stmt = $db->prepare($sql);

                $stmt->execute([':name'=>$name, ':price'=>$price, ':dealer_price'=>$dealer_price, ':hsn_code'=>$hsn_code, ':category'=>$category, ':fabric'=>$fabric, ':occasion'=>$occasion, ':color'=>$color, ':stock'=>$stock, ':sizes'=>$sizes, ':description'=>$description, ':meta_title'=>$meta_title, ':meta_description'=>$meta_description, ':image_url'=>$image_url, ':id'=>$id]);

            } else {

                // CREATE

                $sql = "INSERT INTO products (name, price, dealer_price, hsn_code, category, fabric, occasion, color, stock, sizes, description, meta_title, meta_description, image_url) VALUES (:name, :price, :dealer_price, :hsn_code, :category, :fabric, :occasion, :color, :stock, :sizes, :description, :meta_title, :meta_description, :image_url)";

                $stmt = $db->prepare($sql);

                $stmt->execute([':name'=>$name, ':price'=>$price, ':dealer_price'=>$dealer_price, ':hsn_code'=>$hsn_code, ':category'=>$category, ':fabric'=>$fabric, ':occasion'=>$occasion, ':color'=>$color, ':stock'=>$stock, ':sizes'=>$sizes, ':description'=>$description, ':meta_title'=>$meta_title, ':meta_description'=>$meta_description, ':image_url'=>$image_url]);

                $product_id = $db->lastInsertId();

            }

    

            // Log inventory change

            $quantity_change = $stock - $old_stock;

            if ($quantity_change != 0) {

                $reason = $id ? 'stock_update' : 'initial_stock';

                $log_inventory = "INSERT INTO inventory_history (product_id, quantity_change, reason) VALUES (?, ?, ?)";

                $stmt_log = $db->prepare($log_inventory);

                $stmt_log->execute([$product_id, $quantity_change, $reason]);

            }

    

            // 2. Handle Gallery Images

            if (isset($_FILES['gallery'])) {

                $gallery = $_FILES['gallery'];

                $count = count($gallery['name']);

                $target_dir = "../uploads/";

                

                $sql_gal = "INSERT INTO product_images (product_id, image_url) VALUES (:pid, :url)";

                $stmt_gal = $db->prepare($sql_gal);

    

                for ($i = 0; $i < $count; $i++) {

                    // Re-structure file array for validation function

                    $file_to_check = [

                        'name' => $gallery['name'][$i],

                        'type' => $gallery['type'][$i],

                        'tmp_name' => $gallery['tmp_name'][$i],

                        'error' => $gallery['error'][$i],

                        'size' => $gallery['size'][$i]

                    ];

    

                    if ($file_to_check['error'] == 0) {

                        $ext = validateImageFile($file_to_check); // Validate and get extension

                        $file_name = time() . "_gal_" . uniqid() . "." . $ext;

                        if (move_uploaded_file($file_to_check['tmp_name'], $target_dir . $file_name)) {

                            $url = UPLOADS_URL . "/" . $file_name;

                            $stmt_gal->execute([':pid' => $product_id, ':url' => $url]);

                        } else {

                            error_log("Failed to move uploaded gallery image: " . $file_to_check['name']);

                            // Decide if you want to throw an exception and halt, or just log and continue

                        }

                    }

                }

            }

    

            // --- AUTO POST TO SOCIAL MEDIA ON NEW PRODUCT ---
            if (!$id) { // Only on fresh product creation
                include_once 'social_media_poster.php';
                $product_link = "https://yourwebsite.com/product/" . $product_id;
                
                $post_message = "🆕 New Arrival: {$name}!\n\n" . 
                                "✨ Fabric: {$fabric}\n" . 
                                "🎨 Color: {$color}\n" . 
                                "💸 Price: ₹{$price}\n\n" .
                                "{$description}";

                // Make sure your .env is setup or replace the place holders inside the class.
                SocialMediaPoster::postToFacebook($post_message, $product_link, $image_url);
                SocialMediaPoster::postToInstagram($image_url, $post_message . "\n\nLink in bio: " . $product_link);
            }

            ob_clean();
            echo json_encode(["status" => "success", "message" => "Product saved successfully"]);

    } else if ($method == 'DELETE') {
        // --- DELETE PRODUCT AND ASSOCIATED IMAGES ---
        $id = $_GET['id'];

        // 1. Get main image URL
        $stmt_main_img = $db->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt_main_img->execute([$id]);
        $main_image_url = $stmt_main_img->fetchColumn();

        // 2. Get gallery image URLs
        $stmt_gal_imgs = $db->prepare("SELECT image_url FROM product_images WHERE product_id = ?");
        $stmt_gal_imgs->execute([$id]);
        $gallery_image_urls = $stmt_gal_imgs->fetchAll(PDO::FETCH_COLUMN);

        // Function to delete a file from the server
        function deleteFile($image_url, $uploads_dir, $uploads_url) {
            if ($image_url && strpos($image_url, $uploads_url) === 0) {
                $relative_path = str_replace($uploads_url . '/', '', $image_url);
                $file_path = $uploads_dir . '/' . $relative_path;
                if (file_exists($file_path)) {
                    unlink($file_path);
                    error_log("Deleted file: " . $file_path);
                }
            } else {
                error_log("Invalid image URL or not an uploaded file: " . $image_url);
            }
        }

        // Delete main image
        deleteFile($main_image_url, UPLOADS_DIR, UPLOADS_URL);

        // Delete gallery images
        foreach ($gallery_image_urls as $gal_image_url) {
            deleteFile($gal_image_url, UPLOADS_DIR, UPLOADS_URL);
        }

        // 3. Delete from product_images table
        $stmt_del_gal = $db->prepare("DELETE FROM product_images WHERE product_id = ?");
        $stmt_del_gal->execute([$id]);

        // 4. Delete from products table
        $stmt_del_product = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt_del_product->execute([$id]);
        
        ob_clean();
        echo json_encode(["status" => "success", "message" => "Product and associated images deleted successfully."]);
    }

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
