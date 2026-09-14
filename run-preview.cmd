@echo off
setlocal
set "PATH=C:\Program Files\nodejs;C:\Users\%USERNAME%\AppData\Roaming\npm;C:\Program Files\Git\cmd;%PATH%"

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% equ 0 (
    echo [OK] Local preview server is actively listening on http://localhost:3000
    exit /b 0
)

echo [STARTING] Launching continuous preview server on http://localhost:3000...
start "TWR Valuation Preview" /b cmd /c "npm run dev > .next-preview.log 2>&1"
timeout /t 3 /nobreak >nul
echo [READY] Server initialized. Visit http://localhost:3000
