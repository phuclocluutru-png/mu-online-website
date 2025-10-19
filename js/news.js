import { WP_API_BASE, WP_NEWS_PAGE_SIZE, WP_TIMEOUT_MS, mapPost } from './news-config.js';

// State
const state = {
    categories: [],
    categoryCounts: {},
    activeCategory: null, // category id or null for 'all'
    page: 1,
    hasMore: true,
    loading: false,
    posts: [],
};

function timeoutFetch(url, opts = {}) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), WP_TIMEOUT_MS);
    return fetch(url, { ...opts, signal: controller.signal })
        .finally(() => clearTimeout(t));
}

async function fetchCategories() {
    try {
        const res = await timeoutFetch(`${WP_API_BASE}/categories?per_page=100&hide_empty=true`);
        if (!res.ok) throw new Error('Bad categories response');
        const json = await res.json();
        state.categories = json.map(c => ({ id: c.id, name: c.name, count: c.count }));
    } catch (e) {
        console.warn('Categories fetch failed', e);
    }
}

async function fetchPosts(reset = false) {
    if (state.loading) return;
    state.loading = true;
    const postsWrap = document.getElementById('news-posts');
    const loadBtn = document.getElementById('news-load-more');
    if (reset) { state.page = 1; state.posts = []; state.hasMore = true; }
    if (loadBtn) loadBtn.disabled = true;
    renderSkeletons(postsWrap, reset ? WP_NEWS_PAGE_SIZE : 3);
    try {
        const catParam = state.activeCategory ? `&categories=${state.activeCategory}` : '';
        const res = await timeoutFetch(`${WP_API_BASE}/posts?per_page=${WP_NEWS_PAGE_SIZE}&page=${state.page}${catParam}&_embed`);
        if (!res.ok) throw new Error('Bad posts response');
        const json = await res.json();
        const mapped = json.map(mapPost);
        if (mapped.length < WP_NEWS_PAGE_SIZE) state.hasMore = false;
        state.posts = reset ? mapped : [...state.posts, ...mapped];
        state.page++;
    } catch (e) {
        console.warn('Posts fetch failed', e);
        state.hasMore = false;
    } finally {
        state.loading = false;
        renderPosts();
        if (loadBtn) loadBtn.disabled = !state.hasMore;
    }
}

function renderCategories() {
    const wrap = document.getElementById('news-categories');
    if (!wrap) return;
    wrap.innerHTML = '';
    // "All" pill
    const allBtn = createCategoryPill({ id: null, name: 'Tất cả', count: state.categories.reduce((a, c) => a + c.count, 0) });
    wrap.appendChild(allBtn);
    state.categories.forEach(cat => wrap.appendChild(createCategoryPill(cat)));
}

function createCategoryPill(cat) {
    const btn = document.createElement('button');
    btn.className = 'news__cat';
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.textContent = cat.name;
    const countSpan = document.createElement('span');
    countSpan.className = 'news__catCount';
    countSpan.textContent = cat.count;
    btn.appendChild(countSpan);
    if (state.activeCategory === cat.id) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
        if (state.activeCategory === cat.id) return;
        state.activeCategory = cat.id; // can be null
        document.querySelectorAll('.news__cat').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        fetchPosts(true);
    });
    return btn;
}

function renderSkeletons(container, count) {
    if (!container) return;
    if (count <= 0) return;
    if (!state.loading) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const sk = document.createElement('div');
        sk.className = 'news__skeleton';
        container.appendChild(sk);
    }
}

function getFeaturedImage(post) {
    // WordPress _embed feature contains featured media in embedded list
    try {
        const media = post._embedded['wp:featuredmedia'];
        if (Array.isArray(media) && media[0]?.source_url) return media[0].source_url;
    } catch (e) { /* ignore */ }
    return 'images/news-placeholder.jpg';
}

function renderPosts() {
    const wrap = document.getElementById('news-posts');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (!state.posts.length) {
        const empty = document.createElement('div');
        empty.className = 'news__empty';
        empty.innerHTML = '<p>Không tìm thấy bài viết. Kiểm tra domain WordPress hoặc danh mục trống.</p>';
        wrap.appendChild(empty);
        return;
    }
    state.posts.forEach(p => {
        const card = document.createElement('article');
        card.className = 'news__card';
        const imgUrl = getFeaturedImage(p);
        const dateObj = new Date(p.date);
        const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const catName = categoryNameFromPost(p) || 'Tin Tức';
        const internalLink = `pages/post.html?id=${p.id}`;
        card.innerHTML = `
            <a class="news__cardImgWrap" href="${internalLink}" aria-label="Xem bài viết: ${p.title}">
                <img src="${imgUrl}" alt="${p.title}" loading="lazy" />
            </a>
            <div class="news__cardBody">
                <span class="news__cardCat">${catName}</span>
                <h3 class="news__cardTitle"><a href="${internalLink}" class="news__cardTitleLink">${p.title}</a></h3>
                <div class="news__cardMeta">
                    <span>${dateStr}</span>
                    <span>#${p.id}</span>
                </div>
                <p class="news__cardExcerpt">${p.excerpt}</p>
                <div class="news__cardFooter">
                    <a class="news__readMore" href="${internalLink}" aria-label="Đọc bài viết">Đọc</a>
                </div>
            </div>
        `;
        wrap.appendChild(card);
    });
}

function categoryNameFromPost(post) {
    if (!post.categories || !post.categories.length) return null;
    const found = state.categories.find(c => c.id === post.categories[0]);
    return found ? found.name : null;
}

function initLoadMore() {
    const btn = document.getElementById('news-load-more');
    if (!btn) return;
    btn.addEventListener('click', () => { if (!state.hasMore || state.loading) return; fetchPosts(false); });
}

export async function initNews() {
    const section = document.getElementById('news');
    if (!section) return;
    if (section.dataset.initialized) return;
    section.dataset.initialized = 'true';
    await fetchCategories();
    renderCategories();
    await fetchPosts(true); // initial load
    initLoadMore();
}
