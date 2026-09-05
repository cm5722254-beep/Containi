@echo off
title CTN University Project - Stop Containers
echo =========================================================
echo CTN University Project: Stopping Containers (Keeping Data)
echo =========================================================
echo.

set "DOCKER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin"
if exist "%DOCKER_BIN%" (
    set "PATH=%PATH%;%DOCKER_BIN%"
)

docker compose down

echo.
echo =========================================================
echo All containers stopped safely!
echo Your PostgreSQL volume (postgres_data) is safely preserved!
echo =========================================================
echo.
pause
