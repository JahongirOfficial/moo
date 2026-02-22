# VPS'ni to'liq yangilash (force update)
$VPS_IP = "164.68.109.208"
$VPS_USER = "root"
$PROJECT_PATH = "/var/www/moo"

Write-Host "VPS'ga ulanilmoqda va to'liq yangilanmoqda..." -ForegroundColor Cyan

ssh ${VPS_USER}@${VPS_IP} @"
cd $PROJECT_PATH

echo '=== Git holatini tekshirish ==='
git status

echo ''
echo '=== Remote yangilash ==='
git remote set-url origin https://github.com/JahongirOfficial/moo.git
git remote -v

echo ''
echo '=== Barcha o'zgarishlarni bekor qilish ==='
git fetch origin
git reset --hard origin/main
git clean -fd

echo ''
echo '=== Node modules yangilash ==='
npm install

echo ''
echo '=== Yangi build qilish ==='
rm -rf dist
npm run build

echo ''
echo '=== PM2 restart ==='
pm2 restart all

echo ''
echo '=== Nginx restart ==='
systemctl restart nginx

echo ''
echo '=== Tayyor! ==='
"@

Write-Host "`nVPS muvaffaqiyatli yangilandi!" -ForegroundColor Green
Write-Host "Brauzerda Ctrl+Shift+R bosib cache'ni tozalang" -ForegroundColor Yellow
