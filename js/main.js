// Entry point for custom interactions during the rebuild phase

document.addEventListener('DOMContentLoaded', () => {
    const baseWidth = 1200; // updated from 1280
    let wrapper = null;

    function ensureWrapper() {
        const deviceWidth = window.innerWidth;
        if (deviceWidth < baseWidth) {
            // create wrapper if not exists
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'wrapper-scale';
                // Ensure no margin auto so left edge aligns to viewport
                wrapper.style.margin = '0';
                // move existing body children into wrapper
                const children = Array.from(document.body.children).filter(el => !el.classList.contains('wrapper-scale'));
                children.forEach(child => wrapper.appendChild(child));
                document.body.appendChild(wrapper);
            }
        } else if (wrapper) {
            // unwrap on desktop
            const kids = Array.from(wrapper.children);
            kids.forEach(child => document.body.insertBefore(child, wrapper));
            wrapper.remove();
            wrapper = null;
            document.body.style.minHeight = '';
        }
    }

    function applyScale() {
        ensureWrapper();
        if (!wrapper) return; // desktop
        const deviceWidth = window.innerWidth;
        const scale = deviceWidth / baseWidth;
        wrapper.style.transform = `scale(${scale})`;
        const rect = wrapper.getBoundingClientRect();
        document.body.style.minHeight = (rect.height * scale) + 'px';
    }

    applyScale();
    window.addEventListener('resize', applyScale);
});

// Rankings tabs & event countdowns
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching + indicator movement
    const tabs = document.querySelectorAll('.rankings__tab');
    const panels = document.querySelectorAll('.rankings__panel');
    const indicator = document.querySelector('.rankings__tab-indicator');

    function moveIndicator(activeTab) {
        if (!indicator || !activeTab) return;
        const rect = activeTab.getBoundingClientRect();
        const parentRect = activeTab.parentElement.getBoundingClientRect();
        const width = rect.width;
        const offset = rect.left - parentRect.left;
        indicator.style.transform = `translateX(${offset}px)`;
        indicator.style.width = width + 'px';
    }

    // Sample data (top 5) placeholder; each array element = row object
    // Later replace fetchSampleData() with API call to VPS returning similar structure.
    const sampleData = {
        'top-players': [
            { rank: 1, name: 'DarkLordX', level: 400, reset: 5, relife: 3, cls: 'Dark Lord', guild: 'Reborn' },
            { rank: 2, name: 'ElfQueen', level: 380, reset: 4, relife: 2, cls: 'Elf', guild: 'Reborn' },
            { rank: 3, name: 'BKWar', level: 365, reset: 4, relife: 1, cls: 'BK', guild: 'Infinity' },
            { rank: 4, name: 'SummMaster', level: 350, reset: 3, relife: 1, cls: 'Summoner', guild: 'Infinity' },
            { rank: 5, name: 'MGFire', level: 340, reset: 3, relife: 1, cls: 'MG', guild: 'Reborn' }
        ],
        'top-boss': [
            { rank: 1, name: 'SlayerPro', points: 120, guild: 'Reborn' },
            { rank: 2, name: 'DarkLordX', points: 95, guild: 'Reborn' },
            { rank: 3, name: 'ElfQueen', points: 80, guild: 'Reborn' },
            { rank: 4, name: 'BKWar', points: 72, guild: 'Infinity' },
            { rank: 5, name: 'MGFire', points: 70, guild: 'Infinity' }
        ],
        'top-boss-guild': [
            { rank: 1, logo: 'images/guild-sample.png', name: 'Reborn', owner: 'MasterLee', boss: 520, star: 'DarkLordX' },
            { rank: 2, logo: 'images/guild-sample.png', name: 'Infinity', owner: 'BCMaster', boss: 410, star: 'ElfQueen' },
            { rank: 3, logo: 'images/guild-sample.png', name: 'Legends', owner: 'SummMaster', boss: 390, star: 'BKWar' },
            { rank: 4, logo: 'images/guild-sample.png', name: 'Empire', owner: 'MGFire', boss: 360, star: 'SlayerPro' },
            { rank: 5, logo: 'images/guild-sample.png', name: 'Phoenix', owner: 'LordAce', boss: 340, star: 'SummMaster' }
        ],
        'top-loan-chien': [
            { rank: 1, name: 'BKWar', score: 3400, guild: 'Reborn' },
            { rank: 2, name: 'SlayerPro', score: 2800, guild: 'Reborn' },
            { rank: 3, name: 'DarkLordX', score: 2300, guild: 'Reborn' },
            { rank: 4, name: 'ElfQueen', score: 2100, guild: 'Infinity' },
            { rank: 5, name: 'MGFire', score: 2000, guild: 'Infinity' }
        ],
        'top-bc': [
            { rank: 1, name: 'BCMaster', score: 220, guild: 'Infinity' },
            { rank: 2, name: 'DVMaster', score: 180, guild: 'Infinity' },
            { rank: 3, name: 'DarkLordX', score: 160, guild: 'Reborn' },
            { rank: 4, name: 'ElfQueen', score: 150, guild: 'Reborn' },
            { rank: 5, name: 'SummMaster', score: 120, guild: 'Legends' }
        ],
        'top-dv': [
            { rank: 1, name: 'DVMaster', score: 180, guild: 'Infinity' },
            { rank: 2, name: 'CCMaster', score: 95, guild: 'Infinity' },
            { rank: 3, name: 'DarkLordX', score: 90, guild: 'Reborn' },
            { rank: 4, name: 'BKWar', score: 85, guild: 'Reborn' },
            { rank: 5, name: 'ElfQueen', score: 80, guild: 'Reborn' }
        ],
        'top-cc': [
            { rank: 1, name: 'CCMaster', score: 95, guild: 'Infinity' },
            { rank: 2, name: 'DVMaster', score: 80, guild: 'Infinity' },
            { rank: 3, name: 'DarkLordX', score: 70, guild: 'Reborn' },
            { rank: 4, name: 'SummMaster', score: 65, guild: 'Legends' },
            { rank: 5, name: 'MGFire', score: 60, guild: 'Phoenix' }
        ]
    };

    function renderPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const tbody = panel.querySelector('tbody');
        if (!tbody) return;
        const data = sampleData[panelId];
        if (!data) return;
        // Clear existing
        tbody.innerHTML = '';

        // Build rows according to panel type
        const frag = document.createDocumentFragment();
        data.forEach(row => {
            const tr = document.createElement('tr');
            let cells = [];
            switch (panelId) {
                case 'top-players':
                    cells = [row.rank, row.name, row.level, row.reset, row.relife, row.cls, `<img src="images/guild-sample.png" alt="Guild" class="guild-logo">`];
                    break;
                case 'top-boss':
                    cells = [row.rank, row.name, row.points, row.guild, `<img src="images/guild-sample.png" alt="Guild" class="guild-logo">`];
                    break;
                case 'top-boss-guild':
                    cells = [row.rank, `<img src="${row.logo}" alt="Guild" class="guild-logo">`, row.name, row.owner, row.boss, row.star];
                    break;
                case 'top-loan-chien':
                case 'top-bc':
                case 'top-dv':
                case 'top-cc':
                    cells = [row.rank, row.name, row.score, row.guild, `<img src="images/guild-sample.png" alt="Guild" class="guild-logo">`];
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

    // Initial render for all panels so switching is instant
    Object.keys(sampleData).forEach(renderPanel);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('is-active')) return;
            tabs.forEach(t => t.classList.remove('is-active'));
            panels.forEach(p => p.classList.remove('is-visible'));
            tab.classList.add('is-active');
            const targetId = tab.getAttribute('data-target');
            const panel = document.getElementById(targetId);
            if (panel) {
                panel.classList.add('is-visible');
                // Re-render in case future API refresh
                renderPanel(targetId);
            }
            moveIndicator(tab);
        });
    });

    // Initial indicator position
    const initialActive = document.querySelector('.rankings__tab.is-active');
    moveIndicator(initialActive);

    // Countdown logic
    const countdownEls = document.querySelectorAll('[data-countdown]');
    function updateCountdown() {
        const now = Date.now();
        countdownEls.forEach(el => {
            const target = new Date(el.getAttribute('data-countdown')).getTime();
            const diff = target - now;
            if (diff <= 0) {
                el.textContent = '00:00:00';
                return;
            }
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            el.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Recalculate indicator on resize in case of font/layout changes
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.rankings__tab.is-active')));
});
