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
    
    Write-Host "`n$($Description):" -ForegroundColor Cyan
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $uri = "$BASE_URL$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $headers
            Write-Host "Status: 200" -ForegroundColor Green
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Body $Data -Headers $headers
            Write-Host "Status: 200" -ForegroundColor Green
        }
        
        # Formatear respuesta JSON
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        if ($statusCode -ge 400 -and $statusCode -lt 500) {
            Write-Host "Status: $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "Status: $statusCode" -ForegroundColor Red
        }
        
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
        } catch {
            Write-Host "Error: $errorMessage" -ForegroundColor Red
        }
    }
}

Write-Host "Testing Dashboard Seguridad API Endpoints" -ForegroundColor Magenta
Write-Host $SEPARATOR

# Verificar que el servidor esté funcionando
Write-Host "Checking if server is running at $BASE_URL..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method Get -TimeoutSec 5
    Write-Host "Server is running!" -ForegroundColor Green
} catch {
    Write-Host "Server is not running at $BASE_URL" -ForegroundColor Red
    Write-Host "Please start the server with: node src/server.js" -ForegroundColor Yellow
    exit 1
}

Write-Host $SEPARATOR

# 1. Health Check
Make-APIRequest -Method "GET" -Endpoint "/api/health" -Description "1. Health Check"

# 2. Configuration Check
Make-APIRequest -Method "GET" -Endpoint "/api/config" -Description "2. Configuration Status"

# 3. Analyze Domain - Google
$domainData = @{ entity = "google.com"; type = "domain" } | ConvertTo-Json
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data $domainData -Description "3. Analyzing google.com (domain)"

# 4. Analyze IP - Google DNS
Try {
    $ipData = @{ entity = "8.8.8.8"; type = "ip" } | ConvertTo-Json
    Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data $ipData -Description "4. Analyzing 8.8.8.8 (IP)"
} Catch {
    Write-Host "Skipping IP test due to PowerShell version compatibility." -ForegroundColor Yellow
}

# 5. Invalid Request - Missing entity
$invalidData = @{ type = "domain" } | ConvertTo-Json
Make-APIRequest -Method "POST" -Endpoint "/api/analyze" -Data $invalidData -Description "5. Testing validation - missing entity (should fail with 400)"

Write-Host "`n$SEPARATOR" -ForegroundColor Magenta
Write-Host "API Testing Complete!" -ForegroundColor Green