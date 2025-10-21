# Dashboard Seguridad - Startup Script
# Inicia Redis y Backend automáticamente

param(
    [switch]$Docker,
    [switch]$Local,
    [switch]$SkipRedis
)

$BackendPath = "c:\Users\Mjoln\OneDrive\Documentos\Programacion Local\porffolio\dashboard-seguridad\backend"

Write-Host "🚀 Starting Dashboard Seguridad Backend..." -ForegroundColor Magenta

# Cambiar al directorio del backend
Set-Location $BackendPath

if (-not $SkipRedis) {
    Write-Host "� Setting up Redis..." -ForegroundColor Cyan
    
    # Use the hybrid Redis setup
    if ($Local) {
        & "./setup-redis.ps1" -Local
    } elseif ($Docker) {
        & "./setup-redis.ps1"
    } else {
        # Default: Try Docker first, fallback to local
        & "./setup-redis.ps1"
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Redis setup failed!" -ForegroundColor Red
        Write-Host "Try: ./setup-redis.ps1 -Status to check Redis" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "⚠️  Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Edit it with your API keys." -ForegroundColor Green
    } else {
        Write-Host "⚠️  No .env file found. API keys may not work." -ForegroundColor Yellow
    }
}

# Verificar dependencias de Node.js
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Iniciar backend
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend should run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Magenta

node src/server.js