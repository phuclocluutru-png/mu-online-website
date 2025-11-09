(function () {
    // Simple mapping from data-action to URL. Opens in external browser when possible.
    var actionLinks = {
        home: 'https://pkclear.com/',
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
        nav.addEventListener('click', function (ev) {
            var btn = ev.target.closest('.banner-news__btn');
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
