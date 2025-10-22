// WordPress API configuration
// Adjust WP_BASE_URL to your WordPress site (no trailing slash)
export const WP_BASE_URL = 'https://pkclear.com'; // Domain WordPress thực tế
export const WP_API_BASE = WP_BASE_URL + '/wp-json/wp/v2';
export const WP_NEWS_PAGE_SIZE = 6; // posts mỗi lần tải
export const WP_TIMEOUT_MS = 1000; // timeout fetch

// Mapping field fallback / transform
export function mapPost(raw) {
    return {
        id: raw.id,
        title: raw.title?.rendered || 'Không tiêu đề',
        excerpt: (raw.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
        link: raw.link,
        date: raw.date,
        featured_media: raw.featured_media,
        categories: raw.categories || [],
        author: raw.author,
        _embedded: raw._embedded || null,
    };
}
