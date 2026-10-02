<#
==============================================================================
FN ROCKET LEAGUE MASTER-ENGINE: PRODUCTION BUILD SYSTEM
File: build.ps1
Target: C:\FN-MasterEngine-RL\FN_RocketLeague_MasterEngine.exe
Architecture: Standalone Executable (.NET Framework WinForms / C# native)
Base Path: C:\Program Files\Epic Games (64-bit standard, no x86)
Encoding: Strict 100% ASCII Only (Zero Unicode / No Non-English Characters)
==============================================================================
#>

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$OutputEncoding = [System.Text.Encoding]::UTF8
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$ErrorActionPreference = "Stop"

$projectRoot = "C:\FN-MasterEngine-RL"
if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
Set-Location $projectRoot

$backendDir = Join-Path $projectRoot "backend"
$dataDir = Join-Path $projectRoot "data"
$configDir = Join-Path $projectRoot "config"

@($backendDir, $dataDir, $configDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: BUILD SYSTEM           " -ForegroundColor Green
Write-Host "   Target Directory: $projectRoot                         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Clean previous build artifacts using standard PowerShell commands
$exeFile = Join-Path $projectRoot "FN_RocketLeague_MasterEngine.exe"
$legacyExe = Join-Path $projectRoot "MasterEngine.exe"
$csFile = Join-Path $projectRoot "Program.cs"

Write-Host "[1/5] Cleaning previous build outputs..." -ForegroundColor Yellow

$cleanTargets = @(
    $exeFile,
    $legacyExe,
    (Join-Path $projectRoot "*.pdb"),
    (Join-Path $projectRoot "*.tmp")
)

foreach ($target in $cleanTargets) {
    if (Test-Path $target) {
        Remove-Item -Path $target -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "      Cleaned: $target" -ForegroundColor DarkGray
    }
}
Write-Host "[OK] Clean workspace ready." -ForegroundColor Green

# 2. Logical validation of Epic Games path
$epicGamesBase = "C:\Program Files\Epic Games"
$epicLauncher = Join-Path $epicGamesBase "Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
$rlBinary = Join-Path $epicGamesBase "rocketleague\Binaries\Win64\RocketLeague.exe"

Write-Host "[2/5] Validating Epic Games directory structure..." -ForegroundColor Yellow

if (Test-Path $epicGamesBase) {
    Write-Host "[OK] Epic Games directory verified: $epicGamesBase" -ForegroundColor Green
    if (Test-Path $rlBinary) {
        Write-Host "     Found Rocket League binary: $rlBinary" -ForegroundColor Green
    } elseif (Test-Path $epicLauncher) {
        Write-Host "     Found Epic Games Launcher: $epicLauncher" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] Epic Games directory not detected at $epicGamesBase" -ForegroundColor DarkYellow
    Write-Host "       Creating placeholder directory for configuration injection..." -ForegroundColor DarkYellow
    New-Item -ItemType Directory -Path $epicGamesBase -Force | Out-Null
}

# 3. Synchronize core resources & SQLite database snapshot
$baseUrl = "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app"
Write-Host "[3/5] Synchronizing resources and SQLite database snapshot..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri "$baseUrl/api/backend-app/download" -OutFile (Join-Path $backendDir "app.py") -UseBasicParsing -TimeoutSec 15
    Invoke-WebRequest -Uri "$baseUrl/api/python-daemon/download" -OutFile (Join-Path $backendDir "engine_daemon.py") -UseBasicParsing -TimeoutSec 15
    $snapshot = Invoke-RestMethod -Uri "$baseUrl/api/github/sqlite-export" -UseBasicParsing -TimeoutSec 15
    $snapshot | ConvertTo-Json -Depth 10 | Out-File (Join-Path $dataDir "fn_master_engine_snapshot.json") -Encoding ascii -Force
    Write-Host "[OK] Resources and offline SQLite database synchronized." -ForegroundColor Green
} catch {
    Write-Host "[WARN] Remote snapshot sync skipped. Proceeding with local offline state." -ForegroundColor DarkYellow
}

# 4. Generate standalone C# application source
Write-Host "[4/5] Preparing standalone C# application source: $csFile" -ForegroundColor Yellow

if (-not (Test-Path $csFile)) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/api/program-cs/download" -OutFile $csFile -UseBasicParsing -TimeoutSec 15
    } catch {
        Write-Host "[WARN] Remote fetch for Program.cs skipped; local file will be used if present." -ForegroundColor DarkYellow
    }
}

# 5. Locate Microsoft C# Compiler (csc.exe) and compile
Write-Host "[5/5] Compiling standalone executable..." -ForegroundColor Yellow

$cscCandidates = @(
    "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe",
    "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
)

$cscPath = $null
foreach ($c in $cscCandidates) {
    if (Test-Path $c) {
        $cscPath = $c
        break
    }
}

if (-not $cscPath) {
    Write-Host "[ERROR] Could not locate csc.exe. Please enable .NET Framework 3.5 / 4.x in Windows Features." -ForegroundColor Red
    Exit 1
}

Write-Host "[OK] Found compiler: $cscPath" -ForegroundColor Green

$compilerArgs = @(
    "/target:winexe",
    "/platform:anycpu",
    "/optimize+",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    "/out:`"$exeFile`"",
    "`"$csFile`""
)

$argLine = $compilerArgs -join " "
$process = Start-Process -FilePath $cscPath -ArgumentList $argLine -Wait -NoNewWindow -PassThru

if ($process.ExitCode -eq 0 -and (Test-Path $exeFile)) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: STANDALONE EXECUTABLE BUILT!                  " -ForegroundColor Green
    Write-Host "   Path: $exeFile                                         " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan

    Start-Process -FilePath $exeFile
} else {
    Write-Host "[ERROR] Compilation exited with status code: $($process.ExitCode)" -ForegroundColor Red
    Exit $process.ExitCode
}
