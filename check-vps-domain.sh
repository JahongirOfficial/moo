#!/bin/bash
# VPS da mukammalotaona.uz domenini tekshirish

echo "=========================================="
echo "🔍 MUKAMMALOTAONA.UZ DOMEN TEKSHIRUVI"
echo "=========================================="
echo ""

# 1. DNS tekshiruvi
echo "📋 1. DNS TEKSHIRUVI:"
echo "---"
echo "Domen: mukammalotaona.uz"
nslookup mukammalotaona.uz 2>/dev/null || dig mukammalotaona.uz +short || host mukammalotaona.uz
echo ""

# 2. VPS IP manzilini ko'rish
echo "📋 2. VPS IP MANZILI:"
echo "---"
hostname -I | awk '{print $1}' || ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
echo ""

# 3. Domen IP bilan solishtirish
echo "📋 3. DOMEN IP BILAN SOLISHTIRISH:"
echo "---"
VPS_IP=$(hostname -I | awk '{print $1}')
DOMAIN_IP=$(dig +short mukammalotaona.uz | tail -1)

echo "VPS IP: $VPS_IP"
echo "Domen IP: $DOMAIN_IP"

if [ "$VPS_IP" = "$DOMAIN_IP" ]; then
    echo "✅ Domen to'g'ri ulangan!"
else
    echo "❌ Domen boshqa IP ga ulangan yoki hali yangilanmagan"
fi
echo ""

# 4. Nginx konfiguratsiyasida domen
echo "📋 4. NGINX KONFIGURATSIYASIDA DOMEN:"
echo "---"
grep -r "server_name" /etc/nginx/sites-available/ 2>/dev/null | grep -v "#"
echo ""

# 5. Nginx test
echo "📋 5. NGINX KONFIGURATSIYA TESTI:"
echo "---"
nginx -t 2>&1
echo ""

# 6. Portlar tekshiruvi
echo "📋 6. PORTLAR TEKSHIRUVI:"
echo "---"
echo "Port 80 (HTTP):"
netstat -tlnp 2>/dev/null | grep :80 || ss -tlnp | grep :80
echo ""
echo "Port 443 (HTTPS):"
netstat -tlnp 2>/dev/null | grep :443 || ss -tlnp | grep :443
echo ""

# 7. Localhost dan tekshirish
echo "📋 7. LOCALHOST DAN TEKSHIRISH:"
echo "---"
curl -I http://localhost 2>/dev/null | head -5
echo ""

# 8. Domen orqali tekshirish (VPS ichidan)
echo "📋 8. DOMEN ORQALI TEKSHIRISH:"
echo "---"
curl -I http://mukammalotaona.uz 2>/dev/null | head -5
echo ""

# 9. SSL sertifikat
echo "📋 9. SSL SERTIFIKAT:"
echo "---"
if [ -d "/etc/letsencrypt/live/mukammalotaona.uz" ]; then
    echo "✅ SSL sertifikat mavjud"
    ls -la /etc/letsencrypt/live/mukammalotaona.uz/
else
    echo "⚠️  SSL sertifikat topilmadi"
fi
echo ""

# 10. Firewall sozlamalari
echo "📋 10. FIREWALL SOZLAMALARI:"
echo "---"
ufw status 2>/dev/null || echo "UFW o'rnatilmagan"
echo ""

echo "=========================================="
echo "✅ TEKSHIRUV TUGADI"
echo "=========================================="
