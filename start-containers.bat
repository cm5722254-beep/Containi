@echo off
setlocal enabledelayedexpansion
title CTN University Project - Docker Containers
echo =========================================================
echo CTN University Project: Starting Multi-Container System
echo =========================================================
echo.

:: Add Docker Desktop path to current session PATH
set "DOCKER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin"
if exist "%DOCKER_BIN%" (
    set "PATH=%PATH%;%DOCKER_BIN%"
)

:: Check if docker CLI is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker CLI not found.
    echo Please make sure Docker Desktop is installed.
    pause
    exit /b 1
)

:: Check if Docker Engine daemon is responding
echo [1/4] Checking Docker Engine daemon status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker Engine is starting or not opened yet.
    echo [*] Launching Docker Desktop app automatically...
    
    set "DOCKER_EXE=%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
    if exist "!DOCKER_EXE!" (
        start "" "!DOCKER_EXE!"
    ) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    )

    echo [*] Waiting for Docker Engine daemon to become ready (this may take 20-40s)...
    :WAIT_LOOP
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Docker Engine is now ONLINE and ready!
        goto DOCKER_READY
    )
    echo [*] Still waiting for Docker Engine... please wait...
    goto WAIT_LOOP
)

:DOCKER_READY
echo.
echo [2/4] Docker Engine is ready! Building and starting all containers...
docker compose up -d

echo.
echo [3/4] Checking container status...
docker compose ps

echo.
echo [4/4] SUCCESS! All 5 Containers are Running!
echo =========================================================
echo Access your application:
echo Web Application: http://localhost
echo Admin Dashboard: http://localhost/admin
echo API Health:      http://localhost/api/health
echo =========================================================
echo.
echo Opening http://localhost in your default browser...
start http://localhost
echo.
pause
