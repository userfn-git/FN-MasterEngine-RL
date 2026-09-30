<#
==============================================================================
FN ROCKET LEAGUE MASTER-ENGINE: STANDALONE EXE COMPILER
Script: Build-Executable.ps1
- Downloads Program.cs cleanly
- Locates Microsoft csc.exe compiler
- Compiles standalone native Windows executable: FN_RocketLeague_MasterEngine.exe
- 100% Pure ASCII & English (Zero CSS / HTML / Unicode)
==============================================================================
#>

[Console]::OutputEncoding = [System.Text.Encoding]::ASCII
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$targetDir = "C:\FN-MasterEngine-RL"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}
Set-Location $targetDir

$outExePath = "$targetDir\FN_RocketLeague_MasterEngine.exe"
$csharpSourceFile = "$targetDir\Program.cs"
$baseUrl = "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: NATIVE EXE COMPILER    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Fetch Clean Program.cs
Write-Host "[1/3] Downloading pure C# source (Program.cs)..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$baseUrl/api/program-cs/download" -OutFile $csharpSourceFile -UseBasicParsing

# 2. Locate Microsoft .NET C# Compiler (csc.exe)
Write-Host "[2/3] Locating Microsoft C# Native Compiler (csc.exe)..." -ForegroundColor Yellow

$cscCandidates = @(
    "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe",
    "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
)

$cscPath = $null
foreach ($path in $cscCandidates) {
    if (Test-Path $path) {
        $cscPath = $path
        break
    }
}

if (-not $cscPath) {
    Write-Host "[ERROR] Could not find csc.exe. Please ensure .NET Framework is installed." -ForegroundColor Red
    Exit 1
}

Write-Host "[OK] Compiler located: $cscPath" -ForegroundColor Green

# 3. Compile Standalone Native Executable
Write-Host "[3/3] Compiling standalone FN_RocketLeague_MasterEngine.exe..." -ForegroundColor Yellow

$compileArgs = "/target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:`"$outExePath`" `"$csharpSourceFile`""
$proc = Start-Process -FilePath $cscPath -ArgumentList $compileArgs -Wait -NoNewWindow -PassThru

if ($proc.ExitCode -eq 0 -and (Test-Path $outExePath)) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: STANDALONE EXE CREATED!                       " -ForegroundColor Green
    Write-Host "   Path: $outExePath                                      " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    Start-Process $outExePath
} else {
    Write-Host "[ERROR] Compilation failed with exit code $($proc.ExitCode)" -ForegroundColor Red
}
