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
    if (isset($_GET['action']) && $_GET['action'] === 'download') {
        $fileId = $_GET['id'];
        $stmt = $db->prepare("SELECT * FROM files WHERE id = ? AND user_id = ?");
        $stmt->execute([$fileId, $userId]);
        $file = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($file) {
            $filePath = '../uploads/' . $file['filename'];
            if (file_exists($filePath)) {
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="' . $file['name'] . '.pdf"');
                readfile($filePath);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'File not found']);
    } else {
        $stmt = $db->prepare("SELECT f.*, c.name as category_name FROM files f LEFT JOIN categories c ON f.category_id = c.id WHERE f.user_id = ?");
        $stmt->execute([$userId]);
        $files = $stmt->        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'files' => $files]);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['name'];
            $categoryId = $_POST['category'];
            $file = $_FILES['file'];
        
            $uploadDir = '../uploads/';
            $fileName = uniqid() . '_' . $file['name'];
            $filePath = $uploadDir . $fileName;
        
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $stmt = $db->prepare("INSERT INTO files (name, filename, category_id, user_id) VALUES (?, ?, ?, ?)");
                if ($stmt->execute([$name, $fileName, $categoryId, $userId])) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to add file to database']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $data = json_decode(file_get_contents("php://input"));
            $stmt = $db->prepare("SELECT filename FROM files WHERE id = ? AND user_id = ?");
            $stmt->execute([$data->id, $userId]);
            $file = $stmt->fetch(PDO::FETCH_ASSOC);
        
            if ($file) {
                $filePath = '../uploads/' . $file['filename'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
        
                $stmt = $db->prepare("DELETE FROM files WHERE id = ? AND user_id = ?");
                if ($stmt->execute([$data->id, $userId])) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete file from database']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'File not found']);
            }
        } 
