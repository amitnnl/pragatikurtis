<?php
try {
    $db = new PDO("mysql:host=localhost;dbname=pragati_kurties", "root", "");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Add loyalty_points to users table if not exists
    $check_lp = $db->query("SHOW COLUMNS FROM users LIKE 'loyalty_points'");
    if ($check_lp->rowCount() == 0) {
        $db->exec("ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0 AFTER is_approved");
        echo "Successfully added 'loyalty_points' column to users table.\n";
    } else {
        echo "'loyalty_points' column already exists in users table.\n";
    }

    // 2. Create abandoned_carts table
    $create_carts = "
    CREATE TABLE IF NOT EXISTS abandoned_carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        cart_data TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        notified TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($create_carts);
    echo "Successfully created or verified 'abandoned_carts' table.\n";

} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
