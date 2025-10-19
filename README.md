<div align="center">

# MU PK CLEAR – Website Tĩnh (Ranking & Event System)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Status](https://img.shields.io/badge/Status-Active-success)

Website tĩnh dành cho cộng đồng MU PK CLEAR: hiển thị Bảng Xếp Hạng (Top 10) và Hệ Thống Sự Kiện thời gian thực (đếm ngược, trạng thái, tooltip chi tiết drop – map – ghi chú – phần thưởng Wcoin). Kiến trúc hướng mở rộng để kết nối backend (API) sau này.

</div>

## ✅ Tính Năng Chính

**Bảng Xếp Hạng**
- Nhiều tab: Nhân Vật, Guild, Boss, Boss Guild, Loạn Chiến, BC, DV, CC.
- Top 10 dữ liệu mẫu (có thể thay bằng API thực tế), auto render khi đổi tab.
- Có sẵn fallback nếu API không phản hồi.
- Thiết kế thu gọn chiều ngang để hiển thị đồng thời thẻ Event.

**Hệ Thống Sự Kiện**
- Khai báo toàn bộ lịch event trong `events-data.js` (giờ xuất hiện, thời lượng, map, ghi chú).
- Tooltip động hiển thị: danh sách giờ, bản đồ, ghi chú, danh sách vật phẩm rơi (`event-drops.js`), thưởng Wcoin (`eventWcoinReward`).
- Đếm ngược tự động đến lần kế tiếp hoặc thời gian kết thúc nếu đang diễn ra.
- Phân loại trạng thái: `Đang diễn ra`, `Sắp diễn ra` (<=10 phút), `Chờ đến giờ`.
- Tự động sắp xếp: event đang diễn ra lên đầu, sau đó sự kiện gần kề.

**UI / UX**
- Theme tím + hiệu ứng glass nhẹ, gradient thương hiệu.
- Tab indicator động di chuyển theo tab chọn.
- Tooltip gọn, theo chuột, tránh tràn viewport.
- Đồng bộ chiều cao thẻ Event với thẻ Ranking bằng `ResizeObserver`.
- Scrollbar tùy biến (WebKit + fallback Firefox).

**Kiến Trúc & Mở Rộng**
- Module tách biệt: ranking, events, data, util – dễ gắn API thực.
- ES Modules (`type="module"`), không phụ thuộc thư viện ngoài.
- Dữ liệu sự kiện / ranking chuẩn hóa để có thể thay bằng fetch API.

## 🧩 Cấu Trúc Thư Mục

```
WEB PKCLEAR/
├── index.html                 # Trang chính + include fragments
├── includes/                  # HTML partials (header, footer, hero, rankings)
│   ├── layout/
│   │   ├── header.html
│   │   └── footer.html
│   └── sections/
│       ├── hero.html
│       └── rankings.html
├── css/
│   ├── base.css               # Biến màu & reset cơ bản
│   ├── components/            # Tập tin CSS thành phần
│   │   ├── header.css
│   │   ├── hero.css
│   │   ├── footer.css
│   │   └── rankings.css
│   ├── style.css              # (legacy / chung)
│   └── responsive.css         # breakpoint (sẽ tinh chỉnh thêm)
├── js/
│   ├── main.js                # Orchestrator: scaling + init modules
│   ├── rankings.js            # Logic tab + render dữ liệu ranking
│   ├── rankings-data.js       # Dữ liệu Top 10 mẫu
│   ├── events.js              # Render danh sách event + tooltip + loop trạng thái
│   ├── events-data.js         # Lịch event (giờ, map, note, duration)
│   ├── event-drops.js         # Drop item + Wcoin reward + format Wcoin
│   ├── time-utils.js          # Hàm thời gian, countdown chung
│   ├── scaling.js             # Giữ giao diện desktop trên màn hình nhỏ (scale wrapper)
│   ├── animations.js          # (dự phòng / hiệu ứng)
│   ├── forms.js               # (placeholder xử lý form)
│   └── includes.js            # Nạp HTML partials bằng data-include
├── images/                    # Asset (logo, icon, drops ...)
├── pages/                     # Trang bổ sung (nếu triển khai thêm)
├── .github/                   # Cấu hình Copilot / workflows
└── README.md
```

## 🚀 Chạy Local

```powershell
git clone https://github.com/<user>/<repo>.git
cd "WEB PKCLEAR"
python -m http.server 8000
# hoặc
npx serve .
```

Mở: http://localhost:8000

## 🌐 Triển Khai GitHub Pages
1. Push lên branch `main`.
2. Settings → Pages → Source: `Deploy from a branch` → Chọn `main` + root.
3. Chờ build hoàn tất, truy cập URL public.

## 🔌 Nối Backend (Tùy Chọn)
- Tạo API trả JSON cho các endpoint: `/api/rankings/top-players`, ...
- Trong `rankings.js` hàm `fetchRanking()` sẽ gọi API và nếu thành công sẽ override dữ liệu tĩnh.
- Timeout 4s → fallback dữ liệu cục bộ đảm bảo giao diện luôn hiển thị.

Ví dụ response:
```json
[
	{ "name": "DarkLordX", "level": 400, "reset": 5, "relife": 3, "cls": "Dark Lord", "guildLogo": "images/guild.png" }
]
```

## 🔧 Tùy Biến Nhanh
- Thay số lượng Top: sửa mảng trong `rankings-data.js` hoặc trả nhiều phần tử hơn từ API.
- Sửa giờ Event: cập nhật `events-data.js` (mảng `times`).
- Thêm drop mới: thêm vào `event-drops.js` dưới key tên event.
- Đổi chiều rộng cột Event: chỉnh biến CSS `--rank-event-width` trong `rankings.css`.

## 📱 Responsive
- Hiện dùng cơ chế scale giữ nguyên bố cục desktop trên màn hình nhỏ.
- Có thể chuyển sang layout mobile thực tế bằng cách bỏ scaling và thêm breakpoints chi tiết.

## ⚙️ Hiệu Năng & UX
- Một vòng lặp countdown duy nhất → giảm CPU.
- Tooltip chỉ render nội dung khi hiển thị.
- DOM cập nhật theo hàng, không reflow nặng.

## 🛡️ Bảo Mật (Định Hướng Backend)
- Sử dụng rate limit + token nếu API public.
- Không trả trực tiếp query SQL ra frontend.
- Sanitize dữ liệu (tránh XSS) khi hiển thị kết quả người chơi.

## 🗺️ Roadmap Ngắn
- [ ] Thêm cột Rank (#) cho từng bảng.
- [ ] Bộ lọc / tìm kiếm nhân vật.
- [ ] API thực tế từ database MU.
- [ ] Dark/Light theme toggle.
- [ ] Tối ưu mobile (không dùng scale) + menu đáp ứng.

## 📄 License / Bản Quyền
© 2025 MU PK CLEAR. All rights reserved.

---
Made with ❤️ cho cộng đồng MU PK CLEAR
