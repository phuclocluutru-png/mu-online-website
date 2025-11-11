<?php
// Global version seed (change manually if cần ép reload toàn bộ)
$GLOBAL_VERSION = '20251110-12'; // bumped to force asset reload after white-box fix

// Gửi header chống cache (HTML, CSS, JS) để launcher / trình duyệt cũ không giữ bản cũ
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');

// Hàm tạo version dựa trên filemtime + GLOBAL_VERSION (nếu file không tồn tại trả về timestamp hiện tại)
function asset_version(string $relative): string {
  global $GLOBAL_VERSION;
  $path = __DIR__ . '/' . ltrim($relative, '/');
  if (is_file($path)) {
    return $GLOBAL_VERSION.'-'.filemtime($path);
  }
  return $GLOBAL_VERSION.'-'.time();
}

// Giữ riêng version cho background nếu muốn dùng nơi khác
$bgVersion = asset_version('images/BG WEB.png');
?>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PKClear Launcher</title>
  <!-- Mỗi asset có version riêng (filemtime) để bust cache -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <link rel="stylesheet" href="css/style.css?v=<?php echo asset_version('css/style.css'); ?>">
</head>
<body>
  <div class="canvas">
  <img class="canvas-bg" src="images/BG WEB.png?v=<?php echo $bgVersion; ?>" alt="">
    <div class="layout">
      <!-- panel-news removed per request. Original content backed up in backups/panel-news/ -->
      <section class="panel panel-news--removed" aria-hidden="true">
        <!-- Placeholder kept so layout spacing remains; redesign the news panel here later. -->
      </section>
      <section class="panel panel-events">
        <div class="events">
          <ul class="events__list">
            <!-- Events will be populated by JS -->
          </ul>
        </div>
      </section>
    </div>
  </div>

  <!-- Event tooltip -->
  <div id="event-times-pop" class="event-times-pop"></div>

  <script src="js/event-drops.js?v=<?php echo asset_version('js/event-drops.js'); ?>"></script>
  <script src="js/events-data.js?v=<?php echo asset_version('js/events-data.js'); ?>"></script>
  <script src="js/time-utils.js?v=<?php echo asset_version('js/time-utils.js'); ?>"></script>
  <script src="js/events.js?v=<?php echo asset_version('js/events.js'); ?>"></script>
  <script src="js/banner-news.js?v=<?php echo asset_version('js/banner-news.js'); ?>"></script>
  <!-- Debug: nguồn file index đang chạy: -->
  <?php echo "<!-- INDEX_FILE=".__FILE__." VERSION=$GLOBAL_VERSION -->"; ?>
  <script>
    // Fallback for legacy browser (no DOMContentLoaded in some old cases)
    (function(){
      function safeInit() {
        if (!window.initEvents) {
          return;
        }
        try {
          initEvents();
        } catch (e) {
          // swallow errors for legacy WebBrowser control
        }
      }
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        safeInit();
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', safeInit);
        window.addEventListener('load', safeInit);
      } else if (document.attachEvent) { // IE8 fallback
        document.attachEvent('onreadystatechange', function(){ if (document.readyState === 'complete') safeInit(); });
        window.attachEvent('onload', safeInit);
      } else {
        window.onload = safeInit;
      }
    })();
  </script>
</body>
</html>
