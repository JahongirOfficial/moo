# BoshSahifa.tsx faylini VPS ga yuklash
# Ishga tushirish: .\update-boshsahifa.ps1

$SERVER = "164.68.109.208"
$USER = "root"
$REMOTE_PATH = "/var/www/mo"

Write-Host "BoshSahifa.tsx faylini VPS ga yuklash..." -ForegroundColor Yellow
Write-Host ""

# 1. Serverda papkalarni yaratish
Write-Host "Serverda papkalar yaratilmoqda..." -ForegroundColor Cyan
ssh ${USER}@${SERVER} "mkdir -p ${REMOTE_PATH}/src/pages"

# 2. Faylni yuklash
Write-Host "Fayl yuklanmoqda..." -ForegroundColor Cyan
scp src/pages/BoshSahifa.tsx ${USER}@${SERVER}:${REMOTE_PATH}/src/pages/

if ($LASTEXITCODE -eq 0) {
    Write-Host "Fayl yuklandi!" -ForegroundColor Green
    Write-Host ""
    
    # 3. Build va restart
    Write-Host "Build va restart qilish..." -ForegroundColor Yellow
    ssh ${USER}@${SERVER} @"
cd $REMOTE_PATH
npm run build
pm2 restart mo
"@
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "YANGILASH TUGADI!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sayt: http://$SERVER" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Xatolik yuz berdi!" -ForegroundColor Red
}
