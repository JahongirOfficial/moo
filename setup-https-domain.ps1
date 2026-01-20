# HTTPS va mukammalotaona.uz domenini sozlash
# Windows PowerShell dan ishga tushiring

$SERVER = "164.68.109.208"
$USER = "root"

Write-Host "=========================================="  -ForegroundColor Green
Write-Host "HTTPS va DOMEN SOZLASH" -ForegroundColor Green
Write-Host "Domen: mukammalotaona.uz" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "MUHIM: Avval DNS sozlang!" -ForegroundColor Yellow
Write-Host ""
Write-Host "DNS provayderingizda quyidagi A recordlarni qo'shing:" -ForegroundColor Cyan
Write-Host "  mukammalotaona.uz     -> 164.68.109.208" -ForegroundColor White
Write-Host "  www.mukammalotaona.uz -> 164.68.109.208" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "DNS sozlandimi? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "VPS ga ulanib HTTPS sozlanmoqda..." -ForegroundColor Yellow
    
    # Skriptni VPS ga yuborish va ishga tushirish
    Get-Content setup-https-domain.sh | ssh ${USER}@${SERVER} "cat > /tmp/setup-https.sh && chmod +x /tmp/setup-https.sh && bash /tmp/setup-https.sh"
    
} else {
    Write-Host ""
    Write-Host "DNS sozlangandan keyin qayta ishga tushiring." -ForegroundColor Yellow
    Write-Host ""
}
