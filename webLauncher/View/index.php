<?php
// Build playlist from assets/image to avoid hardcoding in JS.
function list_media_files(string $dir): array {
    $allowed = ['mp4','webm','ogg','jpg','jpeg','png','gif','bmp'];
    $out = [];
    if (!is_dir($dir)) return $out;
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) continue;
        $out[] = 'assets/image/' . $item;
    }
    // sap xep theo ten de co thu tu on dinh
    sort($out, SORT_NATURAL | SORT_FLAG_CASE);
    return $out;
}
$playlist = list_media_files(__DIR__ . '/assets/image');
if (empty($playlist)) {
    $playlist[] = 'assets/image/bg.mp4';
}

// Optional: neu co file assets/image/playlist.txt thi se dung thu tu trong do (moi dong 1 duong dan)
$playlistTxt = __DIR__ . '/assets/image/playlist.txt';
if (is_file($playlistTxt)) {
    $ordered = [];
    $lines = file($playlistTxt, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        // ho tro ca duong dan tuyet doi hoac tuong doi so voi assets/image
        if (strpos($line, 'assets/') === 0) {
            $candidate = __DIR__ . '/' . $line;
            if (is_file($candidate)) {
                $ordered[] = $line;
            }
        } else {
            $candidate = __DIR__ . '/assets/image/' . ltrim($line, '/\\');
            if (is_file($candidate)) {
                $ordered[] = 'assets/image/' . ltrim($line, '/\\');
            }
        }
    }
    if (!empty($ordered)) {
        $playlist = $ordered;
    }
}
$first = $playlist[0];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Media Viewer</title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <div class="wrap">
    <div id="mount" class="mount">
      <?php if (preg_match('/\\.(jpg|jpeg|png|gif|bmp)$/i', $first)): ?>
        <img src="<?php echo htmlspecialchars($first, ENT_QUOTES, 'UTF-8'); ?>" alt="">
      <?php else: ?>
        <video autoplay muted loop playsinline>
          <source src="<?php echo htmlspecialchars($first, ENT_QUOTES, 'UTF-8'); ?>" type="video/mp4">
        </video>
      <?php endif; ?>
    </div>
    <div class="controls">
      <button type="button" id="btnPrev" aria-label="Previous">Prev</button>
      <button type="button" id="btnNext" aria-label="Next">Next</button>
    </div>
    <div class="status" id="status"></div>
  </div>
  <script>
    window.PLAYLIST = <?php echo json_encode(array_values($playlist), JSON_UNESCAPED_SLASHES); ?>;
    window.IMAGE_DURATION = 5000;
  </script>
  <script src="assets/js/app.js"></script>
</body>
</html>
