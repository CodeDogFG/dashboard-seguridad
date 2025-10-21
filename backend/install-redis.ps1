# Script para instalar Redis en Windows
# Dashboard Seguridad - Redis Setup

Write-Host "🔧 Installing Redis for Dashboard Seguridad..." -ForegroundColor Cyan

# Verificar si Chocolatey está instalado
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Chocolatey no está instalado." -ForegroundColor Red
    Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
    
    # Instalar Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    Write-Host "✅ Chocolatey instalado." -ForegroundColor Green
    Write-Host "⚠️  Reinicia PowerShell como Administrador y ejecuta este script nuevamente." -ForegroundColor Yellow
    exit
}

# Instalar Redis
Write-Host "Installing Redis via Chocolatey..." -ForegroundColor Yellow
try {
    choco install redis-64 -y
    Write-Host "✅ Redis instalado correctamente." -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando Redis: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Intenta instalación manual o usa Docker." -ForegroundColor Yellow
    exit 1
}

# Iniciar servicio Redis
Write-Host "Starting Redis service..." -ForegroundColor Yellow
try {
    Start-Service redis
    Write-Host "✅ Servicio Redis iniciado." -ForegroundColor Green
} catch {
    Write-Host "⚠️  Iniciando Redis manualmente..." -ForegroundColor Yellow
    Start-Process "redis-server" -WindowStyle Minimized
}

# Verificar conexión
Write-Host "Testing Redis connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $testConnection = redis-cli ping
    if ($testConnection -eq "PONG") {
        Write-Host "✅ Redis está funcionando correctamente!" -ForegroundColor Green
        Write-Host "   - URL: redis://localhost:6379" -ForegroundColor Cyan
        Write-Host "   - Status: Ready for Dashboard Seguridad" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ No se pudo conectar a Redis." -ForegroundColor Red
    Write-Host "Intenta: redis-server en otra terminal" -ForegroundColor Yellow
}

Write-Host "`n🎉 Redis Setup Complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure .env file with REDIS_URL=redis://localhost:6379"
Write-Host "2. Start backend: node src/server.js"
Write-Host "3. Redis will be used for caching API responses"