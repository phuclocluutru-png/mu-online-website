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
                overlay.style.zIndex = '99999';

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
                    b.addEventListener('click', onClick);
                    // Hover styles
                    b.addEventListener('mouseenter', function () { b.style.transform = 'scale(1.06)'; b.style.background = 'rgba(0,0,0,0.6)'; });
                    b.addEventListener('mouseleave', function () { b.style.transform = 'none'; b.style.background = 'rgba(0,0,0,0.45)'; });
                    return b;
                }

                var muteBtn = makeBtn('🔈', 'Toggle mute', function () {
                    vid.muted = !vid.muted;
                    muteBtn.innerText = vid.muted ? '🔇' : '🔈';
                });

                // In-panel maximize: expand video display to fill the launcher's canvas area (not browser fullscreen)
                var fsBtn = makeBtn('⤢', 'Maximize in launcher', function () {
                    try {
                        var canvas = document.querySelector('.canvas') || document.body;
                        var isMax = display.classList.contains('banner-news--maximized');
                        if (isMax) {
                            // revert
                            display.classList.remove('banner-news--maximized');
                            display.style.position = '';
                            display.style.left = '';
                            display.style.top = '';
                            display.style.width = '';
                            display.style.height = '';
                            display.style.zIndex = '';
                            vid.style.objectFit = 'cover';
                            fsBtn.innerText = '⤢';
                        } else {
                            // ensure canvas is positioned for absolute children
                            if (canvas && getComputedStyle(canvas).position === 'static') {
                                canvas.style.position = 'relative';
                            }
                            display.classList.add('banner-news--maximized');
                            display.style.position = 'absolute';
                            display.style.left = '0';
                            display.style.top = '0';
                            display.style.width = '100%';
                            display.style.height = '100%';
                            display.style.zIndex = '2147483640';
                            vid.style.width = '100%';
                            vid.style.height = '100%';
                            vid.style.objectFit = 'cover';
                            fsBtn.innerText = '❐';
                        }
                    } catch (e) {
                        console.warn('[banner-news] in-panel maximize error', e);
                    }
                });

                var pipBtn = makeBtn('⧉', 'Picture-in-Picture', function () {
                    try {
                        // Standard PIP (Chrome, Edge)
                        if (vid.requestPictureInPicture) {
                            // Some browsers require the video to be playing and not muted restrictions may apply
                            var ensurePlay = Promise.resolve();
                            if (vid.paused) {
                                ensurePlay = vid.play().catch(function (e) { console.warn('[banner-news] play before PIP failed', e); });
                            }
                            ensurePlay.then(function () {
                                // If already in PIP, exit
                                if (document.pictureInPictureElement) {
                                    document.exitPictureInPicture().catch(function (e) { console.warn('[banner-news] exit PIP failed', e); });
                                    return;
                                }
                                vid.requestPictureInPicture().catch(function (e) { console.warn('[banner-news] request PIP failed', e); });
                            });
                            return;
                        }

                        // WebKit Safari fallback
                        if (typeof vid.webkitSupportsPresentationMode === 'function' && vid.webkitSupportsPresentationMode('picture-in-picture')) {
                            try {
                                vid.webkitSetPresentationMode('picture-in-picture');
                            } catch (e) {
                                console.warn('[banner-news] webkit PIP failed', e);
                            }
                            return;
                        }

                        console.warn('[banner-news] Picture-in-Picture not supported in this environment');
                        // Fallback: open a small popup window with the same video so user can keep watching
                        try {
                            var currentSrc = (vid.currentSrc && vid.currentSrc.length) ? vid.currentSrc : (vid.querySelector('source') ? vid.querySelector('source').src : null);
                            if (currentSrc) {
                                var w = window.open('', 'pkclear_pip_fallback', 'width=640,height=360');
                                if (w) {
                                    var doc = w.document;
                                    doc.open();
                                    doc.write('<!doctype html><html><head><title>Video</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">');
                                    doc.write('<video src="' + currentSrc + '" style="width:100%;height:100%;max-width:100%;max-height:100%;" controls autoplay></video>');
                                    doc.write('</body></html>');
                                    doc.close();
                                } else {
                                    console.warn('[banner-news] popup blocked or unavailable for PIP fallback');
                                }
                            } else {
                                console.warn('[banner-news] no currentSrc available for PIP fallback');
                            }
                        } catch (e) {
                            console.warn('[banner-news] PIP popup fallback failed', e);
                        }
                    } catch (e) {
                        console.warn('[banner-news] PIP handler error', e);
                    }
                });

                overlay.appendChild(muteBtn);
                overlay.appendChild(fsBtn);
                overlay.appendChild(pipBtn);

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

                // Ensure fullscreen fills viewport: some browsers keep element sizing and cause letterboxing.
                function onFullscreenChange() {
                    var fsElem = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                    var isFs = fsElem === display;
                    if (isFs) {
                        // Force the container and video to match viewport
                        try {
                            display.style.width = '100vw';
                            display.style.height = '100vh';
                            display.style.left = '0';
                            display.style.top = '0';
                            vid.style.width = '100%';
                            vid.style.height = '100%';
                            vid.style.objectFit = 'cover';
                        } catch (e) {
                            console.warn('[banner-news] fullscreen style apply failed', e);
                        }
                    } else {
                        // Revert to original sizing rules
                        display.style.width = '';
                        display.style.height = '';
                        display.style.left = '';
                        display.style.top = '';
                        vid.style.width = '';
                        vid.style.height = '';
                        vid.style.objectFit = 'cover';
                    }
                }

                document.addEventListener('fullscreenchange', onFullscreenChange);
                document.addEventListener('webkitfullscreenchange', onFullscreenChange);
                document.addEventListener('mozfullscreenchange', onFullscreenChange);
                document.addEventListener('MSFullscreenChange', onFullscreenChange);
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
