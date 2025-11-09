// Shared countdown logic rewritten for legacy IE engine used by launcher
function startGlobalCountdown() {
    if (window.__globalCountdownStarted) return;
    if (!document.querySelectorAll) return; // very old engines, bail out gracefully
    window.__globalCountdownStarted = true;

    function pad(num) {
        return num < 10 ? '0' + num : String(num);
    }

    function getNow() {
        return typeof Date.now === 'function' ? Date.now() : new Date().getTime();
    }

    function tick() {
        var now = getNow();
        var nodes = document.querySelectorAll('[data-countdown]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var attr = el.getAttribute('data-countdown');
            if (!attr) continue;
            var target = parseInt(attr, 10);
            if (isNaN(target)) {
                target = new Date(attr).getTime();
            }
            var diff = target - now;
            if (isNaN(target) || diff <= 0) {
                el.innerHTML = '00:00:00';
                continue;
            }
            var h = Math.floor(diff / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            el.innerHTML = pad(h) + ':' + pad(m) + ':' + pad(s);
        }
    }

    tick();
    setInterval(tick, 1000);
}

// expose globally
window.startGlobalCountdown = startGlobalCountdown;
