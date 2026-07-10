<?php
header('Content-Type: application/json');

$FILES_DIR = __DIR__ . '/../files';
$TTL       = 40 * 60; // 40 minutes in seconds

// ── 1. Flush expired session folders ─────────────────────────────────
// Runs on every new upload so no cron needed.
if (is_dir($FILES_DIR)) {
    foreach (scandir($FILES_DIR) as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $sessionPath = $FILES_DIR . '/' . $entry;

        // Only touch session subdirectories, never secret/
        if (!is_dir($sessionPath)) continue;
        if ($entry === 'secret')   continue;

        $age = time() - filemtime($sessionPath);
        if ($age >= $TTL) {
            // Delete all files inside then remove the dir
            foreach (scandir($sessionPath) as $f) {
                if ($f === '.' || $f === '..') continue;
                @unlink($sessionPath . '/' . $f);
            }
            @rmdir($sessionPath);
        }
    }
}

// ── 2. Validate incoming request ─────────────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit;
}

$sessionId = isset($_POST['sessionId']) ? preg_replace('/[^a-f0-9]/', '', $_POST['sessionId']) : '';
if (strlen($sessionId) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid session.']);
    exit;
}

// ── 3. Create session folder if needed ───────────────────────────────
$sessionDir = $FILES_DIR . '/' . $sessionId;
if (!is_dir($sessionDir)) {
    mkdir($sessionDir, 0755, true);
}

// ── 4. Write-once check ───────────────────────────────────────────────
$file        = $_FILES['file'];
$filename    = basename($file['name']);
$destination = $sessionDir . '/' . $filename;

if (file_exists($destination)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'A file with that name already exists.']);
    exit;
}

// ── 5. Save ───────────────────────────────────────────────────────────
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file.']);
    exit;
}

echo json_encode([
    'success'  => true,
    'filename' => $filename,
    'path'     => '/files/' . $sessionId . '/' . $filename
]);
