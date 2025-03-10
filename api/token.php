<?php
require_once 'config.php';
require_once 'logger.php';
class TokenHandler
{


    public function generateToken($userId, $rol)
    {

        $issuedAt = time();
        $expirationTime = $issuedAt + JWT_EXPIRATION;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'userId' => $userId,
            'rol' => $rol
        ];

        return $this->encodeToken($payload);

    }
    public function validateToken($token)
    {
        try {
            logMessage("(validateToken)token cargado: " . json_encode($token));
            // Primero, verificar si el token existe en la base de datos
            $database = new Database();
            $db = $database->getConnection();

            $stmt = $db->prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()");
            $stmt->execute([$token]);
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$session) {//si no encontramos la sesion
                logMessage("(validateToken)No se encontró la sesion en la base de datos");
                return $this->handleInvalidToken();
            }
            $payload = $this->decodeToken($token);

            // Verificar la expiración
            if (isset($payload->exp) && $payload->exp < time()) {
                $this->handleInvalidToken();
                return false;
            }
            logMessage("Token válido: " . json_encode($payload));
            $userId = $payload->userId;
            $rol = $payload->rol;

            logMessage("(validateToken)return: userId>>: " . $userId . ", rol>>: " . $rol);

            return [
                'userId' => $userId,
                'rol' => $rol
            ];

        } catch (Exception $e) {
            logMessage("(validateToken)No se validó el token: " . $e->getMessage());
            $this->handleInvalidToken();
            return false;
        }
    }

    private function handleInvalidToken()
    {
        // Eliminar la cookie del token
        setcookie('jwt', '', time() - 3600, '/', '', true, true);
        return false;
    }
    public function invalidateToken($token, $db)
    {
        try {
            // Verificar el token
            $payload = $this->validateToken($token);
            if ($payload === false) {
                logMessage("Token no válido");
                return false;
            } else {
                // Eliminar la sesión de la base de datos
                $stmt = $db->prepare("DELETE FROM sessions WHERE token = ?");
                return $stmt->execute([$token]);
            }
        } catch (Exception $e) {
            error_log('Error al invalidar el token: ' . $e->getMessage());
            return false;
        }
    }
    private function encodeToken($payload)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    private function decodeToken($token)
    {
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = explode('.', $token);

        $header = json_decode($this->base64UrlDecode($base64UrlHeader));
        $payload = json_decode($this->base64UrlDecode($base64UrlPayload));

        // Verificar la firma
        $signature = $this->base64UrlDecode($base64UrlSignature);
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);

        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Invalid signature');
        }

        return $payload;
    }

    private function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function base64UrlDecode($data)
    {
        $base64 = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($base64);
    }

    private function generateJti()
    {
        return bin2hex(random_bytes(16));
    }

    public function isAdmin($token)
    {

        $payload = $this->validateToken($token);
        if (!$payload) {
            return false;
        }


    }

}