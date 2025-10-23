// Orchestrator module (ESM)
import { initEvents } from './events.js';
import { initNews } from './news.js';
import { initRankings } from './rankings.js';
import { startGlobalCountdown } from './time-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // initScaling(1200); // Disabled: Fixed layout across all devices
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

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
        const href = e.target.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Force smooth scroll with JavaScript
                const targetPosition = targetElement.offsetTop - 20; // Small offset from top
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Add smooth scroll to all anchor links
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            handleAnchorClick(e);
        }
    });

    // Disable right-click context menu to prevent viewing source and downloading images
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable developer tools and view source shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C')) {
            e.preventDefault();
        }
    });
});
