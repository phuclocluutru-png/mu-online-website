// Fetch and render a single WordPress post internally
import { WP_API_BASE, mapPost } from './news-config.js';

// Danh mục cha không muốn hiển thị trong sidebar (thêm tên vào array này)
const excludedParentCats = ['Nổi Bật', 'MU ONLINE PK CLEAR'];

// Thứ tự hiển thị danh mục cha (tên không có trong list sẽ ở cuối)
const categoryOrder = ['Tin tức &amp; Cập nhật', 'Sự kiện', 'Hướng dẫn', 'Nhân vật'];

function slugify(text) {
    // Remove Vietnamese accents
    const accents = 'àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';
    const noAccents = 'aaaaaaaaceeeeiiiidnoooooouuuuyby';
    let str = text.toString().toLowerCase();
    for (let i = 0; i < accents.length; i++) {
        str = str.replace(new RegExp(accents[i], 'g'), noAccents[i]);
    }
    // Remove other accents
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return str
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

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

    // Update URL to SEO-friendly slug
    const currentPath = window.location.pathname;
    const slug = slugify(mapped.title);
    const newPath = '/tin-tuc-su-kien/' + slug;
    if (currentPath !== newPath && !window.location.search.includes('search=')) {
        window.history.pushState(null, mapped.title, newPath);
    }
}

async function loadPost() {
    const cat = getParam('cat');
    if (cat) {
        const catName = cat === 'latest' ? 'Mới nhất' : 'Danh mục';
        loadCategoryPosts(cat, catName);
        return;
    }

    const id = getParam('id');
    const search = getParam('search');
    if (!id && !search) {
        renderError('Không có tham số id hoặc search bài viết.');
        return;
    }

    let postId = id;
    if (search && !id) {
        try {
            console.log('Searching for post with:', search);
            const res = await timeoutFetch(`${WP_API_BASE}/posts?search=${encodeURIComponent(search)}&_embed&per_page=1`);
            if (!res.ok) throw new Error('Không tìm thấy bài viết (HTTP ' + res.status + ')');
            const json = await res.json();
            if (json.length === 0) throw new Error('Không tìm thấy bài viết với từ khóa: ' + search);
            const post = json[0];
            postId = post.id;
            // Update URL with id
            const url = new URL(window.location);
            url.searchParams.set('id', postId);
            window.history.replaceState(null, null, url.pathname + url.search);
        } catch (e) {
            renderError(e.message);
            return;
        }
    }

    console.log('Loading post with ID:', postId);
    try {
        console.log('Fetching from:', `${WP_API_BASE}/posts/${postId}?_embed`);
        const res = await timeoutFetch(`${WP_API_BASE}/posts/${postId}?_embed`);
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error('Không tải được bài viết (HTTP ' + res.status + ')');
        const json = await res.json();
        console.log('Post data:', json);
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

async function loadCategories(postJson = null) {
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
        const currentCatIds = postJson && Array.isArray(postJson.categories) ? postJson.categories : [];
        wrap.innerHTML = '<div class="postView__searchWrap"><input type="text" class="postView__search" placeholder="Tìm kiếm bài viết..."><button class="postView__searchBtn" title="Tìm kiếm"></button></div>';

        // Add "Mới nhất" category
        const latestGroup = document.createElement('div');
        latestGroup.className = 'postView__catGroup';
        latestGroup.innerHTML = `
            <button class="postView__catGroupHeader" type="button">
                <span class="postView__catGroupTitle">Mới nhất</span>
            </button>
        `;
        const latestHeaderBtn = latestGroup.querySelector('.postView__catGroupHeader');
        latestHeaderBtn.addEventListener('click', () => {
            loadCategoryPosts('latest', 'Mới nhất');
        });
        wrap.appendChild(latestGroup);

        (byParent[0] || []).filter(parentCat => !excludedParentCats.includes(parentCat.name)).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.name);
            const indexB = categoryOrder.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        }).forEach(parentCat => {
            const group = document.createElement('div');
            group.className = 'postView__catGroup';
            const children = byParent[parentCat.id] || [];
            const hasChildren = children.length > 0;
            group.innerHTML = `
                <button class="postView__catGroupHeader ${hasChildren ? 'has-children' : ''}" type="button">
                    <span class="postView__catGroupTitle">${parentCat.name}</span>
                    ${hasChildren ? '<span class="postView__catGroupArrow">▼</span>' : ''}
                </button>
            `;
            const headerBtn = group.querySelector('.postView__catGroupHeader');
            const titleSpan = headerBtn.querySelector('.postView__catGroupTitle');

            // Click on title: load category posts
            titleSpan.addEventListener('click', () => {
                loadCategoryPosts(parentCat.id, parentCat.name);
            });

            // If has children, add arrow click handler for accordion toggle
            if (hasChildren) {
                const arrowSpan = headerBtn.querySelector('.postView__catGroupArrow');
                arrowSpan.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent triggering title click
                    const childrenContainer = group.querySelector('.postView__catChildren');
                    if (childrenContainer) {
                        const isExpanded = childrenContainer.style.display !== 'none';
                        childrenContainer.style.display = isExpanded ? 'none' : 'block';
                        arrowSpan.textContent = isExpanded ? '▼' : '▲';
                    }
                });
            }
            if (hasChildren) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'postView__catChildren';
                childrenContainer.style.display = 'none'; // collapsed by default

                let hasActiveChild = false;
                children.forEach(child => {
                    const isActive = currentCatIds.includes(child.id);
                    if (isActive) hasActiveChild = true;
                    const item = buildCatItem(child, isActive);
                    childrenContainer.appendChild(item);
                });

                if (hasActiveChild) {
                    group.classList.add('has-active-child');
                    childrenContainer.style.display = 'flex'; // expand if has active child
                }

                group.appendChild(childrenContainer);
            } else {
                // For parent without children, could add item but header handles it
            }
            wrap.appendChild(group);
        });

        // Add search functionality
        const searchInput = wrap.querySelector('.postView__search');
        const searchBtn = wrap.querySelector('.postView__searchBtn');
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            const article = document.getElementById('post-article');
            if (!article) return;
            try {
                article.innerHTML = '<div class="postView__loading">Đang tìm kiếm...</div>';
                const res = await timeoutFetch(`${WP_API_BASE}/posts?search=${encodeURIComponent(query)}&per_page=10&_embed`);
                if (!res.ok) throw new Error('Search HTTP ' + res.status);
                const posts = await res.json();
                renderSearchResults(article, posts, query);
            } catch (e) {
                article.innerHTML = `<div class="postView__error">Lỗi tìm kiếm: ${e.message}</div>`;
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
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
        loadCategoryPosts(cat.id, cat.name, true); // Skip sidebar reload for child categories
    });
    return btn;
}

// Init
document.addEventListener('DOMContentLoaded', loadPost);

async function loadCategoryPosts(catId, catName, skipSidebarReload = false) {
    const article = document.getElementById('post-article');
    if (!article) return;

    // Show loading
    article.innerHTML = '<div class="postView__loading">Đang tải bài viết...</div>';

    // Load categories for sidebar only if not skipping
    if (!skipSidebarReload) {
        await loadCategories();
    }

    try {
        // Load first page (10 posts)
        const apiUrl = catId === 'latest'
            ? `${WP_API_BASE}/posts?_embed&per_page=10&page=1&orderby=date&order=desc`
            : `${WP_API_BASE}/posts?categories=${catId}&per_page=10&page=1&_embed`;
        const res = await timeoutFetch(apiUrl);
        if (!res.ok) throw new Error('HTTP ' + res.status);

        const posts = await res.json();
        const totalPages = parseInt(res.headers.get('X-WP-TotalPages')) || 1;

        // Render posts list
        renderCategoryPosts(article, posts, catName, 1, totalPages, catId);
    } catch (e) {
        article.innerHTML = `<div class="postView__error">Lỗi tải danh mục: ${e.message}</div>`;
    }
}

function renderCategoryPosts(container, posts, catName, currentPage, totalPages, catId) {
    const postsHtml = posts.map(post => {
        const mapped = mapPost(post);
        const dateStr = new Date(mapped.date).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const imgUrl = extractFeatured(post);
        const defaultImg = '/images/Logo PK CLEAR -.png';
        return `
            <div class="postView__listItem">
                <img src="${imgUrl || defaultImg}" alt="${mapped.title}" class="postView__listItemImg" onerror="if(this.src !== '${defaultImg}') this.src='${defaultImg}';" />
                <div class="postView__listItemContent">
                    <div class="postView__listItemHeader">
                        <h3 class="postView__listItemTitle">
                            <span class="postView__listItemTitleLink" data-post-id="${mapped.id}">${mapped.title}</span>
                        </h3>
                        <span class="postView__listItemDate">${dateStr}</span>
                    </div>
                    <div class="postView__listItemExcerpt">${mapped.excerpt || '...'}</div>
                </div>
            </div>
        `;
    }).join('');

    // Pagination
    let paginationHtml = '';
    if (totalPages > 1) {
        paginationHtml = '<div class="postView__pagination">';
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="postView__pageBtn ${i === currentPage ? 'is-active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHtml += '</div>';
    }

    container.innerHTML = `
        <div class="postView__catHeader">
            <h2 class="postView__catTitle">${catName}</h2>
            <p class="postView__catCount">${posts.length} bài viết</p>
        </div>
        <div class="postView__postsList">
            ${postsHtml}
        </div>
        ${paginationHtml}
    `;

    // Add pagination event listeners
    container.querySelectorAll('.postView__pageBtn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const page = parseInt(btn.dataset.page);
            try {
                container.innerHTML = '<div class="postView__loading">Đang tải trang...</div>';
                const apiUrl = catId === 'latest'
                    ? `${WP_API_BASE}/posts?_embed&per_page=10&page=${page}&orderby=date&order=desc`
                    : `${WP_API_BASE}/posts?categories=${catId}&per_page=10&page=${page}&_embed`;
                const res = await timeoutFetch(apiUrl);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const newPosts = await res.json();
                renderCategoryPosts(container, newPosts, catName, page, totalPages, catId);
            } catch (e) {
                container.innerHTML = `<div class="postView__error">Lỗi tải trang: ${e.message}</div>`;
            }
        });
    });

    // Add post title click event listeners
    container.querySelectorAll('.postView__listItemTitleLink').forEach(link => {
        link.addEventListener('click', () => {
            const postId = link.dataset.postId;
            // Update URL without page reload
            history.pushState({ postId }, '', `post.html?id=${postId}`);
            // Load the post
            loadSinglePost(postId);
        });
    });
}

async function loadSinglePost(postId) {
    const article = document.getElementById('post-article');
    if (!article) return;

    // Show loading
    article.innerHTML = '<div class="postView__loading">Đang tải bài viết...</div>';

    try {
        console.log('Fetching post:', `${WP_API_BASE}/posts/${postId}?_embed`);
        const res = await timeoutFetch(`${WP_API_BASE}/posts/${postId}?_embed`);
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error('Không tải được bài viết (HTTP ' + res.status + ')');
        const json = await res.json();
        console.log('Post data:', json);

        // Render the post (similar to renderPost but without category loading)
        const mapped = mapPost(json);
        const imgUrl = extractFeatured(json);
        const dateStr = new Date(mapped.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const safeContent = sanitizeHTML(json.content?.rendered || '');

        // Create dynamic breadcrumb based on categories
        let breadcrumbHtml = '<span class="breadcrumb-link" data-cat-id="home">Trang chủ</span> / <span>Tin tức</span>'; // Default fallback
        if (Array.isArray(json.categories) && json.categories.length) {
            try {
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
                        breadcrumbHtml = `<span class="breadcrumb-link" data-cat-id="home">Trang chủ</span> / <span class="breadcrumb-link" data-cat-id="${parentCat.id}">${parentCat.name}</span> - <span class="breadcrumb-link" data-cat-id="${subCat.id}">${subCat.name}</span>`;
                    } else if (parentCat) {
                        breadcrumbHtml = `<span class="breadcrumb-link" data-cat-id="home">Trang chủ</span> / <span class="breadcrumb-link" data-cat-id="${parentCat.id}">${parentCat.name}</span>`;
                    } else if (subCat) {
                        breadcrumbHtml = `<span class="breadcrumb-link" data-cat-id="home">Trang chủ</span> / <span class="breadcrumb-link" data-cat-id="${subCat.id}">${subCat.name}</span>`;
                    }
                }
            } catch (e) {
                console.log('Error fetching categories for breadcrumb:', e);
            }
        }

        article.innerHTML = `
            <div class="postView__title">${mapped.title}</div>
            <div class="postView__metaBar">
                <div class="postView__breadcrumb">
                    ${breadcrumbHtml}
                </div>
                <div class="postView__metaDate">${dateStr}</div>
            </div>
            ${imgUrl ? `<img src="${imgUrl}" alt="${mapped.title}" class="postView__featuredImg" onerror="this.style.display='none';" />` : ''}
            <div class="postView__content">${safeContent}</div>
        `;

        // Add breadcrumb click handlers
        article.querySelectorAll('.breadcrumb-link').forEach(link => {
            link.addEventListener('click', () => {
                const catId = link.dataset.catId;
                if (catId === 'home') {
                    // Navigate to home page
                    window.location.href = '/index.html';
                    return;
                }
                // Update URL and load category
                history.pushState({ catId }, '', `post.html?cat=${catId}`);
                loadCategoryPosts(catId, link.textContent);
            });
        });
    } catch (e) {
        article.innerHTML = `<div class="postView__error">Lỗi tải bài viết: ${e.message}</div>`;
    }
}

function renderSearchResults(container, posts, query) {
    const postsHtml = posts.map(post => {
        const mapped = mapPost(post);
        const dateStr = new Date(mapped.date).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const imgUrl = extractFeatured(post);
        const defaultImg = '/images/Logo PK CLEAR -.png';
        return `
            <div class="postView__listItem">
                <img src="${imgUrl || defaultImg}" alt="${mapped.title}" class="postView__listItemImg" onerror="if(this.src !== '${defaultImg}') this.src='${defaultImg}';" />
                <div class="postView__listItemContent">
                    <div class="postView__listItemHeader">
                        <h3 class="postView__listItemTitle">
                            <a href="post.html?id=${mapped.id}">${mapped.title}</a>
                        </h3>
                        <span class="postView__listItemDate">${dateStr}</span>
                    </div>
                    <div class="postView__listItemExcerpt">${mapped.excerpt || '...'}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="postView__catHeader">
            <h2 class="postView__catTitle">Kết quả tìm kiếm: "${query}"</h2>
            <p class="postView__catCount">${posts.length} bài viết</p>
        </div>
        <div class="postView__postsList">
            ${postsHtml}
        </div>
    `;
}

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.postId) {
        loadSinglePost(event.state.postId);
    } else {
        // Reload current page state
        loadPost();
    }
});
