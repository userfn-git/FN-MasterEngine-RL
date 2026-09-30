<#
==============================================================================
FN ROCKET LEAGUE MASTER-ENGINE: LAUNCH SCRIPT
File: launch.ps1
- Checks for Node.js and Python presence with clear diagnostic feedback
- Launches the local development server on port 5173
- Opens the application interface automatically using: start http://localhost:5173
==============================================================================
#>

[Console]::OutputEncoding = [System.Text.Encoding]::ASCII
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: SYSTEM LAUNCHER        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check for Node.js
Write-Host "[1/3] Checking Node.js runtime..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCmd) {
    $nodeVer = & node --version
    Write-Host "[OK] Node.js is installed: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js is MISSING from your system or not added to PATH!" -ForegroundColor Red
    Write-Host "        Please download and install Node.js from https://nodejs.org" -ForegroundColor DarkYellow
}

# 2. Check for Python
Write-Host "[2/3] Checking Python runtime..." -ForegroundColor Yellow
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    $pyVer = & $pythonCmd --version
    Write-Host "[OK] Python is installed: $pyVer" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Python is MISSING from your system or not added to PATH!" -ForegroundColor Red
    Write-Host "        Please install Python from https://www.python.org/downloads" -ForegroundColor DarkYellow
}

# 3. Start Dev Server & Open in Default Browser
Write-Host "[3/3] Launching Local Application Interface..." -ForegroundColor Yellow

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptRoot) { $scriptRoot = Get-Location }
Set-Location $scriptRoot

# Start Vite dev server on port 5173 if node is present
if ($nodeCmd) {
    if (Test-Path "$scriptRoot\node_modules\.bin\vite.cmd") {
        Start-Process "$scriptRoot\node_modules\.bin\vite.cmd" -ArgumentList "--port 5173" -WindowStyle Minimized
    } else {
        Start-Process "npx" -ArgumentList "vite --port 5173" -WindowStyle Minimized -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Open the local application interface automatically in the user's default browser
Write-Host "[+] Opening http://localhost:5173 in default browser..." -ForegroundColor Cyan
start http://localhost:5173

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Rocket League Master-Engine is now active!             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
