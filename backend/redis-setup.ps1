# Dashboard Seguridad - Simple Redis Setup
# Hybrid approach: Docker first, local fallback

param(
    [switch]$Local,
    [switch]$Status,
    [switch]$Stop
)

if ($Status) {
    Write-Host "Redis Status Check..." -ForegroundColor Cyan
    
    # Check Docker Redis
    $dockerRedis = docker ps -q -f name=dashboard-redis 2>$null
    if ($dockerRedis) {
        Write-Host "Docker Redis: Running" -ForegroundColor Green
        try {
            $dockerPing = docker exec dashboard-redis redis-cli ping 2>$null
            Write-Host "Docker Status: $dockerPing" -ForegroundColor Green
        } catch {
            Write-Host "Docker Status: Error" -ForegroundColor Red
        }
    } else {
        Write-Host "Docker Redis: Not running" -ForegroundColor Yellow
    }
    
    # Check Local Redis
    try {
        $localPing = redis-cli ping 2>$null
        Write-Host "Local Redis: $localPing" -ForegroundColor Green
    } catch {
        Write-Host "Local Redis: Not running" -ForegroundColor Yellow
    }
    exit 0
}

if ($Stop) {
    Write-Host "Stopping Redis services..." -ForegroundColor Yellow
    
    # Stop Docker Redis
    $dockerRedis = docker ps -q -f name=dashboard-redis 2>$null
    if ($dockerRedis) {
        docker stop dashboard-redis 2>$null | Out-Null
        docker rm dashboard-redis 2>$null | Out-Null
        Write-Host "Docker Redis stopped" -ForegroundColor Green
    }
    exit 0
}

Write-Host "Starting Redis for Dashboard Seguridad..." -ForegroundColor Cyan

if ($Local) {
    Write-Host "Using Local Redis..." -ForegroundColor Yellow
    
    try {
        $localTest = redis-cli ping 2>$null
        if ($localTest -eq "PONG") {
            Write-Host "Local Redis already running" -ForegroundColor Green
            exit 0
        } else {
            Start-Service redis -ErrorAction Stop
            Start-Sleep -Seconds 2
            Write-Host "Local Redis started" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "Could not start local Redis" -ForegroundColor Red
        Write-Host "Try manually: redis-server" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Trying Docker Redis..." -ForegroundColor Yellow
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        # Check if already running
        $existingContainer = docker ps -q -f name=dashboard-redis 2>$null
        if ($existingContainer) {
            Write-Host "Docker Redis already running" -ForegroundColor Green
            exit 0
        } else {
            # Clean up any stopped container
            docker rm dashboard-redis 2>$null | Out-Null
            
            # Start new container
            Write-Host "Starting Docker Redis..." -ForegroundColor Yellow
            try {
                docker run -d --name dashboard-redis -p 6379:6379 redis:7-alpine | Out-Null
                
                # Wait for ready
                $retries = 0
                do {
                    Start-Sleep -Seconds 1
                    $retries++
                    try {
                        $ping = docker exec dashboard-redis redis-cli ping 2>$null
                        if ($ping -eq "PONG") {
                            Write-Host "Docker Redis ready!" -ForegroundColor Green
                            exit 0
                        }
                    } catch {}
                } while ($retries -lt 10)
                
                Write-Host "Docker Redis timeout, trying local..." -ForegroundColor Yellow
            } catch {
                Write-Host "Docker failed, trying local..." -ForegroundColor Yellow
            }
        }
    }
    
    # Fallback to local
    Write-Host "Falling back to local Redis..." -ForegroundColor Yellow
    try {
        $localTest = redis-cli ping 2>$null
        if ($localTest -eq "PONG") {
            Write-Host "Local Redis already running" -ForegroundColor Green
            exit 0
        } else {
            redis-server --daemonize yes 2>$null
            Start-Sleep -Seconds 2
            Write-Host "Local Redis started" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "All Redis options failed!" -ForegroundColor Red
        Write-Host "Try: redis-server" -ForegroundColor Yellow
        exit 1
    }
}