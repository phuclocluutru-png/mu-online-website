# 🚀 Hướng Dẫn Deploy API Server MU Online

## 📋 Chuẩn Bị Trước Khi Deploy

### 1. **Domain & SSL**
```bash
# Đảm bảo domain api.pkclear.com đã trỏ về VPS IP
# Cài đặt SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.pkclear.com
```

### 2. **Database Connection**
- Đảm bảo VPS có thể connect đến SQL Server database
- Test connection từ VPS:
```bash
# Install sqlcmd
sudo apt install mssql-tools18 unixodbc-dev

# Test connection
sqlcmd -S your-db-server,1456 -U sa -P your-password -Q "SELECT TOP 1 Name FROM Character"
```

### 3. **Cấu Hình .env**
```env
DB_HOST=your-db-server-ip
DB_PORT=1456
DB_NAME=MUPKClear
DB_USER=sa
DB_PASS=your-actual-password
DB_ENCRYPT=yes
DB_TRUST_SERVER_CERT=yes
ALLOWED_ORIGIN=https://pkclear.com
```

## 🛠️ Deploy Steps

### **Bước 1: Upload Files**
```bash
# Upload toàn bộ thư mục API Server lên VPS
scp -r API Server/* user@vps:/tmp/api-files/
```

### **Bước 2: Chạy Script Install**
```bash
# Trên VPS
cd /tmp/api-files
sudo bash scripts/install_ubuntu.sh
```

### **Bước 3: Cấu Hình Database**
```bash
# Copy .env đã config
sudo cp .env /var/www/api.pkclear.com/
sudo chown www-data:www-data /var/www/api.pkclear.com/.env
```

### **Bước 4: Test API**
```bash
# Test health check
curl https://api.pkclear.com/health

# Test character ranking API (for Nhân Vật tab)
curl "https://api.pkclear.com/character/top?limit=5"
```

## 🔍 Troubleshooting

### **Lỗi Database Connection**
```bash
# Check PHP logs
sudo tail -f /var/log/php8.2-fpm.log

# Test manual connection
php -r "
try {
    \$pdo = new PDO('sqlsrv:Server=your-db-server,1456;Database=MUPKClear', 'sa', 'password');
    echo 'Connected successfully';
} catch(Exception \$e) {
    echo 'Connection failed: ' . \$e->getMessage();
}
"
```

### **Lỗi CORS**
- Đảm bảo ALLOWED_ORIGIN trong .env khớp với domain website
- Check browser console cho CORS errors

### **Lỗi 404**
- Đảm bảo nginx đã reload: `sudo systemctl reload nginx`
- Check file permissions: `sudo chown -R www-data:www-data /var/www/api.pkclear.com`

## 📊 Monitor & Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/api.pkclear.com.access.log

# PHP errors
sudo tail -f /var/log/php8.2-fpm.log

# Check API health
curl https://api.pkclear.com/health
```

## ✅ Kiểm Tra Hoạt Động

Sau khi deploy thành công:

1. **API Health**: `https://api.pkclear.com/health`
2. **Character Ranking**: `https://api.pkclear.com/character/top?limit=10`
3. **Website Integration**: Bảng xếp hạng trên `https://pkclear.com` sẽ load data thật từ character API

🎉 **API Server đã sẵn sàng cung cấp dữ liệu cho website MU Online!**
