import { rankingData } from './rankings-data.js';
// Attempt to fetch dynamic data from backend API if available
async function fetchRanking(panelId) {
    const map = {
        'top-players': 'top-players',
        'top-guild': 'top-guild',
        'top-boss': 'top-boss',
        'top-boss-guild': 'top-guild', // hiện chưa có bảng riêng boss-guild, reuse guild or create later
        'top-loan-chien': 'top-loan-chien',
        'top-bc': 'top-bc',
        'top-dv': 'top-dv',
        'top-cc': 'top-cc'
        // có thể thêm 'top-reset', 'top-sinh-ton', 'top-tvt' nếu tạo tab giao diện
    };
    const endpoint = map[panelId];
    if (!endpoint) return null;
    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000); // 4s timeout
        const res = await fetch(`/api/rankings/${endpoint}`, { signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) return null;
        const json = await res.json();
        if (!Array.isArray(json) || !json.length) return json; // may be empty array
        return json;
    } catch (e) {
        // Silent fallback
        return null;
    }
}
export function initRankings() {
    const tabs = document.querySelectorAll('.rankings__tab');
    const panels = document.querySelectorAll('.rankings__panel');
    const indicator = document.querySelector('.rankings__tab-indicator');
    if (!tabs.length || !panels.length) return;
    function moveIndicator(activeTab) {
        if (!indicator || !activeTab) return;
        const rect = activeTab.getBoundingClientRect();
        const parentRect = activeTab.parentElement.getBoundingClientRect();
        indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
        indicator.style.width = rect.width + 'px';
    }
    async function renderPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const tbody = panel.querySelector('tbody');
        if (!tbody) return;
        let data = rankingData[panelId];
        const apiData = await fetchRanking(panelId);
        if (apiData) {
            data = apiData;
        }
        if (!data) return;
        tbody.innerHTML = '';
        const frag = document.createDocumentFragment();
        data.forEach(row => {
            const tr = document.createElement('tr');
            let cells = [];
            switch (panelId) {
                case 'top-players':
                    cells = [row.name, row.level, row.reset, row.relife, row.cls, `<img src="${row.guildLogo}" alt="Guild" class="guild-logo">`];
                    break;
                case 'top-guild':
                    cells = [`<img src="${row.logo}" alt="Guild" class="guild-logo">`, row.name, row.owner, row.members];
                    break;
                case 'top-boss':
                    cells = [row.name, row.points, `<img src="${row.guildLogo}" alt="Guild" class="guild-logo">`];
                    break;
                case 'top-boss-guild':
                    cells = [`<img src="${row.logo}" alt="Guild" class="guild-logo">`, row.name, row.owner, row.boss, row.star];
                    break;
                case 'top-loan-chien':
                case 'top-bc':
                case 'top-dv':
                case 'top-cc':
                    cells = [row.name, row.score, row.guild, `<img src="${row.guildLogo}" alt="Guild" class="guild-logo">`];
                    break;
            }
            cells.forEach(html => {
                const td = document.createElement('td');
                td.innerHTML = html;
                tr.appendChild(td);
            });
            frag.appendChild(tr);
        });
        tbody.appendChild(frag);
    }
    // Initial render (async)
    renderPanel('top-players');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('is-active')) return;
            tabs.forEach(t => t.classList.remove('is-active'));
            panels.forEach(p => p.classList.remove('is-visible'));
            tab.classList.add('is-active');
            const targetId = tab.getAttribute('data-target');
            renderPanel(targetId);
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('is-visible');
            moveIndicator(tab);
        });
    });
    moveIndicator(document.querySelector('.rankings__tab.is-active'));
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.rankings__tab.is-active')));
}
