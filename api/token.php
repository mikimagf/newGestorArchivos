<?php
require_once 'config.php';

class TokenHandler {
    public function generateToken($userId) {
        $issuedAt = time();
        $expirationTime = $issuedAt + JWT_EXPIRATION;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'userId' => $userId,
            'jti' => $this->generateJti() // Añadimos un identificador único para el token
        ];
 
        return $this->encodeToken($payload);
    }

    public function validateToken($token) {
        try {
            $decoded = $this->decodeToken($token);
            
            // Verificar si el token ha expirado
            if ($decoded->exp < time()) {
                return false;
            }
            
            // Aquí podrías añadir una verificación adicional contra la base de datos
            // para asegurarte de que el token no ha sido revocado
            
            return $decoded->userId;
        } catch (Exception $e) {
            return false;
        }
    }

    private function encodeToken($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    private function decodeToken($token) {
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

    private function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function base64UrlDecode($data) {
        $base64 = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($base64);
    }

    private function generateJti() {
        return bin2hex(random_bytes(16));
    }

    public function invalidateToken($token) {
        // Aquí deberías implementar la lógica para invalidar el token en la base de datos
        // Por ejemplo, añadirlo a una lista negra o marcarlo como revocado
        // Retorna true si se invalidó correctamente, false en caso contrario
        return true;
    }
}