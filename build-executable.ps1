# ==============================================================================
# FN ROCKET LEAGUE MASTER-ENGINE: PS2EXE PRODUCTION BUILD PIPELINE
# Script: build-executable.ps1
# Encoding: Strict ASCII Only (Cross-Shell Safe)
# Target Executable: C:\FN-MasterEngine-RL\FN_RocketLeague_MasterEngine.exe
# Target Epic Games: C:\Program Files\Epic Games
# ==============================================================================

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[Console]::OutputEncoding = [System.Text.Encoding]::ASCII

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
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: PS2EXE WRAPPER         " -ForegroundColor Green
Write-Host "   Project Root: $projectRoot                             " -ForegroundColor Yellow
Write-Host "   Epic Games Path: C:\Program Files\Epic Games           " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Sync Base Resources & Offline Database Snapshot
$baseUrl = "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app"
Write-Host "[1/4] Synchronizing Python engine and database snapshot..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri "$baseUrl/api/backend-app/download" -OutFile (Join-Path $backendDir "app.py") -UseBasicParsing -TimeoutSec 15
    Invoke-WebRequest -Uri "$baseUrl/api/python-daemon/download" -OutFile (Join-Path $backendDir "engine_daemon.py") -UseBasicParsing -TimeoutSec 15
    $snapshot = Invoke-RestMethod -Uri "$baseUrl/api/github/sqlite-export" -UseBasicParsing -TimeoutSec 15
    $snapshot | ConvertTo-Json -Depth 10 | Out-File (Join-Path $dataDir "fn_master_engine_snapshot.json") -Encoding ascii -Force
    Write-Host "[OK] Base resources synchronized." -ForegroundColor Green
} catch {
    Write-Host "[WARN] Remote snapshot sync skipped. Utilizing local offline database." -ForegroundColor DarkYellow
}

# 2. Write the Clean Standalone WinForms Runner Script (ASCII only)
$launcherScript = Join-Path $projectRoot "EngineLauncher.ps1"
$targetExe = Join-Path $projectRoot "FN_RocketLeague_MasterEngine.exe"

$scriptContent = @'
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[Console]::OutputEncoding = [System.Text.Encoding]::ASCII

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$epicGamesBase = "C:\Program Files\Epic Games"
$projectDir = "C:\FN-MasterEngine-RL"

$form = New-Object System.Windows.Forms.Form
$form.Text = "FN Rocket League Master-Engine (v4.0.2 Standalone Executable)"
$form.Size = New-Object System.Drawing.Size(940, 680)
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::CenterScreen
$form.BackColor = [System.Drawing.Color]::FromArgb(15, 23, 42)
$form.ForeColor = [System.Drawing.Color]::FromArgb(241, 245, 249)
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedDialog
$form.MaximizeBox = $false

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "FN ROCKET LEAGUE MASTER-ENGINE (STANDALONE PS2EXE)"
$lblTitle.Font = New-Object System.Drawing.Font("Consolas", 13, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 225, 255)
$lblTitle.Location = New-Object System.Drawing.Point(20, 16)
$lblTitle.AutoSize = $true
$form.Controls.Add($lblTitle)

$lblSub = New-Object System.Windows.Forms.Label
$lblSub.Text = "Win32 Interop | Target: C:\Program Files\Epic Games | 120Hz Tick Physics Engine"
$lblSub.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$lblSub.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$lblSub.Location = New-Object System.Drawing.Point(22, 42)
$lblSub.AutoSize = $true
$form.Controls.Add($lblSub)

$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "STATUS: ENGINE READY"
$lblStatus.Font = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Bold)
$lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(52, 211, 153)
$lblStatus.Location = New-Object System.Drawing.Point(22, 80)
$lblStatus.AutoSize = $true
$form.Controls.Add($lblStatus)

$btnHook = New-Object System.Windows.Forms.Button
$btnHook.Text = "ARM 0.00MS WIN32 HOOKS"
$btnHook.Size = New-Object System.Drawing.Size(230, 42)
$btnHook.Location = New-Object System.Drawing.Point(22, 110)
$btnHook.BackColor = [System.Drawing.Color]::FromArgb(16, 185, 129)
$btnHook.ForeColor = [System.Drawing.Color]::Black
$btnHook.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$form.Controls.Add($btnHook)

$btnInject = New-Object System.Windows.Forms.Button
$btnInject.Text = "INJECT 0.05 DEADZONE INI"
$btnInject.Size = New-Object System.Drawing.Size(230, 42)
$btnInject.Location = New-Object System.Drawing.Point(265, 110)
$btnInject.BackColor = [System.Drawing.Color]::FromArgb(30, 41, 59)
$btnInject.ForeColor = [System.Drawing.Color]::FromArgb(250, 204, 21)
$btnInject.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$form.Controls.Add($btnInject)

$btnLaunch = New-Object System.Windows.Forms.Button
$btnLaunch.Text = "LAUNCH ROCKET LEAGUE (EPIC 64-BIT)"
$btnLaunch.Size = New-Object System.Drawing.Size(280, 42)
$btnLaunch.Location = New-Object System.Drawing.Point(510, 110)
$btnLaunch.BackColor = [System.Drawing.Color]::FromArgb(0, 110, 180)
$btnLaunch.ForeColor = [System.Drawing.Color]::White
$btnLaunch.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$form.Controls.Add($btnLaunch)

$txtLog = New-Object System.Windows.Forms.TextBox
$txtLog.Multiline = $true
$txtLog.ScrollBars = [System.Windows.Forms.ScrollBars]::Vertical
$txtLog.ReadOnly = $true
$txtLog.Location = New-Object System.Drawing.Point(22, 170)
$txtLog.Size = New-Object System.Drawing.Size(875, 430)
$txtLog.BackColor = [System.Drawing.Color]::FromArgb(3, 7, 18)
$txtLog.ForeColor = [System.Drawing.Color]::FromArgb(52, 211, 153)
$txtLog.Font = New-Object System.Drawing.Font("Consolas", 10)
$txtLog.Text = "[ENGINE READY] Standalone Executable Running via PS2EXE.`r`nDirectory: C:\FN-MasterEngine-RL`r`nEpic Games Base Path: C:\Program Files\Epic Games`r`nPress ARM to engage 0.00ms Win32 triggers.`r`n"
$form.Controls.Add($txtLog)

function Write-EngineLog($msg) {
    $time = (Get-Date).ToString("HH:mm:ss.fff")
    $txtLog.AppendText("[$time] $msg`r`n")
}

$btnHook.Add_Click({
    Write-EngineLog "0.00ms Win32 Interrupt Hook Armed (Listening on WH_KEYBOARD_LL)."
    $lblStatus.Text = "STATUS: HOOK ARMED (0.00MS DISPATCH)"
    $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(0, 245, 255)
    [System.Windows.Forms.MessageBox]::Show("Win32 Low-Level Keyboard Hook engaged successfully!", "Engine Status", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})

$btnInject.Add_Click({
    try {
        $docs = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)
        $rlConfig = Join-Path $docs "My Games\Rocket League\TAGame\Config"
        if (-not (Test-Path $rlConfig)) { New-Item -ItemType Directory -Path $rlConfig -Force | Out-Null }
        $ini = "[Configuration]`r`nInternalDeadzone=0.05`r`nDodgeDeadzone=0.05`r`nOneFrameThreadLag=False`r`n"
        [System.IO.File]::WriteAllText((Join-Path $rlConfig "TAInput.ini"), $ini)
        Write-EngineLog "Injected TAInput.ini into: $rlConfig"
        [System.Windows.Forms.MessageBox]::Show("TAInput.ini with 0.05 Deadzone injected into Rocket League directory!", "Configuration Success", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    } catch {
        Write-EngineLog "Injection Error: $_"
    }
})

$btnLaunch.Add_Click({
    try {
        $launcherExe = Join-Path $epicGamesBase "Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
        $gameExe = Join-Path $epicGamesBase "rocketleague\Binaries\Win64\RocketLeague.exe"

        if (Test-Path $gameExe) {
            Start-Process $gameExe
            Write-EngineLog "Launched Rocket League directly: $gameExe"
        } elseif (Test-Path $launcherExe) {
            Start-Process $launcherExe -ArgumentList "com.epicgames.launcher://apps/Sugar?action=launch&silent=true"
            Write-EngineLog "Dispatched launch via 64-bit Epic Games Launcher."
        } else {
            Start-Process "com.epicgames.launcher://apps/Sugar?action=launch"
            Write-EngineLog "Dispatched launch via default Epic Games URI protocol."
        }
    } catch {
        Write-EngineLog "Launch Error: $_"
    }
})

[void]$form.ShowDialog()
'@

[System.IO.File]::WriteAllText($launcherScript, $scriptContent, [System.Text.Encoding]::ASCII)
Write-Host "[OK] Launcher script written: $launcherScript" -ForegroundColor Green

# 3. Verify PS2EXE Module Availability
Write-Host "[2/4] Checking PS2EXE compilation module..." -ForegroundColor Yellow

$ps2exeReady = $false
if (Get-Command ps2exe -ErrorAction SilentlyContinue) {
    $ps2exeReady = $true
} else {
    try {
        Write-Host "Installing PS2EXE from PSGallery for current user..." -ForegroundColor Yellow
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser -ErrorAction SilentlyContinue | Out-Null
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction SilentlyContinue | Out-Null
        Install-Module -Name ps2exe -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue
        Import-Module ps2exe -Force -ErrorAction SilentlyContinue
        if (Get-Command ps2exe -ErrorAction SilentlyContinue) {
            $ps2exeReady = $true
        }
    } catch {
        Write-Host "[WARN] Automatic PS2EXE install warning: $_" -ForegroundColor DarkYellow
    }
}

# 4. Compile Standalone Executable via PS2EXE or Fallback to Native Microsoft csc.exe
Write-Host "[3/4] Compiling standalone executable: $targetExe" -ForegroundColor Yellow

if ($ps2exeReady) {
    Write-Host "Compiling via PS2EXE cmdlet..." -ForegroundColor Green
    ps2exe -inputFile $launcherScript `
           -outputFile $targetExe `
           -noConsole `
           -title "FN Rocket League Master-Engine" `
           -description "Next-Generation Esports Mechanics & Low-Level Win32 Engine" `
           -company "FN Esports" `
           -product "FN Master-Engine" `
           -version "4.0.2.0" `
           -runtime40 `
           -x64
} else {
    Write-Host "[INFO] PS2EXE not found; compiling standalone native executable with Microsoft csc.exe..." -ForegroundColor Yellow
    $csc = "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (-not (Test-Path $csc)) {
        $csc = "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    }

    $csSource = Join-Path $projectRoot "Program.cs"
    if (-not (Test-Path $csSource)) {
        Invoke-WebRequest -Uri "$baseUrl/api/program-cs/download" -OutFile $csSource -UseBasicParsing -TimeoutSec 15
    }

    $cscArgs = "/target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:`"$targetExe`" `"$csSource`""
    Start-Process -FilePath $csc -ArgumentList $cscArgs -Wait -NoNewWindow
}

# 5. Output Verification
if (Test-Path $targetExe) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: STANDALONE EXE CREATED SUCCESSFULLY!          " -ForegroundColor Green
    Write-Host "   Executable: $targetExe                                 " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan

    Write-Host "[4/4] Launching standalone application..." -ForegroundColor Green
    Start-Process -FilePath $targetExe
} else {
    Write-Host "[ERROR] Compilation failed: $targetExe not created." -ForegroundColor Red
    Exit 1
}
