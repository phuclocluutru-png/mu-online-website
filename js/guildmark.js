// Vẽ logo guild MU từ chuỗi hex 64 ký tự (32 byte = 8×8 ô),
// theo bảng màu “chuẩn MU” (palette 0–f).
//
// - hex: chuỗi 64 ký tự [0-9a-f], có thể có 0x ở đầu (sẽ tự cắt).
// - cellPx: kích thước 1 ô (pixel).
// - transparentZero: ô '0' là trong suốt (chuẩn MU).
// - swap67: hoán đổi màu 6↔7 (nhiều server dùng bảng đảo).

(function (w) {
    const PALETTE = {
        "0": "transparent",
        "1": "#000000",
        "2": "#8c8a8d",
        "3": "#ffffff",
        "4": "#fe0000",
        "5": "#ff8a00",
        "6": "#ffff00",
        "7": "#8cff01",
        "8": "#00ff00",
        "9": "#01ff8d",
        "a": "#00ffff",
        "b": "#008aff",
        "c": "#0000fe",
        "d": "#8c00ff",
        "e": "#ff00fe",
        "f": "#ff008c"
    };

    function normHex(s) {
        if (!s) return "";
        s = String(s).trim();
        if (s.startsWith("0x") || s.startsWith("0X")) s = s.slice(2);
        return s.toLowerCase();
    }

    function drawGuildHex(canvas, hex, { cellPx = 8, transparentZero = true, swap67 = true } = {}) {
        hex = normHex(hex);
        if (!/^[0-9a-f]{64}$/.test(hex)) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return false;
        }

        const pal = { ...PALETTE };
        if (swap67) { const t = pal["6"]; pal["6"] = pal["7"]; pal["7"] = t; }

        const size = 8;
        const px = Math.max(1, cellPx);
        canvas.width = size * px;
        canvas.height = size * px;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 64; i++) {
            const ch = hex[i];
            const color = (ch === "0" && transparentZero) ? null : pal[ch];
            if (!color || color === "transparent") continue;
            const x = (i % 8) * px;
            const y = Math.floor(i / 8) * px;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, px, px);
        }
        return true;
    }

    w.PKGuild = { drawGuildHex };
})(window);
