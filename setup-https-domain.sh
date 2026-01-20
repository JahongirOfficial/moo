#!/bin/bash
# HTTPS va mukammalotaona.uz domenini sozlash
# VPS da ishga tushiring: ssh root@164.68.109.208 'bash -s' < setup-https-domain.sh

set -e

echo "=========================================="
echo "HTTPS va DOMEN SOZLASH"
echo "Domen: mukammalotaona.uz"
echo "=========================================="
echo ""

# 1. Certbot o'rnatish
echo "[1/4] Certbot o'rnatilmoqda..."
apt update
apt install -y certbot python3-certbot-nginx

# 2. Nginx config yangilash (domen bilan)
echo "[2/4] Nginx config yangilanmoqda..."
cat > /etc/nginx/sites-available/mo << 'EOF'
server {
    listen 80;
    server_name mukammalotaona.uz www.mukammalotaona.uz 164.68.109.208;

    root /var/www/mo/dist;
    index index.html;

    # Uploads
    location /uploads/ {
        alias /var/www/mo/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }

    # Payments endpoint
    location /payments {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Nginx tekshirish va restart
nginx -t && systemctl restart nginx

# 3. SSL sertifikat olish (Let's Encrypt)
echo "[3/4] SSL sertifikat olinmoqda..."
echo ""
echo "MUHIM: Avval DNS sozlang!"
echo "mukammalotaona.uz -> 164.68.109.208 (A record)"
echo "www.mukammalotaona.uz -> 164.68.109.208 (A record)"
echo ""
read -p "DNS sozlandimi? (y/n): " dns_ready

if [ "$dns_ready" = "y" ] || [ "$dns_ready" = "Y" ]; then
    certbot --nginx -d mukammalotaona.uz -d www.mukammalotaona.uz --non-interactive --agree-tos --email admin@mukammalotaona.uz --redirect
    
    echo ""
    echo "[4/4] SSL avtomatik yangilanishni sozlash..."
    # Certbot avtomatik yangilaydi, lekin tekshiramiz
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    echo ""
    echo "=========================================="
    echo "TAYYOR!"
    echo "=========================================="
    echo ""
    echo "Sayt manzillari:"
    echo "  https://mukammalotaona.uz"
    echo "  https://www.mukammalotaona.uz"
    echo ""
else
    echo ""
    echo "DNS sozlangandan keyin quyidagi buyruqni ishga tushiring:"
    echo ""
    echo "certbot --nginx -d mukammalotaona.uz -d www.mukammalotaona.uz"
    echo ""
fi
