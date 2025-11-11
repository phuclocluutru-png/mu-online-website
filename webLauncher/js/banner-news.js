(function () {
    // Simple mapping from data-action to URL. Opens in external browser when possible.
    var actionLinks = {
        home: 'https://pkclear.com/',
        news: 'https://pkclear.com/pages/post.html?cat=latest',
        fanpage: 'https://www.facebook.com/mupkclear',
        community: 'https://zalo.me/g/yigzjy890',
        guide: 'huongdan.html' // Local hướng dẫn
    };

    function openExternal(url) {
        try {
            // In launcher environment might be WebBrowser control (older IE); window.open may be blocked.
            var win = window.open(url, '_blank');
            if (!win) {
                // Fallback: change location to force navigation.
                window.location.href = url;
            }
        } catch (e) {
            window.location.href = url;
        }
    }

    function initBannerNav() {
        var nav = document.querySelector('.banner-news__nav');
        if (!nav) return;
        // Ensure banner display has a solid fallback background in legacy embedded webviews
        (function ensureBannerFallback() {
            try {
                var display = document.getElementById('bannerNewsDisplay');
                if (!display) return;
                // If browser doesn't support CSS.supports for linear-gradient, apply solid bg
                var supportsGradient = false;
                if (window.CSS && typeof CSS.supports === 'function') {
                    try {
                        supportsGradient = CSS.supports('background-image', 'linear-gradient(0deg, #000, #000)');
                    } catch (e) {
                        supportsGradient = false;
                    }
                }
                if (!supportsGradient) {
                    try {
                        // setProperty with priority to override inline/author styles in some engines
                        display.style.setProperty('background', '#2e1f47', 'important');
                        display.style.setProperty('min-height', '200px', 'important');
                    } catch (e) {
                        display.style.background = '#2e1f47';
                        display.style.minHeight = display.style.minHeight || '200px';
                    }
                }
            } catch (e) {
                // swallow errors on very old engines
            }
        })();
        nav.addEventListener('click', function (ev) {
            // IE11- không có .closest, dùng vòng lặp cha
            var el = ev.target;
            var btn = null;
            while (el && el !== nav) {
                if (el.className && typeof el.className === 'string' && el.className.indexOf('banner-news__btn') !== -1) {
                    btn = el;
                    break;
                }
                el = el.parentNode;
            }
            if (!btn) return;
            var act = btn.getAttribute('data-action');
            if (actionLinks[act]) {
                openExternal(actionLinks[act]);
            } else {
                // Placeholder actions for other buttons (could be replaced later)
                if (act === 'news') {
                    console.log('[banner-news] Tin tức: chưa triển khai nội dung.');
                } else if (act === 'fanpage') {
                    console.log('[banner-news] Fanpage: chưa có URL cấu hình.');
                } else if (act === 'admin') {
                    console.log('[banner-news] Liên hệ Admin: sẽ mở modal hoặc chat sau.');
                } else if (act === 'guide') {
                    console.log('[banner-news] Hướng Dẫn: file huongdan.html chưa tìm thấy hoặc sẽ được bổ sung.');
                }
            }
        });
        // Video rotation: insert a video element into #bannerNewsDisplay when present
        (function initVideoRotation() {
            try {
                var display = document.getElementById('bannerNewsDisplay');
                if (!display) return;

                // Configure your video sources here (relative to webLauncher/)
                var videos = [
                    'assets/video/video1.mp4',
                    'assets/video/video2.mp4'
                ];

                // Create video element
                var vid = document.createElement('video');
                vid.setAttribute('playsinline', ''); // mobile inline playback
                vid.setAttribute('webkit-playsinline', '');
                vid.setAttribute('muted', ''); // muted allows autoplay in many webviews
                vid.setAttribute('controls', '');
                vid.style.width = '100%';
                vid.style.height = '100%';
                vid.style.objectFit = 'cover';

                // Helper to load and play a given index
                var current = Math.floor(Math.random() * videos.length);
                function loadAndPlay(i) {
                    if (i < 0 || i >= videos.length) return;
                    current = i;
                    // clear existing sources
                    while (vid.firstChild) vid.removeChild(vid.firstChild);
                    var src = document.createElement('source');
                    src.src = videos[i];
                    src.type = 'video/mp4';
                    vid.appendChild(src);
                    // load then play, ignore promise rejections for legacy engines
                    try {
                        vid.load();
                        var p = vid.play();
                        if (p && typeof p.then === 'function') {
                            p.catch(function (e) { /* ignore autoplay block */ });
                        }
                    } catch (e) {
                        // older embedded webviews may not support promises
                    }
                }

                // On end, switch to the other video (rotate)
                vid.addEventListener('ended', function () {
                    var next = (current + 1) % videos.length;
                    loadAndPlay(next);
                });

                // Basic error handling: try next video on error
                vid.addEventListener('error', function () {
                    var next = (current + 1) % videos.length;
                    loadAndPlay(next);
                });

                // Insert video into display (replace placeholder)
                display.innerHTML = '';
                display.appendChild(vid);
                // Start with a random video
                loadAndPlay(current);
            } catch (e) {
                // swallow errors to keep launcher stable
                console.warn('[banner-news] video init failed', e);
            }
        })();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initBannerNav();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', initBannerNav);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState === 'complete') initBannerNav();
        });
    } else {
        window.onload = initBannerNav;
    }
})();
