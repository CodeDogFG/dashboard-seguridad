# Quick Start Script for Dashboard Seguridad
Write-Host "🚀 Dashboard Seguridad - Quick Start" -ForegroundColor Magenta
Write-Host "====================================="

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  No .env file found!" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env"
    Write-Host "2. Add your API keys to .env"
    Write-Host "3. Run this script again"
    
    if (Test-Path ".env.example") {
        Write-Host "`nWould you like to copy .env.example to .env now? (y/n)" -ForegroundColor Cyan
        $response = Read-Host
        if ($response -eq "y" -or $response -eq "Y") {
            Copy-Item ".env.example" ".env"
            Write-Host "✅ .env file created! Please edit it with your API keys." -ForegroundColor Green
        }
    }
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Start backend in background
Write-Host "`n🔧 Starting Backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node src/server.js
}

Write-Host "Backend started in background (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Test backend
Write-Host "`n🔍 Testing Backend..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend failed to start properly" -ForegroundColor Red
    Write-Host "Check logs with: Receive-Job $($backendJob.Id)" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🎨 Now start the frontend in another terminal:" -ForegroundColor Cyan
Write-Host "cd ../frontend && npm run dev" -ForegroundColor Yellow

Write-Host "`n📝 Useful commands:" -ForegroundColor Cyan
Write-Host "- Stop backend: Stop-Job $($backendJob.Id)"
Write-Host "- View backend logs: Receive-Job $($backendJob.Id)"
Write-Host "- Test API: ./test-simple.ps1"

Write-Host "`n🌐 URLs:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5000"
Write-Host "- Frontend: http://localhost:5173 (after starting)"

Write-Host "`nBackend is running! Press Ctrl+C to stop monitoring." -ForegroundColor Green