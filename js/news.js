import { WP_API_BASE, WP_TIMEOUT_MS, mapPost } from './news-config.js';

// State
const state = {
    featuredPosts: [], // bai viet noi bat cho slider
    currentSlide: 0,
    activeTab: 'latest', // tab mac dinh
    tabPosts: {}, // Cache posts cho moi tab
    loading: false,
};

// Cau hinh tabs co dinh
const mainCategories = {
    'latest': { name: 'Mới nhất', slug: 'latest' },
    'tin-tuc-cap-nhat': { name: 'Tin tức & cập nhật', slug: 'tin-tuc-cap-nhat' },
    'su-kien': { name: 'Sự kiện', slug: 'su-kien' },
    'huong-dan': { name: 'Hướng dẫn', slug: 'huong-dan' },
    'nhan-vat': { name: 'Nhân vật', slug: 'nhan-vat' }
};

function timeoutFetch(url, opts = {}) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), WP_TIMEOUT_MS);
    return fetch(url, { ...opts, signal: controller.signal })
        .finally(() => clearTimeout(t));
}

// Fetch bài viết nổi bật cho slider
async function fetchFeaturedPosts() {
    try {
        // Đầu tiên tìm category ID của "noi-bat"
        console.log('Finding category "noi-bat"...');
        const catRes = await timeoutFetch(`${WP_API_BASE}/categories?slug=noi-bat`);
        let categoryId = null;

        if (catRes.ok) {
            const categories = await catRes.json();
            console.log('Categories found:', categories);
            if (categories.length > 0) {
                categoryId = categories[0].id;
                console.log('Found category ID for "noi-bat":', categoryId);
            }
        }

        // Fetch posts từ category "noi-bat" hoặc tất cả posts nếu không tìm thấy category
        let apiUrl;
        if (categoryId) {
            apiUrl = `${WP_API_BASE}/posts?per_page=5&_embed&categories=${categoryId}`;
            console.log('Fetching featured posts from category ID:', categoryId);
        } else {
            apiUrl = `${WP_API_BASE}/posts?per_page=5&_embed`;
            console.log('Category "noi-bat" not found, fetching latest posts as fallback');
        }

        const res = await timeoutFetch(apiUrl);
        if (!res.ok) throw new Error('Bad featured posts response');

        const json = await res.json();
        console.log('Featured posts fetched:', json.length, 'posts');
        state.featuredPosts = json.map(mapPost);

    } catch (e) {
        console.warn('Featured posts fetch failed:', e);
        state.featuredPosts = [];
    }
}

// Fetch posts cho một tab cụ thể
async function fetchTabPosts(tabSlug) {
    if (state.loading) return;
    state.loading = true;

    const listWrap = document.getElementById('news-list');
    renderLoading(listWrap);

    try {
        console.log('Fetching posts for tab:', tabSlug);
        let postsRes;

        if (tabSlug === 'latest') {
            // Tab Mới nhất: lấy 6 bài viết mới nhất
            postsRes = await timeoutFetch(`${WP_API_BASE}/posts?per_page=6&_embed&orderby=date&order=desc`);
        } else {
            // Tìm category ID từ slug
            const categoriesRes = await timeoutFetch(`${WP_API_BASE}/categories?slug=${tabSlug}`);
            console.log('Categories response for', tabSlug, ':', categoriesRes.status);

            if (categoriesRes.ok) {
                const categories = await categoriesRes.json();
                console.log('Categories found for', tabSlug, ':', categories);

                if (categories.length > 0) {
                    const categoryId = categories[0].id;
                    console.log('Using category ID:', categoryId, 'for tab:', tabSlug);
                    postsRes = await timeoutFetch(`${WP_API_BASE}/posts?per_page=6&categories=${categoryId}&_embed`);
                } else {
                    console.log('No category found for', tabSlug, ', fetching all posts');
                    postsRes = await timeoutFetch(`${WP_API_BASE}/posts?per_page=6&_embed`);
                }
            } else {
                console.log('Category lookup failed for', tabSlug, ', fetching all posts');
                postsRes = await timeoutFetch(`${WP_API_BASE}/posts?per_page=8&_embed`);
            }
        }

        if (!postsRes.ok) throw new Error('Bad posts response');
        const json = await postsRes.json();
        console.log('Posts fetched for', tabSlug, ':', json.length, 'posts');
        state.tabPosts[tabSlug] = json.map(mapPost);

    } catch (e) {
        console.warn(`Tab posts fetch failed for ${tabSlug}`, e);
        state.tabPosts[tabSlug] = [];
    } finally {
        state.loading = false;
    }
}

// Render slider cho bài viết nổi bật
function renderFeaturedSlider() {
    const sliderWrap = document.getElementById('news-slider');
    if (!sliderWrap || state.featuredPosts.length === 0) return;

    // Check if slides already exist
    const existingSlides = sliderWrap.querySelectorAll('.news__slide');
    if (existingSlides.length === state.featuredPosts.length) {
        // Just update active class
        existingSlides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === state.currentSlide);
        });
        // Update dots
        const dots = sliderWrap.querySelectorAll('.news__sliderDot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === state.currentSlide);
        });
    } else {
        // Create slides HTML
        const slidesHtml = state.featuredPosts.map((post, index) => {
            const imgUrl = getPostImage(post);
            console.log('Slider post:', post.title, 'Image:', imgUrl, 'Embedded:', post._embedded);
            return `
        <div class="news__slide ${index === state.currentSlide ? 'is-active' : ''}"
             onclick="window.location.href='/pages/post.html?id=${post.id}'">
            <img src="${imgUrl}" alt="${post.title}" class="news__slideImg" 
                 onload="console.log('Image loaded:', '${imgUrl}')" 
                 onerror="console.error('Image failed to load:', '${imgUrl}'); this.src='images/top-bg.png'">
            <div class="news__slideOverlay"></div>
            <h3 class="news__slideTitle">${post.title}</h3>
            <div class="news__slideMeta">
                <span>${formatDate(post.date)}</span>
            </div>
        </div>
    `;
        }).join('');

        const dotsHtml = state.featuredPosts.map((_, index) => `
        <div class="news__sliderDot ${index === state.currentSlide ? 'is-active' : ''}"
             onclick="changeSlide(${index})"></div>
    `).join('');

        sliderWrap.innerHTML = `
        ${slidesHtml}
        <div class="news__sliderNav">
            ${dotsHtml}
        </div>
        <div class="news__sliderControls">
            <button class="news__sliderBtn" onclick="prevSlide()" aria-label="Previous slide">
                &#10094;
            </button>
            <button class="news__sliderBtn" onclick="nextSlide()" aria-label="Next slide">
                &#10095;
            </button>
        </div>
    `;
    }

    // Auto slide every 3 seconds
    if (window.sliderInterval) clearInterval(window.sliderInterval);
    window.sliderInterval = setInterval(() => {
        nextSlide();
    }, 3000);
}

// Render tabs
function renderTabs() {
    const tabsWrap = document.querySelector('.news__tabs');
    if (!tabsWrap) return;

    const tabsHtml = Object.entries(mainCategories).map(([slug, cat]) => `
        <button class="news__tab ${state.activeTab === slug ? 'is-active' : ''}"
                data-category="${slug}"
                role="tab"
                aria-selected="${state.activeTab === slug}">
            ${cat.name}
        </button>
    `).join('');

    tabsWrap.innerHTML = tabsHtml;

    // Add event listeners
    tabsWrap.querySelectorAll('.news__tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            switchTab(category);
        });
    });
}

// Render danh sách posts cho tab active
function renderPostsList() {
    const listWrap = document.getElementById('news-list');
    if (!listWrap) return;

    const posts = state.tabPosts[state.activeTab] || [];
    console.log('Rendering posts for tab:', state.activeTab, 'Posts:', posts);

    if (posts.length === 0) {
        listWrap.innerHTML = '<div class="news__empty">Không có bài viết nào trong danh mục này.</div>';
        return;
    }

    const postsHtml = posts.map(post => {
        console.log('Post ID:', post.id, 'Title:', post.title);
        return `
        <div class="news__item" onclick="window.location.href='/pages/post.html?id=${post.id}'">
            <h4 class="news__itemTitle">${post.title}</h4>
            <div class="news__itemMeta">
                <span class="news__itemDate">${formatDate(post.date)}</span>
            </div>
        </div>
    `}).join('');

    listWrap.innerHTML = postsHtml;
}

// Render loading state
function renderLoading(container) {
    container.innerHTML = '<div class="news__loading">Đang tải...</div>';
}

// Helper functions
function getPostImage(post) {
    try {
        return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'Logo PK CLEAR -.png';
    } catch (e) {
        return 'Logo PK CLEAR -.png';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Global function for slider navigation
window.changeSlide = function (index) {
    state.currentSlide = index;
    renderFeaturedSlider();
};

// Global functions for prev/next navigation
window.prevSlide = function () {
    const newIndex = state.currentSlide === 0 ? state.featuredPosts.length - 1 : state.currentSlide - 1;
    changeSlide(newIndex);
};

window.nextSlide = function () {
    const newIndex = (state.currentSlide + 1) % state.featuredPosts.length;
    changeSlide(newIndex);
};

// Switch tab
async function switchTab(tabSlug) {
    if (state.activeTab === tabSlug) return;

    state.activeTab = tabSlug;

    // Update active tab UI
    document.querySelectorAll('.news__tab').forEach(tab => {
        tab.classList.toggle('is-active', tab.dataset.category === tabSlug);
        tab.setAttribute('aria-selected', tab.dataset.category === tabSlug);
    });

    // Load posts if not cached
    if (!state.tabPosts[tabSlug]) {
        await fetchTabPosts(tabSlug);
    }

    renderPostsList();
}

// Initialize
export async function initNews() {
    const section = document.getElementById('news');
    if (!section) return;
    if (section.dataset.initialized) return;
    section.dataset.initialized = 'true';

    // Load featured posts and initial tab
    await Promise.all([
        fetchFeaturedPosts(),
        fetchTabPosts(state.activeTab)
    ]);

    renderFeaturedSlider();
    renderTabs();
    renderPostsList();
}
