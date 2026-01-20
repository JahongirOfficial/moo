#!/bin/bash
# VPS Deploy Script - 164.68.109.208
# Ishga tushirish: ssh root@164.68.109.208 'bash -s' < deploy-164.sh

set -e  # Xatolik bo'lsa to'xtatish

echo "🚀 Deploy boshlandi: 164.68.109.208 -> /var/www/mo"

# ============================================
# 1. TIZIMNI YANGILASH VA DASTURLAR O'RNATISH
# ============================================

echo "📦 Tizimni yangilash..."
apt update && apt upgrade -y

# Node.js 20
echo "📦 Node.js 20 o'rnatish..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx

# PM2
echo "📦 PM2 o'rnatish..."
npm install -g pm2

# MongoDB
echo "📦 MongoDB o'rnatish..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# ============================================
# 2. LOYIHANI GITHUB DAN CLONE QILISH
# ============================================

echo "📥 Loyihani GitHub dan yuklash..."
mkdir -p /var/www
cd /var/www

# Eski papkani o'chirish (agar mavjud bo'lsa)
if [ -d "mo" ]; then
    echo "⚠️  Eski /var/www/mo papkasi topildi, o'chirilmoqda..."
    pm2 delete mo 2>/dev/null || true
    rm -rf mo
fi

# GitHub dan clone qilish
git clone https://github.com/JahongirOfficial/moo.git mo
cd mo

# ============================================
# 3. ENVIRONMENT SOZLASH
# ============================================

echo "⚙️  Environment o'rnatish..."
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/mukammal-ota-ona
PORT=3001
JWT_SECRET=super_secret_jwt_key_change_this_in_production_164_68_109_208

# Telegram Bot (ixtiyoriy)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_ID=

# Groq AI (ixtiyoriy)
GROQ_API_KEY=
EOF

# ============================================
# 4. BUILD QILISH
# ============================================

echo "🔨 Loyihani build qilish..."
npm install
npm run build

# Uploads papkasi
mkdir -p uploads
chmod 755 uploads

# ============================================
# 5. PM2 CONFIG VA ISHGA TUSHIRISH
# ============================================

echo "🚀 PM2 bilan serverni ishga tushirish..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'mo',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: '/var/www/mo',
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

echo "🌐 Nginx sozlash..."
cat > /etc/nginx/sites-available/mo << 'EOF'
server {
    listen 80;
    server_name 164.68.109.208;

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

ln -sf /etc/nginx/sites-available/mo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================
# 7. FIREWALL SOZLASH
# ============================================

echo "🔒 Firewall sozlash..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# ============================================
# 8. NATIJALAR
# ============================================

echo ""
echo "✅ ============================================"
echo "✅ DEPLOY MUVAFFAQIYATLI TUGADI!"
echo "✅ ============================================"
echo ""
echo "🌐 Sayt manzili: http://164.68.109.208"
echo "📁 Papka: /var/www/mo"
echo ""
echo "📊 Tekshirish buyruqlari:"
echo "   pm2 status"
echo "   pm2 logs mo"
echo "   systemctl status mongod"
echo "   systemctl status nginx"
echo ""
