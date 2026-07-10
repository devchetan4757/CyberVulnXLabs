<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

$routes = [
    '/api/upload'      => __DIR__ . '/api/upload.php',
    '/api/reset'       => __DIR__ . '/api/reset.php',
    '/api/submit-flag' => __DIR__ . '/api/submit-flag.php',
];

if (isset($routes[$uri])) {
    require $routes[$uri];
    return true;
}

$path = __DIR__ . $uri;

// Handle /files/<sessionId>/<filename>
if (preg_match('#^/files/([a-f0-9]{8,})/([^/]+)$#', $uri, $m)) {
    $sessionId = $m[1];
    $filename  = $m[2];
    $filePath  = __DIR__ . '/files/' . $sessionId . '/' . $filename;

    if (!file_exists($filePath)) {
        http_response_code(404);
        echo "404 Not Found";
        return true;
    }

    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

    if (in_array($ext, ['jpg','jpeg','png','gif'], true)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        return true;
    }

    if ($ext === 'php') {
        // Intercept ?cmd= here instead of letting system() run freely
        if (isset($_GET['cmd'])) {
            header('Content-Type: text/plain');
            echo executeCmd($_GET['cmd'], $sessionId);
            return true;
        }
        // No cmd — just show shell is active
        header('Content-Type: text/plain');
        echo "PHP shell active.\nUsage: ?cmd=<command>\nExamples: ?cmd=ls, ?cmd=ls .., ?cmd=cat ../secret/nothing/profile.jpg";
        return true;
    }
}

// Real static file
if ($uri !== '/' && file_exists($path) && !is_dir($path)) {
    return false;
}

require __DIR__ . '/index.html';

// ── Command executor ───────────────────────────────────────────────────

function executeCmd($cmd, $sessionId) {
    $JAIL     = realpath(__DIR__ . '/files');
    $CWD      = $JAIL . '/' . $sessionId;
    $parts    = preg_split('/\s+/', trim($cmd), 2);
    $command  = $parts[0];
    $arg      = isset($parts[1]) ? trim($parts[1]) : '';

    switch ($command) {

        case 'pwd':
            return '/app/files/' . $sessionId;

        case 'whoami':
            return 'www-data';

        case 'id':
            return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';

        case 'uname':
            return 'Linux webserver 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';

        case 'ls': {
            $target = resolvePath($arg ?: '.', $CWD, $JAIL);
            if ($target === false) {
                return "ls: cannot access '$arg': Permission denied";
            }
            if (!is_dir($target)) {
                return "ls: cannot access '$arg': No such file or directory";
            }
            $entries = array_diff(scandir($target), ['.', '..']);
            return implode("\n", array_values($entries));
        }

        case 'cat': {
            if (!$arg) return "cat: missing operand";

            $target = resolvePath($arg, $CWD, $JAIL);
            if ($target === false) {
                return "cat: $arg: Permission denied";
            }
            if (!file_exists($target)) {
                return "cat: $arg: No such file or directory";
            }
            if (is_dir($target)) {
                return "cat: $arg: Is a directory";
            }

            $ext = strtolower(pathinfo($target, PATHINFO_EXTENSION));

            // Serve the flag image
            if (in_array($ext, ['jpg','jpeg','png','gif'])) {
                $mime = $ext === 'jpg' || $ext === 'jpeg' ? 'image/jpeg' : 'image/' . $ext;
                header('Content-Type: ' . $mime);
                readfile($target);
                exit;
            }

            return file_get_contents($target);
        }

        default:
            return "sh: $command: command not found";
    }
}

function resolvePath($arg, $cwd, $jail) {
    // Build absolute path
    if ($arg[0] === '/') {
        // Absolute paths not allowed
        return false;
    }

    $resolved = realpath($cwd . '/' . $arg);

    // realpath returns false if path doesn't exist — try without realpath for ls on valid dirs
    if ($resolved === false) {
        // Manually resolve without requiring existence
        $resolved = normalizePath($cwd . '/' . $arg);
    }

    // Jail check — must stay within /app/files/
    if (strpos($resolved, $jail) !== 0) {
        return false;
    }

    return $resolved;
}

function normalizePath($path) {
    $parts  = explode('/', $path);
    $result = [];
    foreach ($parts as $part) {
        if ($part === '' || $part === '.') continue;
        if ($part === '..') {
            array_pop($result);
        } else {
            $result[] = $part;
        }
    }
    return '/' . implode('/', $result);
}
