@echo off
setlocal
echo Installing TWR Bank Data Preview to Windows Startup...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $startupPath = [System.Environment]::GetFolderPath('Startup'); $shortcut = $ws.CreateShortcut(\"$startupPath\TWR-Bank-Data-Preview.lnk\"); $shortcut.TargetPath = 'wscript.exe'; $shortcut.Arguments = '\"S:\TWR Bank Data Project\scripts\start-background.vbs\"'; $shortcut.WorkingDirectory = 'S:\TWR Bank Data Project'; $shortcut.Description = 'TWR Bank Data Continuous Local Preview'; $shortcut.Save(); Write-Output '[SUCCESS] Autostart shortcut configured in Windows Startup.'"
pause
