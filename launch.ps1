<#
==============================================================================
FN ROCKET LEAGUE MASTER-ENGINE: SYSTEM LAUNCHER
File: launch.ps1
Encoding: Strict 100% ASCII Only (Zero Unicode / No Non-English Characters)
Prerequisites: Node.js, Python 3.10+, PowerShell 5.1+
Target Epic Games Base: C:\Program Files\Epic Games
==============================================================================
#>

[Console]::OutputEncoding = [System.Text.Encoding]::ASCII
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: SYSTEM LAUNCHER        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptRoot) { $scriptRoot = "C:\FN-MasterEngine-RL" }
if (-not (Test-Path $scriptRoot)) {
    New-Item -ItemType Directory -Path $scriptRoot -Force | Out-Null
}
Set-Location $scriptRoot

# 1. Clean stale temporary and lock files
Write-Host "[1/4] Verifying workspace and cleaning temporary cache..." -ForegroundColor Yellow

$tempPatterns = @("*.tmp", "~*", "npm-debug.log*")
foreach ($pat in $tempPatterns) {
    Get-ChildItem -Path $scriptRoot -Filter $pat -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "[OK] Clean workspace state confirmed." -ForegroundColor Green

# 2. Logical validation of Epic Games path
Write-Host "[2/4] Checking Epic Games Rocket League installation..." -ForegroundColor Yellow
$epicGamesBase = "C:\Program Files\Epic Games"
$epicLauncherExe = Join-Path $epicGamesBase "Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
$rlGameExe = Join-Path $epicGamesBase "rocketleague\Binaries\Win64\RocketLeague.exe"

if (Test-Path $epicGamesBase) {
    Write-Host "[OK] Epic Games directory found: $epicGamesBase" -ForegroundColor Green
    if (Test-Path $rlGameExe) {
        Write-Host "     Found Rocket League binary: $rlGameExe" -ForegroundColor Green
    } elseif (Test-Path $epicLauncherExe) {
        Write-Host "     Found Epic Games Launcher binary: $epicLauncherExe" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] Epic Games directory not found at $epicGamesBase" -ForegroundColor DarkYellow
    Write-Host "       Creating placeholder directory for configuration injection..." -ForegroundColor DarkYellow
    New-Item -ItemType Directory -Path $epicGamesBase -Force | Out-Null
}

# 3. Check for Node.js runtime
Write-Host "[3/4] Checking Node.js and Python runtimes..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCmd) {
    $nodeVer = & node --version
    Write-Host "[OK] Node.js is installed: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js is MISSING or not added to system PATH!" -ForegroundColor Red
    Write-Host "        Please install Node.js from https://nodejs.org" -ForegroundColor DarkYellow
}

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
    Write-Host "[ERROR] Python is MISSING or not added to system PATH!" -ForegroundColor Red
    Write-Host "        Please install Python from https://www.python.org/downloads" -ForegroundColor DarkYellow
}

# 4. Start local development server on port 5173
Write-Host "[4/4] Launching local telemetry dashboard on port 5173..." -ForegroundColor Yellow

if ($nodeCmd) {
    $viteCmd = Join-Path $scriptRoot "node_modules\.bin\vite.cmd"
    if (Test-Path $viteCmd) {
        Start-Process $viteCmd -ArgumentList "--port 5173" -WindowStyle Minimized
    } else {
        Start-Process "npx" -ArgumentList "vite --port 5173" -WindowStyle Minimized -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host "[+] Opening http://localhost:5173 in default browser..." -ForegroundColor Cyan
start "http://localhost:5173"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Rocket League Master-Engine is now active!             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
