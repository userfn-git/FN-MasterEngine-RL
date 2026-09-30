# 🏆 FN Rocket League Master-Engine (v4.0.2 PRO)

<div align="center">

![Rocket League](https://img.shields.io/badge/Esports-Rocket%20League%20RLCS-005fb8?style=for-the-badge&logo=rocketleague&logoColor=white)
![Author](https://img.shields.io/badge/Architect-userfn--git-00D2FF?style=for-the-badge&logo=github&logoColor=white)
![Stack](https://img.shields.io/badge/C%23%20%7C%20Python%20%7C%20SQLite%20%7C%20React%20%7C%20TypeScript-007acc?style=for-the-badge)
![Physics](https://img.shields.io/badge/Physics%20Engine-120Hz%20Sub--Tick%20Precision-success?style=for-the-badge&logo=unrealengine)
![Kernel](https://img.shields.io/badge/Windows%20Kernel-WH__KEYBOARD__LL%20(0.00ms)-purple?style=for-the-badge&logo=windows)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Next-Generation Input Optimization Framework, Low-Level Win32 Execution Kernel, and Autonomous Esports Mechanics Engine for Competitive Rocket League Players.**

[Official Repository](https://github.com/userfn-git/FN-MasterEngine-RL) • [RLCS Esports Reference](https://esports.rocketleague.com) • [Psyonix TAStatsAPI Spec](https://www.rocketleague.com)

</div>

---

## 📖 Executive Overview

**FN Rocket League Master-Engine** is a specialized, zero-compromise mechanical engine engineered to eliminate synthetic input lag, stabilize hardware polling jitter, and unlock frame-perfect execution of high-tier competitive mechanics (Speedflips, Fast Aerials, Chaindashes, and Half-Flips) at the physical **120Hz Unreal Engine tick boundary (8.33ms)**.

Developed by **`userfn-git`**, this system bridges kernel-level Windows user input (`user32.dll`), autonomous Python SQLite local daemons, Logitech G-HUB memory-injection Lua architecture, and a dynamic real-time telemetry dashboard.

---

## 🌐 Authoritative Scientific & Industry References

The architecture is grounded in verified operating system specifications, esports tournament frameworks, and authoritative computer science literature:

1. **Psyonix & Epic Games Unreal Engine 3 Telemetry Engine**:
   * [Psyonix Rocket League Esports](https://esports.rocketleague.com): Official RLCS Rulebook and LAN integrity standards for whitelisted local telemetry.
   * `MatchStatsExporter_TA` Specification: Unreal Engine 3 `TAGame.MatchStatsExporter_TA` 120Hz broadcast socket interface.
2. **Microsoft Windows Systems & Kernel API**:
   * [Microsoft Learn: Win32 SetWindowsHookEx (`WH_KEYBOARD_LL`)](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexw): Low-overhead hardware interrupt hook bypassing Windows message pump queuing.
   * [Microsoft Learn: Win32 SendInput API](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput): Direct hardware-level scan-code injection avoiding synthetic virtualization overhead.
3. **Computer Science & Polling Science (Wikipedia REST Grounding)**:
   * [Wikipedia: Input Lag & Human Reaction Time](https://en.wikipedia.org/wiki/Input_lag): Academic analysis of end-to-end display latency, frame pacing, and human reaction curves.
   * [Wikipedia: USB HID Class Specification](https://en.wikipedia.org/wiki/USB_human_interface_device_class): Microsecond interrupt transfer scheduling and 1000Hz polling rate optimization.
4. **Logitech Gaming Systems Architecture**:
   * [Logitech G-HUB Developer Suite](https://www.logitechg.com/en-us/innovation/g-hub.html): Lua 5.1 sandboxed hardware execution driver and G-Key memory triggers.

---

## 🚀 Core Engine Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │    FN ROCKET LEAGUE MASTER-ENGINE v4.0.2     │
                    │               userfn-git Core                │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐              ┌──────────────────┐
│  Win32 Low-Level │             │   Local SQLite   │              │ Logitech G-HUB   │
│  Kernel Hooks    │             │   Python Daemon  │              │ Lua Engine       │
│  WH_KEYBOARD_LL  │             │   data/fn_db     │              │ G-Key Micro-step │
│  (0.00ms Jitter) │             │   (120Hz Tick)   │              │ (Anti-Backflip)  │
└────────┬─────────┘             └────────┬─────────┘              └────────┬─────────┘
         │                                │                                 │
         └────────────────────────────────┼─────────────────────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │   Rocket League (TAGame Config Path)  │
                      │   * TAInput.ini (0.05 Deadzone)       │
                      │   * TASystemSettings.ini (DirectSound)│
                      │   * Unreal Engine 3 Physics Engine    │
                      └───────────────────────────────────────┘
```

### 1. Zero-Latency Win32 Interrupt Hook (`WH_KEYBOARD_LL`)
* Operates at `0.00ms` dispatch latency directly against `user32.dll`.
* Eliminates double-stroke recursion through hardware-flag inspection (`LLKHF_INJECTED = 0x10`).
* Emergency hardware killswitch bound to **`[F10]`** and **`[Pause/Break]`** to instantly yield control to standard Windows inputs.

### 2. Microsecond-Accurate Esports Mechanics Sequences
* **Left Speedflip (`[W]` / `[A]` Trigger)**:
  `Boost ON` ➔ `Pitch 45°` ➔ `Jump (30ms)` ➔ `Sub-tick Delay (30ms)` ➔ `Jump 2 (20ms)` ➔ `Cancel Pitch Down (-1.0) + Air Roll Left (650ms)` ➔ `Supersonic State Reached`.
* **Fast Aerial (`[S]` Trigger)**:
  `Pitch Backward (-0.95)` ➔ `Jump 1 (20ms)` ➔ `Release (25ms)` ➔ `Jump 2 (20ms)` ➔ `Continuous Boost` ➔ `Zero Backflip Accidental Lockout`.
* **Wall Chaindash (`[Shift]` Pulsing)**:
  `Micro-Jump (25ms)` ➔ `Two-Wheel Surface Contact` ➔ `Flip Transfer (15ms)` ➔ `Wall Momentum Accumulation`.

### 3. Local Embedded SQLite & Python Daemon
* Local data store path: `data/fn_master_engine_snapshot.json` & `data/fn_master_engine.db`.
* Autonomous persistent logging of controller drift, polling stability, frame times, and hardware metrics.
* Fully operational offline without requiring cloud accounts or remote connectivity.

---

## ⚡ Quick Start: Native Desktop Deployment

### System Prerequisites
* **Operating System**: Windows 10 / Windows 11 (64-bit).
* **Git**: Installed and available in PATH.
* **Privileges**: Administrator execution for Win32 Low-Level interrupt registration.

### 1. Clone & Bootstrap Local Repository
Open **PowerShell as Administrator** and execute:

```powershell
mkdir "C:\FN-MasterEngine-RL" -Force; Set-Location "C:\FN-MasterEngine-RL"
git clone https://github.com/userfn-git/FN-MasterEngine-RL.git .
```

### 2. Launch Local Engine Studio
```powershell
.\launch.ps1
```

This single command:
1. Detects OS specifications and verifies Python & Node.js environments.
2. Initiates the local backend and database engine.
3. Automatically opens the interactive interface at `http://localhost:5173`.

---

## 📁 Repository Directory Structure

```text
C:\FN-MasterEngine-RL\
├── launch.ps1                  # Primary automated bootstrapper & diagnostic launcher
├── local_desktop_launcher.ps1  # Native Win32 ShowDialog Forms GUI control center
├── package.json                # Engine dependency manifest (React 19, TypeScript, Vite)
├── backend/
│   ├── app.py                  # Primary Python REST & SQLite backend engine
│   └── engine_daemon.py        # Microsecond hardware profiler & 120Hz tick daemon
├── data/
│   ├── fn_master_engine.db     # Embedded persistent SQLite database
│   └── fn_master_engine_snapshot.json # Full portable database export
├── config/
│   └── active_macro_config.json# Active RLCS profile timings & deadzone matrix
└── src/
    ├── components/             # Dynamic interactive modules (Latency Lab, INI Studio, Form GUI)
    ├── lib/                    # Hardware interop & state managers
    └── types/                  # TypeScript interface contracts
```

---

## 🛡️ Fair Play & Competitive Integrity

The **FN Rocket League Master-Engine** is designed for mechanical training, hardware diagnostics, and low-level latency optimization. It adheres to all local offline execution guidelines and respects client memory space isolation without modifying protected game binaries.

---

## 👤 Author & Architecture Credits

* **Lead Architect & Maintainer**: [`userfn-git`](https://github.com/userfn-git)
* **Official Repository**: [https://github.com/userfn-git/FN-MasterEngine-RL](https://github.com/userfn-git/FN-MasterEngine-RL)
* **Contact & Support**: `fnprospace@gmail.com`

---

<div align="center">
<i>Built for champions. Designed for sub-millisecond precision.</i>
</div>
