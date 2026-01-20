# VPS'da remote'ni yangilab git pull qilish
$VPS_IP = "164.68.109.208"
$VPS_USER = "root"
$PROJECT_PATH = "/var/www/prox"
$NEW_REMOTE = "https://github.com/JahongirOfficial/moo.git"

Write-Host "VPS'ga ulanilmoqda..." -ForegroundColor Cyan

# SSH orqali buyruqlarni bajarish
ssh ${VPS_USER}@${VPS_IP} @"
cd $PROJECT_PATH
echo 'Hozirgi remote:'
git remote -v
echo ''
echo 'Remote yangilanmoqda...'
git remote set-url origin $NEW_REMOTE
echo 'Yangi remote:'
git remote -v
echo ''
echo 'Git pull qilinmoqda...'
git pull origin main
echo ''
echo 'Tayyor!'
"@

Write-Host "`nJarayon tugadi!" -ForegroundColor Green
