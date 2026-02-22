# VPS Deploy Qo'llanmasi (45.92.173.33)

## 1-QADAM: VPS ga SSH orqali ulaning

```bash
ssh root@45.92.173.33
```

## 2-QADAM: Tizimni yangilash va kerakli dasturlarni o'rnatish

```bash
# Tizimni yangilash
apt update && apt upgrade -y

# Node.js 20 o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Git, Nginx, PM2 o'rnatish
apt install -y git nginx
npm install -g pm2

# MongoDB o'rnatish
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

## 3-QADAM: Loyihani yuklash

```bash
# Papka yaratish
mkdir -p /var/www
cd /var/www

# Git orqali yuklash (yoki SCP bilan)
git clone YOUR_REPO_URL mukammal-ota-ona
cd mukammal-ota-ona

# Yoki lokal kompyuterdan SCP bilan yuklash:
# scp -r ./* root@45.92.173.33:/var/www/mukammal-ota-ona/
```

## 4-QADAM: Environment sozlash

```bash
cd /var/www/mukammal-ota-ona

# .env fayl yaratish
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/mukammal-ota-ona
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_change_this_123456

# Telegram Bot (ixtiyoriy)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_ID=your_telegram_admin_id

# Groq AI (ixtiyoriy)
GROQ_API_KEY=your_groq_api_key
EOF
```

## 5-QADAM: Loyihani build qilish

```bash
cd /var/www/mukammal-ota-ona

# Dependencies o'rnatish
npm install

# Frontend build
npm run build

# Uploads papkasini yaratish
mkdir -p uploads
chmod 755 uploads
```

## 6-QADAM: PM2 bilan serverni ishga tushirish

```bash
# ecosystem.config.cjs fayl yaratish
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'mukammal-ota-ona',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: '/var/www/mukammal-ota-ona',
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

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 7-QADAM: Nginx sozlash

```bash
# Nginx config yaratish
cat > /etc/nginx/sites-available/mukammal-ota-ona << 'EOF'
server {
    listen 80;
    server_name 45.92.173.33;

    # Frontend (React build)
    root /var/www/mukammal-ota-ona/dist;
    index index.html;

    # Uploads papkasi
    location /uploads/ {
        alias /var/www/mukammal-ota-ona/uploads/;
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

    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Symlink yaratish va nginx qayta ishga tushirish
ln -sf /etc/nginx/sites-available/mukammal-ota-ona /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 8-QADAM: Firewall sozlash

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## 9-QADAM: Tekshirish

```bash
# Server ishlayaptimi?
pm2 status
pm2 logs mukammal-ota-ona

# MongoDB ishlayaptimi?
systemctl status mongod

# Nginx ishlayaptimi?
systemctl status nginx
```

---

## TEZKOR DEPLOY SCRIPT

Barcha qadamlarni bitta script bilan bajarish:

```bash
#!/bin/bash
# deploy.sh - VPS da ishga tushiring

apt update && apt upgrade -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx

# PM2
npm install -g pm2

# MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl start mongod && systemctl enable mongod

echo "✅ Asosiy dasturlar o'rnatildi!"
echo "Endi loyihani /var/www/mukammal-ota-ona papkasiga yuklang"
```

---

## Lokal kompyuterdan fayllarni yuklash

Windows PowerShell dan:

```powershell
# Build qilish
npm run build

# Fayllarni yuklash (SCP)
scp -r dist root@45.92.173.33:/var/www/mukammal-ota-ona/
scp -r server root@45.92.173.33:/var/www/mukammal-ota-ona/
scp -r uploads root@45.92.173.33:/var/www/mukammal-ota-ona/
scp package.json root@45.92.173.33:/var/www/mukammal-ota-ona/
scp tsconfig.json root@45.92.173.33:/var/www/mukammal-ota-ona/
scp .env root@45.92.173.33:/var/www/mukammal-ota-ona/
```

---

## Sayt manzili

Deploy tugagandan so'ng sayt quyidagi manzilda ochiladi:

**http://45.92.173.33**
