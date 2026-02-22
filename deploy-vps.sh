#!/bin/bash
# VPS da ishga tushiring: ssh root@45.92.173.33

# ============================================
# 1. ASOSIY DASTURLARNI O'RNATISH
# ============================================

apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx

# PM2
npm install -g pm2

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# ============================================
# 2. LOYIHANI GITHUB DAN CLONE QILISH
# ============================================

mkdir -p /var/www
cd /var/www
rm -rf moo
git clone https://github.com/JahongirOfficial/moo.git moo
cd moo

# ============================================
# 3. ENVIRONMENT SOZLASH
# ============================================

cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/mukammal-ota-ona
PORT=3001
JWT_SECRET=super_secret_jwt_key_change_this_in_production_123456

# Telegram Bot (ixtiyoriy)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_ID=

# Groq AI (ixtiyoriy)
GROQ_API_KEY=
EOF

# ============================================
# 4. BUILD QILISH
# ============================================

npm install
npm run build

# Uploads papkasi
mkdir -p uploads
chmod 755 uploads

# ============================================
# 5. PM2 CONFIG
# ============================================

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'moo',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: '/var/www/moo',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# ============================================
# 6. NGINX SOZLASH
# ============================================

cat > /etc/nginx/sites-available/moo << 'EOF'
server {
    listen 80;
    server_name 45.92.173.33;

    root /var/www/moo/dist;
    index index.html;

    # Uploads
    location /uploads/ {
        alias /var/www/moo/uploads/;
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
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }

    # Payments endpoint
    location /payments {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # React Router SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

ln -sf /etc/nginx/sites-available/moo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================
# 7. FIREWALL
# ============================================

ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "✅ DEPLOY TUGADI!"
echo "🌐 Sayt: http://45.92.173.33"
echo ""
echo "Tekshirish:"
echo "  pm2 status"
echo "  pm2 logs moo"
