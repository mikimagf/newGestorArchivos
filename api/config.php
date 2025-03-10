<?php
//configuracion de la Base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'file_management_system');

//configuracion de JWT
define('JWT_SECRET', 'a2a5f972ad5bff4ea9823cc5f772e95c4f87662712ff70902ee9ef152002a0213364f0de4804054716f709458f949d345f21df7f035a7c8428a4d8c2c8e93a6a');
define('JWT_EXPIRATION', 3600); // 1 hour 
//configuracion de la carpeta de logs
define('LOG_PATH', __DIR__ . '/../logs/');
// Configuración de reCAPTCHA
define('RECAPTCHA_SECRET_KEY', $_ENV['RECAPTCHA_SECRET_KEY'] ?? '');