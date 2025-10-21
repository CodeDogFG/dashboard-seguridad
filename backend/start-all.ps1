# Dashboard Seguridad - Start Everything
# Handles Docker Desktop startup and Redis

Write-Host "Dashboard Seguridad - Complete Startup" -ForegroundColor Magenta
Write-Host "======================================="

# Check if Docker Desktop is running
Write-Host "Checking Docker Desktop..." -ForegroundColor Cyan
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker Desktop is running" -ForegroundColor Green
        
        # Check if redis-stack is already running
        $existingRedis = docker ps --format "table {{.Names}}" | Where-Object { $_ -like "*redis*" }
        if ($existingRedis) {
            Write-Host "Found existing Redis container: $existingRedis" -ForegroundColor Green
            
            # Test connection to existing Redis
            try {
                $testConnection = docker exec $existingRedis redis-cli ping 2>$null
                if ($testConnection -eq "PONG") {
                    Write-Host "Existing Redis is working perfectly!" -ForegroundColor Green
                } else {
                    Write-Host "Warning: Existing Redis not responding" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Could not test existing Redis" -ForegroundColor Yellow
            }
        } else {
            # Start new Redis container
            Write-Host "Starting new Redis container..." -ForegroundColor Yellow
            docker run -d --name dashboard-redis -p 6379:6379 redis:7-alpine | Out-Null
            
            # Wait for new Redis to be ready
            $retries = 0
            do {
                Start-Sleep -Seconds 1
                $retries++
                try {
                    $ping = docker exec dashboard-redis redis-cli ping 2>$null
                    if ($ping -eq "PONG") {
                        Write-Host "New Redis is ready!" -ForegroundColor Green
                        break
                    }
                } catch {}
            } while ($retries -lt 15)
            
            if ($retries -ge 15) {
                Write-Host "Redis startup timeout" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "Docker Desktop is not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again, or:" -ForegroundColor Cyan
    Write-Host "1. Open Docker Desktop application" -ForegroundColor Yellow
    Write-Host "2. Wait for it to start completely" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Install Redis locally" -ForegroundColor Cyan
    Write-Host "choco install redis-64 -y" -ForegroundColor Yellow
    exit 1
}

# Verify .env file
Write-Host "Checking environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit .env with your API keys" -ForegroundColor Green
    } else {
        Write-Host "No .env file found" -ForegroundColor Yellow
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: cd ../frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Magenta

node src/server.js