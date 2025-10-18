# MU Online - Website Gaming Chính Thức

![MU Online](https://img.shields.io/badge/MU%20Online-Gaming%20Website-orange)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎮 Giới Thiệu

Website chính thức của game MU Online với thiết kế hiện đại, responsive và đầy đủ tính năng cho cộng đồng game thủ. Website được xây dựng với công nghệ web tiên tiến, mang đến trải nghiệm người dùng tuyệt vời trên mọi thiết bị.

## ✨ Tính Năng Chính

### 🏠 Trang Chủ
- Hero section với video background ấn tượng
- Thống kê real-time về số người chơi online
- Thiết kế gradient và hiệu ứng animation hiện đại
- Responsive hoàn toàn trên mọi thiết bị

### ⚔️ Nhân Vật (Character Classes)
- Giới thiệu chi tiết 4 class nhân vật chính:
  - **Dark Knight**: Chiến binh cận chiến mạnh mẽ
  - **Dark Wizard**: Pháp sư hắc ám với sức mạnh ma thuật
  - **Fairy Elf**: Cung thủ nhanh nhẹn và hỗ trợ đội
  - **Magic Gladiator**: Chiến binh ma pháp đa năng
- Thanh thống kê kỹ năng interactive
- Hover effects và animations mượt mà

### 📰 Tin Tức & Sự Kiện
- Layout tin tức dạng card hiện đại
- Phân loại tin tức theo category
- Tin nổi bật với layout đặc biệt
- Tích hợp meta data (ngày, thể loại)

### 💾 Tải Game
- Thông tin cấu hình tối thiểu
- Nút download với progress simulation
- Hỗ trợ đa platform (Windows, Mobile sắp tới)
- Animation feedback khi click

### 👤 Đăng Ký/Đăng Nhập
- Form validation real-time
- Password strength indicator
- Chuyển đổi form mượt mà
- Notification system đẹp mắt
- Security validation patterns

## 🛠️ Công Nghệ Sử Dụng

### Frontend Technologies
- **HTML5**: Semantic markup với cấu trúc clean
- **CSS3**: 
  - CSS Grid & Flexbox layouts
  - CSS Variables cho theming
  - Advanced animations & transitions
  - Gradient effects & glassmorphism
- **JavaScript ES6+**:
  - Modular architecture
  - Class-based components
  - Intersection Observer API
  - Web APIs integration

### Design Features
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Graceful degradation
- **Accessibility**: WCAG guidelines compliance
- **Performance**: Optimized loading & rendering
- **Cross-browser**: Compatible với các browser chính

## 📁 Cấu Trúc Dự Án

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
├── images/                   # Assets & media files
│   ├── logo.png
│   ├── hero-video.mp4
│   ├── dark-knight.jpg
│   ├── dark-wizard.jpg
│   ├── fairy-elf.jpg
│   ├── magic-gladiator.jpg
│   ├── news-1.jpg
│   ├── news-2.jpg
│   └── news-3.jpg
├── pages/                    # Additional pages
├── index.html               # Main homepage
└── README.md               # Documentation
```

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- Web browser hiện đại (Chrome, Firefox, Safari, Edge)
- VS Code (khuyến nghị)
- Live Server extension (cho development)

### Cách Chạy

1. **Clone hoặc download project**
   ```bash
   git clone <repository-url>
   cd WEB PKCLEAR
   ```

2. **Mở trong VS Code**
   ```bash
   code .
   ```

3. **Cài đặt Live Server extension** (nếu chưa có)
   - Mở VS Code Extensions
   - Tìm kiếm "Live Server"
   - Cài đặt extension của Ritwick Dey

4. **Chạy website**
   - Click phải vào `index.html`
   - Chọn "Open with Live Server"
   - Website sẽ mở tại `http://localhost:5500`

### Development Server
```bash
# Sử dụng Python (nếu có)
python -m http.server 8000

# Sử dụng Node.js (nếu có)
npx serve .

# Sử dụng PHP (nếu có)
php -S localhost:8000
```

## 🎨 Tùy Chỉnh & Phát Triển

### Colors Scheme
```css
/* Primary Colors */
--primary: #ff6b35;
--primary-dark: #f7931e;
--accent: #ffcc02;

/* Background Colors */
--bg-dark: #0a0a0a;
--bg-medium: #1a1a1a;
--bg-light: #2a2a2a;

/* Text Colors */
--text-primary: #ffffff;
--text-secondary: #cccccc;
```

### Typography
- **Display Font**: Orbitron (Google Fonts)
- **Body Font**: Roboto (Google Fonts)
- **Icons**: Font Awesome 6

### Responsive Breakpoints
```css
/* Mobile Small */
@media (max-width: 479px)

/* Mobile Large */
@media (max-width: 767px)

/* Tablet */
@media (max-width: 991px)

/* Desktop */
@media (max-width: 1199px)

/* Large Desktop */
@media (min-width: 1200px)
```

## 📱 Tính Năng Responsive

- **Mobile First Design**: Tối ưu cho mobile trước
- **Adaptive Navigation**: Menu hamburger trên mobile
- **Flexible Layouts**: Grid/Flexbox adaptive
- **Touch Optimized**: Buttons và interactions cho touch
- **Performance**: Optimized cho mobile networks

## 🔧 Tính Năng JavaScript

### Core Features
- **Smooth Scrolling**: Navigation mượt mà
- **Intersection Observer**: Lazy loading & animations
- **Form Validation**: Real-time validation
- **Progress Animations**: Counter animations
- **Particle System**: Background effects

### Advanced Features
- **Loading Screen**: Custom loading animation
- **Back to Top**: Scroll-based button
- **Password Strength**: Real-time strength checking
- **Notification System**: Toast notifications
- **Animation Framework**: Custom animation utilities

## 🌟 Highlights

### Performance Features
- **Lazy Loading**: Images và content
- **Optimized Assets**: Compressed images & minified code
- **Efficient Animations**: Hardware-accelerated CSS
- **Minimal Dependencies**: Lightweight codebase

### User Experience
- **Intuitive Navigation**: Clear user flow
- **Visual Feedback**: Hover states & transitions
- **Loading States**: Progress indicators
- **Error Handling**: Graceful error messages
- **Accessibility**: Screen reader friendly

### Modern Web Standards
- **Semantic HTML**: Clean markup structure
- **CSS Custom Properties**: Maintainable theming
- **ES6+ JavaScript**: Modern JS patterns
- **Progressive Enhancement**: Works without JS

## 📞 Hỗ Trợ & Liên Hệ

- **Email**: support@muonline.com
- **Discord**: MU Online Community
- **Facebook**: /MUOnlineVietnam
- **Website**: https://muonline.com

## 📄 License

© 2025 MU Online. Tất cả quyền được bảo lưu.

---

**Made with ❤️ for MU Online Community**
