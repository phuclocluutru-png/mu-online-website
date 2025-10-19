// API helper – quản lý base URL và gọi JSON.
// Lưu base trong localStorage để trang admin có thể đổi nhanh.

(function (w) {
    const KEY = "pk_api_base";
    const Api = {
        base: localStorage.getItem(KEY) || "http://api.pkclear.com",

        setBase(url) {
            this.base = url.replace(/\/+$/, "");
            localStorage.setItem(KEY, this.base);
            return this.base;
        },

        url(path) {
            if (!path) return this.base;
            return this.base + (path.startsWith("/") ? path : "/" + path);
        },

        async json(path, fetchInit = {}) {
            const res = await fetch(this.url(path), {
                headers: { "Accept": "application/json" },
                ...fetchInit
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
            }
            return res.json();
        },

        async ping() {           // /health bạn đã triển khai
            return this.json("/health");
        }
    };

    w.PKAPI = Api; // đưa ra global
})(window);
