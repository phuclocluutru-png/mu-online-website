<?php
// public_html/share/post.php
// Dùng để tạo preview có thẻ Open Graph cho mạng xã hội.

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) { http_response_code(404); exit('Not found'); }

// Gọi WP REST API để lấy tiêu đề/ảnh. Nếu host tắt allow_url_fopen, dùng cURL.
$api = "https://pkclear.com/wp-json/wp/v2/posts/$id?_embed";

function get_json($url) {
  if (ini_get('allow_url_fopen')) {
    $resp = @file_get_contents($url);
  } else {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_USERAGENT => 'PKClear-OG-Fetcher'
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);
  }
  return $resp ? json_decode($resp, true) : null;
}

$data = get_json($api);
if (!$data) { http_response_code(404); exit('Not found'); }

$title = html_entity_decode(strip_tags($data['title']['rendered'] ?? 'MU PKClear'), ENT_QUOTES, 'UTF-8');
$desc  = html_entity_decode(strip_tags($data['excerpt']['rendered'] ?? ''), ENT_QUOTES, 'UTF-8');
$desc  = trim(preg_replace('/\s+/', ' ', $desc));
$link  = "https://pkclear.com/pages/post.html?id={$id}";

// Ảnh đại diện
$img = '';
if (!empty($data['_embedded']['wp:featuredmedia'][0]['source_url'])) {
  $img = $data['_embedded']['wp:featuredmedia'][0]['source_url'];
}
if ($img === '') $img = 'https://pkclear.com/images/og-default-1200x630.jpg';

$published = $data['date'] ?? '';
$modified  = $data['modified'] ?? '';
?>
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title><?= htmlspecialchars($title) ?></title>
<link rel="canonical" href="<?= htmlspecialchars($link) ?>">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="MU PKClear">
<meta property="og:title" content="<?= htmlspecialchars($title) ?>">
<meta property="og:description" content="<?= htmlspecialchars(mb_strimwidth($desc,0,300,'…','UTF-8')) ?>">
<meta property="og:url" content="<?= htmlspecialchars($link) ?>">
<meta property="og:image" content="<?= htmlspecialchars($img) ?>">
<meta property="og:locale" content="vi_VN">
<?php if ($published): ?><meta property="article:published_time" content="<?= htmlspecialchars($published) ?>"><?php endif; ?>
<?php if ($modified):  ?><meta property="article:modified_time"  content="<?= htmlspecialchars($modified)  ?>"><?php endif; ?>

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
<meta name="twitter:description" content="<?= htmlspecialchars(mb_strimwidth($desc,0,300,'…','UTF-8')) ?>">
<meta name="twitter:image" content="<?= htmlspecialchars($img) ?>">

<!-- Khi người dùng bấm trực tiếp, tự chuyển sang trang đọc bài -->
<meta http-equiv="refresh" content="0; url=<?= htmlspecialchars($link) ?>">
</head>
<body>
Nếu bạn không được chuyển tiếp, bấm vào đây:
<a href="<?= htmlspecialchars($link) ?>"><?= htmlspecialchars($title) ?></a>.
</body>
</html>
