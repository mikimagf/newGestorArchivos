<?php
require_once 'database.php';
require_once 'token.php';
require_once 'config.php';

header("Content-Type: application/json");

function sendJsonResponse($data) {
    echo json_encode($data);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $tokenHandler = new TokenHandler();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJsonResponse(['success' => false, 'message' => 'Método no permitido']);
    }

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendJsonResponse(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    }

    if (!isset($data->action)) {
        sendJsonResponse(['success' => false, 'message' => 'Acción no especificada']);
    }

    switch ($data->action) {
        case 'login':
            if (!isset($data->username) || !isset($data->password)) {
                sendJsonResponse(['success' => false, 'message' => 'Datos incompletos']);
            }

            $stmt = $db->prepare("SELECT id, PASSWORD FROM users WHERE username = ?");
            $stmt->execute([$data->username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($data->password, $user['PASSWORD'])) {
                $token = $tokenHandler->generateToken($user['id']);
                sendJsonResponse(['success' => true, 'token' => $token]);
            } else {
                sendJsonResponse(['success' => false, 'message' => 'Credenciales inválidas']);
            }
            break;

        case 'register':
            if (!isset($data->nombre) || !isset($data->apellido) || !isset($data->email) || !isset($data->username) || !isset($data->password)) {
                sendJsonResponse(['success' => false, 'message' => 'Datos incompletos']);
            }

            $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$data->username, $data->email]);
            if ($stmt->fetch()) {
                sendJsonResponse(['success' => false, 'message' => 'El usuario o email ya existe']);
            }

            $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO users (nombre, apellido, email, username, PASSWORD) VALUES (?, ?, ?, ?, ?)");
            if ($stmt->execute([$data->nombre, $data->apellido, $data->email, $data->username, $hashedPassword])) {
                sendJsonResponse(['success' => true, 'message' => 'Usuario registrado exitosamente']);
            } else {
                sendJsonResponse(['success' => false, 'message' => 'Error al registrar el usuario']);
            }
            break;

        case 'logout':
            $headers = getallheaders();
            if (!isset($headers['Authorization'])) {
                sendJsonResponse(['success' => false, 'message' => 'Token no proporcionado']);
            }
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            if ($tokenHandler->invalidateToken($token)) {
                sendJsonResponse(['success' => true, 'message' => 'Sesión cerrada exitosamente']);
            } else {
                sendJsonResponse(['success' => false, 'message' => 'Error al cerrar sesión']);
            }
            break;

        default:
            sendJsonResponse(['success' => false, 'message' => 'Acción no reconocida']);
            break;
    }
} catch (Exception $e) {
    sendJsonResponse(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}