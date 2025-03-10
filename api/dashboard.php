<?php
require_once 'database.php';
require_once 'token.php';

header("Content-Type: application/json");

$database = new Database();
$db = $database->getConnection();
$tokenHandler = new TokenHandler();

//=== VALIDACIONES DE TOKEN ===
$token = $_COOKIE['jwt'];
$respuesta = $tokenHandler->validateToken($token);
if ($respuesta==false) {
    logMessage("(dashboard.php)No se pudo validar el token");
    header('location:/index');
    exit;
}
$userId = $respuesta['userId'];
// $userId = 12;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get total files
    $stmt = $db->prepare("SELECT COUNT(*) as total_files FROM files WHERE user_id = ?");
    $stmt->execute([$userId]);
    $totalFiles = $stmt->fetch(PDO::FETCH_ASSOC)['total_files'];
    logMessage("archivos encontrados:" . $totalFiles);
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

    $formattedActivity = array_map(function ($activity) {
        return "Archivo '{$activity['name']}' subido en la categoría '{$activity['category']}' el {$activity['upload_date']}";
    }, $recentActivity);
    echo json_encode([
        'success' => true,
        'totalFiles' => $totalFiles,
        'totalCategories' => $totalCategories,
        'recentActivity' => $formattedActivity
    ]);
}