<?php
header('Content-Type: application/json');

$FILES_DIR = __DIR__ . '/../files';

if (!is_dir($FILES_DIR)) {
    mkdir($FILES_DIR, 0755, true);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit;
}

$file = $_FILES['file'];

// Vulnerable by design: the original filename — and therefore its
// extension — is trusted outright. The only place a "jpg/png only"
// rule is enforced is client-side, in the browser.
$filename = basename($file['name']);
$destination = $FILES_DIR . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file.']);
    exit;
}

echo json_encode([
    'success'  => true,
    'filename' => $filename,
    'path'     => '/files/' . $filename
]);
