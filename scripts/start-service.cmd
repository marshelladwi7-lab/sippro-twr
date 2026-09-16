@echo off
setlocal
cd /d "S:\TWR Bank Data Project"
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;C:\Program Files\Git\cmd;%PATH%"

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% equ 0 (
    exit /b 0
)

call npm.cmd run dev >> "S:\TWR Bank Data Project\.next-preview.log" 2>&1
