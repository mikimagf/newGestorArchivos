<?php
require_once 'database.php';
require_once 'token.php';

header("Content-Type: application/json");

$database = new Database();
$db = $database->getConnection();
$tokenHandler = new TokenHandler();

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization']);

$userId = $tokenHandler->validateToken($token);
if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get total files
    $stmt = $db->prepare("SELECT COUNT(*) as total_files FROM files WHERE user_id = ?");
    $stmt->execute([$userId]);
    $totalFiles = $stmt->fetch(PDO::FETCH_ASSOC)['total_files'];

    // Get total categories
    $stmt = $db->prepare("SELECT COUNT(*) as total_categories FROM categories WHERE user_id = ?");
    $stmt->execute([$userId]);
    $totalCategories = $stmt->fetch(PDO::FETCH_ASSOC)['total_categories'];

    // Get recent activity
    $stmt = $db->prepare("SELECT f.name, c.name as category, f.upload_date 
                          FROM files f 
                          LEFT JOIN categories c ON f.category_id = c.id 
                          WHERE f.user_id = ? 
                          ORDER BY f.upload_date DESC 
                          LIMIT 5");
    $stmt->execute([$userId]);
    $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedActivity = array_map(function($activity) {
        return "Archivo '{$activity['name']}' subido en la categoría '{$activity['category']}' el {$activity['upload_date']}";
    }, $recentActivity);

    echo json_encode([
        'success' => true,
        'totalFiles' => $totalFiles,
        'totalCategories' => $totalCategories,
        'recentActivity' => $formattedActivity
    ]);
}