import { eventDrops, eventWcoinReward, formatWcoin } from './event-drops.js';
import { eventSchedule } from './events-data.js';
import { startGlobalCountdown } from './time-utils.js';

// Global helpers
function computeNextStart(times, nowTs = Date.now()) {
    const candidates = times.map(t => {
        const [h, m] = t.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        // Only push to tomorrow if start < current (strict)
        if (d.getTime() < nowTs) d.setDate(d.getDate() + 1);
        return d.getTime();
    });
    const next = candidates.sort((a, b) => a - b)[0];
    return new Date(next).toISOString();
}

function computeActiveWindow(info, nowTs = Date.now()) {
    const durMs = (info.duration || 0) * 60000;
    let found = null;
    info.times.forEach(t => {
        const [h, m] = t.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        const start = d.getTime();
        const end = start + durMs;
        if (nowTs >= start && nowTs < end) {
            // If multiple overlapping (unlikely) pick earliest end
            if (!found || end < found.endTime) found = { startTime: start, endTime: end };
        }
    });
    return found; // null if not active
}

export function initEvents() {
    const list = document.querySelector('.events__list');
    if (!list) return;
    if (list.dataset.rendered) return;
    const frag = document.createDocumentFragment();
    Object.entries(eventSchedule).forEach(([name, info]) => {
        const times = info.times;
        const li = document.createElement('li');
        li.className = 'event';
        const activeWin = computeActiveWindow(info);
        const upcomingISO = activeWin ? new Date(activeWin.endTime).toISOString() : computeNextStart(times);
        li.setAttribute('data-event-name', name);
        li.setAttribute('data-duration', info.duration);
        if (activeWin) li.setAttribute('data-active-start', new Date(activeWin.startTime).toISOString());
        li.innerHTML = `
            <span class="event__name">${name}</span>
            <span class="event__countdown" data-countdown="${upcomingISO}">--:--:--</span>
            <span class="event__status">${activeWin ? 'Đang diễn ra' : 'Chờ đến giờ'}</span>
        `;
        frag.appendChild(li);
    });
    list.appendChild(frag);
    list.dataset.rendered = 'true';
    initEventTooltip();
    startGlobalCountdown();
}

function initEventTooltip() {
    const list = document.querySelector('.events__list');
    const popup = document.getElementById('event-times-pop');
    if (!list || !popup) return;
    function buildHTML(name, info) {
        if (!info || !info.times || !info.times.length) return `<div class='event-times-pop__title'>${name}</div><p style='margin:0;font-size:0.7rem;opacity:.7'>Chưa có giờ.</p>`;
        const drops = eventDrops[name];
        const reward = eventWcoinReward[name];
        const dropsHTML = drops && drops.length ? `
            <div class='event-times-pop__dropsTitle'>Drop</div>
            <ul class='event-times-pop__drops'>${drops.map(d => `<li><img src='images/${d.img}' alt='${d.name}'/><span>${d.name}</span></li>`).join('')}</ul>
        ` : '';
        const wcoinHTML = reward ? `<div class='event-times-pop__reward is-bottom'><img src='images/Wcoin.png' alt='Wcoin' class='event-times-pop__rewardIcon big'/><span class='event-times-pop__rewardVal'>${formatWcoin(reward)} Wcoin</span></div>` : '';
        const mapHTML = info.map ? `<div class='event-times-pop__meta'><span class='event-times-pop__metaLabel'>MAP:</span> <span class='event-times-pop__metaValue'>${info.map}</span></div>` : '';
        const noteHTML = info.note ? `<div class='event-times-pop__note'>${info.note}</div>` : '';
        return `<div class='event-times-pop__title'>${name} <span style='font-weight:600;font-size:0.65rem;opacity:.7'>(~${info.duration}p)</span></div>${mapHTML}${noteHTML}<ul class='event-times-pop__list'>${info.times.map(t => `<li>${t}</li>`).join('')}</ul>${dropsHTML}${wcoinHTML}`;
    }
    function show(li, evt) {
        const name = li.querySelector('.event__name').textContent.trim();
        popup.innerHTML = buildHTML(name, eventSchedule[name]);
        popup.classList.add('is-visible');
        positionNearCursor(evt);
    }
    function hide() { popup.classList.remove('is-visible'); }
    function positionNearCursor(evt) {
        if (!popup.classList.contains('is-visible')) return;
        const offsetX = 4; // dịch nhẹ để không che đúng đầu mũi tên
        const offsetY = 6;
        let x = evt.clientX + offsetX;
        let y = evt.clientY + offsetY;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pw = popup.offsetWidth;
        const ph = popup.offsetHeight;
        // nếu tràn phải/bên dưới thì đẩy ngược lại
        if (x + pw + 8 > vw) x = vw - pw - 8;
        if (y + ph + 8 > vh) y = vh - ph - 8;
        // tránh âm
        if (x < 4) x = 4;
        if (y < 4) y = 4;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
    }
    list.addEventListener('mouseover', e => { const li = e.target.closest('.event'); if (li) show(li, e); });
    list.addEventListener('mousemove', e => { const li = e.target.closest('.event'); if (li) positionNearCursor(e); });
    list.addEventListener('mouseout', e => { const li = e.target.closest('.event'); if (li) hide(); });
    list.addEventListener('click', e => { const li = e.target.closest('.event'); if (!li) return; if (popup.classList.contains('is-visible')) { hide(); } else { show(li, e); } });
    document.addEventListener('click', e => { if (!popup.classList.contains('is-visible')) return; if (!e.target.closest('.event') && !e.target.closest('#event-times-pop')) hide(); });
}

// Countdown & status + sort logic (active shows remaining time)
function updateEventsLoop() {
    const now = Date.now();
    const active = [];
    const upcoming = [];
    document.querySelectorAll('.event').forEach(li => {
        const statusEl = li.querySelector('.event__status');
        const countdownEl = li.querySelector('[data-countdown]');
        if (!statusEl || !countdownEl) return;
        const durationMin = parseInt(li.getAttribute('data-duration'), 10) || 0;
        const target = new Date(countdownEl.getAttribute('data-countdown')).getTime();
        const activeStartAttr = li.getAttribute('data-active-start');
        if (activeStartAttr) {
            // currently active; target is end time
            const endTime = target;
            const remaining = endTime - now;
            if (remaining <= 0) {
                // switch to upcoming next cycle
                li.removeAttribute('data-active-start');
                const name = li.getAttribute('data-event-name');
                const info = eventSchedule[name];
                if (info) {
                    const nextStartISO = computeNextStart(info.times, now);
                    countdownEl.setAttribute('data-countdown', nextStartISO);
                    statusEl.textContent = 'Chuẩn bị';
                    statusEl.classList.remove('is-active');
                }
            } else {
                // show remaining time
                const hours = Math.floor(remaining / 3600000);
                const mins = Math.floor((remaining % 3600000) / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                statusEl.textContent = 'Đang diễn ra';
                statusEl.classList.add('is-active');
                active.push({ li, remaining });
            }
        } else {
            // upcoming; target is start time
            const startTime = target;
            const untilStart = startTime - now;
            if (untilStart <= 0) {
                // become active
                const endTime = startTime + durationMin * 60000;
                li.setAttribute('data-active-start', new Date(startTime).toISOString());
                countdownEl.setAttribute('data-countdown', new Date(endTime).toISOString());
                statusEl.textContent = 'Đang diễn ra';
                statusEl.classList.add('is-active');
                active.push({ li, remaining: endTime - now });
                // update displayed remaining immediately
                const hours = Math.floor((endTime - now) / 3600000);
                const mins = Math.floor(((endTime - now) % 3600000) / 60000);
                const secs = Math.floor(((endTime - now) % 60000) / 1000);
                countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            } else {
                const hours = Math.floor(untilStart / 3600000);
                const mins = Math.floor((untilStart % 3600000) / 60000);
                const secs = Math.floor((untilStart % 60000) / 1000);
                countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                // Status logic: <=10 phút => Sắp diễn ra, còn lại Chờ đến giờ
                if (untilStart <= 10 * 60000) {
                    statusEl.textContent = 'Sắp diễn ra';
                    statusEl.classList.add('is-soon');
                } else {
                    statusEl.textContent = 'Chờ đến giờ';
                    statusEl.classList.remove('is-soon');
                }
                statusEl.classList.remove('is-active');
                upcoming.push({ li, untilStart });
            }
        }
    });
    // Sort & reorder DOM: active first (shortest remaining first), then upcoming (nearest start first)
    active.sort((a, b) => a.remaining - b.remaining);
    upcoming.sort((a, b) => a.untilStart - b.untilStart);
    const list = document.querySelector('.events__list');
    if (list) {
        const all = [...active, ...upcoming];
        all.forEach(obj => list.appendChild(obj.li));
    }
}

setInterval(updateEventsLoop, 1000);
