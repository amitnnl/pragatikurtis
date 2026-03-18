<?php
class Security {
    public static $JWT_SECRET_KEY;
    public static $RAZORPAY_KEY_ID;
    public static $RAZORPAY_KEY_SECRET;

    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
}

// Assign values after class definition
Security::$JWT_SECRET_KEY = $_ENV['JWT_SECRET_KEY'] ?? $_SERVER['JWT_SECRET_KEY'] ?? getenv('JWT_SECRET_KEY') ?? null;
if (empty(Security::$JWT_SECRET_KEY)) { // Check for empty or null
    die(json_encode([
        "status" => "error",
        "message" => "FATAL_ERROR: JWT_SECRET_KEY is not set in the environment. Application cannot start."
    ]));
}
Security::$RAZORPAY_KEY_ID = $_ENV['RAZORPAY_KEY_ID'] ?? $_SERVER['RAZORPAY_KEY_ID'] ?? getenv('RAZORPAY_KEY_ID') ?? null;
Security::$RAZORPAY_KEY_SECRET = $_ENV['RAZORPAY_KEY_SECRET'] ?? $_SERVER['RAZORPAY_KEY_SECRET'] ?? getenv('RAZORPAY_KEY_SECRET') ?? null;
?>
