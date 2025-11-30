// Legacy ES5 version (removed ES module imports)
// Assumes eventSchedule & startGlobalCountdown already loaded globally.

// Minimal polyfills for legacy IE engine used by launcher control
if (typeof Date.now !== 'function') {
    Date.now = function () { return new Date().getTime(); };
}

function matchesSelectorLegacy(el, selector) {
    if (!el || el.nodeType !== 1) return false;
    var proto = el.matches || el.matchesSelector || el.msMatchesSelector || el.webkitMatchesSelector;
    if (proto) return proto.call(el, selector);
    if (selector.charAt(0) === '.') {
        var cls = selector.substr(1);
        return (' ' + (el.className || '') + ' ').indexOf(' ' + cls + ' ') !== -1;
    }
    if (selector.charAt(0) === '#') {
        return el.id === selector.substr(1);
    }
    return el.tagName && el.tagName.toLowerCase() === selector.toLowerCase();
}

function closestLegacy(el, selector) {
    while (el && el !== document) {
        if (matchesSelectorLegacy(el, selector)) return el;
        el = el.parentElement || el.parentNode;
    }
    return null;
}

// Global helpers
function computeNextStart(times, nowTs) {
    if (!nowTs) nowTs = Date.now();
    var candidates = [];
    for (var i = 0; i < times.length; i++) {
        var parts = times[i].split(':');
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10);
        var d = new Date();
        d.setHours(h, m, 0, 0);
        if (d.getTime() < nowTs) d.setDate(d.getDate() + 1);
        candidates.push(d.getTime());
    }
    candidates.sort(function (a, b) { return a - b; });
    var next = candidates[0];
    return next;
}

function computeActiveWindow(info, nowTs) {
    if (!nowTs) nowTs = Date.now();
    var durMs = (info.duration || 0) * 60000;
    var found = null;
    for (var i = 0; i < info.times.length; i++) {
        var parts = info.times[i].split(':');
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10);
        var d = new Date();
        d.setHours(h, m, 0, 0);
        var start = d.getTime();
        var end = start + durMs;
        if (nowTs >= start && nowTs < end) {
            if (!found || end < found.endTime) found = { startTime: start, endTime: end };
        }
    }
    return found;
}

function initEvents() {
    if (!document.querySelector) return;
    var list = document.querySelector('.events__list');
    if (!list || list.getAttribute('data-rendered')) return;
    var frag = document.createDocumentFragment ? document.createDocumentFragment() : null;
    for (var name in eventSchedule) {
        if (!eventSchedule.hasOwnProperty(name)) continue;
        var info = eventSchedule[name];
        var times = info.times;
        var li = document.createElement('li');
        li.className = 'event';
        var activeWin = computeActiveWindow(info);
        var countdownValue = activeWin ? activeWin.endTime : computeNextStart(times);
        li.setAttribute('data-event-name', name);
        li.setAttribute('data-duration', info.duration);
        if (activeWin) li.setAttribute('data-active-start', String(activeWin.startTime));
        var html = '' +
            '<span class="event__name">' + name + '</span>' +
            '<span class="event__countdown" data-countdown="' + countdownValue + '">--:--:--</span>' +
            '<span class="event__status">' + (activeWin ? 'Đang diễn ra' : 'Chờ đến giờ') + '</span>';
        li.innerHTML = html;
        if (activeWin) { li.className += ' event--running'; }
        if (frag) {
            frag.appendChild(li);
        } else {
            list.appendChild(li);
        }
    }
    if (frag) list.appendChild(frag);
    list.setAttribute('data-rendered', 'true');
    initEventTooltip();
    if (typeof startGlobalCountdown === 'function') startGlobalCountdown();
}

function initEventTooltip() {
    var list = document.querySelector('.events__list');
    var popup = document.getElementById('event-times-pop');
    if (!list || !popup) return;
    function buildHTML(name, info) {
        if (!info) return '<div class="event-times-pop__title">' + name + '</div><p class="event-times-pop__empty">Chưa có dữ liệu cho sự kiện này.</p>';
        var mapHTML = info.map ? '<div class="event-times-pop__meta"><span class="event-times-pop__metaLabel">MAP:</span> <span class="event-times-pop__metaValue">' + info.map + '</span></div>' : '';
        var noteHTML = info.note ? '<div class="event-times-pop__note">' + info.note + '</div>' : '';
        var listHTML = '<div class="event-times-pop__section"><div class="event-times-pop__sectionTitle">Khung giờ</div>';
        if (info.times && info.times.length) {
            listHTML += '<ul class="event-times-pop__list event-times-pop__list--grid">';
            for (var tIndex = 0; tIndex < info.times.length; tIndex++) {
                listHTML += '<li>' + info.times[tIndex] + '</li>';
            }
            listHTML += '</ul>';
        } else {
            listHTML += '<ul class="event-times-pop__list"><li class="event-times-pop__fallback">Chưa cập nhật</li></ul>';
        }
        listHTML += '</div>';

        var drops = (typeof eventDrops !== 'undefined' && eventDrops && eventDrops[name]) ? eventDrops[name] : null;
        var dropsHTML = '';
        if (drops && drops.length) {
            dropsHTML = '<div class="event-times-pop__section"><div class="event-times-pop__sectionTitle">Vật phẩm rơi</div><ul class="event-times-pop__drops event-times-pop__drops--grid">';
            for (var dIndex = 0; dIndex < drops.length; dIndex++) {
                var drop = drops[dIndex];
                var imgSrc = drop && drop.img ? 'images/' + drop.img : '';
                dropsHTML += '<li class="event-times-pop__drop">';
                if (imgSrc) {
                    dropsHTML += '<span class="event-times-pop__dropThumb"><img src="' + imgSrc + '" alt="' + drop.name + '"></span>';
                }
                dropsHTML += '<span class="event-times-pop__dropName">' + drop.name + '</span></li>';
            }
            dropsHTML += '</ul></div>';
        }

        var rewardVal = (typeof eventWcoinReward !== 'undefined' && eventWcoinReward) ? eventWcoinReward[name] : null;
        var formatFn = (typeof formatWcoin === 'function') ? formatWcoin : function (value) {
            var num = Number(value);
            if (isNaN(num)) return String(value);
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        };
        var rewardHTML = rewardVal ? '<div class="event-times-pop__section event-times-pop__reward">Thưởng: <span class="event-times-pop__rewardValue">' + formatFn(rewardVal) + ' Wcoin</span></div>' : '';

        return '<div class="event-times-pop__title">' + name + ' <span class="event-times-pop__duration">(~' + info.duration + ' phút)</span></div>' + mapHTML + noteHTML + listHTML + dropsHTML + rewardHTML;
    }
    function show(li, evt) {
        var name = li.querySelector('.event__name').innerHTML;
        popup.innerHTML = buildHTML(name, eventSchedule[name]);
        popup.className = 'event-times-pop is-visible';
        positionNearCursor(evt);
    }
    function hide() { popup.className = 'event-times-pop'; }
    function positionNearCursor(evt) {
        if (popup.className.indexOf('is-visible') === -1) return;
        var offsetX = 4;
        var offsetY = 6;
        var baseX = typeof evt.clientX === 'number' ? evt.clientX : 0;
        var baseY = typeof evt.clientY === 'number' ? evt.clientY : 0;
        var x = baseX + offsetX;
        var y = baseY + offsetY;
        var docEl = document.documentElement || document.body;
        var vw = window.innerWidth || (docEl ? docEl.clientWidth : 0);
        var vh = window.innerHeight || (docEl ? docEl.clientHeight : 0);
        var pw = popup.offsetWidth;
        var ph = popup.offsetHeight;
        if (x + pw + 8 > vw) x = vw - pw - 8;
        if (y + ph + 8 > vh) y = vh - ph - 8;
        if (x < 4) x = 4;
        if (y < 4) y = 4;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
    }
    list.onmouseover = function (e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var li = closestLegacy(target, '.event');
        if (li) show(li, e);
    };
    list.onmousemove = function (e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var li = closestLegacy(target, '.event');
        if (li) positionNearCursor(e);
    };
    list.onmouseout = function (e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var li = closestLegacy(target, '.event');
        if (li) hide();
    };
    list.onclick = function (e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var li = closestLegacy(target, '.event');
        if (!li) return;
        if (popup.className.indexOf('is-visible') !== -1) {
            hide();
        } else {
            show(li, e);
        }
    };
    document.onclick = function (e) {
        e = e || window.event;
        if (popup.className.indexOf('is-visible') === -1) return;
        var target = e.target || e.srcElement;
        var isEvent = closestLegacy(target, '.event');
        var isPopup = closestLegacy(target, '#event-times-pop');
        if (!isEvent && !isPopup) hide();
    };
}

// Countdown & status + sort logic (active shows remaining time)
function updateEventsLoop() {
    if (!document.querySelectorAll) return;
    var now = Date.now();
    var active = [];
    var upcoming = [];
    var nodes = document.querySelectorAll('.event');
    for (var i = 0; i < nodes.length; i++) {
        var li = nodes[i];
        var statusEl = li.querySelector ? li.querySelector('.event__status') : null;
        var countdownEl = li.querySelector ? li.querySelector('[data-countdown]') : null;
        if (!statusEl || !countdownEl) continue;
        var durationMin = parseInt(li.getAttribute('data-duration'), 10) || 0;
        var attrVal = countdownEl.getAttribute('data-countdown');
        var target = parseInt(attrVal, 10);
        if (isNaN(target)) {
            target = new Date(attrVal).getTime();
        }
        var activeStartAttr = li.getAttribute('data-active-start');
        if (activeStartAttr) {
            var endTime = target;
            var remaining = endTime - now;
            if (remaining <= 0) {
                li.removeAttribute('data-active-start');
                var name = li.getAttribute('data-event-name');
                var info = eventSchedule[name];
                if (info) {
                    var nextStartISO = computeNextStart(info.times, now);
                    countdownEl.setAttribute('data-countdown', String(nextStartISO));
                    statusEl.innerHTML = 'Ch? ??n gi?';
                    statusEl.className = statusEl.className.replace(' is-active', '').replace(' is-soon', '');
                    li.className = li.className.replace(' event--running', '');
                }
            } else {
                var hours = Math.floor(remaining / 3600000);
                var mins = Math.floor((remaining % 3600000) / 60000);
                var secs = Math.floor((remaining % 60000) / 1000);
                countdownEl.innerHTML = (hours < 10 ? '0' + hours : hours) + ':' + (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
                statusEl.innerHTML = 'Đang diễn ra';
                if (statusEl.className.indexOf('is-active') === -1) statusEl.className += ' is-active';
                if (li.className.indexOf('event--running') === -1) li.className += ' event--running';
                active.push({ li: li, remaining: remaining });
            }
        } else {
            var startTime = target;
            var untilStart = startTime - now;
            if (untilStart <= 0) {
                var endTime2 = startTime + durationMin * 60000;
                li.setAttribute('data-active-start', String(startTime));
                countdownEl.setAttribute('data-countdown', String(endTime2));
                statusEl.innerHTML = 'Đang diễn ra';
                if (statusEl.className.indexOf('is-active') === -1) statusEl.className += ' is-active';
                if (li.className.indexOf('event--running') === -1) li.className += ' event--running';
                active.push({ li: li, remaining: endTime2 - now });
                var hours2 = Math.floor((endTime2 - now) / 3600000);
                var mins2 = Math.floor(((endTime2 - now) % 3600000) / 60000);
                var secs2 = Math.floor(((endTime2 - now) % 60000) / 1000);
                countdownEl.innerHTML = (hours2 < 10 ? '0' + hours2 : hours2) + ':' + (mins2 < 10 ? '0' + mins2 : mins2) + ':' + (secs2 < 10 ? '0' + secs2 : secs2);
            } else {
                var hours3 = Math.floor(untilStart / 3600000);
                var mins3 = Math.floor((untilStart % 3600000) / 60000);
                var secs3 = Math.floor((untilStart % 60000) / 1000);
                countdownEl.innerHTML = (hours3 < 10 ? '0' + hours3 : hours3) + ':' + (mins3 < 10 ? '0' + mins3 : mins3) + ':' + (secs3 < 10 ? '0' + secs3 : secs3);
                if (untilStart <= 10 * 60000) {
                    statusEl.innerHTML = 'Sắp diễn ra';
                    if (statusEl.className.indexOf('is-soon') === -1) statusEl.className += ' is-soon';
                } else {
                    statusEl.innerHTML = 'Chờ đến giờ';
                    statusEl.className = statusEl.className.replace(' is-soon', '');
                }
                statusEl.className = statusEl.className.replace(' is-active', '');
                li.className = li.className.replace(' event--running', '');
                upcoming.push({ li: li, untilStart: untilStart });
            }
        }
    }
    active.sort(function (a, b) { return a.remaining - b.remaining; });
    upcoming.sort(function (a, b) { return a.untilStart - b.untilStart; });
    var list = document.querySelector('.events__list');
    if (list) {
        var all = active.concat(upcoming);
        for (var j = 0; j < all.length; j++) list.appendChild(all[j].li);
    }
}
setInterval(updateEventsLoop, 1000);

// expose global init for inline call
window.initEvents = initEvents;
