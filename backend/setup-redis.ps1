# Dashboard Seguridad - Hybrid Redis Setup
# Usa Docker por defecto, fallback a Redis local

param(
    [switch]$Local,
    [switch]$Status,
    [switch]$Stop
)

$BackendPath = "c:\Users\Mjoln\OneDrive\Documentos\Programacion Local\porffolio\dashboard-seguridad\backend"

if ($Status) {
    Write-Host "🔍 Redis Status Check..." -ForegroundColor Cyan
    
    # Check Docker Redis
    $dockerRedis = docker ps -q -f name=dashboard-redis 2>$null
    if ($dockerRedis) {
        Write-Host "✅ Docker Redis: Running (dashboard-redis)" -ForegroundColor Green
        try {
            $dockerPing = docker exec dashboard-redis redis-cli ping 2>$null
            Write-Host "   Status: $dockerPing" -ForegroundColor Green
        } catch {}
    } else {
        Write-Host "❌ Docker Redis: Not running" -ForegroundColor Red
    }
    
    # Check Local Redis
    try {
        $localPing = redis-cli ping 2>$null
        if ($localPing -eq "PONG") {
            Write-Host "✅ Local Redis: Running on localhost:6379" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Local Redis: Not running" -ForegroundColor Red
    }
    exit
}

if ($Stop) {
    Write-Host "🛑 Stopping Redis services..." -ForegroundColor Yellow
    
    # Stop Docker Redis
    $dockerRedis = docker ps -q -f name=dashboard-redis 2>$null
    if ($dockerRedis) {
        docker stop dashboard-redis 2>$null
        docker rm dashboard-redis 2>$null
        Write-Host "✅ Docker Redis stopped" -ForegroundColor Green
    }
    
    # Optionally stop local Redis service
    try {
        Stop-Service redis -ErrorAction SilentlyContinue
        Write-Host "✅ Local Redis service stopped" -ForegroundColor Green
    } catch {}
    exit
}

Write-Host "🚀 Starting Redis for Dashboard Seguridad..." -ForegroundColor Magenta

if ($Local) {
    # Force local Redis
    Write-Host "🔧 Using Local Redis (forced)..." -ForegroundColor Cyan
    
    try {
        $localTest = redis-cli ping 2>$null
        if ($localTest -eq "PONG") {
            Write-Host "✅ Local Redis already running" -ForegroundColor Green
        } else {
            # Try to start local Redis
            Start-Service redis -ErrorAction Stop
            Start-Sleep -Seconds 2
            Write-Host "✅ Local Redis service started" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Could not start local Redis service" -ForegroundColor Red
        Write-Host "Try manually: redis-server" -ForegroundColor Yellow
        exit 1
    }
} else {
    # Default: Try Docker first, fallback to local
    Write-Host "🐳 Trying Docker Redis first..." -ForegroundColor Cyan
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        # Check if Docker Redis is already running
        $existingContainer = docker ps -q -f name=dashboard-redis 2>$null
        if ($existingContainer) {
            Write-Host "✅ Docker Redis already running" -ForegroundColor Green
        } else {
            # Remove any stopped container with same name
            docker rm dashboard-redis 2>$null | Out-Null
            
            # Start new Docker Redis
            Write-Host "Starting new Docker Redis container..." -ForegroundColor Yellow
            try {
                docker run -d --name dashboard-redis -p 6379:6379 redis:7-alpine | Out-Null
                
                # Wait for Redis to be ready
                $retries = 0
                do {
                    Start-Sleep -Seconds 1
                    $retries++
                    try {
                        $ping = docker exec dashboard-redis redis-cli ping 2>$null
                        if ($ping -eq "PONG") {
                            Write-Host "✅ Docker Redis is ready!" -ForegroundColor Green
                            break
                        }
                    } catch {}
                } while ($retries -lt 15)
                
                if ($retries -ge 15) {
                    throw "Docker Redis failed to start"
                }
            } catch {
                Write-Host "❌ Docker Redis failed, trying local..." -ForegroundColor Yellow
                
                # Fallback to local Redis
                try {
                    $localTest = redis-cli ping 2>$null
                    if ($localTest -eq "PONG") {
                        Write-Host "✅ Using existing local Redis" -ForegroundColor Green
                    } else {
                        Start-Service redis -ErrorAction Stop
                        Start-Sleep -Seconds 2
                        Write-Host "✅ Local Redis started as fallback" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "❌ Both Docker and Local Redis failed!" -ForegroundColor Red
                    Write-Host "Manual options:" -ForegroundColor Yellow
                    Write-Host "  - redis-server (terminal)" -ForegroundColor Cyan
                    Write-Host "  - Docker Desktop running?" -ForegroundColor Cyan
                    exit 1
                }
            }
        }
    } else {
        Write-Host "⚠️  Docker not found, using local Redis..." -ForegroundColor Yellow
        
        try {
            $localTest = redis-cli ping 2>$null
            if ($localTest -eq "PONG") {
                Write-Host "✅ Local Redis already running" -ForegroundColor Green
            } else {
                Start-Service redis -ErrorAction Stop
                Start-Sleep -Seconds 2
                Write-Host "✅ Local Redis started" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Local Redis failed to start" -ForegroundColor Red
            Write-Host "Try manually: redis-server" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Final verification
Write-Host "`n🔍 Final Redis check..." -ForegroundColor Cyan
try {
    $finalPing = redis-cli ping 2>$null
    if ($finalPing -eq "PONG") {
        Write-Host "✅ Redis is ready for Dashboard Seguridad!" -ForegroundColor Green
        Write-Host "   URL: redis://localhost:6379" -ForegroundColor Cyan
        Write-Host "   Backend can now start successfully" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Redis verification failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Redis verification failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Redis Setup Complete!" -ForegroundColor Green
Write-Host "Commands:" -ForegroundColor Yellow
Write-Host "  ./setup-redis.ps1 -Status    # Check Redis status" -ForegroundColor Cyan
Write-Host "  ./setup-redis.ps1 -Local     # Force local Redis" -ForegroundColor Cyan
Write-Host "  ./setup-redis.ps1 -Stop      # Stop all Redis" -ForegroundColor Cyan