<?php
error_reporting(E_ERROR | E_PARSE);
require_once 'database.php';
require_once 'token.php';

header("Content-Type: application/json");

$database = new Database();
$db = $database->getConnection();
$tokenHandler = new TokenHandler();

//=== VALIDACIONES DE TOKEN ===
$token = $_COOKIE['jwt']??null;
logMessage("categorias:".$token);
$respuesta = $tokenHandler-> validateToken($token);
if ($respuesta==false) {
    logMessage("(categories.php)No se pudo validar el token");
    header('location:/index');
    exit;
}
$userId = $respuesta['userId'];
//$userId = 12;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare("SELECT * FROM categories WHERE user_id = ?");
    $stmt->execute([$userId]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    logMessage("categorias".$categories);
    echo json_encode(['success' => true, 'categories' => $categories]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $db->prepare("INSERT INTO categories (name, user_id) VALUES (?, ?)");
    if ($stmt->execute([$data->name, $userId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add category']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $db->prepare("UPDATE categories SET name = ? WHERE id = ? AND user_id = ?");
    if ($stmt->execute([$data->name, $data->id, $userId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update category']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ? AND user_id = ?");
    if ($stmt->execute([$data->id, $userId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete category']);
    }
} 
