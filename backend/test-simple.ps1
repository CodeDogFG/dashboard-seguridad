# Simple Integration Test for Dashboard Seguridad
$BASE_URL = "http://localhost:5000"

Write-Host "Testing Backend Health..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method Get -TimeoutSec 5
    Write-Host "Backend is running!" -ForegroundColor Green
    Write-Host "VirusTotal API: $($health.services.virusTotal)" -ForegroundColor $(if($health.services.virusTotal){"Green"}else{"Yellow"})
    Write-Host "AbuseIPDB API: $($health.services.abuseIP)" -ForegroundColor $(if($health.services.abuseIP){"Green"}else{"Yellow"})
} catch {
    Write-Host "Backend not running! Start with: node src/server.js" -ForegroundColor Red
    exit 1
}

Write-Host "`nTesting API Integration..." -ForegroundColor Cyan
$testData = @{
    type = "domain"
    value = "google.com"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/api/analyze" -Method Post -ContentType "application/json" -Body $testData
    Write-Host "API Integration working!" -ForegroundColor Green
    Write-Host "Response structure: $($result.data.GetType().Name)" -ForegroundColor Green
} catch {
    Write-Host "API Integration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNext: Start frontend with 'cd frontend && npm run dev'" -ForegroundColor Yellow