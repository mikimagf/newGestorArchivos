<?php
require_once 'database.php';
require_once 'token.php';

header("Content-Type: application/json");

$database = new Database();
$db = $database->getConnection();
$tokenHandler = new TokenHandler();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($data->action === 'login') {
        $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
        $stmt->execute([$data->username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password'])) {
            $token = $tokenHandler->generateToken($user['id']);
            echo json_encode(['success' => true, 'token' => $token]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } elseif ($data->action === 'register') {
        $stmt = $db->prepare("INSERT INTO users (nombre, apellido, email, username, password) VALUES (?, ?, ?, ?, ?)");
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        if ($stmt->execute([$data->nombre, $data->apellido, $data->email, $data->usuario, $hashedPassword])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed']);
        }
    }
} else {
    header("HTTP/1.0 405 Method Not Allowed");

}
