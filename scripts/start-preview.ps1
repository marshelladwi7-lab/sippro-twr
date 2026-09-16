# Set working directory to project root
$projectRoot = "S:\TWR Bank Data Project"
Set-Location -Path $projectRoot

# Ensure Node environment in PATH
$env:Path = "C:\Program Files\nodejs;C:\Users\marsh\AppData\Roaming\npm;C:\Program Files\Git\cmd;" + $env:Path

# Disable interactive TTY stdin listeners and telemetry for headless background execution
$env:CI = "true"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Check if port 3000 is already listening
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    exit 0
}

# Launch Next.js dev server completely headless and detached
$nodePath = "C:\Program Files\nodejs\node.exe"
$outLog = Join-Path $projectRoot ".next-preview.log"
$errLog = Join-Path $projectRoot ".next-preview-err.log"

Start-Process -FilePath $nodePath `
    -ArgumentList @("node_modules\next\dist\bin\next", "dev", "-p", "3000") `
    -WorkingDirectory $projectRoot `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -WindowStyle Hidden
