// Fetch and render a single WordPress post internally
import { WP_API_BASE, mapPost } from './news-config.js';

async function timeoutFetch(url, ms = 8000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(t);
        return res;
    } catch (e) {
        clearTimeout(t);
        throw e;
    }
}

function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function extractFeatured(raw) {
    try {
        const media = raw._embedded?.['wp:featuredmedia'];
        if (Array.isArray(media) && media[0]?.source_url) return media[0].source_url;
    } catch (e) { }
    return null;
}

function renderError(msg) {
    const article = document.getElementById('post-article');
    if (!article) return;
    article.innerHTML = `<div class="postView__error">${msg}</div>`;
}

function sanitizeHTML(html) {
    // Basic whitelist removal of script/style tags
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
}

function renderPost(raw) {
    const article = document.getElementById('post-article');
    if (!article) return;
    const mapped = mapPost(raw);
    const imgUrl = extractFeatured(raw);
    const dateStr = new Date(mapped.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const safeContent = sanitizeHTML(raw.content?.rendered || '');
    article.innerHTML = `
    <h1 class="postView__title">${mapped.title}</h1>
    <div class="postView__meta">
      <span>${dateStr}</span>
      <span>ID: ${mapped.id}</span>
    </div>
    ${imgUrl ? `<img src="${imgUrl}" alt="${mapped.title}" class="postView__heroImg" />` : ''}
    <div class="postView__content">${safeContent}</div>
  `;
}

async function loadPost() {
    const id = getParam('id');
    if (!id) { renderError('Không có tham số id bài viết.'); return; }
    try {
        const res = await timeoutFetch(`${WP_API_BASE}/posts/${id}?_embed`);
        if (!res.ok) throw new Error('Không tải được bài viết (HTTP ' + res.status + ')');
        const json = await res.json();
        renderPost(json);
        // After post loaded, fetch categories for sidebar
        await loadCategories(json);
    } catch (e) {
        console.error(e);
        renderError('Lỗi tải bài viết: ' + e.message);
    }
}

async function loadCategories(postJson) {
    const wrap = document.getElementById('post-cats');
    if (!wrap) return;
    try {
        const res = await timeoutFetch(`${WP_API_BASE}/categories?per_page=100`);
        if (!res.ok) throw new Error('Categories HTTP ' + res.status);
        const cats = await res.json();
        // Build parent -> children map
        const byParent = {};
        cats.forEach(c => {
            const parent = c.parent || 0;
            if (!byParent[parent]) byParent[parent] = [];
            byParent[parent].push(c);
        });
        const currentCatIds = Array.isArray(postJson.categories) ? postJson.categories : [];
        wrap.innerHTML = '';
        (byParent[0] || []).forEach(parentCat => {
            const group = document.createElement('div');
            group.className = 'postView__catGroup';
            group.innerHTML = `<h4 class="postView__catGroupTitle">${parentCat.name}</h4>`;
            const children = byParent[parentCat.id] || [];
            if (!children.length) {
                // treat parent itself as clickable
                const item = buildCatItem(parentCat, currentCatIds.includes(parentCat.id));
                group.appendChild(item);
            } else {
                children.forEach(child => {
                    const item = buildCatItem(child, currentCatIds.includes(child.id));
                    group.appendChild(item);
                });
            }
            wrap.appendChild(group);
        });
    } catch (e) {
        console.warn('Category sidebar failed', e);
        wrap.innerHTML = '<div class="postView__error">Không tải được danh mục.</div>';
    }
}

function buildCatItem(cat, isActive) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'postView__catItem';
    if (isActive) btn.classList.add('is-active');
    btn.innerHTML = `<span>${cat.name}</span><span style="opacity:.65;font-size:.6rem">${cat.count}</span>`;
    btn.addEventListener('click', () => {
        // Navigate back to index news filtered by category id (optional design)
        window.location.href = `../index.html#news`; // could append ?cat=ID for future filter
    });
    return btn;
}

// Init
document.addEventListener('DOMContentLoaded', loadPost);
