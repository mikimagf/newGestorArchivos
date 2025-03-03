<?php
require_once 'config.php';

try {
    $conn = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
    $conn->exec($sql);
    echo "Database created successfully<br>";

    // Use the created database
    $conn->exec("USE " . DB_NAME);

    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "Table 'users' created successfully<br>";

    // Create categories table
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INT(11) UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'categories' created successfully<br>";

    // Create files table
    $sql = "CREATE TABLE IF NOT EXISTS files (
        id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        category_id INT(11) UNSIGNED,
        user_id INT(11) UNSIGNED,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'files' created successfully<br>";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}

$conn = null;