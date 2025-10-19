// /js/services/rankings.js
(function (w) {
    const Rankings = {
        // Top nhân vật
        async topCharacters({ limit = 100, offset = 0 } = {}) {
            const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
            return PKAPI.json(`/ranking/characters?${qs}`);
        },

        // (Ví dụ) chi tiết NV theo tên
        async characterInfo(name, { includeGM = 0 } = {}) {
            const qs = new URLSearchParams({ name: name || "", include_gm: String(includeGM) }).toString();
            return PKAPI.json(`/character/info?${qs}`);
        },

        // (Ví dụ) liệt kê NV theo tài khoản
        async charactersByAccount(account, { all = 0 } = {}) {
            const qs = new URLSearchParams({ account: account || "", all: String(all) }).toString();
            return PKAPI.json(`/character/by-account?${qs}`);
        },

        // TODO: các tab khác khi API sẵn sàng
        // async topBoss(...) { return PKAPI.json('/ranking/boss?...') }
        // async topGuild(...) { return PKAPI.json('/ranking/guilds?...') }
    };

    w.Rankings = Rankings;
})(window);
