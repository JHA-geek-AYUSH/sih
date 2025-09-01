@echo off
REM Pharmalytics Care - Docker Startup Script for Windows

echo 🏥 Starting Pharmalytics Care with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo 📝 Creating .env file from template...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your configuration before continuing.
    pause
)

REM Choose deployment mode
echo Choose deployment mode:
echo 1) Development (with hot reload)
echo 2) Production (optimized build)
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo 🚀 Starting in Development mode...
    docker-compose -f docker-compose.full.yml --profile dev up --build
) else if "%choice%"=="2" (
    echo 🚀 Starting in Production mode...
    docker-compose -f docker-compose.full.yml --profile prod up --build
) else (
    echo ❌ Invalid choice. Starting in Development mode...
    docker-compose -f docker-compose.full.yml --profile dev up --build
)

echo ✅ Pharmalytics Care is starting up!
echo 🌐 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:5000/api
echo 📊 MongoDB: mongodb://localhost:27017
echo 🔄 Redis: redis://localhost:6379
echo.
echo 📋 Useful commands:
echo   View logs: docker-compose -f docker-compose.full.yml logs -f
echo   Stop services: docker-compose -f docker-compose.full.yml down
echo   Restart: docker-compose -f docker-compose.full.yml restart
pause
