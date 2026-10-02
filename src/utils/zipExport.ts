import JSZip from 'jszip';
import { MacroConfig } from '../types';
import {
  generateLuaScript,
  RAW_TAINPUT_INI,
  RAW_TASYSTEMSETTINGS_INI,
  RAW_POWERSHELL_TEMPLATES,
} from '../data/defaultConfig';

export async function generateMasterEngineZipBackup(
  config: MacroConfig,
  presetName: string = 'v402'
): Promise<Blob> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString();

  // 1. Logitech Lua Script
  const luaScript = generateLuaScript(config);
  zip.file('lua/RocketLeague_MasterEngine.lua', luaScript);

  // 2. Logitech G-Hub Profile JSON
  const ghubProfile = {
    applicationId: 'com.psyonix.rocketleague',
    applicationPath: 'C:\\Program Files\\Epic Games\\rocketleague\\Binaries\\Win64\\RocketLeague.exe',
    name: `Rocket League - FN Master Engine (${presetName.toUpperCase()})`,
    version: '4.0.2',
    profileId: `fn-masterengine-backup-${Date.now()}`,
    isDefault: false,
    isActive: true,
    metadata: {
      engine: 'FN-MasterEngine-RL',
      author: 'FN Pro Space',
      exportDate: timestamp,
      ghubVersion: '2026.3.1004',
      preset: presetName,
    },
    settings: {
      reportRate: 1000,
      dpi: 800,
      internalDeadzone: config.internalDeadzone,
      dodgeDeadzone: config.dodgeDeadzone,
      groundSensitivity: config.groundSense,
      aerialSensitivity: config.aerialSense,
      curveExponent: config.curveExponent,
      hardwareJitter: config.hardwareJitter,
      timings: {
        speedflipJump1: config.speedflipJump1,
        speedflipJump2Delay: config.speedflipJump2Delay,
        speedflipJump2: config.speedflipJump2,
        speedflipCancelHold: config.speedflipCancelHold,
        fastAerialJump1: config.fastAerialJump1,
        fastAerialJump2Delay: config.fastAerialJump2Delay,
        fastAerialCancelDelay: config.fastAerialCancelDelay,
        chaindashJump1: config.chaindashJump1,
        chaindashPause: config.chaindashPause,
      },
    },
    scripts: [
      {
        id: 'fn-rl-script-master',
        name: 'RocketLeague_MasterEngine.lua',
        source: luaScript,
        syncEnabled: true,
        lastModified: timestamp,
      },
    ],
    assignments: [
      {
        cardId: 'fn-speedflip-card',
        slotId: `mouse-button-${config.mouseSpeedflip}`,
        actionId: 'lua-speedflip-trigger',
        label: `FN Speedflip (MB${config.mouseSpeedflip})`,
      },
      {
        cardId: 'fn-chaindash-card',
        slotId: `mouse-button-${config.mouseChaindash}`,
        actionId: 'lua-chaindash-trigger',
        label: `FN Chain Dash (MB${config.mouseChaindash})`,
      },
      {
        cardId: 'fn-toggle-card',
        slotId: `mouse-button-${config.mouseToggle}`,
        actionId: 'lua-engine-toggle',
        label: 'FN Engine Toggle (Middle Mouse)',
      },
    ],
    deviceTypes: ['mouse', 'keyboard', 'headset'],
  };
  zip.file('profiles/Logitech_GHub_Profile.json', JSON.stringify(ghubProfile, null, 2));

  // 3. INI Settings
  zip.file('ini/TAInput.ini', RAW_TAINPUT_INI);
  zip.file('ini/TASystemSettings.ini', RAW_TASYSTEMSETTINGS_INI);

  // 4. PowerShell Low-Level Win32 Scripts
  zip.file('powershell/FastAerial_Hook.ps1', RAW_POWERSHELL_TEMPLATES.fastAerial);
  zip.file('powershell/LeftSpeedflip_Hook.ps1', RAW_POWERSHELL_TEMPLATES.leftSpeedflip);
  zip.file('powershell/RightSpeedflip_Hook.ps1', RAW_POWERSHELL_TEMPLATES.rightSpeedflip);
  zip.file('powershell/ForwardSpeedflip_Hook.ps1', RAW_POWERSHELL_TEMPLATES.forwardSpeedflip);
  zip.file('powershell/DeadzoneTuner_Utility.ps1', RAW_POWERSHELL_TEMPLATES.deadzoneTuner);

  // 5. Raw Engine Configuration JSON
  zip.file('backup/macro-config-backup.json', JSON.stringify(config, null, 2));

  // 6. Comprehensive README and deployment manual
  const readme = `================================================================================
FN MASTER ENGINE v4.0.2 - COMPLETE OFFLINE BACKUP ARCHIVE (.ZIP)
Generated: ${timestamp}
Active Preset: ${presetName.toUpperCase()}
================================================================================

This backup archive contains all components required to run the Rocket League
Master Engine in an offline or LAN tournament environment without internet access.

ARCHIVE CONTENTS:
-----------------
1. [lua/RocketLeague_MasterEngine.lua]
   Single-threaded OnEvent Lua script for Logitech G-Hub. Features continuous
   radial deadzone calculation, anti-backflip dodge gate, and click dispatchers.

2. [profiles/Logitech_GHub_Profile.json]
   Pre-formatted Logitech G-Hub profile. Open Logitech G-HUB > Profiles >
   Import Profile to instantly bind Mouse Buttons 3, 4, and 5 and load the Lua script.

3. [ini/TAInput.ini]
   Custom Rocket League input file. Copy to:
   %USERPROFILE%\\Documents\\My Games\\Rocket League\\TAGame\\Config\\TAInput.ini

4. [ini/TASystemSettings.ini]
   Ultra-low latency competitive PC display settings. Removes frame smoothing lag
   and disables GPU-bound post-processing filters. Copy to:
   %USERPROFILE%\\Documents\\My Games\\Rocket League\\TAGame\\Config\\TASystemSettings.ini

5. [powershell/*.ps1]
   Standalone Win32 keyboard & mouse input hooks. Can be run in environments
   where Logitech G-Hub is not installed (e.g. university labs, cybercafes, tournament PCs).

6. [backup/macro-config-backup.json]
   Complete machine-readable JSON backup of your custom deadzones, timing intervals,
   and key assignments.

================================================================================
RLCS LAN COMPLIANCE:
All single-threaded Lua hooks execute within standard 1:1 hardware input tolerances.
================================================================================
`;
  zip.file('README_OFFLINE_BACKUP.txt', readme);

  return await zip.generateAsync({ type: 'blob' });
}
