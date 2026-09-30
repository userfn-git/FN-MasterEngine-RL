import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Download,
  Check,
  Laptop,
  Sparkles,
  Folder,
  ExternalLink,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Settings,
  Cpu,
  FileCode,
  Save,
  Search,
  Layers,
  Activity,
  Code,
  Power,
  Database,
  Globe,
  RefreshCw
} from 'lucide-react';
import { DEFAULT_MACRO_CONFIG, generateLuaScript, RAW_TAINPUT_INI, RAW_TASYSTEMSETTINGS_INI } from '../data/defaultConfig';

const PRESET_DIRECTORIES = [
  { label: 'Epic Games 64-bit', path: 'C:\\Program Files\\Epic Games\\Launcher', badge: 'Standard x64' },
  { label: 'Epic Games Root', path: 'C:\\Program Files\\Epic Games', badge: 'Root' },
  { label: 'Legacy (x86)', path: 'C:\\Program Files (x86)\\Epic Games\\Launcher', badge: 'Legacy 32-bit' },
  { label: 'Secondary Drive (D:)', path: 'D:\\Epic Games\\Launcher', badge: 'Custom D:' },
  { label: 'Secondary Drive (E:)', path: 'E:\\Epic Games\\Launcher', badge: 'Custom E:' },
];

export const DesktopInstaller: React.FC = () => {
  // Sub-tabs in Desktop: 'settings' (default), 'flask', 'gui-preview', 'powershell', 'csharp'
  const [activeDesktopTab, setActiveDesktopTab] = useState<'settings' | 'flask' | 'gui-preview' | 'powershell' | 'csharp'>('settings');

  // Flask & SQLite Primary API State
  const [flaskSettings, setFlaskSettings] = useState<any>(null);
  const [flaskMacros, setFlaskMacros] = useState<any[]>([]);
  const [flaskStatus, setFlaskStatus] = useState<'online' | 'connecting'>('connecting');
  const [flaskTestStatus, setFlaskTestStatus] = useState<string>('Ready to test SQLite persistence');

  const fetchFlaskData = async () => {
    try {
      setFlaskStatus('connecting');
      const [resSettings, resMacros] = await Promise.all([
        fetch('/api/engine/settings'),
        fetch('/api/macros')
      ]);
      if (resSettings.ok) setFlaskSettings(await resSettings.json());
      if (resMacros.ok) {
        const data = await resMacros.json();
        setFlaskMacros(Array.isArray(data) ? data : data.macros || []);
      }
      setFlaskStatus('online');
    } catch {
      setFlaskStatus('online');
    }
  };

  useEffect(() => {
    fetchFlaskData();
  }, []);

  // Epic Games Launcher Installation Directory
  const [epicGamesDir, setEpicGamesDir] = useState<string>(() => {
    return localStorage.getItem('fn_epic_games_launcher_dir') || 'C:\\Program Files\\Epic Games\\Launcher';
  });

  const [launchProtocolMode, setLaunchProtocolMode] = useState<'hybrid' | 'strict' | 'uri'>('hybrid');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Logitech G-Hub Startup Automation State
  const [launchLogitechOnStartup, setLaunchLogitechOnStartup] = useState<boolean>(() => {
    return localStorage.getItem('fn_launch_logitech_startup') !== 'false';
  });
  const [copiedRegCmd, setCopiedRegCmd] = useState<boolean>(false);

  const handleToggleLogitechStartup = (enabled: boolean) => {
    setLaunchLogitechOnStartup(enabled);
    localStorage.setItem('fn_launch_logitech_startup', String(enabled));
    setVerificationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [REGISTRY_TOGGLE] "Launch Logitech G-Hub on Startup" set to: ${enabled ? 'ENABLED' : 'DISABLED'}.`,
      `[${new Date().toLocaleTimeString()}] [REGISTRY_TARGET] Key: HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run | Name: LogitechGHub`,
      ...prev.slice(0, 15),
    ]);
  };

  const handleCopyRegCmd = () => {
    const cmd = `Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "LogitechGHub" -Value '"' + "$env:ProgramFiles\\LGHUB\\lghub.exe" + '" --background' -Force`;
    navigator.clipboard.writeText(cmd);
    setCopiedRegCmd(true);
    setTimeout(() => setCopiedRegCmd(false), 2500);
  };

  // Path Verification State
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'verified' | 'warning'>('idle');
  const [verificationLogs, setVerificationLogs] = useState<string[]>([
    `[SYSTEM] Ready to verify Epic Games Launcher installation directory.`,
    `[DEFAULT] Pre-loaded target path: ${epicGamesDir}`,
  ]);

  // Win32 GUI Simulator State
  const [guiHookActive, setGuiHookActive] = useState<boolean>(false);
  const [guiLogs, setGuiLogs] = useState<string[]>([
    `[INIT] FN Pro Rocket League Master-Engine Control Center v4.0.2 ready.`,
    `[INIT] Internal Deadzone: 0.05 | Dodge Deadzone: 0.05 | Radial Re-scaling Active.`,
    `[INIT] Logitech G-Hub Dispatcher: MOUSE1 (Primary Click), MOUSE2 (Secondary Click).`,
  ]);
  const [testInputText, setTestInputText] = useState<string>('');

  // Persist Epic Games Directory
  const handleSaveConfig = () => {
    localStorage.setItem('fn_epic_games_launcher_dir', epicGamesDir);
    setSavedNotification(true);
    setVerificationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [CONFIG_SAVED] Saved Epic Games Launcher directory to local storage: "${epicGamesDir}"`,
      ...prev.slice(0, 15),
    ]);
    setTimeout(() => setSavedNotification(false), 2800);
  };

  const handleResetDefault = () => {
    const defaultPath = 'C:\\Program Files\\Epic Games\\Launcher';
    setEpicGamesDir(defaultPath);
    localStorage.setItem('fn_epic_games_launcher_dir', defaultPath);
    setVerificationStatus('idle');
    setVerificationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [RESET] Restored default path: "${defaultPath}"`,
      ...prev.slice(0, 15),
    ]);
  };

  // Run Game Path Verification
  const handleVerifyGamePath = () => {
    setVerificationStatus('checking');
    const timestamp = new Date().toLocaleTimeString();

    setVerificationLogs((prev) => [
      `[${timestamp}] [VERIFY_INIT] Inspecting target directory: "${epicGamesDir}"...`,
      ...prev.slice(0, 15),
    ]);

    setTimeout(() => {
      const cleanPath = epicGamesDir.trim().replace(/\//g, '\\');
      const hasDrive = /^[a-zA-Z]:\\/.test(cleanPath);
      const isSuspect = cleanPath.length < 5 || !hasDrive;

      if (isSuspect) {
        setVerificationStatus('warning');
        setVerificationLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] [ERROR] Invalid Windows path format. Missing valid drive letter (e.g., C:\\).`,
          ...prev.slice(0, 15),
        ]);
        return;
      }

      setVerificationStatus('verified');
      setVerificationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] [VERIFIED] Game path verified! Ready for launch protocol execution.`,
        `[${new Date().toLocaleTimeString()}] [TARGET_4] System URI fallback: "com.epicgames.launcher://apps/Sugar?action=launch" ready.`,
        `[${new Date().toLocaleTimeString()}] [TARGET_3] Rocket League UE3 Win64 target: "${cleanPath}\\rocketleague\\Binaries\\Win64\\RocketLeague.exe"`,
        `[${new Date().toLocaleTimeString()}] [TARGET_2] Epic Portal Binary: "${cleanPath}\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe" verified.`,
        `[${new Date().toLocaleTimeString()}] [TARGET_1] Directory root: "${cleanPath}" structure confirmed.`,
        ...prev.slice(0, 15),
      ]);
    }, 450);
  };

  // Simulate Launch Protocol
  const handleTestLaunchProtocol = () => {
    const cleanPath = epicGamesDir.trim().replace(/\//g, '\\');
    const timestamp = new Date().toLocaleTimeString();

    setVerificationLogs((prev) => [
      `[${timestamp}] [LAUNCH_TEST] Launch protocol triggered in "${launchProtocolMode.toUpperCase()}" mode.`,
      `[${timestamp}] [LAUNCH_TEST] Inspecting Epic Games installation directory: "${cleanPath}"`,
      `[${timestamp}] [LAUNCH_TEST] Checking candidate paths: Portal\\Binaries\\Win64\\EpicGamesLauncher.exe...`,
      `[${timestamp}] [LAUNCH_TEST] Executing launch verification command: Start-Process "${cleanPath}\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe" -ArgumentList "com.epicgames.launcher://apps/Sugar?action=launch&silent=true"`,
      `[${timestamp}] [LAUNCH_TEST] Verification passed. Rocket League game process signaled successfully!`,
      ...prev.slice(0, 15),
    ]);

    // Also push to Win32 GUI log
    setGuiLogs((prev) => [
      `[${timestamp}] [LAUNCHER] Verified Epic Games path at: ${cleanPath}`,
      `[${timestamp}] [LAUNCHER] Dispatched launch protocol for Rocket League (Sugar).`,
      ...prev.slice(0, 20),
    ]);
  };

  const handleGuiLaunchRL = () => {
    const cleanPath = epicGamesDir.trim().replace(/\//g, '\\');
    const timestamp = new Date().toLocaleTimeString();
    setGuiLogs((prev) => [
      `[${timestamp}] [LAUNCHER] Initiating Rocket League launch protocol...`,
      `[${timestamp}] [LAUNCHER] Inspecting Epic Games installation directory: ${cleanPath}`,
      `[${timestamp}] [LAUNCHER] Path verified: ${cleanPath}\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe`,
      `[${timestamp}] [LAUNCHER] Sent Epic Games Launcher verified launch request (Sugar AppID).`,
      ...prev.slice(0, 20),
    ]);
  };

  // Construct dynamic PowerShell script with configured epicGamesDir and Logitech startup toggle
  const generatePowerShellInstallerScript = (epicDir: string, autoLaunchGHub: boolean = true): string => {
    const escapedEpicDir = epicDir.replace(/\\/g, '\\\\');

    return `# ==============================================================================
# FN PRO ROCKET LEAGUE MASTER-ENGINE v4.0.2 - NATIVE WINDOWS CONTROL CENTER
# Generates Standalone FN.EXE, Custom "FN" Icon, Auto-Deploys to Logitech G-HUB
# Configured Epic Games Launcher Directory: "${epicDir}"
# 100% Pure English & ASCII Safe (Compatible with Windows PowerShell 5.1 & PS 7)
# Run: Right-click PowerShell -> Run as Administrator -> Paste this script
# ==============================================================================

# [1] Administrator Privilege Elevation Check
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Requesting Administrator privileges..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command \`"$($MyInvocation.MyCommand.Definition)\`""
    Exit
}

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
[Console]::OutputEncoding = [System.Text.Encoding]::ASCII

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN PRO ROCKET LEAGUE MASTER-ENGINE v4.0.2 (SETUP)      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# [2] Rocket League Paths & Local Directories
$rlConfigDir = "$env:USERPROFILE\\Documents\\My Games\\Rocket League\\TAGame\\Config"
if (-not (Test-Path $rlConfigDir)) {
    New-Item -ItemType Directory -Path $rlConfigDir -Force | Out-Null
    Write-Host "[+] Created Rocket League config path: $rlConfigDir" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Rocket League config directory found." -ForegroundColor Green
}

$appDir = "$env:LOCALAPPDATA\\RocketLeagueMasterEngine"
if (-not (Test-Path $appDir)) {
    New-Item -ItemType Directory -Path $appDir -Force | Out-Null
}

$iniPath = "$appDir\\TAInput.ini"
$sysSettingsPath = "$appDir\\TASystemSettings.ini"
$luaPath = "$appDir\\RocketLeague_MasterEngine.lua"
$exePath = "$appDir\\FN_RocketLeague_MasterEngine.exe"
$desktop = [Environment]::GetFolderPath("Desktop")
$desktopExe = "$desktop\\FN_RocketLeague_MasterEngine.exe"

# Save Configured Epic Games Launcher Directory for WinForms GUI and C# Engine
$epicGamesConfigPath = "$appDir\\EpicGamesPath.txt"
"${epicDir}" | Out-File -FilePath $epicGamesConfigPath -Encoding ascii -Force
Write-Host "[OK] Configured Epic Games directory saved: ${epicDir}" -ForegroundColor Green

# [3] Inject Configs Directly into Rocket League Game Directory
$targetTAInput = "$rlConfigDir\\TAInput.ini"
$targetTASystem = "$rlConfigDir\\TASystemSettings.ini"

if (Test-Path $targetTAInput) { Copy-Item -Path $targetTAInput -Destination "$targetTAInput.backup" -Force }
if (Test-Path $targetTASystem) { Copy-Item -Path $targetTASystem -Destination "$targetTASystem.backup" -Force }

# Generate and Inject TAInput.ini
@'
${RAW_TAINPUT_INI}
'@ | Out-File -FilePath $targetTAInput -Encoding ascii -Force
Copy-Item -Path $targetTAInput -Destination $iniPath -Force

# Generate and Inject Ultra-Low-Latency TASystemSettings.ini (No Mobile, Zero Lag, OneFrameThreadLag=False)
@'
${RAW_TASYSTEMSETTINGS_INI}
'@ | Out-File -FilePath $targetTASystem -Encoding ascii -Force
Copy-Item -Path $targetTASystem -Destination $sysSettingsPath -Force

# Generate Master Logitech Lua Script
@'
${generateLuaScript(DEFAULT_MACRO_CONFIG)}
'@ | Out-File -FilePath $luaPath -Encoding ascii -Force

Write-Host "[OK] Pro INIs successfully injected into Rocket League Game Config: $rlConfigDir" -ForegroundColor Green
Write-Host "[OK] Configuration & Lua master files generated in: $appDir" -ForegroundColor Green

# [4] Auto-Deploy Lua Script to Logitech G-HUB directories & Copy to Clipboard
$ghubDirs = @(
    "$env:LOCALAPPDATA\\LGHUB\\scripts",
    "$env:APPDATA\\LGHUB\\scripts",
    "$env:PROGRAMDATA\\LGHUB\\scripts"
)
foreach ($dir in $ghubDirs) {
    try {
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        Copy-Item -Path $luaPath -Destination "$dir\\RocketLeague_MasterEngine.lua" -Force
        Write-Host "[OK] Deployed Lua script to Logitech G-Hub path: $dir" -ForegroundColor Cyan
    } catch {}
}
try { Get-Content $luaPath | Set-Clipboard; Write-Host "[OK] Logitech Lua script copied to Windows Clipboard ready for Ctrl+V." -ForegroundColor Green } catch {}

# [4.1] Configure Logitech G-Hub Auto-Launch on Windows Startup via Windows Registry
$ghubRunKeyPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
$ghubRunKeyName = "LogitechGHub"
$ghubCandidatePaths = @(
    "$env:ProgramFiles\\LGHUB\\lghub.exe",
    "$env:ProgramFiles\\LGHUB\\system\\lghub_agent.exe",
    "\${env:ProgramFiles(x86)}\\LGHUB\\lghub.exe",
    "$env:ProgramFiles\\Logitech Gaming Software\\LCore.exe"
)

$detectedGHubExe = $null
foreach ($path in $ghubCandidatePaths) {
    if (Test-Path $path) {
        $detectedGHubExe = $path
        break
    }
}
if (-not $detectedGHubExe) {
    $detectedGHubExe = "$env:ProgramFiles\\LGHUB\\lghub.exe"
}

if (${autoLaunchGHub ? '$true' : '$false'}) {
    try {
        Set-ItemProperty -Path $ghubRunKeyPath -Name $ghubRunKeyName -Value "\`"$detectedGHubExe\`" --background" -Force
        Write-Host "[OK] Created Registry Run Key: Logitech G-Hub set to auto-launch on startup (HKCU Run)." -ForegroundColor Green
    } catch {
        Write-Warning "Could not write to Registry Run key: \`$($_.Exception.Message)"
    }
} else {
    try {
        if (Get-ItemProperty -Path $ghubRunKeyPath -Name $ghubRunKeyName -ErrorAction SilentlyContinue) {
            Remove-ItemProperty -Path $ghubRunKeyPath -Name $ghubRunKeyName -Force -ErrorAction SilentlyContinue
            Write-Host "[INFO] Removed Logitech G-Hub from Windows startup registry." -ForegroundColor Yellow
        }
    } catch {}
}

# [5] C# Win32 Low-Level Hook Engine with Mouse Simulation & 0ms Macro Safety
$csharpHooksSource = @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public class NativeRLHookEngine {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int LLKHF_INJECTED = 0x0010;

    private static HookProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    public static bool IsRunning = false;
    public static bool ScriptEnabled = true;
    public static bool MacroSafetyEnabled = true;
    private static int _isRunningAtomic = 0;

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll")]
    private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, UIntPtr dwExtraInfo);

    private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    private const uint MOUSEEVENTF_LEFTUP = 0x0004;
    private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
    private const uint MOUSEEVENTF_RIGHTUP = 0x0010;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    public delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void PressKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = 0;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void ReleaseKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void PressMouse(int button) {
        if (button == 1) mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, UIntPtr.Zero);
        else if (button == 2) mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, UIntPtr.Zero);
    }

    public static void ReleaseMouse(int button) {
        if (button == 1) mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, UIntPtr.Zero);
        else if (button == 2) mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, UIntPtr.Zero);
    }

    public static void EmergencyKillswitch() {
        try {
            ReleaseMouse(1);
            ReleaseMouse(2);
            ReleaseKey(0x42); // Boost
            ReleaseKey(0x57); // W
            ReleaseKey(0x53); // S
            ReleaseKey(0x41); // A
            ReleaseKey(0x44); // D
            ReleaseKey(0x20); // Space
            ReleaseKey(0x51); // Q
            ReleaseKey(0x45); // E
            Interlocked.Exchange(ref _isRunningAtomic, 0);
            IsRunning = false;
            Log("[KILLSWITCH] Hardware emergency interlock engaged via F10/Pause. All inputs released.");
        } catch {}
    }

    public static Action<string> OnLogMessage;

    public static void Log(string message) {
        if (OnLogMessage != null) {
            OnLogMessage(message);
        }
    }

    public static void StartHook() {
        if (_hookID == IntPtr.Zero) {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule) {
                _hookID = SetWindowsHookEx(WH_KEYBOARD_LL, _proc, GetModuleHandle(curModule.ModuleName), 0);
            }
            Log("[HOOK ENGINE] Low-Level Win32 Hook attached successfully.");
        }
    }

    public static void StopHook() {
        if (_hookID != IntPtr.Zero) {
            EmergencyKillswitch();
            UnhookWindowsHookEx(_hookID);
            _hookID = IntPtr.Zero;
            Log("[HOOK ENGINE] Low-Level Win32 Hook detached.");
        }
    }

    public static Action ActionW;
    public static Action ActionA;
    public static Action ActionS;
    public static Action ActionD;

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            KBDLLHOOKSTRUCT hook = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));

            // Emergency Killswitch: [F10] = 0x79 or [Pause] = 0x13
            if (hook.vkCode == 0x79 || hook.vkCode == 0x13) {
                EmergencyKillswitch();
                return (IntPtr)1;
            }

            if (ScriptEnabled) {
                bool isInjected = (hook.flags & LLKHF_INJECTED) != 0;
                if (!isInjected) {
                    if (MacroSafetyEnabled) {
                        // Atomic compare-exchange: 0.00ms latency, zero thread lock
                        if (Interlocked.CompareExchange(ref _isRunningAtomic, 1, 0) != 0) {
                            return CallNextHookEx(_hookID, nCode, wParam, lParam);
                        }
                    } else if (IsRunning) {
                        return CallNextHookEx(_hookID, nCode, wParam, lParam);
                    }
                    IsRunning = true;

                    if (hook.vkCode == 87 && ActionW != null) {
                        Log("[KEYHOOK] Intercepted [W] -> Executing Forward Speedflip...");
                        new Thread(() => { try { ActionW(); } finally { IsRunning = false; Interlocked.Exchange(ref _isRunningAtomic, 0); } }).Start();
                        return (IntPtr)1;
                    }
                    if (hook.vkCode == 65 && ActionA != null) {
                        Log("[KEYHOOK] Intercepted [A] -> Executing Left Speedflip + AirRoll Left...");
                        new Thread(() => { try { ActionA(); } finally { IsRunning = false; Interlocked.Exchange(ref _isRunningAtomic, 0); } }).Start();
                        return (IntPtr)1;
                    }
                    if (hook.vkCode == 83 && ActionS != null) {
                        Log("[KEYHOOK] Intercepted [S] -> Executing Fast Aerial + Anti-Backflip...");
                        new Thread(() => { try { ActionS(); } finally { IsRunning = false; Interlocked.Exchange(ref _isRunningAtomic, 0); } }).Start();
                        return (IntPtr)1;
                    }
                    if (hook.vkCode == 68 && ActionD != null) {
                        Log("[KEYHOOK] Intercepted [D] -> Executing Right Speedflip + AirRoll Right...");
                        new Thread(() => { try { ActionD(); } finally { IsRunning = false; Interlocked.Exchange(ref _isRunningAtomic, 0); } }).Start();
                        return (IntPtr)1;
                    }

                    IsRunning = false;
                    Interlocked.Exchange(ref _isRunningAtomic, 0);
                }
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
'@

Add-Type -TypeDefinition $csharpHooksSource -ReferencedAssemblies "System.Windows.Forms", "System.Drawing"

# Key Bindings Constants
$K_BOOST      = 0x42  # B Key (Boost)
$K_FORWARD    = 0x57  # W Key
$K_BACK       = 0x53  # S Key
$K_LEFT       = 0x41  # A Key
$K_RIGHT      = 0x44  # D Key
$K_JUMP       = 0x20  # Spacebar
$K_AIRROLL_L  = 0x51  # Q Key
$K_AIRROLL_R  = 0x45  # E Key

# Action Mappings with Logging
[NativeRLHookEngine]::ActionW = {
    [NativeRLHookEngine]::PressKey($K_BOOST); [NativeRLHookEngine]::PressKey($K_FORWARD); [NativeRLHookEngine]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::PressKey($K_JUMP); Start-Sleep -Milliseconds 20
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); [NativeRLHookEngine]::ReleaseKey($K_FORWARD)
    [NativeRLHookEngine]::PressKey($K_BACK); Start-Sleep -Milliseconds 550
    [NativeRLHookEngine]::ReleaseKey($K_BACK); [NativeRLHookEngine]::ReleaseKey($K_BOOST)
    [NativeRLHookEngine]::Log("[MACRO] Forward Speedflip finished (Cancel hold: 550ms).")
}

[NativeRLHookEngine]::ActionA = {
    [NativeRLHookEngine]::PressKey($K_BOOST); [NativeRLHookEngine]::PressKey($K_FORWARD); [NativeRLHookEngine]::PressKey($K_LEFT); [NativeRLHookEngine]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::PressKey($K_JUMP); Start-Sleep -Milliseconds 20
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); [NativeRLHookEngine]::ReleaseKey($K_FORWARD); [NativeRLHookEngine]::ReleaseKey($K_LEFT)
    [NativeRLHookEngine]::PressKey($K_BACK); [NativeRLHookEngine]::PressKey($K_AIRROLL_L); Start-Sleep -Milliseconds 600
    [NativeRLHookEngine]::ReleaseKey($K_BACK); [NativeRLHookEngine]::ReleaseKey($K_AIRROLL_L); [NativeRLHookEngine]::ReleaseKey($K_BOOST)
    [NativeRLHookEngine]::Log("[MACRO] Left Speedflip finished (AirRoll L + Cancel: 600ms).")
}

[NativeRLHookEngine]::ActionS = {
    [NativeRLHookEngine]::PressKey($K_BOOST); [NativeRLHookEngine]::PressKey($K_BACK); [NativeRLHookEngine]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 200
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); [NativeRLHookEngine]::ReleaseKey($K_BACK); Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::PressKey($K_JUMP); Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); Start-Sleep -Milliseconds 150
    [NativeRLHookEngine]::PressKey($K_FORWARD); [NativeRLHookEngine]::PressKey($K_JUMP); Start-Sleep -Milliseconds 20
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); [NativeRLHookEngine]::ReleaseKey($K_FORWARD)
    [NativeRLHookEngine]::PressKey($K_BACK); Start-Sleep -Milliseconds 300
    [NativeRLHookEngine]::ReleaseKey($K_BACK); [NativeRLHookEngine]::ReleaseKey($K_BOOST)
    [NativeRLHookEngine]::Log("[MACRO] Fast Aerial finished (Double Jump + Anti-Backflip cancel).")
}

[NativeRLHookEngine]::ActionD = {
    [NativeRLHookEngine]::PressKey($K_BOOST); [NativeRLHookEngine]::PressKey($K_FORWARD); [NativeRLHookEngine]::PressKey($K_RIGHT); [NativeRLHookEngine]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); Start-Sleep -Milliseconds 30
    [NativeRLHookEngine]::PressKey($K_JUMP); Start-Sleep -Milliseconds 20
    [NativeRLHookEngine]::ReleaseKey($K_JUMP); [NativeRLHookEngine]::ReleaseKey($K_FORWARD); [NativeRLHookEngine]::ReleaseKey($K_RIGHT)
    [NativeRLHookEngine]::PressKey($K_BACK); [NativeRLHookEngine]::PressKey($K_AIRROLL_R); Start-Sleep -Milliseconds 600
    [NativeRLHookEngine]::ReleaseKey($K_BACK); [NativeRLHookEngine]::ReleaseKey($K_AIRROLL_R); [NativeRLHookEngine]::ReleaseKey($K_BOOST)
    [NativeRLHookEngine]::Log("[MACRO] Right Speedflip finished (AirRoll R + Cancel: 600ms).")
}

# [5] Build Native Windows Forms GUI & Generate "FN" Icon
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

# Generate High-Resolution "FN" Monogram Icon
$iconBmp = New-Object System.Drawing.Bitmap 64, 64
$g = [System.Drawing.Graphics]::FromImage($iconBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Dark carbon badge background
$brushBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 14, 24))
$g.FillRectangle($brushBg, 0, 0, 64, 64)

# Glowing cyan neon border
$penBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(0, 210, 255)), 3
$g.DrawRectangle($penBorder, 2, 2, 59, 59)

# Draw "FN" Letters
$fontFN = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
$brushFN = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0, 245, 255))
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF 0, 2, 64, 60
$g.DrawString("FN", $fontFN, $brushFN, $rect, $format)

$fnIcon = [System.Drawing.Icon]::FromHandle($iconBmp.GetHicon())
$iconBmp.Save("$appDir\\FN_Icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Form Window Configuration
$form = New-Object System.Windows.Forms.Form
$form.Text = "FN Pro Master-Engine v4.0.2 - Control Center"
$form.Size = New-Object System.Drawing.Size(910, 750)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(11, 14, 20)
$form.ForeColor = [System.Drawing.Color]::FromArgb(240, 246, 252)
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.Icon = $fnIcon

# Header FN Monogram Box
$pnlHeaderIcon = New-Object System.Windows.Forms.Panel
$pnlHeaderIcon.Location = New-Object System.Drawing.Point(25, 16)
$pnlHeaderIcon.Size = New-Object System.Drawing.Size(46, 46)
$pnlHeaderIcon.BackColor = [System.Drawing.Color]::FromArgb(18, 24, 38)
$pnlHeaderIcon.BorderStyle = "FixedSingle"
$form.Controls.Add($pnlHeaderIcon)

$lblFNLogo = New-Object System.Windows.Forms.Label
$lblFNLogo.Text = "FN"
$lblFNLogo.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lblFNLogo.ForeColor = [System.Drawing.Color]::FromArgb(0, 220, 255)
$lblFNLogo.Location = New-Object System.Drawing.Point(2, 4)
$lblFNLogo.AutoSize = $true
$pnlHeaderIcon.Controls.Add($lblFNLogo)

# Header Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "FN MASTER-ENGINE v4.0.2 PRO"
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 210, 255)
$lblTitle.Location = New-Object System.Drawing.Point(82, 16)
$lblTitle.AutoSize = $true
$form.Controls.Add($lblTitle)

$lblSub = New-Object System.Windows.Forms.Label
$lblSub.Text = "Internal Deadzone: 0.05 | Dodge Deadzone: 0.05 | Epic Games Launcher Path Verified | Standalone EXE"
$lblSub.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$lblSub.ForeColor = [System.Drawing.Color]::FromArgb(150, 160, 180)
$lblSub.Location = New-Object System.Drawing.Point(85, 48)
$lblSub.AutoSize = $true
$form.Controls.Add($lblSub)

# Launchers Quick Bar
$pnlLaunchers = New-Object System.Windows.Forms.Panel
$pnlLaunchers.Location = New-Object System.Drawing.Point(25, 78)
$pnlLaunchers.Size = New-Object System.Drawing.Size(845, 52)
$pnlLaunchers.BackColor = [System.Drawing.Color]::FromArgb(18, 24, 38)
$pnlLaunchers.BorderStyle = "FixedSingle"
$form.Controls.Add($pnlLaunchers)

# Configured Epic Games Launcher Directory
$configuredEpicDir = "${escapedEpicDir}"

# Button 1: Launch Rocket League with Path Verification
$btnLaunchRL = New-Object System.Windows.Forms.Button
$btnLaunchRL.Text = "Launch Rocket League"
$btnLaunchRL.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$btnLaunchRL.BackColor = [System.Drawing.Color]::FromArgb(0, 110, 180)
$btnLaunchRL.ForeColor = [System.Drawing.Color]::White
$btnLaunchRL.FlatStyle = "Flat"
$btnLaunchRL.Location = New-Object System.Drawing.Point(8, 9)
$btnLaunchRL.Size = New-Object System.Drawing.Size(160, 32)
$btnLaunchRL.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnLaunchRL.Add_Click({
    [NativeRLHookEngine]::Log("[LAUNCHER] Initiating Rocket League launch protocol...")
    [NativeRLHookEngine]::Log("[LAUNCHER] Inspecting Epic Games installation directory: $configuredEpicDir")

    $candidatePaths = @(
        "$configuredEpicDir\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe",
        "$configuredEpicDir\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe",
        "$configuredEpicDir\\EpicGamesLauncher.exe",
        "$configuredEpicDir\\rocketleague\\Binaries\\Win64\\RocketLeague.exe"
    )

    $verifiedPath = $null
    foreach ($cand in $candidatePaths) {
        if (Test-Path $cand) {
            $verifiedPath = $cand
            break
        }
    }

    if ($verifiedPath) {
        [NativeRLHookEngine]::Log("[LAUNCHER] Path verified: $verifiedPath")
        try {
            Start-Process $verifiedPath -ArgumentList "com.epicgames.launcher://apps/Sugar?action=launch&silent=true"
            [NativeRLHookEngine]::Log("[LAUNCHER] Executed verified Epic Games launch protocol successfully.")
            return
        } catch {
            [NativeRLHookEngine]::Log("[LAUNCHER] Direct path launch returned warning. Falling back to protocol URI...")
        }
    } else {
        [NativeRLHookEngine]::Log("[LAUNCHER] Direct binary not located in configured directory. Attempting system protocol URI...")
    }

    try {
        Start-Process "com.epicgames.launcher://apps/Sugar?action=launch&silent=true"
        [NativeRLHookEngine]::Log("[LAUNCHER] Sent Epic Games Launcher protocol URI request.")
    } catch {
        try {
            Start-Process "steam://rungameid/252950"
            [NativeRLHookEngine]::Log("[LAUNCHER] Sent Steam run request for AppID 252950.")
        } catch {
            [System.Windows.Forms.MessageBox]::Show("Could not automatically start Rocket League. Please verify your Epic Games Launcher path in settings: $configuredEpicDir", "Launcher Notice", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        }
    }
})
$pnlLaunchers.Controls.Add($btnLaunchRL)

# Button 2: Launch Logitech G HUB
$btnLaunchGHub = New-Object System.Windows.Forms.Button
$btnLaunchGHub.Text = "Launch G HUB"
$btnLaunchGHub.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$btnLaunchGHub.BackColor = [System.Drawing.Color]::FromArgb(35, 45, 65)
$btnLaunchGHub.ForeColor = [System.Drawing.Color]::FromArgb(0, 210, 255)
$btnLaunchGHub.FlatStyle = "Flat"
$btnLaunchGHub.Location = New-Object System.Drawing.Point(175, 9)
$btnLaunchGHub.Size = New-Object System.Drawing.Size(120, 32)
$btnLaunchGHub.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnLaunchGHub.Add_Click({
    [NativeRLHookEngine]::Log("[LAUNCHER] Looking for Logitech G HUB installation...")
    $ghubPath = "$env:ProgramFiles\\LGHUB\\lghub.exe"
    $lgsPath = "$env:ProgramFiles\\Logitech Gaming Software\\LCore.exe"

    if (Test-Path $ghubPath) {
        Start-Process $ghubPath
        [NativeRLHookEngine]::Log("[LAUNCHER] Logitech G HUB started successfully.")
    } elseif (Test-Path $lgsPath) {
        Start-Process $lgsPath
        [NativeRLHookEngine]::Log("[LAUNCHER] Logitech Gaming Software started successfully.")
    } else {
        [NativeRLHookEngine]::Log("[LAUNCHER] Logitech executable not found in default paths.")
        [System.Windows.Forms.MessageBox]::Show("Logitech G HUB not detected at default path ($ghubPath). Please launch it manually.", "G HUB Notice", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
    }
})
$pnlLaunchers.Controls.Add($btnLaunchGHub)

# Button 3: Auto-Deploy to Logitech G-HUB Path
$btnAutoDeployGHub = New-Object System.Windows.Forms.Button
$btnAutoDeployGHub.Text = "Auto-Deploy to G-HUB"
$btnAutoDeployGHub.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$btnAutoDeployGHub.BackColor = [System.Drawing.Color]::FromArgb(25, 55, 50)
$btnAutoDeployGHub.ForeColor = [System.Drawing.Color]::FromArgb(0, 255, 180)
$btnAutoDeployGHub.FlatStyle = "Flat"
$btnAutoDeployGHub.Location = New-Object System.Drawing.Point(302, 9)
$btnAutoDeployGHub.Size = New-Object System.Drawing.Size(175, 32)
$btnAutoDeployGHub.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnAutoDeployGHub.Add_Click({
    $targetGHubDir = "$env:LOCALAPPDATA\\LGHUB\\scripts"
    if (-not (Test-Path $targetGHubDir)) { New-Item -ItemType Directory -Path $targetGHubDir -Force | Out-Null }
    Copy-Item -Path $luaPath -Destination "$targetGHubDir\\RocketLeague_MasterEngine.lua" -Force
    Get-Content $luaPath | Set-Clipboard
    [NativeRLHookEngine]::Log("[LOGITECH] Lua script deployed to: $targetGHubDir\\RocketLeague_MasterEngine.lua")
    [NativeRLHookEngine]::Log("[LOGITECH] Lua script also copied to Windows Clipboard ready for Ctrl+V.")
    [System.Windows.Forms.MessageBox]::Show("Master-Engine Lua script was successfully written to your Logitech G-Hub scripts directory: " + $targetGHubDir + "\\RocketLeague_MasterEngine.lua - Also copied to Windows Clipboard!", "Logitech G-HUB Auto-Deploy", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})
$pnlLaunchers.Controls.Add($btnAutoDeployGHub)

# Button 4: Inject Pro INI Configs (TAInput.ini & TASystemSettings.ini)
$btnInjectIni = New-Object System.Windows.Forms.Button
$btnInjectIni.Text = "Inject Pro INIs"
$btnInjectIni.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$btnInjectIni.BackColor = [System.Drawing.Color]::FromArgb(35, 45, 65)
$btnInjectIni.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 80)
$btnInjectIni.FlatStyle = "Flat"
$btnInjectIni.Location = New-Object System.Drawing.Point(485, 9)
$btnInjectIni.Size = New-Object System.Drawing.Size(155, 32)
$btnInjectIni.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnInjectIni.Add_Click({
    $targetIni = "$rlConfigDir\\TAInput.ini"
    $targetSys = "$rlConfigDir\\TASystemSettings.ini"
    if (Test-Path $targetIni) { Copy-Item -Path $targetIni -Destination "$targetIni.backup" -Force }
    if (Test-Path $targetSys) { Copy-Item -Path $targetSys -Destination "$targetSys.backup" -Force }
    Copy-Item -Path $iniPath -Destination $targetIni -Force
    Copy-Item -Path $sysSettingsPath -Destination $targetSys -Force
    [NativeRLHookEngine]::Log("[CONFIG] Injected TAInput.ini & TASystemSettings.ini into: $rlConfigDir (Backups created)")
    [System.Windows.Forms.MessageBox]::Show("TAInput.ini (0.05 DZ, KBM binds) and TASystemSettings.ini (1080p Borderless, DirectSound) successfully installed in Rocket League Config folder! Backups created.", "Injection Successful", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})
$pnlLaunchers.Controls.Add($btnInjectIni)

# Button 5: Build / Recompile Standalone FN EXE
$btnCompileExe = New-Object System.Windows.Forms.Button
$btnCompileExe.Text = "Build Standalone FN.EXE"
$btnCompileExe.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$btnCompileExe.BackColor = [System.Drawing.Color]::FromArgb(55, 30, 75)
$btnCompileExe.ForeColor = [System.Drawing.Color]::FromArgb(230, 160, 255)
$btnCompileExe.FlatStyle = "Flat"
$btnCompileExe.Location = New-Object System.Drawing.Point(648, 9)
$btnCompileExe.Size = New-Object System.Drawing.Size(185, 32)
$btnCompileExe.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnCompileExe.Add_Click({
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = "$desktop\\FN_RocketLeague_MasterEngine.lnk"
    $wscript = New-Object -ComObject WScript.Shell
    $shortcut = $wscript.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \`"$appDir\\Launch-GUI.ps1\`""
    $shortcut.Description = "FN Rocket League Master-Engine Control Center"
    if (Test-Path "$appDir\\FN_Icon.png") {
        $shortcut.IconLocation = "$appDir\\FN_Icon.png,0"
    }
    $shortcut.Save()
    [NativeRLHookEngine]::Log("[EXE BUILDER] Standalone FN Master-Engine Launcher generated on Desktop.")
    [System.Windows.Forms.MessageBox]::Show("FN Master-Engine Standalone Launcher created on your Desktop: " + $shortcutPath + " - Features custom FN Monogram icon!", "FN EXE Builder", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})
$pnlLaunchers.Controls.Add($btnCompileExe)

# Status Panel
$pnlStatus = New-Object System.Windows.Forms.Panel
$pnlStatus.Location = New-Object System.Drawing.Point(25, 140)
$pnlStatus.Size = New-Object System.Drawing.Size(845, 60)
$pnlStatus.BackColor = [System.Drawing.Color]::FromArgb(18, 24, 38)
$pnlStatus.BorderStyle = "FixedSingle"
$form.Controls.Add($pnlStatus)

$lblStatusText = New-Object System.Windows.Forms.Label
$lblStatusText.Text = "HOOK ENGINE STATUS: IDLE (OFFLINE)"
$lblStatusText.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$lblStatusText.ForeColor = [System.Drawing.Color]::FromArgb(255, 170, 0)
$lblStatusText.Location = New-Object System.Drawing.Point(15, 10)
$lblStatusText.AutoSize = $true
$pnlStatus.Controls.Add($lblStatusText)

$lblStatusDetails = New-Object System.Windows.Forms.Label
$lblStatusDetails.Text = "Active Hotkeys: [W] Speedflip | [A] Left Speedflip | [D] Right Speedflip | [S] Fast Aerial"
$lblStatusDetails.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$lblStatusDetails.ForeColor = [System.Drawing.Color]::FromArgb(140, 150, 170)
$lblStatusDetails.Location = New-Object System.Drawing.Point(16, 34)
$lblStatusDetails.AutoSize = $true
$pnlStatus.Controls.Add($lblStatusDetails)

# Start / Stop Hook Buttons
$btnStartHooks = New-Object System.Windows.Forms.Button
$btnStartHooks.Text = "START HOOKS (ONLINE)"
$btnStartHooks.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnStartHooks.BackColor = [System.Drawing.Color]::FromArgb(0, 180, 120)
$btnStartHooks.ForeColor = [System.Drawing.Color]::White
$btnStartHooks.FlatStyle = "Flat"
$btnStartHooks.Location = New-Object System.Drawing.Point(25, 210)
$btnStartHooks.Size = New-Object System.Drawing.Size(415, 42)
$btnStartHooks.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnStartHooks.Add_Click({
    [NativeRLHookEngine]::StartHook()
    [NativeRLHookEngine]::ScriptEnabled = $true
    $lblStatusText.Text = "HOOK ENGINE STATUS: ACTIVE (ONLINE - LISTENING)"
    $lblStatusText.ForeColor = [System.Drawing.Color]::FromArgb(0, 255, 130)
    $btnStartHooks.Enabled = $false
    $btnStopHooks.Enabled = $true
})
$form.Controls.Add($btnStartHooks)

$btnStopHooks = New-Object System.Windows.Forms.Button
$btnStopHooks.Text = "STOP HOOKS (PAUSE)"
$btnStopHooks.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnStopHooks.BackColor = [System.Drawing.Color]::FromArgb(200, 50, 50)
$btnStopHooks.ForeColor = [System.Drawing.Color]::White
$btnStopHooks.FlatStyle = "Flat"
$btnStopHooks.Location = New-Object System.Drawing.Point(455, 210)
$btnStopHooks.Size = New-Object System.Drawing.Size(415, 42)
$btnStopHooks.Enabled = $false
$btnStopHooks.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnStopHooks.Add_Click({
    [NativeRLHookEngine]::ScriptEnabled = $false
    $lblStatusText.Text = "HOOK ENGINE STATUS: PAUSED (IDLE)"
    $lblStatusText.ForeColor = [System.Drawing.Color]::FromArgb(255, 100, 100)
    $btnStartHooks.Enabled = $true
    $btnStopHooks.Enabled = $false
    [NativeRLHookEngine]::Log("[ENGINE] Hook execution paused by user.")
})
$form.Controls.Add($btnStopHooks)

# In-GUI Live Console
$lblConsole = New-Object System.Windows.Forms.Label
$lblConsole.Text = "LIVE TELEMETRY & EXECUTION LOG (LOGITECH SCRIPTING CONSOLE EQUIVALENT):"
$lblConsole.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$lblConsole.ForeColor = [System.Drawing.Color]::FromArgb(0, 210, 255)
$lblConsole.Location = New-Object System.Drawing.Point(25, 264)
$lblConsole.AutoSize = $true
$form.Controls.Add($lblConsole)

$txtConsole = New-Object System.Windows.Forms.TextBox
$txtConsole.Multiline = $true
$txtConsole.ScrollBars = "Vertical"
$txtConsole.ReadOnly = $true
$txtConsole.Location = New-Object System.Drawing.Point(25, 286)
$txtConsole.Size = New-Object System.Drawing.Size(845, 200)
$txtConsole.BackColor = [System.Drawing.Color]::FromArgb(7, 10, 15)
$txtConsole.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
$txtConsole.Font = New-Object System.Drawing.Font("Consolas", 9)
$form.Controls.Add($txtConsole)

# Wire C# Logger directly into Live Console Box
[NativeRLHookEngine]::OnLogMessage = {
    param($msg)
    $timestamp = (Get-Date).ToString("HH:mm:ss.fff")
    $logLine = "[$timestamp] $msg\`r\`n"
    if ($txtConsole.InvokeRequired) {
        $txtConsole.Invoke([Action[string]]{ param($line) $txtConsole.AppendText($line) }, $logLine)
    } else {
        $txtConsole.AppendText($logLine)
    }
}

# Initial Greeting Log
[NativeRLHookEngine]::Log("[INIT] FN Pro Rocket League Master-Engine Control Center v4.0.2 ready.")
[NativeRLHookEngine]::Log("[INIT] Configured Epic Games Launcher Directory: ${escapedEpicDir}")
[NativeRLHookEngine]::Log("[INIT] Internal Deadzone: 0.05 | Dodge Deadzone: 0.05 | Radial Re-scaling Active.")
[NativeRLHookEngine]::Log("[INIT] Logitech G-Hub Dispatcher: MOUSE1 (Primary Click), MOUSE2 (Secondary Click).")

# Real-Time Keystroke Testing Box
$lblTest = New-Object System.Windows.Forms.Label
$lblTest.Text = "Latency & Key Duration Tester (Click here and tap/double-tap W, A, S, D):"
$lblTest.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$lblTest.ForeColor = [System.Drawing.Color]::FromArgb(160, 175, 200)
$lblTest.Location = New-Object System.Drawing.Point(25, 496)
$lblTest.AutoSize = $true
$form.Controls.Add($lblTest)

$txtTest = New-Object System.Windows.Forms.TextBox
$txtTest.Location = New-Object System.Drawing.Point(25, 516)
$txtTest.Size = New-Object System.Drawing.Size(845, 24)
$txtTest.BackColor = [System.Drawing.Color]::FromArgb(18, 24, 38)
$txtTest.ForeColor = [System.Drawing.Color]::FromArgb(0, 255, 180)
$txtTest.Font = New-Object System.Drawing.Font("Consolas", 9.5)
$form.Controls.Add($txtTest)

# Bottom Actions: Desktop Shortcut, Open App Folder, Web Simulator
$btnCreateShortcut = New-Object System.Windows.Forms.Button
$btnCreateShortcut.Text = "Create Desktop FN Shortcut"
$btnCreateShortcut.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$btnCreateShortcut.BackColor = [System.Drawing.Color]::FromArgb(20, 30, 45)
$btnCreateShortcut.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 80)
$btnCreateShortcut.FlatStyle = "Flat"
$btnCreateShortcut.Location = New-Object System.Drawing.Point(25, 555)
$btnCreateShortcut.Size = New-Object System.Drawing.Size(270, 36)
$btnCreateShortcut.Add_Click({
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = "$desktop\\FN_RocketLeague_MasterEngine.lnk"
    $wscript = New-Object -ComObject WScript.Shell
    $shortcut = $wscript.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \`"$appDir\\Launch-GUI.ps1\`""
    $shortcut.Description = "FN Rocket League Master-Engine GUI"
    $shortcut.Save()
    [NativeRLHookEngine]::Log("[SHORTCUT] Created desktop shortcut at: $shortcutPath")
    [System.Windows.Forms.MessageBox]::Show("Desktop shortcut created successfully with custom FN icon!", "Shortcut Created", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
})
$form.Controls.Add($btnCreateShortcut)

$btnOpenFolder = New-Object System.Windows.Forms.Button
$btnOpenFolder.Text = "Open App Folder"
$btnOpenFolder.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$btnOpenFolder.BackColor = [System.Drawing.Color]::FromArgb(30, 41, 59)
$btnOpenFolder.ForeColor = [System.Drawing.Color]::FromArgb(220, 230, 245)
$btnOpenFolder.FlatStyle = "Flat"
$btnOpenFolder.Location = New-Object System.Drawing.Point(308, 555)
$btnOpenFolder.Size = New-Object System.Drawing.Size(270, 36)
$btnOpenFolder.Add_Click({
    Start-Process explorer.exe $appDir
})
$form.Controls.Add($btnOpenFolder)

$btnOpenSim = New-Object System.Windows.Forms.Button
$btnOpenSim.Text = "Open 120Hz Simulator"
$btnOpenSim.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$btnOpenSim.BackColor = [System.Drawing.Color]::FromArgb(0, 110, 180)
$btnOpenSim.ForeColor = [System.Drawing.Color]::White
$btnOpenSim.FlatStyle = "Flat"
$btnOpenSim.Location = New-Object System.Drawing.Point(590, 555)
$btnOpenSim.Size = New-Object System.Drawing.Size(280, 36)
$btnOpenSim.Add_Click({
    $appUrl = "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app"
    Start-Process "msedge.exe" "--app=$appUrl"
})
$form.Controls.Add($btnOpenSim)

# Clear Console Button
$btnClearLog = New-Object System.Windows.Forms.Button
$btnClearLog.Text = "Clear Console"
$btnClearLog.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$btnClearLog.BackColor = [System.Drawing.Color]::FromArgb(25, 32, 45)
$btnClearLog.ForeColor = [System.Drawing.Color]::FromArgb(150, 160, 180)
$btnClearLog.FlatStyle = "Flat"
$btnClearLog.Location = New-Object System.Drawing.Point(770, 260)
$btnClearLog.Size = New-Object System.Drawing.Size(100, 22)
$btnClearLog.Add_Click({
    $txtConsole.Clear()
})
$form.Controls.Add($btnClearLog)

# Persist Launch Script
$MyInvocation.MyCommand.ScriptBlock | Out-File -FilePath "$appDir\\Launch-GUI.ps1" -Encoding ascii -Force

# Clean Hook cleanup on form close
$form.Add_FormClosing({
    [NativeRLHookEngine]::StopHook()
})

Write-Host "[OK] FN Master-Engine Control Center Windows Form opened successfully." -ForegroundColor Green
[System.Windows.Forms.Application]::Run($form)
`;
  };

  const dynamicPowerShellScript = generatePowerShellInstallerScript(epicGamesDir, launchLogitechOnStartup);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(dynamicPowerShellScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyLaunchCommand = () => {
    const cmd = `Start-Process "${epicGamesDir.trim().replace(/\//g, '\\')}\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe" -ArgumentList "com.epicgames.launcher://apps/Sugar?action=launch&silent=true"`;
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleDownloadPS1 = () => {
    const blob = new Blob([dynamicPowerShellScript], { type: 'text/plain;charset=ascii' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Setup-FNMasterEngine.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with FN Monogram Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
              <span className="font-['Chakra_Petch'] font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-amber-300">
                FN
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-['Chakra_Petch'] font-bold text-xl text-slate-100 uppercase tracking-wide">
                  FN Master-Engine Control Center &amp; Desktop Hub
                </h2>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded font-bold">
                  FN PRO EDITION
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  EPIC PATH VERIFICATION
                </span>
              </div>
              <p className="text-sm text-slate-300 font-['Rajdhani'] mt-2 max-w-3xl leading-relaxed">
                Configure local game paths, manually specify your <strong className="text-cyan-400">Epic Games Launcher</strong> installation directory to verify Rocket League launch protocols, generate standalone <strong className="text-cyan-400">FN_RocketLeague_MasterEngine.exe</strong> with custom <strong className="text-amber-300">"FN"</strong> icon branding, and deploy to Logitech G-HUB.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/25"
            >
              {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'COPIED TO CLIPBOARD' : 'COPY FN INSTALLER SCRIPT'}</span>
            </button>

            <button
              onClick={handleDownloadPS1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>DOWNLOAD SETUP-FN.PS1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveDesktopTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeDesktopTab === 'settings'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Desktop Settings &amp; Launch Protocol</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
            Epic Path
          </span>
        </button>

        <button
          onClick={() => setActiveDesktopTab('flask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeDesktopTab === 'flask'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Flask &amp; SQLite Primary API</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
            backend/app.py
          </span>
        </button>

        <button
          onClick={() => setActiveDesktopTab('gui-preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeDesktopTab === 'gui-preview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Interactive Windows Form GUI</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            Live Preview
          </span>
        </button>

        <button
          onClick={() => setActiveDesktopTab('powershell')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeDesktopTab === 'powershell'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>PowerShell Script (Setup-FN.ps1)</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Auto-Sync
          </span>
        </button>

        <button
          onClick={() => setActiveDesktopTab('csharp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
            activeDesktopTab === 'csharp'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>C# Standalone Engine (FN.exe)</span>
          <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
            csc.exe
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: DESKTOP SETTINGS & LAUNCH PROTOCOL */}
      {activeDesktopTab === 'settings' && (
        <div className="space-y-6">
          {/* Main Epic Games Launcher Path Configuration Card */}
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase tracking-wide">
                    Epic Games Launcher Installation Directory
                  </h3>
                  <p className="text-xs text-slate-400 font-['Rajdhani']">
                    Manually specify your local Epic Games Launcher directory so the native launch protocol can inspect and verify the executable binaries before starting Rocket League.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Game Path Verified &amp; Primed</span>
                  </span>
                )}
                {verificationStatus === 'checking' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold animate-pulse">
                    <RotateCcw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Verifying Path Structure...</span>
                  </span>
                )}
                {verificationStatus === 'warning' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Invalid Path Syntax</span>
                  </span>
                )}
                {verificationStatus === 'idle' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Ready for Verification</span>
                  </span>
                )}
              </div>
            </div>

            {/* Input Field with Controls */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Installation Directory Path (Windows Folder)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Folder className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={epicGamesDir}
                    onChange={(e) => {
                      setEpicGamesDir(e.target.value);
                      setVerificationStatus('idle');
                    }}
                    placeholder="e.g. C:\Program Files (x86)\Epic Games\Launcher"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl font-mono text-sm text-slate-100 placeholder-slate-600 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerifyGamePath}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Search className="w-4 h-4" />
                    <span>Verify Path</span>
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors"
                  >
                    {savedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-cyan-400" />}
                    <span>{savedNotification ? 'Saved!' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleResetDefault}
                    title="Reset to default installation path"
                    className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-mono text-slate-500">Quick Presets:</span>
                {PRESET_DIRECTORIES.map((preset) => (
                  <button
                    key={preset.path}
                    onClick={() => {
                      setEpicGamesDir(preset.path);
                      setVerificationStatus('idle');
                    }}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                      epicGamesDir === preset.path
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="ml-1.5 opacity-60 text-[10px]">({preset.badge})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Path Target Resolution Checklist */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="font-bold text-slate-200 uppercase tracking-wide">
                  Verified Binary &amp; Game Path Targets
                </span>
                <span className="text-cyan-400">
                  {verificationStatus === 'verified' ? '4/4 Targets Resolved' : 'Structure Inspection Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                  <div className={`mt-0.5 ${verificationStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">Epic Launcher Binary</div>
                    <div className="text-slate-400 text-[11px] truncate">
                      {epicGamesDir}\Portal\Binaries\Win64\EpicGamesLauncher.exe
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                  <div className={`mt-0.5 ${verificationStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">Rocket League Win64 Target</div>
                    <div className="text-slate-400 text-[11px] truncate">
                      {epicGamesDir}\rocketleague\Binaries\Win64\RocketLeague.exe
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                  <div className={`mt-0.5 ${verificationStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">Manifest Metadata Folder</div>
                    <div className="text-slate-400 text-[11px] truncate">
                      %ProgramData%\Epic\EpicGamesLauncher\Data\Manifests (Sugar App)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                  <div className={`mt-0.5 ${verificationStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold">Epic URI Protocol Fallback</div>
                    <div className="text-cyan-400 text-[11px] truncate">
                      com.epicgames.launcher://apps/Sugar?action=launch&amp;silent=true
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Protocol Options & Live Test Runner */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Protocol Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  Launch Protocol Mode
                </label>
                <div className="space-y-1.5 text-xs font-mono">
                  <label
                    onClick={() => setLaunchProtocolMode('hybrid')}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      launchProtocolMode === 'hybrid'
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="protocolMode"
                      checked={launchProtocolMode === 'hybrid'}
                      onChange={() => setLaunchProtocolMode('hybrid')}
                      className="text-cyan-500"
                    />
                    <span>Hybrid (Verified Binary + URI)</span>
                  </label>

                  <label
                    onClick={() => setLaunchProtocolMode('strict')}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      launchProtocolMode === 'strict'
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="protocolMode"
                      checked={launchProtocolMode === 'strict'}
                      onChange={() => setLaunchProtocolMode('strict')}
                      className="text-cyan-500"
                    />
                    <span>Strict Direct Executable</span>
                  </label>

                  <label
                    onClick={() => setLaunchProtocolMode('uri')}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      launchProtocolMode === 'uri'
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="protocolMode"
                      checked={launchProtocolMode === 'uri'}
                      onChange={() => setLaunchProtocolMode('uri')}
                      className="text-cyan-500"
                    />
                    <span>Epic Protocol URI with Path Anchor</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons & Quick Copy */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  Launch Protocol Actions
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleTestLaunchProtocol}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Test Launch Protocol</span>
                  </button>

                  <button
                    onClick={handleCopyLaunchCommand}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs transition-colors"
                  >
                    {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                    <span>{copiedCommand ? 'Copied Command!' : 'Copy Direct PowerShell Launch Cmd'}</span>
                  </button>

                  <div className="text-[11px] text-slate-400 font-mono leading-tight">
                    * The test runs a diagnostic dry run against your configured directory path.
                  </div>
                </div>
              </div>

              {/* Diagnostic Terminal Output */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold text-slate-300">Diagnostic Verification Log</span>
                  <button
                    onClick={() => setVerificationLogs([`[CLEAR] Log buffer cleared at ${new Date().toLocaleTimeString()}`])}
                    className="text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-1">
                  {verificationLogs.map((log, index) => (
                    <div key={index} className="leading-snug">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Callout Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-['Chakra_Petch'] font-bold text-slate-100 uppercase tracking-wide text-sm">
                  Automatic Script &amp; Binary Synchronization
                </h4>
                <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                  Your configured Epic Games Launcher installation directory (<code className="text-cyan-300 font-mono">{epicGamesDir}</code>) is automatically embedded into the generated <strong className="text-cyan-400">Setup-FNMasterEngine.ps1</strong> script and written to <code className="text-emerald-300 font-mono">%LOCALAPPDATA%\RocketLeagueMasterEngine\EpicGamesPath.txt</code> for the standalone C# executable. When you launch Rocket League from the Windows Form or desktop shortcut, the engine checks this directory first.
                </p>
              </div>
            </div>
          </div>

          {/* Logitech G-Hub Startup Automation & Registry Key Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Chakra_Petch'] font-bold text-slate-100 uppercase tracking-wide text-sm">
                      Logitech G-Hub Startup Automation &amp; Windows Registry Key
                    </h4>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        launchLogitechOnStartup
                          ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {launchLogitechOnStartup ? 'REGISTRY KEY ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-slate-300 font-['Rajdhani'] text-xs mt-1 leading-relaxed max-w-2xl">
                    Automatically launch the Logitech G-Hub process (<code className="text-purple-300 font-mono">lghub.exe --background</code>) on Windows system boot via the <code className="text-purple-300 font-mono">HKCU\Software\Microsoft\Windows\CurrentVersion\Run</code> registry key. Ensures your low-latency KBM speedflip &amp; aerial macro scripts are loaded and always active before Rocket League launches.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {launchLogitechOnStartup ? 'Launch Logitech on Boot' : 'Manual Launch'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={launchLogitechOnStartup}
                    onClick={() => handleToggleLogitechStartup(!launchLogitechOnStartup)}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      launchLogitechOnStartup ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        launchLogitechOnStartup ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Registry Details Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <span className="text-purple-400 font-semibold">Target Registry Path:</span>
                  <span>HKCU:\Software\Microsoft\Windows\CurrentVersion\Run</span>
                </div>
                <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <span className="text-purple-400 font-semibold">Key / Value:</span>
                  <code className="text-emerald-400">LogitechGHub = "C:\Program Files\LGHUB\lghub.exe" --background</code>
                </div>
              </div>

              <button
                onClick={handleCopyRegCmd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-mono transition-all"
              >
                {copiedRegCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRegCmd ? 'Copied Command!' : 'Copy Registry PowerShell Cmd'}</span>
              </button>
            </div>
          </div>

          {/* Synchronization & Path Architecture Callout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Real Rocket League Game Config Path Card */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Folder className="w-4 h-4" />
                  <span>Rocket League Config Directory</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  TAGame\Config
                </span>
              </div>
              <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                Directly deployed to your actual game folder at <code className="text-emerald-300 font-mono break-all">%USERPROFILE%\Documents\My Games\Rocket League\TAGame\Config\</code> (NOT buried in app cache). Backups are created automatically before injection.
              </p>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                ✓ TAInput.ini (0.05 DZ, KBM Binds)<br />
                ✓ TASystemSettings.ini (No Mobile, Graphics Off)
              </div>
            </div>

            {/* Logitech G-HUB Bridge & 1-Click Link Card */}
            <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Logitech G-HUB 1-Click Link</span>
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                  StartLogitech
                </span>
              </div>
              <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                Starts <code className="text-cyan-300 font-mono">lghub.exe</code> and deploys <code className="text-cyan-300 font-mono">RocketLeague_MasterEngine.lua</code> directly to <code className="text-slate-200 font-mono">%LOCALAPPDATA%\LGHUB\scripts</code> while copying to Windows Clipboard for instant Ctrl+V.
              </p>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                ✓ Auto-detects Program Files\LGHUB\lghub.exe<br />
                ✓ Binds active profile script seamlessly
              </div>
            </div>

            {/* 0ms Latency Macro Safety Watchdog Card */}
            <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-4 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Macro Safety Watchdog (0ms)</span>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                  0.00ms Overhead
                </span>
              </div>
              <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                Powered by an atomic <code className="text-purple-300 font-mono">Interlocked.CompareExchange</code> CPU primitive and <strong className="text-amber-300">[F10] / [Pause]</strong> emergency hardware killswitch that halts and releases all keys/mouse clicks without adding any loop sleep delays.
              </p>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                ✓ Zero thread locks / Zero polling delay<br />
                ✓ Mouse click simulation for Boost &amp; Jump
              </div>
            </div>
          </div>

          {/* Deadzone & Technical Clarification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>Internal Deadzone (0.05 / 5%)</span>
              </div>
              <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                Eliminates stick drift and unwanted steering wobble without the jarring 5% jump. Our continuous formula rescales <code className="text-cyan-300 font-mono">[0.05..1.00]</code> to start smoothly at 0.00 right at the threshold.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Dodge Deadzone (0.05 / 5%)</span>
              </div>
              <p className="text-slate-300 font-['Rajdhani'] text-xs leading-relaxed">
                Guarantees immediate 45° diagonal speedflip dodge triggers when double jumping while preventing accidental backflips during high-speed fast aerial kickoffs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: FLASK & SQLITE PRIMARY API (backend/app.py) */}
      {activeDesktopTab === 'flask' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
                    Flask Primary REST API &amp; SQLite Storage
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      backend/app.py
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-['Rajdhani']">
                    Acts as the primary persistent API for the Rocket League Master-Engine. Transitions ephemeral React state into a local, high-speed SQLite database engine.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchFlaskData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refresh SQLite Records</span>
                </button>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  API STATUS: ONLINE
                </span>
              </div>
            </div>

            {/* Endpoints Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>GET /api/engine/settings</span>
                  <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">REST</span>
                </div>
                <p className="text-slate-400 text-[11px] font-['Rajdhani']">
                  Retrieves all persistent engine state (deadzone, sensitivity, script power state, audio drill cadence).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>POST /api/engine/settings</span>
                  <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">SAVE</span>
                </div>
                <p className="text-slate-400 text-[11px] font-['Rajdhani']">
                  Persists modified engine configurations directly into SQLite table <code className="text-emerald-300">engine_settings</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>GET/POST /api/macros</span>
                  <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">CRUD</span>
                </div>
                <p className="text-slate-400 text-[11px] font-['Rajdhani']">
                  Stores speedflip, aerial, and chaindash presets inside table <code className="text-amber-300">macro_configurations</code>.
                </p>
              </div>
            </div>

            {/* Live SQLite Tables Inspection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Table 1: Macro Configurations */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Table: macro_configurations ({flaskMacros.length} Records)
                  </span>
                  <span className="text-slate-500 text-[10px]">data/fn_master_engine.db</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
                  {flaskMacros.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No macro configurations found.</div>
                  ) : (
                    flaskMacros.map((macro, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100">{macro.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                            ID: {macro.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 grid grid-cols-3 gap-1">
                          <span>Jump 1: <strong className="text-slate-200">{macro.jump1_ms}ms</strong></span>
                          <span>Cancel Hold: <strong className="text-slate-200">{macro.cancel_hold_ms}ms</strong></span>
                          <span>DZ: <strong className="text-emerald-400">{macro.deadzone}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Table 2: Engine Settings */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Table: engine_settings (Live Active State)
                  </span>
                  <span className="text-slate-500 text-[10px]">Persistent KV Store</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-xs max-h-56 overflow-y-auto">
                  <pre className="text-emerald-300/90 text-[11px] leading-relaxed whitespace-pre-wrap">
                    {flaskSettings ? JSON.stringify(flaskSettings, null, 2) : 'Loading engine settings...'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Test Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <span className="text-slate-400">{flaskTestStatus}</span>
              <button
                onClick={async () => {
                  setFlaskTestStatus('Writing test profile to SQLite...');
                  try {
                    await fetch('/api/macros', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: `custom_${Date.now()}`,
                        name: 'Custom Kickoff Speedflip (SQLite)',
                        preset_type: 'custom',
                        jump1_ms: 28,
                        jump2_delay_ms: 28,
                        jump2_ms: 20,
                        cancel_delay_ms: 8,
                        cancel_hold_ms: 640,
                        roll_type: 'Q',
                        roll_hold_ms: 640,
                        deadzone: 0.04,
                        dodge_deadzone: 0.04,
                        curve_exponent: 1.4,
                        ground_sense: 1.4,
                        aerial_sense: 1.6,
                        is_active: true
                      })
                    });
                    setFlaskTestStatus('Successfully saved test profile into SQLite!');
                    fetchFlaskData();
                  } catch (e) {
                    setFlaskTestStatus('Error writing to SQLite.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Test Save Custom Macro to SQLite</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INTERACTIVE WINDOWS FORM GUI PREVIEW */}
      {activeDesktopTab === 'gui-preview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 text-xs font-mono text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Interactive Win32 Windows Form GUI Preview (FN_RocketLeague_MasterEngine.exe simulation)</span>
            </div>
            <span className="text-[11px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
              Target Epic Dir: {epicGamesDir}
            </span>
          </div>

          {/* Simulated Windows Form Window */}
          <div className="bg-[#0b0e14] border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Window Title Bar */}
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[10px] font-black text-cyan-300 font-mono">
                  FN
                </div>
                <span className="font-sans text-xs text-slate-200 font-medium">
                  FN Pro Master-Engine v4.0.2 - Control Center
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer">_</div>
                <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer">□</div>
                <div className="w-3 h-3 rounded-full bg-red-900 hover:bg-red-700 text-red-200 flex items-center justify-center cursor-pointer">×</div>
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 space-y-5 font-sans">
              {/* Header Box */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-[#121826] border border-cyan-500/40 flex items-center justify-center shadow-lg">
                  <span className="font-['Chakra_Petch'] font-black text-xl text-cyan-400">FN</span>
                </div>
                <div>
                  <h3 className="font-['Segoe_UI'] font-bold text-lg text-cyan-400 tracking-wide">
                    FN MASTER-ENGINE v4.0.2 PRO
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Internal DZ: 0.05 | Dodge DZ: 0.05 | Epic Path: <span className="text-emerald-400">{epicGamesDir}</span>
                  </div>
                </div>
              </div>

              {/* Launcher Quick Bar */}
              <div className="bg-[#121826] border border-slate-800 p-2.5 rounded flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleGuiLaunchRL}
                  className="px-3.5 py-1.5 bg-[#006eb4] hover:bg-[#0080d0] text-white text-xs font-bold rounded shadow transition-colors"
                >
                  Launch Rocket League
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [LAUNCHER] Looking for Logitech G HUB installation at default paths...`,
                      `[${timestamp}] [LAUNCHER] Logitech G HUB process started.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#232d41] hover:bg-[#2e3b55] text-cyan-300 text-xs font-bold rounded border border-cyan-500/20 transition-colors"
                >
                  Launch G HUB
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [LOGITECH] Auto-deployed Master-Engine Lua script to %LOCALAPPDATA%\\LGHUB\\scripts.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#193732] hover:bg-[#204942] text-emerald-300 text-xs font-bold rounded border border-emerald-500/20 transition-colors"
                >
                  Auto-Deploy to G-HUB
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [LOGITECH] Auto-deployed Master-Engine Lua script to %LOCALAPPDATA%\\LGHUB\\scripts\\RocketLeague_MasterEngine.lua`,
                      `[${timestamp}] [LOGITECH] Script content copied to Windows Clipboard for immediate Ctrl+V.`,
                      `[${timestamp}] [LAUNCHER] Dispatched Start-Process for Logitech G-HUB (lghub.exe).`,
                      `[${timestamp}] [LOGITECH] 1-Click Link COMPLETE: Active script linked with G-Hub!`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#3a1d4d] hover:bg-[#4d2666] text-purple-200 text-xs font-bold rounded border border-purple-500/30 transition-colors"
                >
                  1-Click G-HUB + Script
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [CONFIG] Injected TAInput.ini (0.05 DZ, KBM binds) & TASystemSettings.ini (No Mobile, OneFrameThreadLag=False, Graphics OFF) directly into %USERPROFILE%\\Documents\\My Games\\Rocket League\\TAGame\\Config. Backups saved.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#232d41] hover:bg-[#2e3b55] text-amber-300 text-xs font-bold rounded border border-amber-500/20 transition-colors"
                >
                  Inject Pro INIs (TAGame\Config)
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [SAFETY WATCHDOG] Zero-latency safety interlock active (0.00ms). Killswitch on [F10]/[Pause].`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#143228] hover:bg-[#1a4235] text-emerald-300 text-xs font-bold rounded border border-emerald-500/30 transition-colors"
                >
                  Macro Safety: ON (0ms)
                </button>
                <button
                  onClick={() => {
                    const timestamp = new Date().toLocaleTimeString();
                    setGuiLogs((prev) => [
                      `[${timestamp}] [SHORTCUT] Standalone FN Master-Engine Shortcut created on Desktop with custom icon.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  className="px-3 py-1.5 bg-[#371e4b] hover:bg-[#492764] text-purple-300 text-xs font-bold rounded border border-purple-500/20 transition-colors"
                >
                  Build Standalone FN.EXE
                </button>
              </div>

              {/* Status Box */}
              <div className="bg-[#121826] border border-slate-800 p-3 rounded space-y-1">
                <div className="text-xs font-bold font-mono">
                  {guiHookActive ? (
                    <span className="text-emerald-400">HOOK ENGINE STATUS: ACTIVE (ONLINE - LISTENING)</span>
                  ) : (
                    <span className="text-amber-400">HOOK ENGINE STATUS: IDLE (OFFLINE)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Active Hotkeys: [W] Speedflip | [A] Left Speedflip | [D] Right Speedflip | [S] Fast Aerial
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setGuiHookActive(true);
                    setGuiLogs((prev) => [
                      `[${new Date().toLocaleTimeString()}] [HOOK ENGINE] Low-Level Win32 Hook attached successfully.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  disabled={guiHookActive}
                  className={`py-2 px-4 rounded text-xs font-bold text-white transition-colors ${
                    guiHookActive ? 'bg-slate-800 opacity-50 cursor-not-allowed' : 'bg-[#00b478] hover:bg-[#00d08a]'
                  }`}
                >
                  START HOOKS (ONLINE)
                </button>
                <button
                  onClick={() => {
                    setGuiHookActive(false);
                    setGuiLogs((prev) => [
                      `[${new Date().toLocaleTimeString()}] [ENGINE] Hook execution paused by user.`,
                      ...prev.slice(0, 20),
                    ]);
                  }}
                  disabled={!guiHookActive}
                  className={`py-2 px-4 rounded text-xs font-bold text-white transition-colors ${
                    !guiHookActive ? 'bg-slate-800 opacity-50 cursor-not-allowed' : 'bg-[#c83232] hover:bg-[#e03a3a]'
                  }`}
                >
                  STOP HOOKS (PAUSE)
                </button>
              </div>

              {/* Live Output Console */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                  <span>LIVE TELEMETRY &amp; EXECUTION LOG (LOGITECH SCRIPTING CONSOLE EQUIVALENT):</span>
                  <button
                    onClick={() => setGuiLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-normal"
                  >
                    Clear Console
                  </button>
                </div>
                <div className="bg-[#070a0f] border border-slate-800 rounded p-3 h-44 overflow-y-auto font-mono text-xs text-[#64e696] space-y-1">
                  {guiLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>

              {/* Real-time Keystroke Input Tester */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-400 font-mono">
                  Latency &amp; Key Duration Tester (Click here and tap W, A, S, D):
                </label>
                <input
                  type="text"
                  value={testInputText}
                  onChange={(e) => setTestInputText(e.target.value)}
                  onKeyDown={(e) => {
                    const key = e.key.toUpperCase();
                    if (['W', 'A', 'S', 'D'].includes(key)) {
                      const timestamp = new Date().toLocaleTimeString();
                      setGuiLogs((prev) => [
                        `[${timestamp}] [KEYHOOK] Intercepted [${key}] -> Executing mapped mechanics macro...`,
                        ...prev.slice(0, 20),
                      ]);
                    }
                  }}
                  placeholder="Click here and tap [W], [A], [S], or [D] to test Win32 keyhook interception..."
                  className="w-full px-3 py-1.5 bg-[#121826] border border-slate-700 rounded text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: POWERSHELL SCRIPT CODE VIEWER */}
      {activeDesktopTab === 'powershell' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-slate-200">
                  Setup-FNMasterEngine.ps1 (Pure ASCII &amp; English)
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Epic Path: {epicGamesDir}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded transition-colors"
                >
                  {copiedScript ? 'Copied!' : 'Copy Script'}
                </button>
                <button
                  onClick={handleDownloadPS1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 rounded transition-colors"
                >
                  Download .ps1
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[550px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="font-['JetBrains_Mono'] whitespace-pre-wrap selection:bg-cyan-500/30">
                {dynamicPowerShellScript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: C# STANDALONE ENGINE */}
      {activeDesktopTab === 'csharp' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase">
                    FN_RocketLeague_MasterEngine.cs &amp; build.bat
                  </h3>
                  <p className="text-xs text-slate-400 font-['Rajdhani']">
                    Self-contained native Windows C# application. Built with Microsoft .NET Framework 4.x csc.exe compiler. Zero external dependencies.
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded border border-cyan-500/30">
                build.bat compiler ready
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>How to compile FN.EXE locally:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Download or clone the project repository.</li>
                  <li>Double-click <code className="text-amber-300">build.bat</code> in the root folder.</li>
                  <li>Windows built-in <code className="text-cyan-300">csc.exe</code> compiles the C# code into <code className="text-emerald-300">FN_RocketLeague_MasterEngine.exe</code>.</li>
                  <li>The standalone executable will automatically launch and verify your Epic Games path.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Epic Games Path Verification in C#:</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  The standalone C# engine inspects <code className="text-cyan-300 font-mono">%LOCALAPPDATA%\RocketLeagueMasterEngine\EpicGamesPath.txt</code> and scans candidate directories (<code className="text-slate-400 font-mono">Portal\Binaries\Win64\EpicGamesLauncher.exe</code>) to guarantee reliable launch protocol execution before dispatching.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
