@echo off
setlocal
echo Removing TWR Bank Data Preview from Windows Startup...
powershell -NoProfile -Command "$path = Join-Path ([System.Environment]::GetFolderPath('Startup')) 'TWR-Bank-Data-Preview.lnk'; if (Test-Path $path) { Remove-Item $path -Force; Write-Output '[SUCCESS] Autostart shortcut removed from Windows Startup.' } else { Write-Output '[INFO] Shortcut was not found in Startup.' }"
pause
