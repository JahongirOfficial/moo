# PowerShell script - Windows da ishga tushiring
# Ishga tushirish: .\check-domain-local.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 MUKAMMALOTAONA.UZ DOMEN TEKSHIRUVI" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. DNS tekshiruvi
Write-Host "📋 1. DNS TEKSHIRUVI:" -ForegroundColor Yellow
Write-Host "---"
try {
    $dns = Resolve-DnsName mukammalotaona.uz -ErrorAction Stop
    Write-Host "✅ Domen topildi!" -ForegroundColor Green
    $dns | Where-Object {$_.Type -eq "A"} | ForEach-Object {
        Write-Host "   IP Address: $($_.IPAddress)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Domen topilmadi yoki DNS xatosi" -ForegroundColor Red
}
Write-Host ""

# 2. WWW subdomain tekshiruvi
Write-Host "📋 2. WWW SUBDOMAIN TEKSHIRUVI:" -ForegroundColor Yellow
Write-Host "---"
try {
    $wwwDns = Resolve-DnsName www.mukammalotaona.uz -ErrorAction Stop
    Write-Host "✅ www.mukammalotaona.uz topildi!" -ForegroundColor Green
    $wwwDns | Where-Object {$_.Type -eq "A"} | ForEach-Object {
        Write-Host "   IP Address: $($_.IPAddress)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  www subdomain topilmadi" -ForegroundColor Yellow
}
Write-Host ""

# 3. VPS IP bilan solishtirish
Write-Host "📋 3. VPS IP BILAN SOLISHTIRISH:" -ForegroundColor Yellow
Write-Host "---"
$vpsIP = "45.92.173.33"
Write-Host "   VPS IP: $vpsIP" -ForegroundColor Cyan
try {
    $domainIP = (Resolve-DnsName mukammalotaona.uz -ErrorAction Stop | Where-Object {$_.Type -eq "A"}).IPAddress
    if ($domainIP -eq $vpsIP) {
        Write-Host "✅ Domen to'g'ri VPS ga ulangan!" -ForegroundColor Green
    } else {
        Write-Host "❌ Domen boshqa IP ga ulangan: $domainIP" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Tekshirib bo'lmadi" -ForegroundColor Red
}
Write-Host ""

# 4. HTTP orqali tekshirish
Write-Host "📋 4. HTTP ORQALI TEKSHIRISH:" -ForegroundColor Yellow
Write-Host "---"
try {
    $response = Invoke-WebRequest -Uri "http://mukammalotaona.uz" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Sayt ochildi! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Green
} catch {
    Write-Host "❌ Sayt ochilmadi: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. HTTPS orqali tekshirish
Write-Host "📋 5. HTTPS ORQALI TEKSHIRISH:" -ForegroundColor Yellow
Write-Host "---"
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://mukammalotaona.uz" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTPS ishlayapti! Status: $($httpsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   SSL sertifikat faol" -ForegroundColor Green
} catch {
    Write-Host "⚠️  HTTPS ishlamayapti: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   (Bu normal, agar SSL o'rnatilmagan bo'lsa)" -ForegroundColor Gray
}
Write-Host ""

# 6. Ping test
Write-Host "📋 6. PING TEST:" -ForegroundColor Yellow
Write-Host "---"
try {
    $ping = Test-Connection mukammalotaona.uz -Count 4 -ErrorAction Stop
    Write-Host "✅ Ping muvaffaqiyatli!" -ForegroundColor Green
    $avgTime = ($ping | Measure-Object -Property ResponseTime -Average).Average
    Write-Host "   O'rtacha vaqt: $([math]::Round($avgTime, 2)) ms" -ForegroundColor Green
} catch {
    Write-Host "❌ Ping muvaffaqiyatsiz" -ForegroundColor Red
}
Write-Host ""

# 7. Traceroute (ixtiyoriy)
Write-Host "📋 7. TRACEROUTE (birinchi 5 hop):" -ForegroundColor Yellow
Write-Host "---"
try {
    $trace = Test-NetConnection mukammalotaona.uz -TraceRoute -ErrorAction Stop
    Write-Host "✅ Yo'l topildi:" -ForegroundColor Green
    $trace.TraceRoute | Select-Object -First 5 | ForEach-Object {
        Write-Host "   → $_" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Traceroute ishlamadi" -ForegroundColor Yellow
}
Write-Host ""

# 8. API endpoint tekshiruvi
Write-Host "📋 8. API ENDPOINT TEKSHIRUVI:" -ForegroundColor Yellow
Write-Host "---"
try {
    $apiResponse = Invoke-WebRequest -Uri "http://mukammalotaona.uz/api/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ API ishlayapti! Status: $($apiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API javob bermadi (normal, agar health endpoint bo'lmasa)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ TEKSHIRUV TUGADI" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Xulosa
Write-Host "📊 XULOSA:" -ForegroundColor Magenta
Write-Host "---"
try {
    $finalDns = Resolve-DnsName mukammalotaona.uz -ErrorAction Stop
    $finalIP = ($finalDns | Where-Object {$_.Type -eq "A"}).IPAddress
    
    if ($finalIP -eq "45.92.173.33") {
        Write-Host "✅ Domen to'g'ri ulangan: mukammalotaona.uz → 45.92.173.33" -ForegroundColor Green
        
        try {
            $siteCheck = Invoke-WebRequest -Uri "http://mukammalotaona.uz" -TimeoutSec 10 -ErrorAction Stop
            Write-Host "✅ Sayt ishlayapti va ochiladi" -ForegroundColor Green
            Write-Host "" 
            Write-Host "🎉 HAMMASI TAYYOR! Saytingiz: http://mukammalotaona.uz" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Domen ulangan, lekin sayt ochilmayapti" -ForegroundColor Yellow
            Write-Host "   Nginx va PM2 sozlamalarini tekshiring" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Domen noto'g'ri ulangan yoki hali yangilanmagan" -ForegroundColor Red
        Write-Host "   Hozirgi IP: $finalIP" -ForegroundColor Red
        Write-Host "   Kerakli IP: 45.92.173.33" -ForegroundColor Red
        Write-Host ""
        Write-Host "📝 Qilish kerak:" -ForegroundColor Yellow
        Write-Host "   1. Domen provayderida A record ni tekshiring" -ForegroundColor Yellow
        Write-Host "   2. DNS yangilanishi uchun 5-30 daqiqa kuting" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Domen hali DNS da topilmayapti" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Qilish kerak:" -ForegroundColor Yellow
    Write-Host "   1. Domen provayderida DNS sozlamalarini tekshiring" -ForegroundColor Yellow
    Write-Host "   2. A record qo'shing: mukammalotaona.uz → 45.92.173.33" -ForegroundColor Yellow
    Write-Host "   3. DNS yangilanishi uchun 5-30 daqiqa kuting" -ForegroundColor Yellow
}
Write-Host ""
