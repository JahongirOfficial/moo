# Deploy Qo'llanmasi - 164.68.109.208

Server: **164.68.109.208**  
Papka: **/var/www/mo**  
Sayt: **http://164.68.109.208**

---

## 🚀 BIRINCHI MARTA DEPLOY QILISH

### Variant 1: GitHub dan avtomatik deploy (TAVSIYA ETILADI)

```bash
# Lokal terminaldan ishga tushiring:
ssh root@164.68.109.208 'bash -s' < deploy-164.sh
```

Bu script:
- ✅ Node.js, MongoDB, Nginx, PM2 o'rnatadi
- ✅ GitHub dan loyihani clone qiladi
- ✅ Build qiladi va ishga tushiradi
- ✅ Nginx va firewall sozlaydi

---

### Variant 2: Lokal fayllardan deploy (SCP)

```powershell
# Windows PowerShell dan:
.\deploy-local-to-164.ps1
```

Bu script:
- ✅ Lokal build qiladi
- ✅ SCP orqali fayllarni yuklaydi
- ✅ Serverda npm install va PM2 restart qiladi

---

## 🔄 YANGILANISHLARNI DEPLOY QILISH

### GitHub orqali yangilash:

```bash
ssh root@164.68.109.208 'bash -s' < update-deploy-164.sh
```

### Lokal fayllardan yangilash:

```powershell
.\deploy-local-to-164.ps1
```

---

## 📊 MONITORING VA TEKSHIRISH

### SSH orqali ulaning:

```bash
ssh root@164.68.109.208
```

### Server holatini tekshirish:

```bash
# PM2 status
pm2 status
pm2 logs mo

# MongoDB
systemctl status mongod

# Nginx
systemctl status nginx

# Disk space
df -h

# Memory
free -h
```

---

## 🛠️ QOIDA BUYRUQLAR

### PM2 boshqaruvi:

```bash
pm2 restart mo      # Qayta ishga tushirish
pm2 stop mo         # To'xtatish
pm2 start mo        # Ishga tushirish
pm2 logs mo         # Loglarni ko'rish
pm2 logs mo --lines 100  # Oxirgi 100 qator
```

### Nginx boshqaruvi:

```bash
nginx -t                    # Config tekshirish
systemctl restart nginx     # Qayta ishga tushirish
systemctl status nginx      # Status
tail -f /var/log/nginx/error.log  # Error log
```

### MongoDB boshqaruvi:

```bash
systemctl status mongod     # Status
systemctl restart mongod    # Qayta ishga tushirish
mongosh                     # MongoDB shell
```

---

## 🔧 MUAMMOLARNI HAL QILISH

### Server ishlamayapti:

```bash
cd /var/www/mo
pm2 logs mo
pm2 restart mo
```

### Nginx xatolik beradi:

```bash
nginx -t
systemctl restart nginx
tail -f /var/log/nginx/error.log
```

### MongoDB ulanmayapti:

```bash
systemctl status mongod
systemctl restart mongod
```

### Disk to'lgan:

```bash
df -h
du -sh /var/www/mo/*
# node_modules ni tozalash:
cd /var/www/mo
rm -rf node_modules
npm install --production
```

---

## 📁 FAYL TUZILMASI

```
/var/www/mo/
├── dist/              # Frontend build
├── server/            # Backend kod
├── uploads/           # Yuklangan fayllar
├── public/            # Static fayllar
├── node_modules/      # Dependencies
├── package.json
├── tsconfig.json
├── ecosystem.config.cjs
└── .env              # Environment variables
```

---

## 🔒 XAVFSIZLIK

### Firewall:

```bash
ufw status
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### .env faylini himoyalash:

```bash
chmod 600 /var/www/mo/.env
```

### JWT Secret o'zgartirish:

```bash
nano /var/www/mo/.env
# JWT_SECRET ni o'zgartiring
pm2 restart mo
```

---

## 🌐 DOMEN ULASH (ixtiyoriy)

Agar domen ulasangiz (masalan: mukammalotaona.uz):

```bash
# Nginx config yangilash
nano /etc/nginx/sites-available/mo

# server_name qatorini o'zgartiring:
server_name mukammalotaona.uz www.mukammalotaona.uz;

# SSL sertifikat o'rnatish (Let's Encrypt)
apt install certbot python3-certbot-nginx
certbot --nginx -d mukammalotaona.uz -d www.mukammalotaona.uz
```

---

## 📞 YORDAM

Muammo yuzaga kelsa:

1. Loglarni tekshiring: `pm2 logs mo`
2. Nginx loglarni ko'ring: `tail -f /var/log/nginx/error.log`
3. MongoDB statusni tekshiring: `systemctl status mongod`

---

**Sayt manzili:** http://164.68.109.208
