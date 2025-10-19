// Entry point for custom interactions during the rebuild phase

document.addEventListener('DOMContentLoaded', () => {
    const baseWidth = 1280; // updated from 1080
    let wrapper = null;

    function ensureWrapper() {
        const deviceWidth = window.innerWidth;
        if (deviceWidth < baseWidth) {
            // create wrapper if not exists
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'wrapper-scale';
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
