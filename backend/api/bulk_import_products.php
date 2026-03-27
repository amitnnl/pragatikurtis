<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

// Disable HTML errors to keep JSON clean
ini_set('display_errors', 0);
error_reporting(0);

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    try {
        if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] != UPLOAD_ERR_OK) {
            throw new Exception("Please upload a valid CSV file.");
        }

        $fileTmpPath = $_FILES['csv_file']['tmp_name'];
        $fileName = $_FILES['csv_file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if ($fileExtension != 'csv') {
            throw new Exception("Invalid file type. Only CSV files are allowed.");
        }

        $handle = fopen($fileTmpPath, "r");
        if ($handle === FALSE) {
            throw new Exception("Could not read the uploaded file.");
        }

        // Expected Headers: name, price, dealer_price, hsn_code, category, fabric, occasion, color, stock, sizes, description, meta_title, meta_description, image_url
        $headers = fgetcsv($handle, 1000, ",");
        if (!$headers) {
            throw new Exception("The CSV file is empty.");
        }

        // Clean headers (remove BOM, trim)
        $headers = array_map(function($h) { return trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)); }, $headers);

        $requiredHeaders = ['name', 'price', 'category', 'stock'];
        foreach ($requiredHeaders as $req) {
            if (!in_array($req, $headers)) {
                throw new Exception("Missing required column: " . $req);
            }
        }

        $insertedCount = 0;
        $db->beginTransaction();

        $sql = "INSERT INTO products (name, price, dealer_price, hsn_code, category, fabric, occasion, color, stock, sizes, description, meta_title, meta_description, image_url) 
                VALUES (:name, :price, :dealer_price, :hsn_code, :category, :fabric, :occasion, :color, :stock, :sizes, :description, :meta_title, :meta_description, :image_url)";
        $stmt = $db->prepare($sql);

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // Map data to headers
            $row = array_combine($headers, $data);
            if (!$row || empty(trim($row['name']))) continue;

            $params = [
                ':name' => isset($row['name']) ? trim($row['name']) : '',
                ':price' => isset($row['price']) ? floatval($row['price']) : 0,
                ':dealer_price' => isset($row['dealer_price']) ? floatval($row['dealer_price']) : null,
                ':hsn_code' => isset($row['hsn_code']) ? trim($row['hsn_code']) : '',
                ':category' => isset($row['category']) ? trim($row['category']) : '',
                ':fabric' => isset($row['fabric']) ? trim($row['fabric']) : '',
                ':occasion' => isset($row['occasion']) ? trim($row['occasion']) : '',
                ':color' => isset($row['color']) ? trim($row['color']) : '',
                ':stock' => isset($row['stock']) ? intval($row['stock']) : 0,
                ':sizes' => isset($row['sizes']) ? trim($row['sizes']) : 'S,M,L,XL,XXL',
                ':description' => isset($row['description']) ? trim($row['description']) : '',
                ':meta_title' => isset($row['meta_title']) ? trim($row['meta_title']) : '',
                ':meta_description' => isset($row['meta_description']) ? trim($row['meta_description']) : '',
                ':image_url' => isset($row['image_url']) ? trim($row['image_url']) : ''
            ];

            $stmt->execute($params);
            $insertedCount++;
        }

        fclose($handle);
        $db->commit();

        ob_clean();
        echo json_encode(["status" => "success", "message" => "Successfully imported $insertedCount products."]);

    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        ob_clean();
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
