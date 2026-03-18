<?php
if (!class_exists('PDO')) {
    http_response_code(500);
    header('Content-Type: application/json');
    die(json_encode([
        "status" => "error",
        "message" => "PDO class not found. Please ensure the pdo_mysql PHP extension is enabled."
    ]));
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? null;
        $this->db_name = $_ENV['DB_NAME'] ?? null;
        $this->username = $_ENV['DB_USER'] ?? null;
        $this->password = $_ENV['DB_PASS'] ?? null;



        if (empty($this->host) || empty($this->db_name) || empty($this->username)) {
            http_response_code(500);
            header('Content-Type: application/json');
            die(json_encode([
                "status" => "error",
                "message" => "FATAL_ERROR: Database credentials (DB_HOST, DB_NAME, DB_USER) are not fully configured in the environment."
            ]));
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            http_response_code(500);
            header('Content-Type: application/json');
            die(json_encode([
                "status" => "error",
                "message" => "Database connection error: " . $exception->getMessage()
            ]));
        }
        return $this->conn;
    }
}
?>
