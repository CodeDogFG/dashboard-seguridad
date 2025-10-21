# Test script para verificar la clasificación corregida de IPs reportadas
# Prueba específica para IP 179.137.163.237

$API_BASE = "http://localhost:5000"

Write-Host "🧪 Testing IP Risk Classification Fix" -ForegroundColor Magenta
Write-Host "======================================"

# Test 1: IP reportada que debería ser al menos medium_risk
$reportedIP = "179.137.163.237"
Write-Host "`n1️⃣ Testing reported IP: $reportedIP" -ForegroundColor Cyan

$testBody = @{
    type = "ip"
    value = $reportedIP
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$API_BASE/api/analyze" -Method Post -ContentType "application/json" -Body $testBody
    
    if ($result.data.services.abuseIP) {
        $abuseData = $result.data.services.abuseIP
        Write-Host "AbuseIPDB Results:" -ForegroundColor Yellow
        Write-Host "  - Abuse Confidence: $($abuseData.abuseConfidencePercentage)%" -ForegroundColor $(if($abuseData.abuseConfidencePercentage -gt 0){"Red"}else{"Green"})
        Write-Host "  - Risk Level: $($abuseData.riskLevel)" -ForegroundColor $(if($abuseData.riskLevel -in @('medium_risk','high_risk','critical','malicious')){"Red"}else{"Yellow"})
        Write-Host "  - Total Reports: $($abuseData.totalReports)" -ForegroundColor Yellow
        Write-Host "  - Explanation: $($abuseData.riskExplanation)" -ForegroundColor Cyan
        
        Write-Host "`nOverall Risk Score: $($result.data.summary.risk_score)" -ForegroundColor $(if($result.data.summary.risk_score -gt 40){"Red"}else{"Yellow"})
        Write-Host "Overall Risk Level: $($result.data.summary.risk_level)" -ForegroundColor $(if($result.data.summary.risk_level -in @('medium','high')){"Red"}else{"Yellow"})
        Write-Host "Threats Detected: $($result.data.summary.threats_detected)" -ForegroundColor $(if($result.data.summary.threats_detected -gt 0){"Red"}else{"Green"})
        
        # Verificar si la clasificación es correcta
        if ($abuseData.abuseConfidencePercentage -gt 0 -and $abuseData.riskLevel -eq 'low_risk') {
            Write-Host "`n❌ ERROR: IP reportada clasificada como bajo riesgo!" -ForegroundColor Red
        } elseif ($abuseData.abuseConfidencePercentage -gt 0) {
            Write-Host "`n✅ CORRECTO: IP reportada clasificada apropiadamente" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️  No hay reportes para esta IP" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ No se obtuvo respuesta de AbuseIPDB" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error testing IP: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: IP limpia para comparación
Write-Host "`n2️⃣ Testing clean IP for comparison: 8.8.8.8" -ForegroundColor Cyan

$cleanBody = @{
    type = "ip" 
    value = "8.8.8.8"
} | ConvertTo-Json

try {
    $cleanResult = Invoke-RestMethod -Uri "$API_BASE/api/analyze" -Method Post -ContentType "application/json" -Body $cleanBody
    
    if ($cleanResult.data.services.abuseIP) {
        $cleanAbuse = $cleanResult.data.services.abuseIP
        Write-Host "Clean IP Results:" -ForegroundColor Green
        Write-Host "  - Abuse Confidence: $($cleanAbuse.abuseConfidencePercentage)%" -ForegroundColor Green
        Write-Host "  - Risk Level: $($cleanAbuse.riskLevel)" -ForegroundColor Green
        Write-Host "  - Overall Risk Score: $($cleanResult.data.summary.risk_score)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Clean IP test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n======================================"
Write-Host "🎯 Risk Classification Matrix:" -ForegroundColor Cyan
Write-Host "  0% confidence = clean" -ForegroundColor Green
Write-Host "  1-14% confidence = medium_risk (⚠️  CHANGED)" -ForegroundColor Yellow
Write-Host "  15-34% confidence = high_risk" -ForegroundColor Red
Write-Host "  35-64% confidence = critical" -ForegroundColor Red
Write-Host "  65%+ confidence = malicious" -ForegroundColor Red