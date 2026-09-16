Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "S:\TWR Bank Data Project"
WshShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""S:\TWR Bank Data Project\scripts\start-preview.ps1""", 0, False
