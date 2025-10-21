# Dashboard Seguridad - Quick Start Test
# Tests both Redis options and backend

Write-Host "🧪 Dashboard Seguridad - Quick Test" -ForegroundColor Magenta
Write-Host "====================================="

# Test 1: Check Redis Status
Write-Host "`n1️⃣ Checking Redis Status..." -ForegroundColor Cyan
& "./setup-redis.ps1" -Status

# Test 2: Start Redis (hybrid approach)
Write-Host "`n2️⃣ Starting Redis (Docker preferred)..." -ForegroundColor Cyan
& "./setup-redis.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Redis setup failed. Trying local..." -ForegroundColor Red
    & "./setup-redis.ps1" -Local
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Both Redis options failed!" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Test backend connection
Write-Host "`n3️⃣ Testing Backend..." -ForegroundColor Cyan

# Quick backend test without starting full server
Write-Host "Creating test backend instance..." -ForegroundColor Yellow

# Create a minimal test to verify Redis connection
$testScript = @"
const { redisClient, connectRedis } = require('./src/config/redisClient');

async function testRedis() {
    try {
        await connectRedis();
        console.log('✅ Backend can connect to Redis!');
        
        // Test cache operations
        await redisClient.set('test:dashboard', 'working', { EX: 10 });
        const result = await redisClient.get('test:dashboard');
        console.log('✅ Cache operations working:', result);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Backend Redis connection failed:', error.message);
        process.exit(1);
    }
}

testRedis();
"@

$testScript | Out-File -FilePath "test-redis-connection.js" -Encoding UTF8

try {
    node test-redis-connection.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend-Redis connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend-Redis connection failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js test failed: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Cleanup test file
    Remove-Item "test-redis-connection.js" -ErrorAction SilentlyContinue
}

Write-Host "`n🎉 Quick Test Complete!" -ForegroundColor Green
Write-Host "====================================="
Write-Host "Ready to start:" -ForegroundColor Cyan
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host "  Backend:  ./start-backend.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Redis Management:" -ForegroundColor Cyan
Write-Host "  Status:   ./setup-redis.ps1 -Status" -ForegroundColor Yellow
Write-Host "  Docker:   ./setup-redis.ps1" -ForegroundColor Yellow
Write-Host "  Local:    ./setup-redis.ps1 -Local" -ForegroundColor Yellow
Write-Host "  Stop:     ./setup-redis.ps1 -Stop" -ForegroundColor Yellow