<?php
// Events-only view for launcher
$GLOBAL_VERSION = '20251110-12';
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');

$root = dirname(__DIR__);
function asset_version(string $relative) {
    global $GLOBAL_VERSION, $root;
    $path = $root . '/' . ltrim($relative, '/');
    if (is_file($path)) {
        return $GLOBAL_VERSION . '-' . filemtime($path);
    }
    return $GLOBAL_VERSION . '-' . time();
}

$bgVersion = asset_version('images/BG WEB.png');
?>
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PKClear Launcher - Events</title>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <link rel="stylesheet" href="../css/style.css?v=<?php echo asset_version('css/style.css'); ?>">
</head>
<body>
  <div class="canvas">
    <img class="canvas-bg" src="../images/BG WEB.png?v=<?php echo $bgVersion; ?>" alt="">
    <div class="layout layout--events-only">
      <section class="panel panel-events">
        <div class="events">
          <ul class="events__list">
            <!-- Events will be populated by JS -->
          </ul>
        </div>
      </section>
    </div>
  </div>

  <div id="event-times-pop" class="event-times-pop"></div>

  <script src="../js/event-drops.js?v=<?php echo asset_version('js/event-drops.js'); ?>"></script>
  <script src="../js/events-data.js?v=<?php echo asset_version('js/events-data.js'); ?>"></script>
  <script src="../js/time-utils.js?v=<?php echo asset_version('js/time-utils.js'); ?>"></script>
  <script src="../js/events.js?v=<?php echo asset_version('js/events.js'); ?>"></script>
  <?php echo "<!-- INDEX_FILE=".__FILE__." VERSION=$GLOBAL_VERSION -->"; ?>
  <script>
    (function(){
      function safeInit(){ if(window.initEvents){ try{ initEvents(); } catch(e){} } }
      if(document.readyState === 'complete' || document.readyState === 'interactive') { safeInit(); }
      else if(document.addEventListener) { document.addEventListener('DOMContentLoaded', safeInit); window.addEventListener('load', safeInit); }
      else if(document.attachEvent) { document.attachEvent('onreadystatechange', function(){ if(document.readyState === 'complete') safeInit(); }); window.attachEvent('onload', safeInit); }
      else { window.onload = safeInit; }
    })();
  </script>
</body>
</html>
