<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

function handleError($errno, $errstr, $errfile, $errline) {
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
}

set_error_handler('handleError');
require_once 'database.php';
require_once 'token.php';

header("Content-Type: application/json");

$database = new Database();
$db = $database->getConnection();
$tokenHandler = new TokenHandler();

//=== VALIDACIONES DE TOKEN ===
$token = $_COOKIE['jwt'];
$respuesta = $tokenHandler->validateToken($token);
if ($respuesta===false) {
    logMessage("(files.php)No se pudo validar el token");
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}
$userId = $respuesta['userId'];
// $userId = $respuesta['userId'];


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
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'files' => $files]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'upload_chunk') {
        $chunkNumber = $_POST['chunkNumber'];
        $totalChunks = $_POST['totalChunks'];
        $fileName = $_POST['fileName'];
        $originalName = $_POST['originalName'];
        $categoryId = $_POST['categoryId'];

        $chunk = $_FILES['file']['tmp_name'];
        $uploadDir = '../uploads/temp/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $chunkPath = $uploadDir . $fileName . '.part' . $chunkNumber;
        
        if (move_uploaded_file($chunk, $chunkPath)) {
            if ($chunkNumber == $totalChunks - 1) {
                // Último trozo, unir todos los trozos
                $finalPath = '../uploads/' . $fileName;
                $out = fopen($finalPath, 'wb');

                for ($i = 0; $i < $totalChunks; $i++) {
                    $in = fopen($uploadDir . $fileName . '.part' . $i, 'rb');
                    stream_copy_to_stream($in, $out);
                    fclose($in);
                    unlink($uploadDir . $fileName . '.part' . $i);
                }

                fclose($out);

                // Insertar en la base de datos
                $stmt = $db->prepare("INSERT INTO files (name, filename, category_id, user_id) VALUES (?, ?, ?, ?)");
                if ($stmt->execute([$originalName, $fileName, $categoryId, $userId])) {
                    echo json_encode(['success' => true, 'message' => 'File uploaded successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to add file to database']);
                }
            } else {
                echo json_encode(['success' => true, 'message' => 'Chunk uploaded successfully']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to upload chunk']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
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
