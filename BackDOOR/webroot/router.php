<?php
// Use with the built-in dev server:
//   php -S localhost:8000 router.php
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

// Images under /files/ should download as an attachment instead of
// rendering inline in the browser. This only applies to image
// extensions -- anything else under /files/ (including uploaded .php
// files) still falls through below and is served/executed directly by
// the built-in server, which is what the lab depends on.
$downloadExts = ['jpg', 'jpeg', 'png', 'gif'];
if (strpos($uri, '/files/') === 0 && file_exists($path) && !is_dir($path)) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (in_array($ext, $downloadExts, true)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($path) . '"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        return true;
    }
}

// If the request matches a real file on disk (including anything under
// /files/, so uploaded .php files still get executed), let the built-in
// server handle it directly.
if ($uri !== '/' && file_exists($path) && !is_dir($path)) {
    return false;
}

require __DIR__ . '/index.html';
