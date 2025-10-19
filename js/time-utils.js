// Shared countdown logic
export function startGlobalCountdown() {
    if (window.__globalCountdownStarted) return;
    window.__globalCountdownStarted = true;
    function tick() {
        const now = Date.now();
        document.querySelectorAll('[data-countdown]').forEach(el => {
            const target = new Date(el.getAttribute('data-countdown')).getTime();
            const diff = target - now;
            if (diff <= 0) { el.textContent = '00:00:00'; return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        });
    }
    tick();
    setInterval(tick, 1000);
}
