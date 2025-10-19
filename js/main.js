// Orchestrator module (ESM)
import { initEvents } from './events.js';
import { initNews } from './news.js';
import { initRankings } from './rankings.js';
import { initScaling } from './scaling.js';
import { startGlobalCountdown } from './time-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    initScaling(1200);
    // Re-sync event card height to ranking card height for balanced look
    const syncEventHeight = () => {
        const rankingCard = document.querySelector('.rankings__card');
        const eventsCard = document.querySelector('.events');
        if (!rankingCard || !eventsCard) return;
        const rankHeight = rankingCard.offsetHeight; // faster than getBoundingClientRect for height
        // Set events card height to match exactly
        eventsCard.style.height = rankHeight + 'px';
        // Precise inner list height: total - (title + top/bottom padding + gap after title)
        const list = eventsCard.querySelector('.events__list');
        if (list) {
            const style = getComputedStyle(eventsCard);
            const padTop = parseFloat(style.paddingTop) || 0;
            const padBottom = parseFloat(style.paddingBottom) || 0;
            const title = eventsCard.querySelector('.events__title');
            const titleH = title ? title.offsetHeight : 0;
            // gap between title and list from flex layout (0.65rem) ~ convert to px
            const gap = parseFloat(style.rowGap) || 10;
            const reserved = padTop + padBottom + titleH + gap;
            const maxListHeight = rankHeight - reserved;
            if (maxListHeight > 100) {
                list.style.maxHeight = Math.round(maxListHeight) + 'px';
            }
        }
    };
    const rankingCardDirect = () => document.querySelector('.rankings__card');
    const ro = new ResizeObserver(() => syncEventHeight());
    const initObserver = () => {
        const rc = rankingCardDirect();
        if (rc) ro.observe(rc);
    };
    initObserver();
    window.addEventListener('resize', syncEventHeight);

    const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelector('.rankings__tab')) {
            initRankings();
            initEvents();
            initNews();
            startGlobalCountdown();
            // delay a tick to ensure content rendered
            requestAnimationFrame(() => { initObserver(); syncEventHeight(); });
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { initRankings(); initEvents(); initNews(); startGlobalCountdown(); initObserver(); syncEventHeight(); }, 1200);
});
