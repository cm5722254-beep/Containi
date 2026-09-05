@echo off
echo =========================================================
echo CTN University Project: Starting Multi-Container System
echo =========================================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not detected or not running!
    echo Please make sure Docker Desktop is installed and running.
    echo Download Docker Desktop: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [1/3] Building and starting all containers in detached mode...
docker compose up -d

echo.
echo [2/3] Checking container status...
docker compose ps

echo.
echo [3/3] Done! Access your application at:
echo ---------------------------------------------------------
echo Web Application: http://localhost
echo Admin Dashboard: http://localhost/admin
echo API Health:      http://localhost/api/health
echo ---------------------------------------------------------
echo.
pause
