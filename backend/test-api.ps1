# Security Dashboard API Test Script para PowerShell
# Este script prueba todos los endpoints del backend en Windows

$BASE_URL = "http://localhost:5000"
$SEPARATOR = "============================================"

function Make-APIRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Description
    )
    
    Write-Host "`n$Description:" -ForegroundColor Cyan
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $uri = "$BASE_URL$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
            Write-Host "✅ Status: 200" -ForegroundColor Green
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Body $Data -Headers $headers
            Write-Host "✅ Status: 200" -ForegroundColor Green
        }
        
        # Formatear respuesta JSON
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($statusCode -ge 400 -and $statusCode -lt 500) {
            Write-Host "⚠️  Status: $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Status: $statusCode" -ForegroundColor Red
        }
        
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
        } catch {
            Write-Host "Error: $errorMessage" -ForegroundColor Red
        }
    }
}

Write-Host "🔍 Testing Dashboard Seguridad API Endpoints" -ForegroundColor Magenta
Write-Host $SEPARATOR

# Verificar que el servidor esté funcionando
Write-Host "🔄 Checking if server is running at $BASE_URL..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running at $BASE_URL" -ForegroundColor Red
    Write-Host "💡 Please start the server with: node src/server.js" -ForegroundColor Yellow
    exit 1
}

Write-Host $SEPARATOR

# 1. Health Check
Make-APIRequest -Method "GET" -Endpoint "/api/health" -Description "1. Health Check"

# 2. Configuration Check
Make-APIRequest -Method "GET" -Endpoint "/api/config" -Description "2. Configuration Status"

# 3. Analyze Domain - Google
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "google.com", "type": "domain"}' -Description "3. Analyzing google.com (domain)"

# 4. Analyze Domain - Suspicious
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "malware-test-site.com", "type": "domain"}' -Description "4. Analyzing suspicious domain"

# 5. Analyze IP - Google DNS
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "8.8.8.8", "type": "ip"}' -Description "5. Analyzing 8.8.8.8 (IP)"

# 6. Analyze IP - Private IP
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "192.168.1.1", "type": "ip"}' -Description "6. Analyzing 192.168.1.1 (private IP)"

# 7. Analyze Email
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "test@example.com", "type": "email"}' -Description "7. Analyzing test@example.com (email)"

# 8. Invalid Request - Missing entity
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"type": "domain"}' -Description "8. Testing validation - missing entity (should fail)"

# 9. Invalid Request - Invalid type
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "test.com", "type": "invalid_type"}' -Description "9. Testing validation - invalid type (should fail)"

# 10. Invalid Request - Empty entity
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data '{"entity": "", "type": "domain"}' -Description "10. Testing validation - empty entity (should fail)"

Write-Host "`n$SEPARATOR" -ForegroundColor Magenta
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host "🔍 Review the responses above to verify all endpoints are working correctly." -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected results:" -ForegroundColor Yellow
Write-Host "- Health check: Should return status 200 with system information"
Write-Host "- Config check: Should show API key status"
Write-Host "- Valid analyses: Should return status 200 with mock/real data"
Write-Host "- Invalid requests: Should return status 400 with error messages"
Write-Host $SEPARATOR -ForegroundColor Magenta