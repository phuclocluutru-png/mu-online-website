# MU PK CLEAR – Website Tĩnh

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript ES6](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![Site Type](https://img.shields.io/badge/Type-Static%20Site-success)

Website tĩnh phục vụ cộng đồng MU PK CLEAR: hiển thị bảng xếp hạng (Top 10) và hệ thống sự kiện thời gian thực với đếm ngược trạng thái, tooltip chi tiết drop – bản đồ – ghi chú – phần thưởng Wcoin (định dạng 30.000). Thiết kế hướng tới rõ ràng, dễ mở rộng backend sau này.

## ✨ Tính Năng Hiện Có

### 🏠 Trang Chủ
- Banner giới thiệu server (hero)
- Nút hành động chính: Tải game, Liên hệ admin
- Khối thông tin nhanh (Relife, Pet, Point)

### 📊 Bảng Xếp Hạng
- Tabs (chuẩn bị - UI có thể mở rộng nhiều loại ranking)
- Render Top 10 (có thể tăng số lượng dễ dàng)
- Màu sắc theo cấp / loại giúp đọc nhanh
- Tối ưu chiều cao để cân đối với khối sự kiện

### 🕒 Hệ Thống Sự Kiện (Real-time)
- Dữ liệu sự kiện khai báo trong module JS
- Tính toán trạng thái: Đang diễn ra / Sắp diễn ra / Chờ đến giờ
- Đồng hồ đếm ngược cập nhật mỗi giây
- Tự động sắp xếp: sự kiện đang diễn ra lên đầu
- Tooltip phong phú: tất cả giờ trong ngày, map, ghi chú, danh sách drop, Wcoin reward
- Định dạng Wcoin: 30.000 (dấu chấm phần nghìn)
- Chiều cao danh sách đồng bộ với bảng xếp hạng (ResizeObserver)
- Scrollbar tuỳ biến (fallback cho trình duyệt không hỗ trợ đầy đủ)

### 🎨 UI/UX
- Theme tím + glassmorphism nhẹ
- Hover rõ ràng từng dòng event & ranking
- Cấu trúc module tách biệt để mở rộng
- Responsive cơ bản (sẽ tinh chỉnh thêm breakpoints)

## 🛠️ Công Nghệ

### Frontend
- HTML5 semantic
- CSS3 (Flexbox, Custom Properties, gradients, shadows)
- JavaScript ES6 modules (import/export) + DOM API

### Kiến Trúc Module
- `main.js`: khởi tạo rankings + events + đồng bộ chiều cao
- `events.js`: render danh sách, cập nhật trạng thái & countdown, tooltip, reorder
- `rankings.js`: (cấu trúc cho bảng xếp hạng – mở rộng)
- `event-drops.js`: dữ liệu drop + format Wcoin
- `events-data.js`: thời gian, thời lượng, map, note
- `time-utils.js`: tiện ích xử lý thời gian toàn cục

### Thiết Kế
- Responsive (đang mở rộng)
- Progressive enhancement
- Tối ưu interval duy nhất thay vì nhiều timers rời
- Cross-browser (Chrome, Edge, Firefox; Cốc Cốc có hạn chế màu scrollbar)

## 📁 Cấu Trúc

```
WEB PKCLEAR/
├── .github/
│   └── copilot-instructions.md
├── css/
│   ├── style.css              # Main styles
│   └── responsive.css         # Responsive breakpoints
├── js/
│   ├── main.js               # Core functionality
│   ├── animations.js         # Animation systems
│   └── forms.js              # Form handling & validation
├── images/                   # Assets (logo, backgrounds,...)
├── pages/                    # Additional pages
├── index.html               # Main homepage
└── README.md               # Documentation
```

## 🚀 Chạy & Triển Khai

### Local
```bash
git clone https://github.com/<user>/<repo>.git
cd WEB\ PKCLEAR
python -m http.server 8000  # hoặc: npx serve .
```
Truy cập: http://localhost:8000

### GitHub Pages (Thủ Công)
1. Push code lên branch `main`
2. Settings → Pages → Source: `Deploy from a branch`, chọn `main` + `/ (root)`
3. Chờ build, URL: `https://<user>.github.io/<repo>/`

### GitHub Pages (Workflow Tự Động)
Workflow `.github/workflows/pages.yml` upload toàn bộ site mỗi lần push lên `main`.

### Yêu Cầu
- Trình duyệt hiện đại (Chrome, Edge, Firefox)
- Không cần backend để chạy tính năng hiện tại

## 📱 Responsive
- Layout chính hoạt động tốt ở desktop & mobile
- Sẽ tối ưu thêm cho breakpoint trung gian (tablet)
- Đảm bảo tooltip không tràn màn hình nhỏ

## 🔧 JavaScript Chính
- Đồng hồ đếm ngược toàn cục (interval duy nhất)
- Tối ưu DOM: cập nhật nội dung thay vì re-render full
- Tinh gọn: không dùng thư viện ngoài

## 🌟 Hiệu Năng & UX
- Ít request (chỉ assets tĩnh)
- Script nhẹ, không block render
- Tooltip hiển thị tức thì, di chuyển theo chuột
- Trạng thái sự kiện đổi màu trực quan

## 📄 License / Bản Quyền
© 2025 MU PK CLEAR. Mọi quyền được bảo lưu.

---
Made with ❤️ cho cộng đồng MU PK CLEAR
