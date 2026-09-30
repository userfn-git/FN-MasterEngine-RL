# 🏆 FN Rocket League Master-Engine (v4.0.2 PRO)

<div align="center">

![Rocket League](https://img.shields.io/badge/Esports-Rocket%20League%20RLCS-005fb8?style=for-the-badge&logo=rocketleague&logoColor=white)
![Author](https://img.shields.io/badge/Architect-userfn--git-00D2FF?style=for-the-badge&logo=github&logoColor=white)
![Stack](https://img.shields.io/badge/C%23%20%7C%20PowerShell%20%7C%20Python%20%7C%20SQLite%20%7C%20React-007acc?style=for-the-badge)
![Physics](https://img.shields.io/badge/Physics%20Engine-120Hz%20Sub--Tick%20Precision-success?style=for-the-badge&logo=unrealengine)
![Kernel](https://img.shields.io/badge/Windows%20Kernel-WH__KEYBOARD__LL%20(0.00ms)-purple?style=for-the-badge&logo=windows)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Next-Generation Input Optimization Framework, Low-Level Win32 Execution Kernel, Standalone Native Executable Wrapper, and Autonomous Esports Mechanics Engine for Competitive Rocket League Players.**

[Official Repository](https://github.com/userfn-git/FN-MasterEngine-RL) • [RLCS Esports Reference](https://esports.rocketleague.com) • [Psyonix TAStatsAPI Spec](https://www.rocketleague.com)

</div>

---

## 📖 Executive Overview

**FN Rocket League Master-Engine** is a specialized, zero-compromise mechanical execution engine engineered to eliminate synthetic input lag, stabilize hardware polling jitter, and unlock frame-perfect execution of high-tier competitive mechanics (Speedflips, Fast Aerials, Chaindashes, and Half-Flips) at the physical **120Hz Unreal Engine tick boundary (8.33ms)**.

Developed by **`userfn-git`**, this system bridges:
* **Standalone Windows Executable (`FN_RocketLeague_MasterEngine.exe`)**: Single-file native wrapper compiled via PS2EXE or native Microsoft C# (.NET Framework) Win32 Interop.
* **Kernel-Level Windows User Input (`user32.dll`)**: `WH_KEYBOARD_LL` low-level interrupt hooks operating at 0.00ms dispatch latency.
* **Autonomous Python & SQLite Local Daemon**: Real-time 120Hz tick profiler and persistence engine for hardware telemetry.
* **Official 64-bit Epic Games Launcher Integration**: Explicitly targeted to `C:\Program Files\Epic Games`.

---

## 🚀 Quick Start & Building the Standalone Executable (.EXE)

### Prerequisites
* Windows 10 or Windows 11 (64-bit).
* Windows PowerShell (Run as Administrator).
* Rocket League installed via Epic Games (Path: `C:\Program Files\Epic Games`).

---

### Step 1: Sync or Clone the Repository
Open **PowerShell as Administrator** and navigate to `C:\FN-MasterEngine-RL`:

```powershell
Set-Location "C:\FN-MasterEngine-RL"
git pull origin main
```

*(If you are setting up the repository for the first time or fixing tracking information):*
```powershell
& ".\git-init-fix.ps1"
```

---

### Step 2: Build the Standalone Executable (PS2EXE)
Execute the clean, strict ASCII build script:

```powershell
& ".\build-executable.ps1"
```

#### What `build-executable.ps1` does:
1. **Verifies Environment**: Validates directories (`backend`, `data`, `config`) and sets `C:\Program Files\Epic Games` as the root launcher path.
2. **Generates Win32 Application**: Prepares the standalone Windows Forms control center with 0.00ms interrupt triggers.
3. **Compiles Single-File Executable**: Uses `ps2exe` with automatic fallback to Microsoft .NET C# compiler (`csc.exe`).
4. **Outputs Executable**: Produces `C:\FN-MasterEngine-RL\FN_RocketLeague_MasterEngine.exe` and launches it immediately.

---

## ⚙️ Key Engine Features

### 1. Zero-Latency Win32 Interrupt Hook (`WH_KEYBOARD_LL`)
* Operates at `0.00ms` dispatch latency directly against `user32.dll`.
* Eliminates double-stroke recursion through hardware-flag inspection (`LLKHF_INJECTED = 0x10`).
* Emergency hardware killswitch bound to **`[F10]`** to instantly yield control to standard Windows inputs.

### 2. High-Tier Mechanics Execution Matrix
* **Left / Right Speedflip**: Perfect 45° flip cancel sequence timed to 30ms / 20ms physics ticks.
* **Fast Aerial**: Instant double-jump with -0.95 pitch back and anti-accidental-backflip lock.
* **Wall Chaindash**: 25ms micro-jump wheel contact momentum transfer.

### 3. Native TAInput.ini Configuration Injection
* Directly writes competitive configs into `%USERPROFILE%\Documents\My Games\Rocket League\TAGame\Config\TAInput.ini`.
* Injects **0.05 Deadzone**, **0.05 Dodge Deadzone**, and disables `OneFrameThreadLag`.

---

## 📁 Repository Directory Structure

```text
C:\FN-MasterEngine-RL\
├── build-executable.ps1        # Pure ASCII PS2EXE standalone .exe compiler
├── build.ps1                   # Native Microsoft C# (.NET Framework) build script
├── git-init-fix.ps1            # Automated Git remote & upstream tracking setup tool
├── Program.cs                  # Standalone C# Win32 application source
├── FN_RocketLeague_MasterEngine.exe # Output compiled standalone executable
├── backend/
│   ├── app.py                  # Primary Python REST & SQLite backend engine
│   └── engine_daemon.py        # Microsecond hardware profiler & 120Hz tick daemon
├── data/
│   ├── fn_master_engine.db     # Embedded persistent SQLite database
│   └── fn_master_engine_snapshot.json # Full portable database export
├── config/
│   └── active_macro_config.json# Active RLCS profile timings & deadzone matrix
└── src/                        # Full-stack UI & Telemetry Studio source files
```

---

## 👤 Author & Repository Information

* **Lead Architect & Maintainer**: [`userfn-git`](https://github.com/userfn-git)
* **Official Repository**: [https://github.com/userfn-git/FN-MasterEngine-RL](https://github.com/userfn-git/FN-MasterEngine-RL)
* **Contact & Support**: `fnprospace@gmail.com`

---

<div align="center">
<i>Built for champions. Designed for sub-millisecond precision.</i>
</div>
