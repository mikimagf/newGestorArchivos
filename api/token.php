<?php
require_once 'config.php';

class TokenHandler {
    public function generateToken($userId) {
        $issuedAt = time();
        $expirationTime = $issuedAt + JWT_EXPIRATION;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'userId' => $userId
        ];

        return $this->encodeToken($payload);
    }

    public function validateToken($token) {
        try {
            $decoded = $this->decodeToken($token);
            return $decoded->userId;
        } catch (Exception $e) {
            return false;
        }
    }

    private function encodeToken($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    private function decodeToken($token) {
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = explode('.', $token);
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)));
        
        if ($payload->exp < time()) {
            throw new Exception('Token has expired');
        }
        
        return $payload;
    }
} 
