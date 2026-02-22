#!/bin/bash
# VPS da ishga tushiring: ssh root@45.92.173.33
# Keyin: bash check-domain.sh

echo "=========================================="
echo "🔍 DOMEN VA SERVER TEKSHIRUVI"
echo "=========================================="
echo ""

# 1. Nginx konfiguratsiyasini ko'rish
echo "📋 1. NGINX KONFIGURATSIYA:"
echo "---"
cat /etc/nginx/sites-available/moo 2>/dev/null || echo "❌ Nginx config topilmadi"
echo ""

# 2. Nginx status
echo "📋 2. NGINX STATUS:"
echo "---"
systemctl status nginx --no-pager | head -5
echo ""

# 3. PM2 status
echo "📋 3. PM2 STATUS:"
echo "---"
pm2 status
echo ""

# 4. Server portini tekshirish
echo "📋 4. PORT 3001 ISHLAYAPTIMI:"
echo "---"
netstat -tlnp | grep 3001 || ss -tlnp | grep 3001
echo ""

# 5. Nginx portini tekshirish
echo "📋 5. PORT 80 ISHLAYAPTIMI:"
echo "---"
netstat -tlnp | grep :80 || ss -tlnp | grep :80
echo ""

# 6. DNS tekshiruvi
echo "📋 6. DNS TEKSHIRUVI (mukammalotaona.uz):"
echo "---"
nslookup mukammalotaona.uz 2>/dev/null || dig mukammalotaona.uz +short || echo "❌ DNS tool topilmadi"
echo ""

# 7. Curl bilan localhost tekshiruvi
echo "📋 7. LOCALHOST API TEKSHIRUVI:"
echo "---"
curl -s http://localhost:3001/api/health || echo "❌ API javob bermadi"
echo ""

# 8. Curl bilan tashqi IP tekshiruvi
echo "📋 8. TASHQI IP TEKSHIRUVI (45.92.173.33):"
echo "---"
curl -s http://45.92.173.33 | head -20 || echo "❌ Tashqi IP javob bermadi"
echo ""

# 9. Domen orqali tekshirish
echo "📋 9. DOMEN ORQALI TEKSHIRISH (mukammalotaona.uz):"
echo "---"
curl -I http://mukammalotaona.uz 2>/dev/null || echo "❌ Domen javob bermadi"
echo ""

# 10. SSL sertifikat tekshiruvi
echo "📋 10. SSL SERTIFIKAT:"
echo "---"
ls -la /etc/letsencrypt/live/mukammalotaona.uz/ 2>/dev/null || echo "⚠️  SSL sertifikat topilmadi"
echo ""

# 11. Nginx error log
echo "📋 11. NGINX ERROR LOG (oxirgi 10 qator):"
echo "---"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "❌ Error log topilmadi"
echo ""

# 12. PM2 logs
echo "📋 12. PM2 LOGS (oxirgi 15 qator):"
echo "---"
pm2 logs moo --lines 15 --nostream
echo ""

echo "=========================================="
echo "✅ TEKSHIRUV TUGADI"
echo "=========================================="
