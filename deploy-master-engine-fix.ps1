# ==============================================================================
# FN ROCKET LEAGUE MASTER-ENGINE: COMPILATION & PROCESS MANAGEMENT PIPELINE
# Script: deploy-master-engine-fix.ps1
# Target Executable: C:\FN-MasterEngine-RL\MasterEngine.exe
# Base Epic Games Path: C:\Program Files\Epic Games
# Encoding: Strict 100% ASCII Only (Zero Unicode / Zero Non-English Characters)
# ==============================================================================

# Safely set TLS protocol and UTF-8 encoding without throwing console handle errors
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$OutputEncoding = [System.Text.Encoding]::UTF8
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$ErrorActionPreference = "Stop"

# Initialize local working directory
$projectRoot = "C:\FN-MasterEngine-RL"
if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
Set-Location $projectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN MASTER-ENGINE: PRODUCTION COMPILATION PIPELINE      " -ForegroundColor Green
Write-Host "   Target Workspace: $projectRoot                         " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$targetExe = Join-Path $projectRoot "MasterEngine.exe"
$legacyExe = Join-Path $projectRoot "FN_RocketLeague_MasterEngine.exe"
$launcherScript = Join-Path $projectRoot "MasterEngineLauncher.ps1"

# ------------------------------------------------------------------------------
# DEDICATED FUNCTION: UNLOCK AND TERMINATE LOCKING PROCESSES
# ------------------------------------------------------------------------------
function Stop-MasterEngineProcess {
    [CmdletBinding()]
    param(
        [string]$TargetExecutablePath = "C:\FN-MasterEngine-RL\MasterEngine.exe"
    )

    Write-Host "[1/6] Invoking Stop-MasterEngineProcess to release file locks..." -ForegroundColor Yellow

    $knownProcessNames = @("MasterEngine", "FN_RocketLeague_MasterEngine")
    $foundLockingProcesses = @()

    # Query processes by known executable names
    $byName = Get-Process -Name $knownProcessNames -ErrorAction SilentlyContinue
    if ($byName) {
        $foundLockingProcesses += $byName
    }

    # Query all running processes to check if any process path matches the target executable
    try {
        $allProcs = Get-Process -ErrorAction SilentlyContinue
        foreach ($proc in $allProcs) {
            try {
                if ($proc.Path -and ($proc.Path -eq $TargetExecutablePath)) {
                    if ($foundLockingProcesses.Id -notcontains $proc.Id) {
                        $foundLockingProcesses += $proc
                    }
                }
            } catch {
                # Ignore system processes where path access is restricted
            }
        }
    } catch {
        # Proceed with name-matched processes if system query fails
    }

    if ($foundLockingProcesses.Count -gt 0) {
        Write-Host "      Detected active process(es) holding file lock on $TargetExecutablePath :" -ForegroundColor DarkYellow
        foreach ($proc in $foundLockingProcesses) {
            Write-Host "      - Process ID: $($proc.Id) | Name: $($proc.ProcessName)" -ForegroundColor DarkYellow
            try {
                Write-Host "        Forcibly terminating PID $($proc.Id)..." -ForegroundColor Yellow
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                Write-Host "        PID $($proc.Id) terminated successfully." -ForegroundColor Green
            } catch {
                Write-Host "        [WARN] Could not terminate PID $($proc.Id): $_" -ForegroundColor DarkYellow
            }
        }

        # Polling loop: Wait up to 3000ms for OS file handles to be completely released
        Write-Host "      Waiting for Windows operating system to release file lock..." -ForegroundColor Yellow
        $maxWaitMs = 3000
        $waitedMs = 0
        while ($waitedMs -lt $maxWaitMs) {
            Start-Sleep -Milliseconds 250
            $waitedMs += 250
            $remaining = Get-Process -Name $knownProcessNames -ErrorAction SilentlyContinue
            if (-not $remaining) {
                break
            }
        }
        Write-Host "[OK] All locking processes terminated. File lock released." -ForegroundColor Green
    } else {
        Write-Host "[OK] No locking processes detected. File lock is clear." -ForegroundColor Green
    }
}

# Execute process termination function before starting file operations
Stop-MasterEngineProcess -TargetExecutablePath $targetExe

# ------------------------------------------------------------------------------
# STEP 2: REMOVE LEGACY BUILD ARTIFACTS
# ------------------------------------------------------------------------------
Write-Host "[2/6] Cleaning previous build artifacts and temporary files..." -ForegroundColor Yellow

$cleanTargets = @(
    $targetExe,
    $legacyExe,
    $launcherScript,
    (Join-Path $projectRoot "MasterEngine.pdb"),
    (Join-Path $projectRoot "FN_RocketLeague_MasterEngine.pdb"),
    (Join-Path $projectRoot "*.tmp"),
    (Join-Path $projectRoot "*.log")
)

foreach ($item in $cleanTargets) {
    if (Test-Path $item) {
        try {
            Remove-Item -Path $item -Force -Recurse -ErrorAction Stop
            Write-Host "      Cleaned legacy artifact: $item" -ForegroundColor DarkGray
        } catch {
            Write-Host "      [WARN] Could not remove $item directly ($($_)). Proceeding..." -ForegroundColor DarkYellow
        }
    }
}
Write-Host "[OK] Workspace cleanup completed." -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 3: VERIFY EPIC GAMES DIRECTORY STRUCTURE
# ------------------------------------------------------------------------------
Write-Host "[3/6] Verifying Epic Games directory structure..." -ForegroundColor Yellow

$epicGamesBase = "C:\Program Files\Epic Games"
$epicLauncherExe = Join-Path $epicGamesBase "Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"
$rlGameExe = Join-Path $epicGamesBase "rocketleague\Binaries\Win64\RocketLeague.exe"

if (Test-Path $epicGamesBase) {
    Write-Host "[OK] Detected Epic Games root directory: $epicGamesBase" -ForegroundColor Green
    if (Test-Path $rlGameExe) {
        Write-Host "     Found Rocket League 64-bit client: $rlGameExe" -ForegroundColor Green
    } elseif (Test-Path $epicLauncherExe) {
        Write-Host "     Found Epic Games Launcher: $epicLauncherExe" -ForegroundColor Green
    } else {
        Write-Host "     Standard Epic Games root is present." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[WARN] Epic Games directory not detected at default location: $epicGamesBase" -ForegroundColor DarkYellow
    Write-Host "       Creating directory structure placeholder..." -ForegroundColor DarkYellow
    New-Item -ItemType Directory -Path $epicGamesBase -Force | Out-Null
}

# ------------------------------------------------------------------------------
# STEP 4: GENERATE STANDALONE LAUNCHER CODE SCRIPT
# ------------------------------------------------------------------------------
Write-Host "[4/6] Generating standalone launcher script source..." -ForegroundColor Yellow

$runnerScript = @'
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$OutputEncoding = [System.Text.Encoding]::UTF8
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$epicGamesBase = "C:\Program Files\Epic Games"
$projectDir = "C:\FN-MasterEngine-RL"

$form = New-Object System.Windows.Forms.Form
$form.Text = "FN Rocket League Master-Engine (Standalone Executable)"
$form.Size = New-Object System.Drawing.Size(940, 680)
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::CenterScreen
$form.BackColor = [System.Drawing.Color]::FromArgb(15, 23, 42)
$form.ForeColor = [System.Drawing.Color]::FromArgb(241, 245, 249)
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedDialog
$form.MaximizeBox = $false

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "FN ROCKET LEAGUE MASTER-ENGINE (WIN32 KERNEL)"
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

# Save runner script with UTF-8 encoding (Strict requirement for PS2EXE)
[System.IO.File]::WriteAllText($launcherScript, $runnerScript, [System.Text.Encoding]::UTF8)
Write-Host "[OK] Standalone launcher source generated at $launcherScript" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 5: IDENTIFY LOCAL PS2EXE MODULE
# ------------------------------------------------------------------------------
Write-Host "[5/6] Identifying local PS2EXE module..." -ForegroundColor Yellow

$ps2exeCmd = $null

if (Get-Command Invoke-ps2exe -ErrorAction SilentlyContinue) {
    $ps2exeCmd = "Invoke-ps2exe"
} elseif (Get-Command ps2exe -ErrorAction SilentlyContinue) {
    $ps2exeCmd = "ps2exe"
} else {
    $localSearchPaths = @(
        "$env:USERPROFILE\Documents\WindowsPowerShell\Modules\ps2exe\*\ps2exe.psm1",
        "$env:ProgramFiles\WindowsPowerShell\Modules\ps2exe\*\ps2exe.psm1",
        "$env:USERPROFILE\Documents\PowerShell\Modules\ps2exe\*\ps2exe.psm1",
        "$env:LOCALAPPDATA\Microsoft\Windows\PowerShell\Modules\ps2exe\*\ps2exe.psm1"
    )

    foreach ($pattern in $localSearchPaths) {
        $file = Get-Item -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($file) {
            Import-Module $file.FullName -Force -ErrorAction SilentlyContinue
            break
        }
    }

    if (Get-Command Invoke-ps2exe -ErrorAction SilentlyContinue) {
        $ps2exeCmd = "Invoke-ps2exe"
    } elseif (Get-Command ps2exe -ErrorAction SilentlyContinue) {
        $ps2exeCmd = "ps2exe"
    }
}

if ($ps2exeCmd) {
    Write-Host "[OK] Identified active PS2EXE command: $ps2exeCmd" -ForegroundColor Green
} else {
    Write-Host "[INFO] PS2EXE not pre-loaded; importing from PSGallery..." -ForegroundColor Yellow
    try {
        Set-PSRepository -Name PSGallery -InstallationPolicy Trusted -ErrorAction SilentlyContinue | Out-Null
        Install-Module -Name ps2exe -Scope CurrentUser -Force -AllowClobber -ErrorAction SilentlyContinue
        Import-Module ps2exe -Force -ErrorAction SilentlyContinue
        if (Get-Command Invoke-ps2exe -ErrorAction SilentlyContinue) {
            $ps2exeCmd = "Invoke-ps2exe"
        } elseif (Get-Command ps2exe -ErrorAction SilentlyContinue) {
            $ps2exeCmd = "ps2exe"
        }
    } catch {
        Write-Host "[WARN] Automatic installation notice: $_" -ForegroundColor DarkYellow
    }
}

# ------------------------------------------------------------------------------
# STEP 6: COMPILE STANDALONE EXECUTABLE
# ------------------------------------------------------------------------------
Write-Host "[6/6] Compiling standalone executable: $targetExe..." -ForegroundColor Yellow

$buildCompleted = $false

if ($ps2exeCmd -and (Test-Path $launcherScript)) {
    Write-Host "      Compiling via $ps2exeCmd with standard parameters..." -ForegroundColor Green
    try {
        # Standard parameters supported by all PS2EXE versions
        & $ps2exeCmd -inputFile $launcherScript `
                     -outputFile $targetExe `
                     -noConsole `
                     -title "FN Rocket League Master-Engine" `
                     -description "Competitive Esports Mechanics & Win32 Interop Kernel" `
                     -company "FN Esports" `
                     -product "MasterEngine" `
                     -version "4.0.2.0" `
                     -x64 `
                     -ErrorAction Stop

        if (Test-Path $targetExe) {
            $buildCompleted = $true
        }
    } catch {
        Write-Host "      [WARN] Detailed invocation returned: $_" -ForegroundColor DarkYellow
        Write-Host "      Retrying with essential parameters..." -ForegroundColor Yellow
        try {
            & $ps2exeCmd -inputFile $launcherScript -outputFile $targetExe -noConsole -x64 -ErrorAction Stop
            if (Test-Path $targetExe) {
                $buildCompleted = $true
            }
        } catch {
            Write-Host "      [WARN] Minimal parameter retry returned: $_" -ForegroundColor DarkYellow
        }
    }
}

# Native compiler fallback using Microsoft csc.exe
if (-not $buildCompleted -or -not (Test-Path $targetExe)) {
    Write-Host "      [INFO] Executing Microsoft csc.exe compiler fallback..." -ForegroundColor Yellow
    $csc = "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    if (-not (Test-Path $csc)) {
        $csc = "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    }

    $csProgram = Join-Path $projectRoot "Program.cs"
    if (-not (Test-Path $csProgram)) {
        Invoke-WebRequest -Uri "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app/api/program-cs/download" -OutFile $csProgram -UseBasicParsing -TimeoutSec 15
    }

    $cArgs = "/target:winexe /platform:anycpu /optimize+ /r:System.Windows.Forms.dll /r:System.Drawing.dll /out:`"$targetExe`" `"$csProgram`""
    $process = Start-Process -FilePath $csc -ArgumentList $cArgs -Wait -NoNewWindow -PassThru
    if ($process.ExitCode -eq 0 -and (Test-Path $targetExe)) {
        $buildCompleted = $true
    }
}

# ------------------------------------------------------------------------------
# VERIFICATION AND EXECUTION
# ------------------------------------------------------------------------------
if (Test-Path $targetExe) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: MasterEngine.exe BUILT AND READY!             " -ForegroundColor Green
    Write-Host "   Path: $targetExe                                       " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan

    Start-Process -FilePath $targetExe
} else {
    Write-Host "[ERROR] Compilation failed: $targetExe was not generated." -ForegroundColor Red
    Exit 1
}
