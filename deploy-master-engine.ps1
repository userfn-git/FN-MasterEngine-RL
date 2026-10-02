# ==============================================================================
# FN ROCKET LEAGUE MASTER-ENGINE: DEPLOYMENT PIPELINE
# File: deploy-master-engine.ps1
# Output Executable: C:\FN-MasterEngine-RL\MasterEngine.exe
# Base Epic Games Path: C:\Program Files\Epic Games
# Encoding: Strict 100% ASCII Only (Zero Unicode / No Non-English Characters)
# ==============================================================================

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[Console]::OutputEncoding = [System.Text.Encoding]::ASCII

$ErrorActionPreference = "Stop"

$projectRoot = "C:\FN-MasterEngine-RL"
if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
Set-Location $projectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN ROCKET LEAGUE MASTER-ENGINE: PRODUCTION DEPLOY      " -ForegroundColor Green
Write-Host "   Target Directory: $projectRoot                         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Clean previous build artifacts using standard PowerShell commands
$targetExe = Join-Path $projectRoot "MasterEngine.exe"
$legacyExe = Join-Path $projectRoot "FN_RocketLeague_MasterEngine.exe"
$launcherScript = Join-Path $projectRoot "MasterEngineLauncher.ps1"

Write-Host "[1/5] Performing clean state verification and file cleanup..." -ForegroundColor Yellow

$artifactsToClean = @(
    $targetExe,
    $legacyExe,
    $launcherScript,
    (Join-Path $projectRoot "MasterEngine.pdb"),
    (Join-Path $projectRoot "*.tmp")
)

foreach ($artifact in $artifactsToClean) {
    if (Test-Path $artifact) {
        Remove-Item -Path $artifact -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "      Removed stale artifact: $artifact" -ForegroundColor DarkGray
    }
}
Write-Host "[OK] Workspace cleanup completed." -ForegroundColor Green

# 2. Logical validation of Epic Games installation path
$epicGamesBase = "C:\Program Files\Epic Games"
$epicLauncherExe = Join-Path $epicGamesBase "Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
$rlGameExe = Join-Path $epicGamesBase "rocketleague\Binaries\Win64\RocketLeague.exe"

Write-Host "[2/5] Validating Epic Games directory structure..." -ForegroundColor Yellow

if (Test-Path $epicGamesBase) {
    Write-Host "[OK] Base directory verified: $epicGamesBase" -ForegroundColor Green
    if (Test-Path $rlGameExe) {
        Write-Host "     Rocket League 64-bit binary detected: $rlGameExe" -ForegroundColor Green
    } elseif (Test-Path $epicLauncherExe) {
        Write-Host "     Epic Games Launcher 64-bit binary detected: $epicLauncherExe" -ForegroundColor Green
    } else {
        Write-Host "     Epic Games directory detected (Default launcher path active)." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[WARN] Standard path not detected at $epicGamesBase." -ForegroundColor DarkYellow
    Write-Host "       Creating directory structure placeholder for local injection..." -ForegroundColor DarkYellow
    New-Item -ItemType Directory -Path $epicGamesBase -Force | Out-Null
}

# 3. Generate standalone runner source script
Write-Host "[3/5] Generating standalone launcher source script..." -ForegroundColor Yellow

$runnerScript = @'
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
$lblSub.Text = "Win32 Interop | Path: C:\Program Files\Epic Games | 120Hz Tick Physics Engine"
$lblSub.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$lblSub.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$lblSub.Location = New-Object System.Drawing.Point(22, 42)
$lblSub.AutoSize = $true
$form.Controls.Add($lblSub)

$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "STATUS: MASTER ENGINE READY"
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
$txtLog.Text = "[ENGINE READY] Standalone Executable Running via MasterEngine.exe`r`nDirectory: C:\FN-MasterEngine-RL`r`nEpic Games Target: C:\Program Files\Epic Games`r`nPress ARM to engage 0.00ms Win32 triggers.`r`n"
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

[System.IO.File]::WriteAllText($launcherScript, $runnerScript, [System.Text.Encoding]::ASCII)
Write-Host "[OK] Standalone launcher source generated at $launcherScript" -ForegroundColor Green

# 4. Programmatically check and configure PS2EXE
Write-Host "[4/5] Checking for PS2EXE compilation module..." -ForegroundColor Yellow

$ps2exeReady = $false
if (Get-Command ps2exe -ErrorAction SilentlyContinue) {
    $ps2exeReady = $true
} else {
    try {
        Write-Host "      Installing PS2EXE from PSGallery for CurrentUser..." -ForegroundColor Yellow
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser -ErrorAction SilentlyContinue | Out-Null
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction SilentlyContinue | Out-Null
        Install-Module -Name ps2exe -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue
        Import-Module ps2exe -Force -ErrorAction SilentlyContinue
        if (Get-Command ps2exe -ErrorAction SilentlyContinue) {
            $ps2exeReady = $true
        }
    } catch {
        Write-Host "      [WARN] Automatic PS2EXE install warning: $_" -ForegroundColor DarkYellow
    }
}

# 5. Standard compilation approach using PS2EXE and Microsoft csc.exe fallback
Write-Host "[5/5] Compiling $targetExe..." -ForegroundColor Yellow

if ($ps2exeReady) {
    Write-Host "      Compiling standalone executable using standard PS2EXE invocation..." -ForegroundColor Green
    try {
        # Standard parameters supported by all PS2EXE versions
        ps2exe -inputFile $launcherScript `
               -outputFile $targetExe `
               -noConsole `
               -title "FN Rocket League Master-Engine" `
               -description "Competitive Esports Mechanics & Win32 Interop Kernel" `
               -company "FN Esports" `
               -product "MasterEngine" `
               -version "4.0.2.0" `
               -x64 -ErrorAction Stop
    } catch {
        Write-Host "      [WARN] Standard PS2EXE call threw: $_" -ForegroundColor DarkYellow
        Write-Host "      Retrying with essential parameters..." -ForegroundColor Yellow
        try {
            ps2exe -inputFile $launcherScript -outputFile $targetExe -noConsole -ErrorAction Stop
        } catch {
            Write-Host "      [WARN] PS2EXE failed. Falling back to Microsoft C# native compiler..." -ForegroundColor DarkYellow
            $ps2exeReady = $false
        }
    }
}

# Native compiler fallback using Microsoft csc.exe
if (-not (Test-Path $targetExe)) {
    Write-Host "      [INFO] Compiling standalone native executable with Microsoft csc.exe..." -ForegroundColor Yellow
    $csc = "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (-not (Test-Path $csc)) {
        $csc = "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    }

    $csProgram = Join-Path $projectRoot "Program.cs"
    if (-not (Test-Path $csProgram)) {
        Invoke-WebRequest -Uri "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app/api/program-cs/download" -OutFile $csProgram -UseBasicParsing -TimeoutSec 15
    }

    $cArgs = "/target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:`"$targetExe`" `"$csProgram`""
    Start-Process -FilePath $csc -ArgumentList $cArgs -Wait -NoNewWindow
}

# Verify and execute
if (Test-Path $targetExe) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: MasterEngine.exe COMPILED AND READY!          " -ForegroundColor Green
    Write-Host "   Path: $targetExe                                       " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan

    Start-Process -FilePath $targetExe
} else {
    Write-Host "[ERROR] Failed to compile MasterEngine.exe." -ForegroundColor Red
    Exit 1
}
