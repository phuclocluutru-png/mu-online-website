import { rankingData } from './rankings-data.js';

// Guild logo rendering utilities
const GUILD_PALETTE = {
    "0": "transparent", "1": "#000000", "2": "#8c8a8d", "3": "#ffffff",
    "4": "#fe0000", "5": "#ff8a00", "6": "#ffff00", "7": "#8cff01",
    "8": "#00ff00", "9": "#01ff8d", "a": "#00ffff", "b": "#008aff",
    "c": "#0000fe", "d": "#8c00ff", "e": "#ff00fe", "f": "#ff008c",
};

// Season 6 Class mapping (7 basic classes with short names)
const SEASON6_CLASS_MAP = {
    // Dark Wizard family
    0: 'DW', 1: 'DW', 2: 'DW',
    // Dark Knight family
    16: 'DK', 17: 'DK', 18: 'DK',
    // Elf family
    32: 'ELF', 33: 'ELF', 34: 'ELF',
    // Magic Gladiator family
    48: 'MG', 49: 'MG',
    // Dark Lord family
    64: 'DL', 65: 'DL', 66: 'DL',
    // Summoner family
    80: 'SUM', 81: 'SUM', 82: 'SUM',
    // Rage Fighter family
    96: 'RF', 97: 'RF'
};

// Full class name to short name mapping
const FULL_TO_SHORT_CLASS_MAP = {
    'Dark Wizard': 'DW', 'Soul Master': 'DW', 'Grand Master': 'DW',
    'Dark Knight': 'DK', 'Blade Knight': 'DK', 'Blade Master': 'DK',
    'Fairy Elf': 'ELF', 'Muse Elf': 'ELF', 'High Elf': 'ELF',
    'Elf': 'ELF', // Also handle generic "Elf"
    'Magic Gladiator': 'MG', 'Duel Master': 'MG',
    'Dark Lord': 'DL', 'Lord Emperor': 'DL',
    'Summoner': 'SUM', 'Bloody Summoner': 'SUM', 'Dimension Master': 'SUM',
    'Rage Fighter': 'RF', 'Fist Master': 'RF'
};

// Function to format numbers with thousand separators (dots)
function formatNumber(num) {
    if (num === null || num === undefined || num === '') return '';
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num.toString();
    return number.toLocaleString('vi-VN').replace(/,/g, '.');
}

function getClassName(classNumber) {
    if (typeof classNumber === 'string') {
        // If it's already a proper class name, check if we have a short version
        if (classNumber && !classNumber.startsWith('Class ')) {
            // Check if we have a short name mapping for this full name
            if (FULL_TO_SHORT_CLASS_MAP[classNumber]) {
                return FULL_TO_SHORT_CLASS_MAP[classNumber];
            }
            return classNumber; // Return as-is if no mapping found
        }
        // Try to parse "Class X" format
        const num = parseInt(classNumber.replace('Class ', ''));
        if (!isNaN(num)) {
            classNumber = num;
        } else {
            return classNumber; // Return as-is if can't parse
        }
    }

    // Check direct mapping first
    if (SEASON6_CLASS_MAP[classNumber]) {
        return SEASON6_CLASS_MAP[classNumber];
    }

    // For unknown classes, try to map to closest family
    if (classNumber >= 0 && classNumber < 16) return 'DW';
    if (classNumber >= 16 && classNumber < 32) return 'DK';
    if (classNumber >= 32 && classNumber < 48) return 'ELF';
    if (classNumber >= 48 && classNumber < 64) return 'MG';
    if (classNumber >= 64 && classNumber < 80) return 'DL';
    if (classNumber >= 80 && classNumber < 96) return 'SUM';
    if (classNumber >= 96) return 'RF';

    return `Unknown Class (${classNumber})`;
} function normalizeGuildHex(hexStr) {
    if (!hexStr) return '';
    hexStr = hexStr.trim();
    if (hexStr.startsWith('0x') || hexStr.startsWith('0X')) {
        hexStr = hexStr.slice(2);
    }
    return hexStr.toLowerCase();
}

function isValidGuildHex(hexStr) {
    const normalized = normalizeGuildHex(hexStr);
    const isValid = /^[0-9a-f]{64}$/.test(normalized);
    console.log('Guild hex validation:', {
        original: hexStr,
        originalLength: hexStr ? hexStr.length : 0,
        normalized: normalized,
        normalizedLength: normalized.length,
        isValid: isValid
    });
    return isValid;
}

function renderGuildLogo(hexStr, size = 32) {
    const normalized = normalizeGuildHex(hexStr);
    console.log('Rendering guild logo:', { original: hexStr, normalized, isValid: isValidGuildHex(normalized) });

    if (!isValidGuildHex(normalized)) {
        console.warn('Invalid guild hex data:', hexStr);
        return '<div class="guild-logo-placeholder">-</div>';
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tileSize = Math.max(1, Math.floor(size / 8)); // Ensure minimum 1px per tile
    const canvasSize = 8 * tileSize;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const cells = normalized.split('');
    cells.forEach((hexChar, index) => {
        const x = (index % 8) * tileSize;
        const y = Math.floor(index / 8) * tileSize;
        const color = GUILD_PALETTE[hexChar];

        if (color && color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    });

    return `<img src="${canvas.toDataURL('image/png')}" alt="Guild Logo" class="guild-logo" style="width: ${size}px; height: ${size}px;" />`;
}

// Attempt to fetch dynamic data from backend API if available
async function fetchRanking(panelId) {
    // Determine if we're in production (GitHub Pages or pkclear.com)
    const isProduction = window.location.hostname.includes('github.io') ||
        window.location.hostname === 'pkclear.com';

    // Map panel IDs to API endpoints
    const endpointMap = {
        'top-players': 'characters',
        'top-guild': 'guilds',
        'top-boss': 'topboss',
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
        const timeout = setTimeout(() => controller.abort(), isProduction ? 5000 : 2000); // Shorter timeout in dev

        // Use production API endpoint
        let apiUrl;
        if (panelId === 'top-players') {
            apiUrl = `https://api.pkclear.com/character/top?limit=5`;
        } else if (panelId === 'top-guild') {
            apiUrl = `https://api.pkclear.com/guild/top?limit=5`;
        } else if (panelId === 'top-boss') {
            apiUrl = `https://api.pkclear.com/topboss?limit=5`;
        } else if (panelId === 'top-boss-guild') {
            apiUrl = `https://api.pkclear.com/topbossguild?limit=5`;
        } else if (panelId === 'top-loan-chien') {
            apiUrl = `https://api.pkclear.com/loan-chien?limit=5`;
        } else if (panelId === 'top-bc') {
            apiUrl = `https://api.pkclear.com/bc?limit=5`;
        } else if (panelId === 'top-dv') {
            apiUrl = `https://api.pkclear.com/dv?limit=5`;
        } else if (panelId === 'top-cc') {
            apiUrl = `https://api.pkclear.com/cc?limit=5`;
        } else {
            // For other endpoints, fallback to mock data
            return await fetchMockData(panelId);
        }
        const res = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });

        clearTimeout(timeout);

        if (!res.ok) {
            console.warn(`API request failed for ${panelId}:`, res.status);
            // For main ranking panels, fallback to mock data
            if (['top-players', 'top-guild', 'top-boss', 'top-loan-chien', 'top-bc', 'top-dv', 'top-cc'].includes(panelId)) {
                return await fetchMockData(panelId);
            }
            // For top-boss-guild, don't fallback to mock data
            return null;
        }

        const json = await res.json();

        // Handle different API response formats
        let data;
        if (panelId === 'top-players') {
            // Character API returns array directly
            if (!Array.isArray(json) || json.length === 0) {
                console.warn(`Invalid API response for ${panelId}:`, json);
                return await fetchMockData(panelId);
            }
            data = json;
        } else if (panelId === 'top-guild' || panelId === 'top-boss' || panelId === 'top-boss-guild' ||
            panelId === 'top-loan-chien' || panelId === 'top-bc' || panelId === 'top-dv' || panelId === 'top-cc') {
            // Guild, Top Boss, and Event APIs return {ok, time, items}
            if (!json.ok || !Array.isArray(json.items) || json.items.length === 0) {
                console.warn(`Invalid API response for ${panelId}:`, json);
                return await fetchMockData(panelId);
            }
            data = json.items;
        } else {
            return await fetchMockData(panelId);
        }

        // Transform API data to match expected format
        if (panelId === 'top-players') {
            return data.map(item => ({
                name: item.Name,
                level: item.cLevel,
                reset: item.Reset || 0,
                relife: item.Relife || 0,
                class: getClassName(item.ClassName || item.Class),
                guild: item.GuildName || '',
                guildMarkHex: item.GuildMarkHex
            }));
        } else if (panelId === 'top-guild') {
            return data.map(item => ({
                name: item.G_Name,
                owner: item.G_Master,
                members: item.MemberCount,
                logo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-boss') {
            return data.map(item => ({
                name: item.Name,
                points: item.TotalPoint,
                totalBoss: item.TotalBossCount,
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-boss-guild') {
            return data.map(item => ({
                logo: renderGuildLogo(item.GuildMarkHex, 46),
                name: item.G_Name,
                owner: item.G_Master,
                boss: item.TotalBossPoints,
                totalBoss: item.TotalBossCount,
                star: item.TopMember || 'N/A'
            }));
        } else if (panelId === 'top-loan-chien') {
            return data.map(item => ({
                name: item.Name,
                kills: item.Kills,
                deads: item.Deads,
                score: item.Score,
                guild: item.GuildName || '',
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-bc' || panelId === 'top-dv') {
            return data.map(item => ({
                name: item.Name,
                score: item.Score,
                monsterKills: item.KillMonsterCount,
                guild: item.GuildName || '',
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-cc') {
            return data.map(item => ({
                name: item.Name,
                score: item.Score,
                guild: item.GuildName || '',
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        }

    } catch (e) {
        console.warn(`Failed to fetch ranking for ${panelId}:`, e.message);
        // For main ranking panels, fallback to mock data
        if (['top-players', 'top-guild', 'top-boss', 'top-loan-chien', 'top-bc', 'top-dv', 'top-cc'].includes(panelId)) {
            return await fetchMockData(panelId);
        }
        // For top-boss-guild, don't fallback to mock data
        return null;
    }
}

// Fallback function to load mock data
async function fetchMockData(panelId) {
    try {
        if (panelId === 'top-players') {
            const res = await fetch('mock-api-response.json');
            if (!res.ok) return null;
            const json = await res.json();
            return json.map(item => ({
                name: item.Name,
                level: item.cLevel,
                reset: item.Reset || 0,
                relife: item.Relife || 0,
                class: getClassName(item.ClassName || item.Class),
                guild: item.GuildName || '',
                guildMarkHex: item.GuildMarkHex
            }));
        } else if (panelId === 'top-guild') {
            // Return mock guild data from rankings-data.js
            return rankingData['top-guild'].map(item => ({
                name: item.name,
                owner: item.owner,
                members: item.members,
                logo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-boss') {
            // Return mock boss data from rankings-data.js
            return rankingData['top-boss'].map(item => ({
                name: item.name,
                points: item.points,
                totalBoss: item.totalBoss,
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-loan-chien') {
            // Return mock loan-chien data from rankings-data.js
            return rankingData['top-loan-chien'].map(item => ({
                name: item.name,
                kills: item.kills,
                deads: item.deads,
                score: item.score,
                guild: item.guild,
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-bc' || panelId === 'top-dv') {
            // Return mock bc/dv data from rankings-data.js
            return rankingData[panelId].map(item => ({
                name: item.name,
                score: item.score,
                monsterKills: item.monsterKills,
                guild: item.guild,
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        } else if (panelId === 'top-cc') {
            // Return mock cc data from rankings-data.js (without monsterKills)
            return rankingData[panelId].map(item => ({
                name: item.name,
                score: item.score,
                guild: item.guild,
                guildLogo: renderGuildLogo(item.GuildMarkHex, 46)
            }));
        }
        return null;
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
                    const guildLogoHtml = renderGuildLogo(row.guildMarkHex, 46);
                    cells = [row.name, formatNumber(row.level), formatNumber(row.reset), formatNumber(row.relife), row.class, row.guild || '', guildLogoHtml];
                    break;
                case 'top-guild':
                    cells = [row.logo, row.name, row.owner, formatNumber(row.members)];
                    break;
                case 'top-boss':
                    cells = [row.name, formatNumber(row.points), formatNumber(row.totalBoss), row.guildLogo];
                    break;
                case 'top-boss-guild':
                    cells = [row.logo, row.name, row.owner, formatNumber(row.boss), formatNumber(row.totalBoss), row.star];
                    break;
                case 'top-loan-chien':
                    cells = [row.name, formatNumber(row.kills), formatNumber(row.deads), formatNumber(row.score), row.guild, row.guildLogo];
                    break;
                case 'top-bc':
                case 'top-dv':
                    cells = [row.name, formatNumber(row.score), formatNumber(row.monsterKills), row.guild, row.guildLogo];
                    break;
                case 'top-cc':
                    cells = [row.name, formatNumber(row.score), row.guild, row.guildLogo];
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
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default scroll behavior
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
