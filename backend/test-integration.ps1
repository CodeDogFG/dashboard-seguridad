# Test de Integración Frontend-Backend
# Script para verificar que la comunicación funciona correctamente

$BASE_URL = "http://localhost:5000"
$FRONTEND_URL = "http://localhost:5173"

Write-Host "🔍 Testing Dashboard Seguridad Integration" -ForegroundColor Magenta
Write-Host "============================================"

# 1. Verificar que el backend esté funcionando
Write-Host "`n1️⃣ Checking Backend Server..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend is running on port 5000" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)"
    Write-Host "   API Keys configured:"
    Write-Host "   - VirusTotal: $($health.services.virusTotal)" -ForegroundColor $(if($health.services.virusTotal){"Green"}else{"Yellow"})
    Write-Host "   - AbuseIPDB: $($health.services.abuseIP)" -ForegroundColor $(if($health.services.abuseIP){"Green"}else{"Yellow"})
    Write-Host "   - Shodan: $($health.services.shodan)" -ForegroundColor $(if($health.services.shodan){"Green"}else{"Yellow"})
} catch {
    Write-Host "❌ Backend not running!" -ForegroundColor Red
    Write-Host "💡 Start with: cd backend; node src/server.js" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar CORS configuration
Write-Host "`n2️⃣ Checking CORS Configuration..." -ForegroundColor Cyan
try {
    $config = Invoke-RestMethod -Uri "$BASE_URL/api/config" -Method Get
    $corsOrigin = $config.cors.frontendUrl
    if ($corsOrigin -eq "http://localhost:5173") {
        Write-Host "✅ CORS configured correctly for frontend port 5173" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CORS origin: $corsOrigin (should be http://localhost:5173)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Could not check CORS config" -ForegroundColor Red
}

# 3. Test real API integration
Write-Host "`n3️⃣ Testing Real API Integration..." -ForegroundColor Cyan

# Test domain analysis
Write-Host "   🌐 Testing domain analysis (google.com)..."
try {
    $domainBody = @{
        type = "domain"
        value = "google.com"
    } | ConvertTo-Json
    
    $domainTest = Invoke-RestMethod -Uri "$BASE_URL/api/analyze" -Method Post -ContentType "application/json" -Body $domainBody
    
    if ($domainTest.data.summary) {
        Write-Host "   ✅ Domain analysis working!" -ForegroundColor Green
        Write-Host "      Risk Score: $($domainTest.data.summary.risk_score)"
        Write-Host "      Risk Level: $($domainTest.data.summary.risk_level)"
        Write-Host "      Services used: $(($domainTest.data.services.PSObject.Properties.Name) -join ', ')"
    } else {
        Write-Host "   ⚠️  Domain analysis returned unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Domain analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test IP analysis
Write-Host "   📡 Testing IP analysis (8.8.8.8)..."
try {
    $ipBody = @{
        type = "ip"
        value = "8.8.8.8"
    } | ConvertTo-Json
    
    $ipTest = Invoke-RestMethod -Uri "$BASE_URL/api/analyze" -Method Post -ContentType "application/json" -Body $ipBody
    
    if ($ipTest.data.summary) {
        Write-Host "   ✅ IP analysis working!" -ForegroundColor Green
        Write-Host "      Risk Score: $($ipTest.data.summary.risk_score)"
        Write-Host "      Risk Level: $($ipTest.data.summary.risk_level)"
        Write-Host "      Services used: $(($ipTest.data.services.PSObject.Properties.Name) -join ', ')"
    } else {
        Write-Host "   ⚠️  IP analysis returned unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ IP analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Check if frontend is running
Write-Host "`n4️⃣ Checking Frontend Status..." -ForegroundColor Cyan
try {
    $frontendTest = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 5 -UseBasicParsing
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running on port 5173" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend not running on port 5173" -ForegroundColor Yellow
    Write-Host "💡 Start with: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "🎉 Integration Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure both backend and frontend are running"
Write-Host "2. Open http://localhost:5173 in your browser"
Write-Host "3. Try analyzing a domain, IP, or email"
Write-Host "4. Check browser dev tools for any console errors"
Write-Host ""
Write-Host "API Keys Status:" -ForegroundColor Yellow
Write-Host "- VirusTotal: Required for domain/IP analysis"
Write-Host "- AbuseIPDB: Required for IP reputation"
Write-Host "- Shodan: Optional (falls back to free InternetDB)"
Write-Host "- Redis: Required for caching"