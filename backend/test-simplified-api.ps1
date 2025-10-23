# Test the simplified IP-only security dashboard
Write-Host "🧪 Testing Simplified IP Security Dashboard" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1️⃣ Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "✅ Health check successful" -ForegroundColor Green
    Write-Host "   - Version: $($health.version)" -ForegroundColor White
    Write-Host "   - AbuseIPDB API: $($health.services.abuseIP)" -ForegroundColor $(if($health.services.abuseIP){"Green"}else{"Yellow"})
    Write-Host "   - Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 5000" -ForegroundColor Yellow
    exit 1
}

# Test 2: Config check
Write-Host "`n2️⃣ Testing config endpoint..." -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "http://localhost:5000/api/config" -Method Get
    Write-Host "✅ Config check successful" -ForegroundColor Green
    Write-Host "   - AbuseIPDB: $($config.apiKeys.abuseIP)" -ForegroundColor $(if($config.apiKeys.abuseIP -eq "configured"){"Green"}else{"Yellow"})
} catch {
    Write-Host "❌ Config check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: IP Analysis with detailed reports
Write-Host "`n3️⃣ Testing IP analysis with detailed reports..." -ForegroundColor Yellow
$testIPs = @("8.8.8.8", "1.1.1.1")

foreach ($ip in $testIPs) {
    Write-Host "   Testing IP: $ip" -ForegroundColor Cyan
    try {
        $body = @{
            type = "ip"
            entity = $ip
            maxAgeInDays = 90
            verbose = $true
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" -Method Post -ContentType "application/json" -Body $body
        
        if ($response.success) {
            $summary = $response.data.summary
            $abuseIP = $response.data.services.abuseIP
            
            Write-Host "   ✅ Analysis successful for $ip" -ForegroundColor Green
            Write-Host "      - Risk Score: $($summary.risk_score)" -ForegroundColor White
            Write-Host "      - Risk Level: $($summary.risk_level)" -ForegroundColor White
            Write-Host "      - Abuse Confidence: $($summary.abuse_confidence)%" -ForegroundColor White
            Write-Host "      - Total Reports: $($summary.threats_detected)" -ForegroundColor White
            Write-Host "      - Reports Analyzed: $($summary.reports_analyzed)" -ForegroundColor White
            Write-Host "      - Unique Categories: $($summary.unique_categories)" -ForegroundColor White
            Write-Host "      - Unique Reporters: $($summary.unique_reporters)" -ForegroundColor White
            
            if ($abuseIP.countryCode) {
                Write-Host "      - Country: $($abuseIP.countryCode)" -ForegroundColor White
            }
            
            if ($abuseIP.categories -and $abuseIP.categories.Count -gt 0) {
                Write-Host "      - Top Categories:" -ForegroundColor Cyan
                $abuseIP.categories | Select-Object -First 3 | ForEach-Object {
                    Write-Host "        • $($_.name): $($_.count) reports ($($_.severity))" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "   ❌ Analysis failed for $ip" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Error analyzing $ip`: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "      Check if AbuseIPDB API key is configured" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
}

# Test 4: Invalid input validation
Write-Host "`n4️⃣ Testing input validation..." -ForegroundColor Yellow

# Test invalid type
try {
    $body = @{
        type = "domain"
        entity = "example.com"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" -Method Post -ContentType "application/json" -Body $body
    Write-Host "   ❌ Should have rejected domain analysis" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✅ Correctly rejected non-IP analysis" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test invalid IP format
try {
    $body = @{
        type = "ip"
        entity = "invalid.ip.address"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/analyze" -Method Post -ContentType "application/json" -Body $body
    Write-Host "   ❌ Should have rejected invalid IP format" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ✅ Correctly rejected invalid IP format" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Detailed Reports endpoint
Write-Host "`n5️⃣ Testing detailed reports endpoint..." -ForegroundColor Yellow
$testIP = "8.8.8.8"

try {
    $body = @{
        entity = $testIP
        maxAgeInDays = 90
        perPage = 10
        page = 1
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/reports" -Method Post -ContentType "application/json" -Body $body
    
    if ($response.success) {
        $data = $response.data
        Write-Host "   ✅ Detailed reports successful for $testIP" -ForegroundColor Green
        Write-Host "      - Total Reports: $($data.pagination.total)" -ForegroundColor White
        Write-Host "      - Reports in this page: $($data.pagination.count)" -ForegroundColor White
        Write-Host "      - Page: $($data.pagination.page) of $($data.pagination.lastPage)" -ForegroundColor White
        Write-Host "      - Categories found: $($data.categories.Count)" -ForegroundColor White
        Write-Host "      - Unique reporters: $($data.uniqueReporters)" -ForegroundColor White
        
        if ($data.categories -and $data.categories.Count -gt 0) {
            Write-Host "      - Category breakdown:" -ForegroundColor Cyan
            $data.categories | Select-Object -First 5 | ForEach-Object {
                Write-Host "        • $($_.name): $($_.count) reports ($($_.uniqueReporters) reporters)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ❌ Detailed reports failed for $testIP" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error getting detailed reports: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "      Check if AbuseIPDB API key is configured" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Available endpoints:" -ForegroundColor Yellow
Write-Host "- POST /api/analyze    - Unified IP analysis with detailed reports and statistics" -ForegroundColor White
Write-Host "- POST /api/reports    - Paginated detailed reports (for advanced usage)" -ForegroundColor White
Write-Host "- GET  /api/health     - Server health check" -ForegroundColor White
Write-Host "- GET  /api/config     - API configuration status" -ForegroundColor White
Write-Host "`nUI Changes:" -ForegroundColor Yellow
Write-Host "- ✅ Removed redundant 'Reportes por IP' tab" -ForegroundColor Green
Write-Host "- ✅ All IP analysis now unified in main dashboard" -ForegroundColor Green
Write-Host "- ✅ Enhanced category visualization with detailed statistics" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "- Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "- Configure AbuseIPDB API key in backend/.env if needed" -ForegroundColor White