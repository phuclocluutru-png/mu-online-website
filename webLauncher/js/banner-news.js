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
        });
        // Video rotation: insert a video element into #bannerNewsDisplay when present
        (function initVideoRotation() {
            try {
                var display = document.getElementById('bannerNewsDisplay');
                if (!display) return;

                // Configure your video sources here (relative to webLauncher/)
                // We'll choose a random base video (video1/video2) each launch, then try casing variants
                var baseNames = [
                    'Video1.mp4',
                    'Video2.mp4'
                ];

                // Build per-base candidate lists (lowercase, capitalized, original)
                var baseCandidates = baseNames.map(function (name) {
                    var list = [];
                    list.push('assets/video/' + name); // try exact first
                    list.push('assets/video/' + name.toLowerCase());
                    list.push('assets/video/' + (name.charAt(0).toUpperCase() + name.slice(1)));
                    // de-dup preserve order
                    return list.filter(function (v, i, a) { return a.indexOf(v) === i; });
                });

                // Flattened fallback list (if needed)
                var flattened = [].concat.apply([], baseCandidates);

                // Create video element (no native controls)
                var vid = document.createElement('video');
                vid.setAttribute('playsinline', ''); // mobile inline playback
                vid.setAttribute('webkit-playsinline', '');
                vid.muted = true; // muted allows autoplay in many webviews
                // DO NOT show native controls; we'll add a tiny custom overlay
                vid.controls = false;
                vid.style.width = '100%';
                vid.style.height = '100%';
                vid.style.objectFit = 'cover';
                vid.style.display = 'block';

                // Helper to load and play a given source URL
                var current = { baseIndex: 0, candidateIndex: 0 };

                function tryPlayFromBase(baseIndex) {
                    // try candidates for this base sequentially
                    var list = baseCandidates[baseIndex] || [];
                    if (!list.length) return false;
                    current.baseIndex = baseIndex;
                    current.candidateIndex = 0;
                    loadAndPlay(list[current.candidateIndex]);
                    return true;
                }

                function loadAndPlay(srcUrl) {
                    // clear existing sources
                    while (vid.firstChild) vid.removeChild(vid.firstChild);
                    var src = document.createElement('source');
                    src.src = srcUrl;
                    src.type = 'video/mp4';
                    vid.appendChild(src);
                    console.log('[banner-news] loading video', srcUrl);
                    try {
                        vid.load();
                        var p = vid.play();
                        if (p && typeof p.then === 'function') {
                            p.catch(function (e) { console.warn('[banner-news] play rejected', e); });
                        }
                    } catch (e) {
                        console.warn('[banner-news] play error', e);
                    }
                }

                // On end, switch to the other base (video1 <-> video2) and try its candidates
                vid.addEventListener('ended', function () {
                    var nextBase = (current.baseIndex + 1) % baseCandidates.length;
                    tryPlayFromBase(nextBase);
                });

                // Basic error handling: try next candidate for current base, otherwise try next base
                vid.addEventListener('error', function (ev) {
                    console.warn('[banner-news] video error for', baseCandidates[current.baseIndex][current.candidateIndex], ev);
                    var list = baseCandidates[current.baseIndex];
                    if (current.candidateIndex + 1 < list.length) {
                        current.candidateIndex++;
                        loadAndPlay(list[current.candidateIndex]);
                        return;
                    }
                    // try other base
                    var nextBase = (current.baseIndex + 1) % baseCandidates.length;
                    if (nextBase !== current.baseIndex) {
                        tryPlayFromBase(nextBase);
                        return;
                    }
                    console.warn('[banner-news] all video candidates attempted, no playable source found');
                });

                // Build small custom control overlay (mute, fullscreen, pip)
                var overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.right = '8px';
                overlay.style.bottom = '8px';
                overlay.style.display = 'flex';
                overlay.style.gap = '8px';
                overlay.style.zIndex = '2147483652';
                overlay.style.pointerEvents = 'auto';
                overlay.style.touchAction = 'manipulation';

                function makeBtn(iconText, title, onClick) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.title = title;
                    b.style.width = '42px';
                    b.style.height = '42px';
                    b.style.borderRadius = '50%';
                    b.style.border = '2px solid rgba(255,255,255,0.12)';
                    b.style.background = 'rgba(0,0,0,0.45)';
                    b.style.color = '#fff';
                    b.style.display = 'flex';
                    b.style.alignItems = 'center';
                    b.style.justifyContent = 'center';
                    b.style.fontSize = '18px';
                    b.style.boxShadow = '0 2px 6px rgba(0,0,0,0.6)';
                    b.style.cursor = 'pointer';
                    b.innerText = iconText;
                    b.addEventListener('click', function (e) { try { e.stopPropagation(); onClick(e); } catch (err) { onClick(e); } });
                    // also support touch devices
                    b.addEventListener('touchstart', function (e) { try { e.preventDefault(); e.stopPropagation(); onClick(e); } catch (err) { onClick(e); } });
                    // ensure button can receive pointer events and sits above video
                    b.style.zIndex = '2147483648';
                    b.style.position = 'relative';
                    b.disabled = false;
                    b.style.pointerEvents = 'auto';
                    // Hover styles
                    b.addEventListener('mouseenter', function () { b.style.transform = 'scale(1.06)'; b.style.background = 'rgba(0,0,0,0.6)'; });
                    b.addEventListener('mouseleave', function () { b.style.transform = 'none'; b.style.background = 'rgba(0,0,0,0.45)'; });
                    return b;
                }

                // Persistent mute: read saved preference if present
                try {
                    var saved = localStorage.getItem('banner-news-muted');
                    if (saved !== null) {
                        vid.muted = saved === '1';
                    }
                } catch (e) {
                    // ignore localStorage failures
                }

                var muteBtn = makeBtn(vid.muted ? '🔇' : '🔈', 'Tắt/bật âm', function () {
                    console.log('[banner-news] mute button clicked');
                    vid.muted = !vid.muted;
                    muteBtn.innerText = vid.muted ? '🔇' : '🔈';
                    try {
                        localStorage.setItem('banner-news-muted', vid.muted ? '1' : '0');
                    } catch (e) {
                        // ignore
                    }
                });

                // Smart wide-toggle: expand/collapse like ⇔ / ⇒⇐ but choose scale by width/height (Smart Cover)
                var fsBtn = makeBtn('⇔', 'Xem trên diện rộng / thu lại (Smart)', function () {
                    try {
                        // toggled state stored on display._isSmartMax
                        var isMax = !!display._isSmartMax;
                        if (isMax) {
                            // collapse: restore saved styles
                            try {
                                display._isSmartMax = false;
                                // restore display
                                if (display._prevStyles) {
                                    display.style.position = display._prevStyles.position || '';
                                    display.style.left = display._prevStyles.left || '';
                                    display.style.top = display._prevStyles.top || '';
                                    display.style.width = display._prevStyles.width || '';
                                    display.style.height = display._prevStyles.height || '';
                                    display.style.zIndex = display._prevStyles.zIndex || '';
                                    display.style.overflow = display._prevStyles.overflow || '';
                                    delete display._prevStyles;
                                }
                                // restore video
                                if (vid._prevStyles) {
                                    vid.style.position = vid._prevStyles.position || '';
                                    vid.style.left = vid._prevStyles.left || '';
                                    vid.style.top = vid._prevStyles.top || '';
                                    vid.style.transform = vid._prevStyles.transform || '';
                                    vid.style.width = vid._prevStyles.width || '';
                                    vid.style.height = vid._prevStyles.height || '';
                                    vid.style.objectFit = vid._prevStyles.objectFit || '';
                                    delete vid._prevStyles;
                                }
                                fsBtn.innerText = '⇔';
                            } catch (e) { console.warn('[banner-news] collapse smart max failed', e); }
                            return;
                        }

                        // expand: save prev styles
                        try {
                            display._isSmartMax = true;
                            display._prevStyles = display._prevStyles || {
                                position: display.style.position || '',
                                left: display.style.left || '',
                                top: display.style.top || '',
                                width: display.style.width || '',
                                height: display.style.height || '',
                                zIndex: display.style.zIndex || '',
                                overflow: display.style.overflow || ''
                            };
                            vid._prevStyles = vid._prevStyles || {
                                position: vid.style.position || '',
                                left: vid.style.left || '',
                                top: vid.style.top || '',
                                transform: vid.style.transform || '',
                                width: vid.style.width || '',
                                height: vid.style.height || '',
                                objectFit: vid.style.objectFit || ''
                            };
                        } catch (e) { }

                        // Set display to cover canvas
                        try {
                            var canvas = document.querySelector('.canvas') || document.body;
                            if (canvas && getComputedStyle(canvas).position === 'static') canvas.style.position = 'relative';
                            display.style.position = 'absolute';
                            display.style.left = '0';
                            display.style.top = '0';
                            display.style.width = '100%';
                            display.style.height = '100%';
                            display.style.zIndex = '2147483640';
                            display.style.overflow = 'hidden';
                        } catch (e) { }

                        // Smart Cover sizing
                        try {
                            var boxW = display.clientWidth || display.offsetWidth;
                            var boxH = display.clientHeight || display.offsetHeight;
                            var vidW = vid.videoWidth || vid.clientWidth || 1280;
                            var vidH = vid.videoHeight || vid.clientHeight || 720;
                            var AR_video = vidW / vidH;
                            var AR_box = boxW / boxH;

                            var scale;
                            if (AR_box > AR_video) {
                                // box wider than video: scale by width
                                scale = boxW / vidW;
                            } else {
                                // scale by height
                                scale = boxH / vidH;
                            }
                            // ensure cover: if other dimension still smaller, increase
                            var coverScale = Math.max(boxW / vidW, boxH / vidH);
                            if (scale < coverScale) scale = coverScale;
                            // cap extreme upscale
                            if (scale > 1) scale = Math.min(scale, 1.12);

                            var finalW = Math.round(vidW * scale);
                            var finalH = Math.round(vidH * scale);

                            vid.style.position = 'absolute';
                            vid.style.left = '50%';
                            vid.style.top = '50%';
                            vid.style.transform = 'translate(-50%,-50%)';
                            vid.style.width = finalW + 'px';
                            vid.style.height = finalH + 'px';
                            vid.style.objectFit = 'none';
                            fsBtn.innerText = '⇒⇐';
                        } catch (e) { console.warn('[banner-news] smart cover sizing failed', e); }
                    } catch (e) {
                        console.warn('[banner-news] smart wide-toggle error', e);
                    }
                });
                // Picture-in-Picture removed per user preference (only 3 buttons required)
                // Browser fullscreen and wide-toggle will remain as requested.

                // PIP handler removed. Only three buttons remain: mute, wide-toggle, and browser fullscreen.

                overlay.appendChild(muteBtn);
                overlay.appendChild(fsBtn);
                // Removed browser fullscreen button and behavior per user request

                // Container styles: ensure display is positioned for overlay
                display.style.position = 'relative';
                display.style.overflow = 'visible';
                // overlay will be appended after the video is inserted. don't append now (innerHTML below will remove it)

                // Insert video into display (replace placeholder)
                display.innerHTML = '';
                // remove any previous overlay to avoid duplicates
                var existing = document.getElementById('banner-news-overlay');
                if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

                // ensure overlay has a stable id and forced visibility
                overlay.id = 'banner-news-overlay';
                overlay.style.zIndex = '2147483647';
                overlay.style.pointerEvents = 'auto';
                overlay.style.visibility = 'visible';

                display.appendChild(vid);
                display.appendChild(overlay);
                // Start with a random base (video1 or video2)
                var startBase = Math.floor(Math.random() * baseCandidates.length);
                tryPlayFromBase(startBase);

                // Fit mode toggle (cover / contain) via double-click on the video
                try {
                    // Read saved preference
                    var savedFit = null;
                    try { savedFit = localStorage.getItem('banner-news-fit'); } catch (e) { savedFit = null; }
                    if (savedFit === 'contain') vid.style.objectFit = 'contain';

                    function showHud(text) {
                        try {
                            var hId = 'banner-news-fit-hud';
                            var existingHud = document.getElementById(hId);
                            if (existingHud && existingHud.parentNode) existingHud.parentNode.removeChild(existingHud);
                            var hud = document.createElement('div');
                            hud.id = hId;
                            hud.style.position = 'absolute';
                            hud.style.left = '16px';
                            hud.style.top = '16px';
                            hud.style.padding = '8px 12px';
                            hud.style.background = 'rgba(0,0,0,0.6)';
                            hud.style.color = '#fff';
                            hud.style.borderRadius = '6px';
                            hud.style.fontSize = '13px';
                            hud.style.zIndex = '2147483650';
                            hud.innerText = text;
                            display.appendChild(hud);
                            setTimeout(function () { try { if (hud.parentNode) hud.parentNode.removeChild(hud); } catch (e) { } }, 1400);
                        } catch (e) { }
                    }

                    vid.addEventListener('dblclick', function () {
                        try {
                            var current = (vid.style.objectFit || getComputedStyle(vid).objectFit) || 'cover';
                            var next = current === 'cover' ? 'contain' : 'cover';
                            vid.style.objectFit = next;
                            try { localStorage.setItem('banner-news-fit', next); } catch (e) { }
                            showHud(next === 'cover' ? 'Fit: Cover' : 'Fit: Contain');
                        } catch (e) { }
                    });
                } catch (e) { }

                // Fullscreen behavior removed (no browser fullscreen button)
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
