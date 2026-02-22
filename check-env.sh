#!/bin/bash
# .env faylini tekshirish

ssh root@164.68.109.208 << 'ENDSSH'
cd /var/www/moo

echo "=== .env fayli mavjudmi? ==="
ls -la .env

echo ""
echo "=== .env tarkibi (API keylar yashirin) ==="
if [ -f .env ]; then
    cat .env | sed 's/\(API_KEY=\).*/\1***HIDDEN***/'
else
    echo ".env fayli topilmadi!"
fi

echo ""
echo "=== PM2 environment variables ==="
pm2 show 0 | grep -A 20 "env:"
ENDSSH
