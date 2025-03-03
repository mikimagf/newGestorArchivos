<?php
$request = $_SERVER['REQUEST_URI'];
$base_path = '/'; // Ajusta esto si tu sitio no está en la raíz del servidor

// Función para manejar páginas no encontradas
function notFound() {
    http_response_code(404);
    echo "<h1>404 - Página no encontrada</h1>";
    echo "<p>Lo sentimos, la página que estás buscando no existe.</p>";
    exit();
}

// Función para redirigir
function redirect($url) {
    header("Location: $url");
    exit();
}

// Eliminar la query string de la solicitud
$request = strtok($request, '?');

// Eliminar el base_path del inicio de la solicitud
$request = substr($request, strlen($base_path));

// Eliminar la extensión .html si está presente
$request = preg_replace('/\.html$/', '', $request);

switch ($request) {
    case '':
        require __DIR__ . '/index.html';
        break;
    case 'index':
        redirect($base_path);
        break;
    case 'dashboard':
        require __DIR__ . '/dashboard.html';
        break;
    case 'register':
        require __DIR__ . '/register.html';
        break;
    default:
        notFound();
        break;
}