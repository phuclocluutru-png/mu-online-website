// Simple playlist controller (ES5, compatible voi WebView IE). Ho tro video + anh.
(function() {
  var playlist = (window.PLAYLIST && window.PLAYLIST.length) ? window.PLAYLIST : [
    'assets/image/bg.mp4'
  ];

  var mount = document.getElementById('mount');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var statusEl = document.getElementById('status');
  var idx = 0;
  var timer = null;
  var imageDurationMs = (typeof window.IMAGE_DURATION === 'number' && window.IMAGE_DURATION > 0) ? window.IMAGE_DURATION : 5000;

  if (!mount || !playlist.length) {
    return;
  }

  function isImage(src) {
    var s = (src || '').toLowerCase();
    return s.indexOf('.jpg') > -1 || s.indexOf('.jpeg') > -1 || s.indexOf('.png') > -1 || s.indexOf('.gif') > -1 || s.indexOf('.bmp') > -1;
  }

  function clearMount() {
    if (timer) { clearTimeout(timer); timer = null; }
    var children = [];
    for (var c = mount.firstChild; c; c = c.nextSibling) {
      children.push(c);
    }
    for (var i = 0; i < children.length; i++) {
      (function(node) {
        try { node.style.opacity = '0'; } catch (e) {}
        setTimeout(function() {
          try { if (node && node.parentNode) node.parentNode.removeChild(node); } catch (e) {}
        }, 700);
      })(children[i]);
    }
  }

  function render(i) {
    clearMount();
    if (!playlist.length) {
      mount.innerHTML = '<div style="color:#e8ecf6;padding:10px;font-family:Segoe UI,Arial,sans-serif;">No media</div>';
      if (statusEl) statusEl.textContent = 'No media';
      return;
    }
    idx = (i + playlist.length) % playlist.length;
    var src = playlist[idx];
    if (statusEl) statusEl.textContent = '';
    var node;
    if (isImage(src)) {
      node = document.createElement('img');
      node.src = src;
      node.alt = '';
      node.style.opacity = '0';
      node.onerror = function(){ playlist.length === 1 ? render(0) : next(); };
      if (playlist.length > 1) {
        timer = setTimeout(next, imageDurationMs);
      } else {
        timer = setTimeout(function(){ render(0); }, imageDurationMs);
      }
    } else {
      node = document.createElement('video');
      node.autoplay = true;
      node.muted = true;
      node.loop = (playlist.length === 1);
      node.playsInline = true;
      node.preload = 'auto';
      node.style.width = '100%';
      node.style.height = '100%';
      node.style.objectFit = 'cover';
      node.style.display = 'block';
      node.style.opacity = '0';
      var srcEl = document.createElement('source');
      srcEl.src = src;
      srcEl.type = 'video/mp4';
      node.appendChild(srcEl);

      // Fallback: neu video khong load duoc trong 4s thi next
      var failTimer = setTimeout(function(){ next(); }, 4000);

      if (node.addEventListener) {
        node.addEventListener('loadeddata', function(){ clearTimeout(failTimer); });
        node.addEventListener('error', function(){ clearTimeout(failTimer); playlist.length === 1 ? render(0) : next(); });
        node.addEventListener('ended', playlist.length === 1 ? function(){ render(0); } : next);
      } else if (node.attachEvent) {
        node.attachEvent('onloadeddata', function(){ clearTimeout(failTimer); });
        node.attachEvent('onerror', function(){ clearTimeout(failTimer); playlist.length === 1 ? render(0) : next(); });
        node.attachEvent('onended', playlist.length === 1 ? function(){ render(0); } : next);
      }
      try {
        var p = node.play();
        if (p && p.catch) { p.catch(function(){}); }
      } catch (e) {}
    }
    mount.appendChild(node);
    // trigger fade-in
    setTimeout(function(){ try { node.style.opacity = '1'; } catch (e) {} }, 30);
  }

  function next() { render(idx + 1); }
  function prev() { render(idx - 1); }

  if (btnNext) {
    if (btnNext.addEventListener) btnNext.addEventListener('click', next);
    else btnNext.attachEvent('onclick', next);
  }
  if (btnPrev) {
    if (btnPrev.addEventListener) btnPrev.addEventListener('click', prev);
    else btnPrev.attachEvent('onclick', prev);
  }

  render(0);
})();
