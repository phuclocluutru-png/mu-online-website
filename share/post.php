<?php
$SITE_BASE   = 'https://pkclear.com';
$READ_LINK   = $SITE_BASE . '/pages/post.html?id=';
$FALLBACK_OG = $SITE_BASE . '/images/og-default-1200x630.jpg';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) { http_response_code(404); header('Content-Type: text/plain; charset=utf-8'); exit('Not found'); }

$link = $READ_LINK . $id;

// ---- Chỉ crawler (được gắn bởi rewrite) mới ở lại trang OG ----
$isCrawler = (isset($_GET['crawler']) && $_GET['crawler'] === '1');

if (!$isCrawler) {
  // Người dùng thật: luôn 302 tới trang đọc bài
  header('Cache-Control: no-cache, no-store, must-revalidate');
  header('Pragma: no-cache');
  header('Expires: 0');
  header('Location: ' . $link, true, 302);
  exit;
}

// ---- Từ đây là luồng crawler: render OG ----
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$api = $SITE_BASE . "/wp-json/wp/v2/posts/$id?_embed";

function http_get($url) {
  if (ini_get('allow_url_fopen')) return @file_get_contents($url);
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_USERAGENT      => 'PKClear-OG-Fetcher',
  ]);
  $resp = curl_exec($ch);
  curl_close($ch);
  return $resp !== false ? $resp : null;
}

$resp = http_get($api);
if (!$resp) { http_response_code(404); exit('Not found'); }
$data = json_decode($resp, true);
if (!is_array($data)) { http_response_code(500); exit('Bad response'); }

$rawTitle = $data['title']['rendered']   ?? 'MU PKClear';
$rawDesc  = $data['excerpt']['rendered'] ?? '';
$title = html_entity_decode(strip_tags($rawTitle), ENT_QUOTES, 'UTF-8');
$desc  = html_entity_decode(strip_tags($rawDesc),  ENT_QUOTES, 'UTF-8');
$desc  = trim(preg_replace('/\s+/', ' ', $desc));
if ($desc === '') $desc = 'Cộng đồng MU Online PK Clear - Tin tức, hướng dẫn và sự kiện.';
$img = $data['_embedded']['wp:featuredmedia'][0]['source_url'] ?? '';
if ($img === '') $img = $FALLBACK_OG;

$published = $data['date'] ?? '';
$modified  = $data['modified'] ?? '';

$imgW = $imgH = null;
if (ini_get('allow_url_fopen')) {
  if ($info = @getimagesize($img)) { $imgW = (int)$info[0]; $imgH = (int)$info[1]; }
}

function clip($s,$n=300){ return function_exists('mb_strimwidth') ? mb_strimwidth($s,0,$n,'…','UTF-8') : (strlen($s)>$n?substr($s,0,$n-3).'...':$s); }
?>
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title><?= htmlspecialchars($title) ?></title>
<link rel="canonical" href="<?= htmlspecialchars($link) ?>">

<meta property="og:type" content="article">
<meta property="og:site_name" content="MU PKClear">
<meta property="og:title" content="<?= htmlspecialchars($title) ?>">
<meta property="og:description" content="<?= htmlspecialchars(clip($desc)) ?>">
<meta property="og:url" content="<?= htmlspecialchars($link) ?>">
<meta property="og:image" content="<?= htmlspecialchars($img) ?>">
<meta property="og:image:secure_url" content="<?= htmlspecialchars($img) ?>">
<?php if ($imgW && $imgH): ?>
<meta property="og:image:width" content="<?= $imgW ?>">
<meta property="og:image:height" content="<?= $imgH ?>">
<?php endif; ?>
<meta property="og:image:alt" content="<?= htmlspecialchars($title) ?>">
<meta property="og:locale" content="vi_VN">
<meta property="og:updated_time" content="<?= gmdate('c') ?>">
<?php if ($published): ?><meta property="article:published_time" content="<?= htmlspecialchars($published) ?>"><?php endif; ?>
<?php if ($modified):  ?><meta property="article:modified_time"  content="<?= htmlspecialchars($modified)  ?>"><?php endif; ?>

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
<meta name="twitter:description" content="<?= htmlspecialchars(clip($desc)) ?>">
<meta name="twitter:image" content="<?= htmlspecialchars($img) ?>">
</head>
<body>
<!-- trang dành cho crawler -->
Nếu bạn là người dùng, vui lòng mở bài viết: <a href="<?= htmlspecialchars($link) ?>"><?= htmlspecialchars($title) ?></a>.
</body>
</html>
