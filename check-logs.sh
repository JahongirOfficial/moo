#!/bin/bash
# Server loglarini tekshirish

ssh root@164.68.109.208 << 'ENDSSH'
echo "=== PM2 logs (oxirgi 50 qator) ==="
pm2 logs --lines 50 --nostream

echo ""
echo "=== PM2 status ==="
pm2 status

echo ""
echo "=== Nginx error log (oxirgi 20 qator) ==="
tail -n 20 /var/log/nginx/error.log
ENDSSH
