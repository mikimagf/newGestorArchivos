<?php
require_once 'config.php';

function logMessage($message, $level = 'INFO') {
    $date = date('Y-m-d H:i:s');
    $logMessage = "[$date] [$level] $message" . PHP_EOL;
    $filename = LOG_PATH . 'app_' . date('Y-m-d') . '.log';
    file_put_contents($filename, $logMessage, FILE_APPEND);
}