<?php
require_once __DIR__ . '/contacts_config.php';

$provided = '';
// Accept token via GET ?token= or Authorization: Bearer <token>
if (!empty($_GET['token'])) {
    $provided = $_GET['token'];
} else {
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($hdr, 'Bearer ') === 0) {
        $provided = trim(substr($hdr, 7));
    }
}

if ($provided !== CONTACTS_VIEW_TOKEN) {
    http_response_code(401);
    echo "<h1>401 Unauthorized</h1><p>Missing or invalid token.</p>";
    exit;
}

$file = __DIR__ . '/contacts.json';
if (!file_exists($file)) {
    echo "<h1>No contacts</h1><p>contacts.json not found.</p>";
    exit;
}

$raw = file_get_contents($file);
$arr = json_decode($raw, true);
if (!is_array($arr)) $arr = [];

// optional CSV download
if (isset($_GET['download']) && $_GET['download'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=contacts.csv');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['id','name','email','message','ip','created_at']);
    foreach ($arr as $row) {
        fputcsv($out, [
            $row['id'] ?? '',
            $row['name'] ?? '',
            $row['email'] ?? '',
            $row['message'] ?? '',
            $row['ip'] ?? '',
            $row['created_at'] ?? ''
        ]);
    }
    fclose($out);
    exit;
}

// sort by created_at desc if available
usort($arr, function ($a, $b) {
    $ta = strtotime($a['created_at'] ?? '');
    $tb = strtotime($b['created_at'] ?? '');
    return $tb <=> $ta;
});

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Contacts List</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:16px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #ddd;padding:8px}
    th{background:#f4f4f4}
    tr:hover{background:#fafafa}
    #filter{margin-bottom:12px;padding:6px;width:320px}
    .meta{margin-bottom:10px}
  </style>
</head>
<body>
  <h1>Saved Contacts</h1>
  <div class="meta">
    <span>Entries: <?php echo count($arr); ?></span>
    &nbsp;|&nbsp;
    <a href="contacts_list.php?token=<?php echo urlencode($provided); ?>&download=csv">Download CSV</a>
  </div>
  <input id="filter" placeholder="Filter by name, email or message..." />

  <table id="contacts">
    <thead>
      <tr>
        <th>When</th>
        <th>Name</th>
        <th>Email</th>
        <th>Message</th>
        <th>IP</th>
        <th>ID</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($arr as $row): ?>
      <tr>
        <td><?php echo h($row['created_at'] ?? ''); ?></td>
        <td><?php echo h($row['name'] ?? ''); ?></td>
        <td><?php echo h($row['email'] ?? ''); ?></td>
        <td><?php echo nl2br(h($row['message'] ?? '')); ?></td>
        <td><?php echo h($row['ip'] ?? ''); ?></td>
        <td style="font-family:monospace;font-size:0.9em"><?php echo h($row['id'] ?? ''); ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>

  <script>
    // simple client-side filter
    (function(){
      const input = document.getElementById('filter');
      const tbody = document.querySelector('#contacts tbody');
      if (!input || !tbody) return;
      input.addEventListener('input', function(){
        const q = input.value.trim().toLowerCase();
        for (const tr of tbody.rows) {
          const text = tr.textContent.toLowerCase();
          tr.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
        }
      });
    })();
  </script>
</body>
</html>
