# Windows PowerShell - Lokal fayllarni 164.68.109.208 ga yuklash
# Ishga tushirish: .\deploy-local-to-164.ps1

$SERVER = "164.68.109.208"
$USER = "root"
$REMOTE_PATH = "/var/www/mo"

Write-Host "Deploy boshlandi: $SERVER -> $REMOTE_PATH" -ForegroundColor Green
Write-Host ""

# 1. Lokal build qilish
Write-Host "Lokal build qilish..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build xatolik bilan tugadi!" -ForegroundColor Red
    exit 1
}

Write-Host "Build muvaffaqiyatli!" -ForegroundColor Green
Write-Host ""

# 2. Serverda papka yaratish
Write-Host "Serverda papka yaratish..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "mkdir -p $REMOTE_PATH"

# 3. Fayllarni yuklash
Write-Host "Fayllarni yuklash..." -ForegroundColor Yellow

# dist papkasi
Write-Host "  - dist/" -ForegroundColor Cyan
scp -r dist ${USER}@${SERVER}:${REMOTE_PATH}/

# server papkasi
Write-Host "  - server/" -ForegroundColor Cyan
scp -r server ${USER}@${SERVER}:${REMOTE_PATH}/

# uploads papkasi
Write-Host "  - uploads/" -ForegroundColor Cyan
scp -r uploads ${USER}@${SERVER}:${REMOTE_PATH}/

# public papkasi
Write-Host "  - public/" -ForegroundColor Cyan
scp -r public ${USER}@${SERVER}:${REMOTE_PATH}/

# Asosiy fayllar
Write-Host "  - package.json, tsconfig.json, .env" -ForegroundColor Cyan
scp package.json ${USER}@${SERVER}:${REMOTE_PATH}/
scp tsconfig.json ${USER}@${SERVER}:${REMOTE_PATH}/
scp ecosystem.config.cjs ${USER}@${SERVER}:${REMOTE_PATH}/

# .env fayl (agar mavjud bo'lsa)
if (Test-Path .env) {
    scp .env ${USER}@${SERVER}:${REMOTE_PATH}/
}

Write-Host ""
Write-Host "Fayllar yuklandi!" -ForegroundColor Green
Write-Host ""

# 4. Serverda npm install va PM2 restart
Write-Host "Serverda npm install va restart..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} @"
cd $REMOTE_PATH
npm install --production
pm2 restart mo || pm2 start ecosystem.config.cjs
pm2 save
"@

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "DEPLOY MUVAFFAQIYATLI TUGADI!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Sayt: http://$SERVER" -ForegroundColor Cyan
Write-Host ""
Write-Host "Loglarni ko'rish:" -ForegroundColor Yellow
Write-Host "   ssh ${USER}@${SERVER}" -ForegroundColor White
Write-Host "   pm2 logs mo" -ForegroundColor White
Write-Host ""
