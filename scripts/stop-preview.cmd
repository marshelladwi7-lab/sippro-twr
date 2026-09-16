@echo off
setlocal
echo Stopping preview server on port 3000...
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; foreach ($c in $conns) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Output 'Port 3000 stopped.'"
