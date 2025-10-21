# Test específico para IP 179.137.163.237
$baseUrl = "http://localhost:5000"

Write-Host "🧪 Testing IP Risk Classification Fix" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

try {
    $body = @{
        type = "ip"
        value = "179.137.163.237"
    } | ConvertTo-Json

    Write-Host "`n🎯 Testing IP: 179.137.163.237" -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/analyze" -Method Post -ContentType "application/json" -Body $body
    
    Write-Host "✅ Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    # Verificar clasificación específica
    if ($response.abuseIpData) {
        $riskLevel = $response.abuseIpData.riskLevel
        $confidence = $response.abuseIpData.abuseConfidencePercentage
        
        Write-Host "`n📊 Risk Classification:" -ForegroundColor Yellow
        Write-Host "  - Confidence: $confidence%" -ForegroundColor White
        Write-Host "  - Risk Level: $riskLevel" -ForegroundColor White
        
        if ($confidence -gt 0 -and $riskLevel -eq "low_risk") {
            Write-Host "❌ ERROR: IP reportada aún clasificada como bajo riesgo!" -ForegroundColor Red
        } elseif ($confidence -gt 0) {
            Write-Host "✅ ÉXITO: IP reportada clasificada correctamente como $riskLevel" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "❌ Error en la petición:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📝 Expected Results:" -ForegroundColor Yellow
Write-Host "  - Confidence: 2% (from AbuseIPDB)" -ForegroundColor White  
Write-Host "  - Risk Level: medium_risk (was low_risk before fix)" -ForegroundColor White
Write-Host "  - Total Reports: 1" -ForegroundColor White