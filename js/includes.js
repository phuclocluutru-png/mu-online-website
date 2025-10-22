// Simple include loader to pull reusable snippets into the page

// Load includes immediately to ensure anchor links work
const loadIncludes = async () => {
    const includeTargets = document.querySelectorAll('[data-include]');

    const loadPromises = Array.from(includeTargets).map(async (target) => {
        const includePath = target.getAttribute('data-include');
        if (!includePath) return;

        // Luôn dùng đường dẫn tuyệt đối từ gốc website
        const fullPath = `${window.location.origin}/includes/${includePath}.html`;

        try {
            const response = await fetch(fullPath, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Không thể tải include: ${includePath}`);

            const markup = await response.text();
            target.innerHTML = markup;
        } catch (error) {
            console.error(error);
            target.innerHTML = `<div class="include-error">${error.message}</div>`;
        }
    });

    // Wait for all includes to load
    await Promise.all(loadPromises);
};

// Load includes immediately when script runs
if (document.readyState === 'loading') {
    // DOM chưa sẵn sàng, chờ một chút
    setTimeout(() => {
        loadIncludes().then(() => adjustNavigationLinks());
    }, 10);
} else {
    // DOM đã sẵn sàng
    loadIncludes().then(() => adjustNavigationLinks());
}

// Also load on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', () => {
    loadIncludes().then(() => adjustNavigationLinks());
});

// Adjust navigation links based on current page
function adjustNavigationLinks() {
    const rankingsLink = document.getElementById('rankings-link');
    if (rankingsLink && window.location.pathname.includes('/pages/post.html')) {
        rankingsLink.href = '/index.html#rankings';
    }
}
