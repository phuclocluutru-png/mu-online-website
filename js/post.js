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

    // Breadcrumb: lấy danh mục cha - con
    let breadcrumb = '';
    if (Array.isArray(mapped.categories) && mapped.categories.length) {
        // Sử dụng categories đã fetch ở sidebar (nếu có), hoặc chỉ lấy tên đầu tiên
        // Đơn giản: chỉ lấy tên đầu tiên
        breadcrumb = `<div class="postView__breadcrumb">
                        <a href="../index.html#news">${window.postMainCatName || 'Danh mục'}</a>
                        ${window.postSubCatName ? `<span>›</span><a href="../index.html#news">${window.postSubCatName}</a>` : ''}
                </div>`;
    }

    article.innerHTML = `
            <h1 class="postView__title">${mapped.title}</h1>
            <div class="postView__metaBar">
                <div style="flex:1;text-align:left;">${breadcrumb}</div>
                <div class="postView__metaDate">${dateStr}</div>
            </div>
            ${imgUrl ? `<img src="${imgUrl}" alt="${mapped.title}" class="postView__heroImg" />` : ''}
            <div class="postView__content">${safeContent}</div>
            <div class="postView__featuredWrap">
                <div class="postView__featuredTitle">Danh mục nổi bật</div>
                <div class="postView__featuredList" id="post-featured-list"></div>
            </div>
            <div class="postView__relatedWrap">
                <div class="postView__relatedTitle">Bài viết liên quan</div>
                <div class="postView__relatedList" id="post-related-list"></div>
            </div>
        `;
}

async function loadPost() {
    const id = getParam('id');
    if (!id) { renderError('Không có tham số id bài viết.'); return; }
    try {
        const res = await timeoutFetch(`${WP_API_BASE}/posts/${id}?_embed`);
        if (!res.ok) throw new Error('Không tải được bài viết (HTTP ' + res.status + ')');
        const json = await res.json();
        // After post loaded, fetch categories for sidebar
        await loadCategories(json);

        // Lưu tên danh mục cho breadcrumb (luôn lấy đúng cha-con)
        if (Array.isArray(json.categories) && json.categories.length) {
            const catRes = await timeoutFetch(`${WP_API_BASE}/categories?include=${json.categories.join(',')}`);
            if (catRes.ok) {
                const catJson = await catRes.json();
                // Tìm category con đầu tiên (parent != 0)
                const subCat = catJson.find(c => c.parent !== 0);
                let parentCat = null;
                if (subCat) {
                    parentCat = catJson.find(c => c.id === subCat.parent);
                } else {
                    parentCat = catJson.find(c => c.parent === 0);
                }
                if (parentCat && subCat) {
                    window.postMainCatName = parentCat.name;
                    window.postSubCatName = subCat.name;
                } else if (parentCat) {
                    window.postMainCatName = parentCat.name;
                    window.postSubCatName = '';
                } else if (subCat) {
                    window.postMainCatName = subCat.name;
                    window.postSubCatName = '';
                } else {
                    window.postMainCatName = catJson[0]?.name || '';
                    window.postSubCatName = '';
                }
                // Gọi lại renderPost để breadcrumb đúng
                renderPost(json);
            } else {
                renderPost(json);
            }
        } else {
            renderPost(json);
        }

        // Fetch danh mục nổi bật (top 3 category by count)
        const catAllRes = await timeoutFetch(`${WP_API_BASE}/categories?per_page=100`);
        let featuredCats = [];
        if (catAllRes.ok) {
            const allCats = await catAllRes.json();
            featuredCats = allCats.sort((a, b) => b.count - a.count).slice(0, 3);
        }
        const featuredList = document.getElementById('post-featured-list');
        if (featuredList && featuredCats.length) {
            featuredList.innerHTML = featuredCats.map(cat => `
                <div class="postView__featuredItem">
                    <a class="postView__featuredItemTitle" href="../index.html#news">${cat.name}</a>
                    <div class="postView__featuredItemDate">${cat.count} bài viết</div>
                </div>
            `).join('');
        }

        // Fetch 5 bài viết liên quan (cùng danh mục, loại trừ bài hiện tại)
        let relatedPosts = [];
        if (Array.isArray(json.categories) && json.categories.length) {
            const relRes = await timeoutFetch(`${WP_API_BASE}/posts?categories=${json.categories[0]}&per_page=6&_embed`);
            if (relRes.ok) {
                const relJson = await relRes.json();
                relatedPosts = relJson.filter(p => p.id !== json.id).slice(0, 5);
            }
        }
        const relatedList = document.getElementById('post-related-list');
        if (relatedList && relatedPosts.length) {
            relatedList.innerHTML = relatedPosts.map(p => {
                const mapped = mapPost(p);
                const dateStr = new Date(mapped.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                return `<div class="postView__relatedItem">
                    <a class="postView__relatedItemTitle" href="post.html?id=${mapped.id}">${mapped.title}</a>
                    <div class="postView__relatedItemDate">${dateStr}</div>
                </div>`;
            }).join('');
        }

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
        wrap.innerHTML = '';
        (byParent[0] || []).forEach(parentCat => {
            const branch = document.createElement('div');
            branch.className = 'postView__catBranch';
            branch.innerHTML = `<div class="postView__catParent">${parentCat.name}</div>`;
            const children = byParent[parentCat.id] || [];
            if (children.length) {
                const childList = document.createElement('div');
                childList.className = 'postView__catChildList';
                children.forEach(child => {
                    const btn = document.createElement('button');
                    btn.className = 'postView__catChildBtn';
                    btn.textContent = child.name;
                    btn.onclick = () => renderCategoryPosts(child.id, child.name);
                    childList.appendChild(btn);
                });
                branch.appendChild(childList);
            }
            wrap.appendChild(branch);
        });
    } catch (e) {
        console.warn('Category sidebar failed', e);
        wrap.innerHTML = '<div class="postView__error">Không tải được danh mục.</div>';
    }
}

// Khi click vào danh mục con, fetch và render list bài viết thuộc danh mục đó
async function renderCategoryPosts(catId, catName) {
    const article = document.getElementById('post-article');
    if (!article) return;
    article.innerHTML = `<h2 class="postView__title">${catName}</h2><div class="postView__loading">Đang tải bài viết...</div>`;
    try {
        const res = await timeoutFetch(`${WP_API_BASE}/posts?categories=${catId}&per_page=10&_embed`);
        if (!res.ok) throw new Error('Không tải được bài viết');
        const posts = await res.json();
        if (!posts.length) {
            article.innerHTML = `<h2 class="postView__title">${catName}</h2><div class="postView__error">Không có bài viết nào trong danh mục này.</div>`;
            return;
        }
        article.innerHTML = `<h2 class="postView__title">${catName}</h2><ul class="postView__catPostList">${posts.map(p => `<li><a href="post.html?id=${p.id}" class="postView__catPostLink">${p.title.rendered}</a></li>`).join('')}</ul>`;
    } catch (e) {
        article.innerHTML = `<h2 class="postView__title">${catName}</h2><div class="postView__error">Lỗi tải bài viết.</div>`;
    }
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
