import { rankingData } from './rankings-data.js';
// Attempt to fetch dynamic data from backend API if available
async function fetchRanking(panelId) {
    // Map panel IDs to API endpoints
    const endpointMap = {
        'top-players': 'characters',
        'top-guild': 'guilds',
        'top-boss': 'boss',
        'top-boss-guild': 'boss-guild',
        'top-loan-chien': 'loan-chien',
        'top-bc': 'bc',
        'top-dv': 'dv',
        'top-cc': 'cc'
    };

    const endpoint = endpointMap[panelId];
    if (!endpoint) return null;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        // Use production API endpoint - character.php for better data
        const apiUrl = `https://api.pkclear.com/character/top?limit=10`;
        const res = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });

        clearTimeout(timeout);

        if (!res.ok) {
            console.warn(`API request failed for ${panelId}:`, res.status);
            // Fallback to mock data
            return await fetchMockData();
        }

        const json = await res.json();

        if (!json.ok || !Array.isArray(json.items)) {
            console.warn(`Invalid API response for ${panelId}:`, json);
            // Fallback to mock data
            return await fetchMockData();
        }

        // Transform API data to match expected format
        return json.map(item => ({
            name: item.Name,
            level: item.cLevel,
            reset: item.Reset || 0,
            relife: item.Relife || 0,
            class: item.ClassName || 'Unknown',
            guild: item.GuildName || ''
        }));

    } catch (e) {
        console.warn(`Failed to fetch ranking for ${panelId}:`, e.message);
        // Fallback to mock data
        return await fetchMockData();
    }
}

// Fallback function to load mock data
async function fetchMockData() {
    try {
        const res = await fetch('mock-api-response.json');
        if (!res.ok) return null;
        const json = await res.json();
        return json.map(item => ({
            name: item.Name,
            level: item.cLevel,
            reset: item.Reset || 0,
            relife: item.Relife || 0,
            class: item.ClassName || 'Unknown',
            guild: item.GuildName || ''
        }));
    } catch (e) {
        console.warn('Failed to load mock data:', e.message);
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
                    cells = [row.name, row.level, row.reset, row.relife, row.class, row.guild || ''];
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
