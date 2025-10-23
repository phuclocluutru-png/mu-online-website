<div align="center">

# 🎮 MU PK CLEAR – Official Website

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?logo=php&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

**Website chính thức cho cộng đồng MU PK CLEAR** – Nơi hội tụ bảng xếp hạng, hệ thống sự kiện thời gian thực, tin tức cập nhật và trải nghiệm tải game chuyên nghiệp.

[🌐 Truy cập Website](https://phuclocluutru-png.github.io/mu-online-website/) • [📖 API Documentation](./DEPLOY-API.md) • [📋 Báo Cáo Dự Án](./baocao.txt)

</div>

## ✨ Tính Năng Chính

### 🏆 **Bảng Xếp Hạng Chi Tiết**
- **8 Danh Mục Chính:** Nhân Vật, Guild, Boss, Boss Guild, Loạn Chiến, Blood Castle, Devil Square, Chaos Castle
- **Top 10** dữ liệu thời gian thực với thông tin đầy đủ (Level, Reset, Relife, Class)
- **Auto-render** khi chuyển đổi tab, **fallback** dữ liệu nếu API không phản hồi
- **Guild Logo** hiển thị trực quan cho các guild hàng đầu

### ⚔️ **Hệ Thống Sự Kiện Thời Gian Thực**
- **Countdown thông minh** với 3 trạng thái: `Đang diễn ra`, `Chuẩn bị` (≤10 phút), `Chờ đến giờ`
- **Tooltip chi tiết** hiển thị: Giờ xuất hiện, Bản đồ, Ghi chú, Danh sách vật phẩm rơi, Phần thưởng Wcoin
- **Auto sắp xếp** ưu tiên event đang diễn ra và sắp diễn ra
- **Lịch event** dễ dàng cấu hình trong `events-data.js`

### 📰 **Hệ Thống Tin Tức**
- **Tích hợp WordPress** API để lấy tin tức mới nhất
- **Lazy loading** và **pagination** cho hiệu năng tối ưu
- **Danh mục bài viết** động từ WordPress
- **Responsive design** cho mọi thiết bị

### 📥 **Modal Download Game Chuyên Nghiệp**
- **Điều khoản & Điều kiện** đầy đủ với toggle hiển thị
- **Checkbox chấp nhận** bắt buộc trước khi tải
- **2 Phương thức tải:** Direct download và Mega.nz
- **Hướng dẫn cài đặt** chi tiết với uninstall guide
- **Tái sử dụng** component trên nhiều trang

### 🎨 **UI/UX Hiện Đại**
- **Theme thương hiệu** tím + vàng với hiệu ứng glass nhẹ
- **Tab indicator động** di chuyển mượt mà theo lựa chọn
- **Tooltip thông minh** tránh tràn viewport, theo chuột
- **Responsive scaling** giữ layout desktop trên mọi thiết bị
- **Scrollbar tùy biến** với WebKit và Firefox fallback

## 🏗️ Kiến Trúc & Công Nghệ

### **Frontend Stack**
- **HTML5** với semantic markup và accessibility
- **CSS3** với CSS Variables, Flexbox, Grid, và animations
- **Vanilla JavaScript ES6+** với ES Modules, không dependencies runtime
- **Component-based architecture** với HTML partials và modular CSS/JS

### **Backend API (Tùy Chọn)**
- **PHP 8.1+** với PDO và prepared statements
- **SQL Server** database connection với encryption
- **RESTful API** endpoints cho rankings, events, news
- **Rate limiting** và **CORS** protection
- **Error handling** và **logging** chi tiết

### **DevOps & Deployment**
- **GitHub Pages** cho frontend static hosting
- **VPS deployment** cho API server với Nginx
- **SSL certificates** với Let's Encrypt
- **Automated deployment** với webhooks

## 📁 Cấu Trúc Thư Mục

```
WEB PKCLEAR/
├── 📄 index.html                 # Trang chính với HTML includes
├── 📄 package.json               # Dependencies và scripts
├── 📄 README.md                  # Tài liệu dự án
├── 📄 DEPLOY-API.md             # Hướng dẫn deploy API
├── 📄 baocao.txt                # Báo cáo đánh giá dự án
├── 📄 webhook-deploy.php        # Webhook tự động deploy
│
├── 🎨 css/                      # Stylesheets
│   ├── 📄 base.css              # CSS Variables & reset cơ bản
│   ├── 📄 style.css             # Legacy styles
│   └── 📄 components/           # Component-specific styles
│       ├── 📄 header.css
│       ├── 📄 hero.css
│       ├── 📄 footer.css
│       ├── 📄 rankings.css
│       ├── 📄 news.css
│       └── 📄 modal-download.css
│
├── ⚙️ js/                       # JavaScript modules
│   ├── 📄 main.js               # Orchestrator chính
│   ├── 📄 includes.js           # HTML partials loader
│   ├── 📄 rankings.js           # Logic bảng xếp hạng
│   ├── 📄 rankings-data.js      # Dữ liệu mẫu rankings
│   ├── 📄 events.js             # Hệ thống sự kiện
│   ├── 📄 events-data.js        # Cấu hình lịch event
│   ├── 📄 event-drops.js        # Danh sách drops & rewards
│   ├── 📄 time-utils.js         # Utilities thời gian
│   ├── 📄 scaling.js            # Responsive scaling
│   ├── 📄 news.js               # Tích hợp WordPress
│   ├── 📄 news-config.js        # Cấu hình WordPress API
│   ├── 📄 modal-download.js     # Logic modal download
│   └── 📄 services/             # Service modules
│       └── 📄 rankings.js
│
├── 🖼️ images/                   # Static assets
│   ├── 📄 logo.png
│   ├── 📄 bg.png
│   └── 📄 guild-logos/
│
├── 📄 includes/                 # HTML partials
│   ├── 📁 layout/               # Layout components
│   │   ├── 📄 header.html
│   │   └── 📄 footer.html
│   ├── 📁 sections/             # Page sections
│   │   ├── 📄 hero.html
│   │   ├── 📄 rankings.html
│   │   └── 📄 news.html
│   └── 📄 modal-download.html   # Download modal component
│
├── 📄 pages/                    # Additional pages
│   └── 📄 post.html             # Individual post page
│
├── 🚀 API Server/               # Backend API (optional)
│   ├── 📁 public/               # Public API endpoints
│   │   ├── 📄 index.php
│   │   └── 📁 endpoints/
│   │       ├── 📄 rankings.php
│   │       ├── 📄 events.php
│   │       └── 📄 topboss.php
│   ├── 📁 config/               # Configuration files
│   │   ├── 📄 database.php
│   │   └── 📄 cors.php
│   ├── 📁 scripts/              # Deployment scripts
│   │   └── 📄 install_ubuntu.sh
│   └── 📄 composer.json         # PHP dependencies
│
├── 📂 Download/                 # Game download files
├── 📂 .github/                  # GitHub configurations
└── 📂 .vscode/                  # VS Code settings
```

## 🚀 Cài Đặt & Chạy Local

### **Yêu Cầu Hệ Thống**
- **Node.js** 18.0+ (cho development server)
- **PHP** 8.1+ (cho API server - tùy chọn)
- **SQL Server** (cho database - tùy chọn)

### **Chạy Frontend**
```bash
# Clone repository
git clone https://github.com/phuclocluutru-png/mu-online-website.git
cd mu-online-website

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
# hoặc
npm start

# Truy cập: http://localhost:3000
```

### **Chạy API Server (Tùy Chọn)**
```bash
# Di chuyển vào thư mục API
cd "API Server/public"

# Chạy PHP built-in server
php -S localhost:8080

# API sẽ có tại: http://localhost:8080
```

## 🌐 Triển Khai Production

### **Frontend (GitHub Pages)**
1. Push code lên branch `main`
2. Vào **Settings → Pages**
3. Chọn **Source: Deploy from a branch**
4. Chọn branch `main` và folder `/ (root)`
5. Chờ build hoàn tất và truy cập URL được cung cấp

### **API Server (VPS)**
Chi tiết xem [DEPLOY-API.md](./DEPLOY-API.md)

```bash
# Upload files lên VPS
scp -r API\ Server/* user@vps:/tmp/api-files/

# Chạy script cài đặt
ssh user@vps
cd /tmp/api-files
sudo bash scripts/install_ubuntu.sh
```

## 🔌 API Endpoints

### **Frontend Integration**
Website tự động fallback sang dữ liệu mẫu nếu API không khả dụng.

```javascript
// Rankings API
GET /api/rankings/top-players
GET /api/rankings/top-guilds
GET /api/rankings/top-boss

// Events API
GET /api/events/active
GET /api/events/schedule

// News API (WordPress)
GET /wp-json/wp/v2/posts
GET /wp-json/wp/v2/categories
```

### **Response Format**
```json
{
  "success": true,
  "data": [
    {
      "name": "PlayerName",
      "level": 400,
      "reset": 5,
      "relife": 3,
      "class": "Dark Lord",
      "guild": "GuildName"
    }
  ],
  "timestamp": "2025-10-24T10:00:00Z"
}
```

## ⚙️ Tùy Chỉnh & Cấu Hình

### **Cấu Hình Rankings**
```javascript
// js/rankings-data.js
export const rankingsData = {
  players: [/* Top 10 players */],
  guilds: [/* Top 10 guilds */],
  // ...
};
```

### **Cấu Hình Events**
```javascript
// js/events-data.js
export const eventsData = [
  {
    name: "Blood Castle",
    times: ["10:00", "14:00", "18:00"],
    duration: 30,
    map: "Blood Castle",
    note: "Yêu cầu level 15+",
    drops: ["Jewel of Chaos", "Jewel of Soul"]
  }
];
```

### **Cấu Hình WordPress**
```javascript
// js/news-config.js
export const WP_CONFIG = {
  BASE_URL: 'https://your-wordpress-site.com',
  NEWS_PAGE_SIZE: 6,
  CACHE_DURATION: 300000 // 5 minutes
};
```

### **Cấu Hình Modal Download**
```html
<!-- includes/modal-download.html -->
<!-- Chỉnh sửa terms, download links, install guide -->
```

## 📱 Responsive & Performance

### **Responsive Strategy**
- **Desktop-first scaling** giữ nguyên layout trên mọi thiết bị
- **CSS Variables** cho consistent theming
- **Flexbox/Grid** cho flexible layouts
- **ResizeObserver** đồng bộ chiều cao components

### **Performance Optimizations**
- **ES Modules** với tree shaking tự nhiên
- **Single countdown loop** giảm CPU usage
- **Lazy loading** cho images và content
- **SessionStorage caching** cho news data
- **Tooltip on-demand rendering**

## 🛡️ Bảo Mật & Best Practices

### **Frontend Security**
- **Content Security Policy** headers
- **Input sanitization** cho user inputs
- **HTTPS enforcement** trên production
- **Rate limiting** cho API calls

### **API Security**
- **PDO prepared statements** chống SQL injection
- **CORS configuration** giới hạn origins
- **Input validation** và **type checking**
- **Error logging** không expose sensitive data

### **Database Security**
- **Encrypted connections** với SQL Server
- **Least privilege principle** cho database users
- **Parameterized queries** cho tất cả operations

## 🗺️ Roadmap & Tính Năng Sắp Ra

### **Phase 1 (Current)**
- ✅ Bảng xếp hạng với 8 categories
- ✅ Hệ thống events với countdown
- ✅ Modal download với terms acceptance
- ✅ WordPress news integration
- ✅ Responsive scaling

### **Phase 2 (Upcoming)**
- 🔄 **Real-time updates** với WebSocket
- 🔄 **User authentication** system
- 🔄 **Guild management** interface
- 🔄 **Event notifications** push
- 🔄 **Mobile app** companion

### **Phase 3 (Future)**
- 📋 **Advanced analytics** dashboard
- 📋 **Tournament system** integration
- 📋 **Marketplace** for items
- 📋 **Voice chat** integration
- 📋 **Multi-language** support

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. **Fork** repository
2. **Tạo feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Tạo Pull Request**

### **Coding Standards**
- Sử dụng **ES6+ features** và **modern CSS**
- **Semantic HTML** với accessibility
- **Descriptive commit messages**
- **Modular code** với single responsibility
- **Comprehensive documentation**

## 📄 License & Credits

**© 2025 MU PK CLEAR Community**

Licensed under [MIT License](LICENSE) - See [LICENSE](LICENSE) file for details.

### **Credits**
- **Game Assets:** MU Online by Webzen
- **Icons:** Custom designed for MU PK CLEAR
- **Fonts:** System fonts với web-safe fallbacks
- **Development:** Community-driven project

### **Disclaimer**
This project is not affiliated with Webzen Inc. or official MU Online. All trademarks and copyrights belong to their respective owners.

---

<div align="center">

**Made with ❤️ for the MU PK CLEAR Community**

[🌐 Website](https://phuclocluutru-png.github.io/mu-online-website/) • [🐛 Issues](https://github.com/phuclocluutru-png/mu-online-website/issues) • [📧 Contact](mailto:contact@pkclear.com)

</div>
