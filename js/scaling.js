// Handles wrapper scaling for smaller viewports
export function initScaling(baseWidth = 1200) {
    let wrapper = null;
    function ensureWrapper() {
        const deviceWidth = window.innerWidth;
        if (deviceWidth < baseWidth) {
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'wrapper-scale';
                wrapper.style.margin = '0';
                const children = Array.from(document.body.children).filter(el => !el.classList.contains('wrapper-scale'));
                children.forEach(child => wrapper.appendChild(child));
                document.body.appendChild(wrapper);
            }
        } else if (wrapper) {
            const kids = Array.from(wrapper.children);
            kids.forEach(child => document.body.insertBefore(child, wrapper));
            wrapper.remove();
            wrapper = null;
            document.body.style.minHeight = '';
        }
    }
    function applyScale() {
        ensureWrapper();
        if (!wrapper) return;
        const deviceWidth = window.innerWidth;
        const scale = deviceWidth / baseWidth;
        wrapper.style.transform = `scale(${scale})`;
        const rect = wrapper.getBoundingClientRect();
        document.body.style.minHeight = (rect.height * scale) + 'px';
    }
    applyScale();
    window.addEventListener('resize', applyScale);
}
