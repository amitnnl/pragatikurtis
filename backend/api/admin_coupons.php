<?php
include_once '../cors.php';
include_once '../config/database.php';
include_once '../config/security.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to safely get POST data from JSON
function getJsonParam($data, $key, $default = null) {
    return isset($data->$key) ? Security::sanitize($data->$key) : $default;
}

try {
    if ($method == 'GET') {
        $stmt = $db->prepare("SELECT * FROM coupons ORDER BY created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else if ($method == 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        
        $id = getJsonParam($data, 'id');
        $code = getJsonParam($data, 'code');
        $discount_type = getJsonParam($data, 'discount_type');
        $value = getJsonParam($data, 'value');
        $min_order_amount = getJsonParam($data, 'min_order_amount');
        $expires_at = getJsonParam($data, 'expires_at');
        $is_active = getJsonParam($data, 'is_active');

        if ($id) {
            $sql = "UPDATE coupons SET code=:code, discount_type=:type, value=:val, min_order_amount=:min, expires_at=:exp, is_active=:act WHERE id=:id";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':code'=>$code, 
                ':type'=>$discount_type, 
                ':val'=>$value, 
                ':min'=>$min_order_amount, 
                ':exp'=>$expires_at, 
                ':act'=>$is_active, 
                ':id'=>$id
            ]);
        } else {
            $sql = "INSERT INTO coupons (code, discount_type, value, min_order_amount, expires_at, is_active) VALUES (:code, :type, :val, :min, :exp, :act)";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':code'=>$code, 
                ':type'=>$discount_type, 
                ':val'=>$value, 
                ':min'=>$min_order_amount, 
                ':exp'=>$expires_at, 
                ':act'=>$is_active
            ]);
        }
        echo json_encode(["status" => "success"]);
    } else if ($method == 'DELETE') {
        $id = Security::sanitize($_GET['id']);
        $stmt = $db->prepare("DELETE FROM coupons WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
