// Simple include loader to pull reusable snippets into the page

document.addEventListener('DOMContentLoaded', () => {
    const includeTargets = document.querySelectorAll('[data-include]');

    includeTargets.forEach(async (target) => {
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
});
