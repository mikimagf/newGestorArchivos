<?php
require_once 'database.php';
require_once 'token.php';
require_once 'config.php';
require_once 'logger.php';


header("Content-Type: application/json");
// Añade esto al principio del archivo, después de los require_once
//logMessage("Cookies recibidas..: " . print_r($_COOKIE, true));

function sendJsonResponse($data)
{
    //header('Content-Type: application/json');
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
            $username = $data->username;
            $password = $data->password;

            // Verificar las credenciales del usuario
            $stmt = $db->prepare("SELECT id, password, rol FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $token = $tokenHandler->generateToken($user['id'], $user['rol']);

                // Guardar la sesión en la base de datos
                $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
                $stmt = $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
                $stmt->execute([$user['id'], $token, $expiresAt]);

                // Configurar la cookie
                setcookie('jwt', $token, [
                    'expires' => strtotime('+1 hour'),
                    'path' => '/',
                    'domain' => '',
                    'secure' => false,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]);
                // Verificar las cabeceras de respuesta
                $headers = headers_list();
                foreach ($headers as $header) {
                    if (strpos($header, 'Set-Cookie: jwt=') === 0) {
                        // logMessage("Cabecera Set-Cookie encontrada: " . $header);
                    }
                }
                // logMessage("Cookie JWT configurada: " . $token);

                //sendJsonResponse(['success' => true, 'message' => 'Login exitoso', 'token' => $token]);
                sendJsonResponse(['success' => true, 'message' => 'Login exitoso']);

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
            
            $token = $_COOKIE['jwt'];
            if ($tokenHandler->invalidateToken($token, $db)) {
                
                setcookie('jwt', '', time() - 3600, '/', '', true, true);
                sendJsonResponse(['success' => true, 'message' => 'Sesiones del usuario cerradas exitosamente']);

            } else {
                sendJsonResponse(['success' => false, 'message' => 'Error al cerrar sesión']);
            }
            break;
        case 'admin_logout_user':
            // Verificar si el usuario actual es un administrador
            $adminToken = $_COOKIE['jwt'] ?? null;
            if (!$adminToken || !$tokenHandler->isAdmin($adminToken)) {
                sendJsonResponse(['success' => false, 'message' => 'No autorizado']);
            }

            if (!isset($data->user_id)) {
                sendJsonResponse(['success' => false, 'message' => 'ID de usuario no proporcionado']);
            }

            // Eliminar todas las sesiones del usuario especificado
            $stmt = $db->prepare("DELETE FROM sessions WHERE user_id = ?");
            if ($stmt->execute([$data->user_id])) {
                sendJsonResponse(['success' => true, 'message' => 'Sesiones del usuario cerradas exitosamente']);
            } else {
                sendJsonResponse(['success' => false, 'message' => 'Error al cerrar las sesiones del usuario']);
            }
            break;
        case 'check_auth':
            if (!isset($_COOKIE['jwt'])) {
                sendJsonResponse(['success' => false, 'authenticated' => false, 'message' => 'Cookie de sesión no encontrada']);
                return;
            }
            $token = $_COOKIE['jwt'];
            // logMessage("Token recibido..: " . $token);
            $respuesta = $tokenHandler->validateToken($token);
            $userId = $respuesta['userId'];
            // logMessage("id usuario>>" . $respuesta['userId']);
            // logMessage("token>>" . $respuesta['rol']);
            if ($userId) {
                $stmt = $db->prepare("SELECT * FROM sessions WHERE user_id = ? AND token = ? AND expires_at > NOW()");
                $stmt->execute([$userId, $token]);
                $session = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($session) {
                    //autenticacion con exito
                    sendJsonResponse(['success' => true, 'authenticated' => true, 'message' => 'Usuario autenticado']);
                } else {
                    setcookie('jwt', '', time() - 3600, '/', '', true, true);
                    sendJsonResponse(['success' => false, 'authenticated' => false, 'message' => 'Sesion expirada o invalida']);
                }
            } else {
                setcookie('jwt', '', time() - 3600, '/', '', true, true);
                sendJsonResponse(['success' => false, 'authenticated' => false, 'message' => 'Token invalido o expirado']);
            }
            break;
        default:
            sendJsonResponse(['success' => false, 'message' => 'Accion no reconocida']);
            break;
    }
} catch (Exception $e) {
    // logMessage("Error catch: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}