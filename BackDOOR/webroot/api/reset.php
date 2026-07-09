<?php
header('Content-Type: application/json');

$FILES_DIR = __DIR__ . '/../files';

if (is_dir($FILES_DIR)) {
    foreach (scandir($FILES_DIR) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        @unlink($FILES_DIR . '/' . $entry);
    }
}

echo json_encode(['success' => true, 'message' => 'Lab reset.']);
