<?php
header('Content-Type: application/json');

// TODO: set this to whatever flag ends up placed alongside the image
const FLAG = 'FLAG{change_me}';

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

$flag = '';
if (is_array($input) && isset($input['flag'])) {
    $flag = trim($input['flag']);
} elseif (isset($_POST['flag'])) {
    $flag = trim($_POST['flag']);
}

if ($flag === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No flag provided.']);
    exit;
}

if ($flag === FLAG) {
    echo json_encode(['success' => true, 'message' => 'Correct. Challenge completed.']);
    exit;
}

http_response_code(401);
echo json_encode(['success' => false, 'message' => 'Incorrect flag. Keep looking.']);
