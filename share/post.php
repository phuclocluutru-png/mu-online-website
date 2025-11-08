<?php
// public_html/share/post.php
// Trả HTML có thẻ Open Graph/Twitter Cards để MXH lấy preview đúng theo ID bài viết WP.

// ------- Cấu hình cơ bản -------
$SITE_BASE   = 'https://pkclear.com';
$READ_LINK   = $SITE_BASE . '/pages/post.html?id='; // trang đọc bài (JS)
$FALLBACK_OG = $SITE_BASE . '/images/og-default-1200x630.jpg'; // 1200x630

// ------- Nhận tham số -------
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    echo 'Not found';
    exit;
}

// ------- Header hạn chế cache để bot lấy preview mới -------
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// ------- Gọi WP REST API để lấy dữ liệu bài viết -------
$api = $SITE_BASE . "/wp-json/wp/v2/posts/$id?_embed";

function http_get($url) {
    if (ini_get('allow_url_fopen')) {
        return @file_get_contents($url);
    }
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
if (!$resp) {
    http_response_code(404);
    echo 'Not found';
    exit;
}

$data = json_decode($resp, true);
if (!is_array($data)) {
    http_response_code(500);
    echo 'Bad response';
    exit;
}

// ------- Trích thông tin cần thiết -------
$rawTitle = $data['title']['rendered']  ?? 'MU PKClear';
$rawDesc  = $data['excerpt']['rendered'] ?? '';
$title = html_entity_decode(strip_tags($rawTitle), ENT_QUOTES, 'UTF-8');
$desc  = html_entity_decode(strip_tags($rawDesc),  ENT_QUOTES, 'UTF-8');
$desc  = trim(preg_replace('/\s+/', ' ', $desc));
if ($desc === '') $desc = 'Cộng đồng MU Online PK Clear - Tin tức, hướng dẫn và sự kiện.';

// Ảnh đại diện (featured image)
$img = '';
if (!empty($data['_embedded']['wp:featuredmedia'][0]['source_url'])) {
    $img = $data['_embedded']['wp:featuredmedia'][0]['source_url'];
}
if ($img === '') $img = $FALLBACK_OG;

// Thời gian
$published = $data['date']     ?? '';
$modified  = $data['modified'] ?? '';

// Link đọc bài thật
$link = $READ_LINK . $id;

// Lấy kích thước ảnh (nếu có thể)
$imgW = $imgH = null;
if (ini_get('allow_url_fopen')) {
    // getimagesize hỗ trợ URL khi allow_url_fopen = On
    if ($info = @getimagesize($img)) {
        $imgW = isset($info[0]) ? (int)$info[0] : null;
        $imgH = isset($info[1]) ? (int)$info[1] : null;
    }
}

// Helper cắt mô tả gọn
function clip($str, $len = 300) {
    if (function_exists('mb_strimwidth')) {
        return mb_strimwidth($str, 0, $len, '…', 'UTF-8');
    }
    return strlen($str) > $len ? substr($str, 0, $len-3) . '...' : $str;
}

// ------- Xuất HTML -------
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

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
<meta name="twitter:description" content="<?= htmlspecialchars(clip($desc)) ?>">
<meta name="twitter:image" content="<?= htmlspecialchars($img) ?>">

<!-- Khi người dùng mở trực tiếp, tự động chuyển về trang đọc bài -->
<meta http-equiv="refresh" content="0; url=<?= htmlspecialchars($link) ?>">
</head>
<body>
Nếu bạn không được chuyển tiếp, bấm vào đây:
<a href="<?= htmlspecialchars($link) ?>"><?= htmlspecialchars($title) ?></a>.
</body>
</html>
