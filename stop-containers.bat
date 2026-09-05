@echo off
echo =========================================================
echo CTN University Project: Stopping Containers (Keeping Data)
echo =========================================================
echo.

docker compose down

echo.
echo All containers stopped. Your PostgreSQL volume (postgres_data) is safely preserved!
echo.
pause
