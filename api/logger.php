<?php
require_once 'config.php';

function logMessage($message, $level = 'INFO') {
    $date = date('Y-m-d H:i:s');
    
    if (is_array($message)) {
        $logMessage = "[$date] [$level] " . print_r($message, true) . PHP_EOL;
    } elseif (is_bool($message)) {
        $logMessage = "[$date] [$level] " . ($message ? 'true' : 'false') . PHP_EOL;
    } else {
        $logMessage = "[$date] [$level] $message" . PHP_EOL;
    }
    
    $filename = LOG_PATH . 'app_' . date('Y-m-d') . '.log';
    file_put_contents($filename, $logMessage, FILE_APPEND);
}