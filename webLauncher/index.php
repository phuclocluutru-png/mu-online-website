<?php
$bgPath = __DIR__ . '/images/BG WEB.png';
$bgVersion = file_exists($bgPath) ? filemtime($bgPath) : time();
?>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PKClear Launcher</title>
  <link rel="stylesheet" href="css/style.css?v=<?php echo $bgVersion; ?>">
</head>
<body>
  <div class="canvas">
    <img class="canvas-bg" src="images/BG WEB.png?v=<?php echo $bgVersion; ?>" alt="">
    <div class="layout">
      <section class="panel panel-news">
        <!-- Banner tin tức: Kích thước tổng thể khu panel ~560px (nằm trong canvas 823x409). 
             Chia làm 2 phần:
             - Vùng hiển thị (display area) 559x359
             - Thanh điều hướng (nav) 559x50 -->
        <div class="banner-news">
          <div class="banner-news__display" id="bannerNewsDisplay">
            <!-- Nội dung tin tức / ảnh / slider sẽ được load ở đây bằng JS sau này -->
            <div class="banner-news__placeholder">Nội dung Tin tức / Hình ảnh</div>
          </div>
          <nav class="banner-news__nav" aria-label="Điều hướng tin tức">
            <ul class="banner-news__navList">
              <li><button type="button" class="banner-news__btn" data-action="home">Trang chủ</button></li>
              <li><button type="button" class="banner-news__btn" data-action="news">Tin tức</button></li>
              <li><button type="button" class="banner-news__btn" data-action="fanpage">Fanpage</button></li>
              <li><button type="button" class="banner-news__btn" data-action="community">Cộng đồng</button></li>
              <li><button type="button" class="banner-news__btn banner-news__btn--highlight" data-action="admin">Liên hệ Admin</button></li>
            </ul>
          </nav>
        </div>
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

  <script src="js/event-drops.js?v=<?php echo $bgVersion; ?>"></script>
  <script src="js/events-data.js?v=<?php echo $bgVersion; ?>"></script>
  <script src="js/time-utils.js?v=<?php echo $bgVersion; ?>"></script>
  <script src="js/events.js?v=<?php echo $bgVersion; ?>"></script>
  <script src="js/banner-news.js?v=<?php echo $bgVersion; ?>"></script>
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
