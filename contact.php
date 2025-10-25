<?php
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed, use POST']);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
} else {
    // handle form-encoded submissions
    $data = $_POST;
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'name, email and message are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid email address']);
    exit;
}

$entry = [
    'id' => time() . '-' . bin2hex(random_bytes(4)),
    'name' => $name,
    'email' => $email,
    'message' => $message,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    'created_at' => date('c'),
];

$file = __DIR__ . '/contacts.json';
if (!file_exists($file)) {
    // create an empty JSON array file if missing
    @file_put_contents($file, json_encode([], JSON_PRETTY_PRINT));
}

$maxAttempts = 3;
for ($i = 0; $i < $maxAttempts; $i++) {
    $fp = @fopen($file, 'c+');
    if (!$fp) {
        // small wait and retry
        usleep(100000);
        continue;
    }

    if (flock($fp, LOCK_EX)) {
        // read current contents
        $size = filesize($file);
        if ($size > 0) {
            rewind($fp);
            $contents = fread($fp, $size);
            $arr = json_decode($contents, true);
            if (!is_array($arr)) $arr = [];
        } else {
            $arr = [];
        }

        $arr[] = $entry;

        // write back
        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode(['success' => true, 'entry' => $entry]);
        exit;
    }

    fclose($fp);
    usleep(100000);
}

http_response_code(500);
echo json_encode(['error' => 'Could not write to contacts.json']);
