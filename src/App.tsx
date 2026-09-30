import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DesktopInstaller } from './components/DesktopInstaller';
import { MechanicsTimeline } from './components/MechanicsTimeline';
import { MacroLuaEditor } from './components/MacroLuaEditor';
import { PowerShellManager } from './components/PowerShellManager';
import { TAInputManager } from './components/TAInputManager';
import { LatencyLab } from './components/LatencyLab';
import { AICoachPanel } from './components/AICoachPanel';
import { CloudSyncHub } from './components/CloudSyncHub';
import { TAStatsAPIManager } from './components/TAStatsAPIManager';
import { UnifiedMasterSuite } from './components/UnifiedMasterSuite';
import { SettingsTab } from './components/SettingsTab';
import { DEFAULT_MACRO_CONFIG, generateLuaScript, RAW_TAINPUT_INI, RAW_TASYSTEMSETTINGS_INI, RAW_POWERSHELL_TEMPLATES } from './data/defaultConfig';
import { MacroConfig, InferredSpatialEvent, OpponentStarvationState } from './types';
import { Shield, Flame, Activity, FileCode, CheckCircle, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('suite');
  const [macroConfig, setMacroConfig] = useState<MacroConfig>(DEFAULT_MACRO_CONFIG);
  const [scriptEnabled, setScriptEnabled] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('v402');
  const [audioDrillActive, setAudioDrillActive] = useState<boolean>(false);

  // Live Stats API Telemetry Bridge (Anti-Jitter Shared States)
  const [opponentStarvedState, setOpponentStarvedState] = useState<OpponentStarvationState>({
    isStarved: false,
    starvationDurationSec: 0,
    opponentBoost: 100,
    lastUpdated: 0,
  });
  const [inferredSpatialEvents, setInferredSpatialEvents] = useState<InferredSpatialEvent[]>([]);

  const handleOpponentStarveChange = useCallback((state: OpponentStarvationState) => {
    setOpponentStarvedState(state);
  }, []);

  const handleSpatialEventInferred = useCallback((event: InferredSpatialEvent) => {
    setInferredSpatialEvents((prev) => [event, ...prev.slice(0, 19)]);
  }, []);

  // Sync state with Python SQLite Database on initial load
  useEffect(() => {
    fetch('/api/app-state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.internalDeadzone !== undefined) {
          setMacroConfig((prev) => ({
            ...prev,
            internalDeadzone: data.internalDeadzone ?? prev.internalDeadzone,
            dodgeDeadzone: data.dodgeDeadzone ?? prev.dodgeDeadzone,
            curveExponent: data.curveExponent ?? prev.curveExponent,
            groundSense: data.groundSense ?? prev.groundSense,
            aerialSense: data.aerialSense ?? prev.aerialSense,
          }));
          if (data.presetName) setActivePreset(data.presetName);
        }
      })
      .catch(() => {});
  }, []);

  // Save changes to Python SQLite Database
  const handleConfigChange = (newConfig: MacroConfig) => {
    setMacroConfig(newConfig);
    fetch('/api/app-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newConfig,
        presetName: activePreset,
      }),
    }).catch(() => {});
  };

  // Preset switching logic
  const handleSelectPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'v402') {
      setMacroConfig(DEFAULT_MACRO_CONFIG);
    } else if (presetKey === 'kickoff') {
      setMacroConfig({
        ...DEFAULT_MACRO_CONFIG,
        internalDeadzone: 0.03,
        dodgeDeadzone: 0.04,
        speedflipJump1: 25,
        speedflipJump2Delay: 25,
        speedflipJump2: 18,
        speedflipCancelHold: 620,
        groundSense: 1.4,
      });
    } else if (presetKey === 'aerial') {
      setMacroConfig({
        ...DEFAULT_MACRO_CONFIG,
        fastAerialJump1: 220,
        fastAerialJump2Delay: 25,
        fastAerialCancelDelay: 130,
        fastAerialCancelHold: 350,
        aerialSense: 1.65,
      });
    } else if (presetKey === 'chaindash') {
      setMacroConfig({
        ...DEFAULT_MACRO_CONFIG,
        chaindashJump1: 25,
        chaindashPause: 45,
        chaindashJump2: 25,
        groundSense: 1.5,
      });
    } else if (presetKey === 'comp240') {
      setMacroConfig({
        ...DEFAULT_MACRO_CONFIG,
        internalDeadzone: 0.02,
        hardwareJitter: 1,
        dodgeDeadzone: 0.03,
        groundSense: 1.35,
        aerialSense: 1.55,
      });
    }
  };

  // Export script bundle
  const handleExportAll = () => {
    const luaScript = generateLuaScript(macroConfig);
    const blob = new Blob(
      [
        `-- ==========================================\n-- ROCKET LEAGUE MASTER ENGINE BUNDLE v4.0.2\n-- ==========================================\n\n` +
          `--- LOGITECH G-HUB LUA SCRIPT ---\n${luaScript}\n\n` +
          `--- ROCKET LEAGUE TAINPUT.INI ---\n${RAW_TAINPUT_INI}\n\n` +
          `--- ROCKET LEAGUE TASYSTEMSETTINGS.INI ---\n${RAW_TASYSTEMSETTINGS_INI}\n\n` +
          `--- POWERSHELL HOOK ENGINE ---\n${RAW_POWERSHELL_TEMPLATES.fastAerial}`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RocketLeague_MasterEngine_FullBundle.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Rajdhani'] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scriptEnabled={scriptEnabled}
        setScriptEnabled={setScriptEnabled}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        audioDrillActive={audioDrillActive}
        setAudioDrillActive={setAudioDrillActive}
        onExportAll={handleExportAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Active Tab View */}
        {activeTab === 'suite' && (
          <UnifiedMasterSuite
            config={macroConfig}
            onUpdateConfig={handleConfigChange}
            onNavigateTab={setActiveTab}
            scriptEnabled={scriptEnabled}
            setScriptEnabled={setScriptEnabled}
            audioDrillActive={audioDrillActive}
            setAudioDrillActive={setAudioDrillActive}
          />
        )}

        {activeTab === 'desktop' && (
          <DesktopInstaller />
        )}

        {activeTab === 'tastats' && (
          <TAStatsAPIManager
            onOpponentStarveChange={handleOpponentStarveChange}
            onSpatialEventInferred={handleSpatialEventInferred}
          />
        )}

        {activeTab === 'cloud' && (
          <CloudSyncHub
            currentDeadzone={macroConfig.internalDeadzone}
            currentDodgeDeadzone={macroConfig.dodgeDeadzone}
            currentCurveExponent={macroConfig.curveExponent}
            onApplyPreset={(calibrated) => {
              handleConfigChange({
                ...macroConfig,
                internalDeadzone: calibrated.internalDeadzone,
                dodgeDeadzone: calibrated.dodgeDeadzone,
                curveExponent: calibrated.curveExponent,
              });
            }}
          />
        )}

        {activeTab === 'simulator' && (
          <MechanicsTimeline
            config={macroConfig}
            onUpdateConfig={handleConfigChange}
            audioDrillActive={audioDrillActive}
            liveSpatialEvents={inferredSpatialEvents}
          />
        )}

        {activeTab === 'lua' && (
          <MacroLuaEditor
            config={macroConfig}
            onUpdateConfig={handleConfigChange}
          />
        )}

        {activeTab === 'powershell' && (
          <PowerShellManager />
        )}

        {activeTab === 'tainput' && (
          <TAInputManager />
        )}

        {activeTab === 'latency' && (
          <LatencyLab
            config={macroConfig}
            onUpdateConfig={handleConfigChange}
          />
        )}

        {activeTab === 'coach' && (
          <AICoachPanel
            config={macroConfig}
            activePreset={activePreset}
            opponentStarved={opponentStarvedState.isStarved}
            starvationDurationSec={opponentStarvedState.starvationDurationSec}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            macroConfig={macroConfig}
            activePreset={activePreset}
            onUpdateConfig={handleConfigChange}
          />
        )}
      </main>

      {/* Footer Info & Physics Spec Banner */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 text-xs py-4 px-4 font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-semibold">Rocket League Physics Tick: 120.00 Hz (8.33ms/tick)</span>
            <span className="text-slate-600">|</span>
            <span>Unreal Engine 3 Input Subsystem</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Profile: Logitech Master-Engine v4.0.2</span>
            <span>KBM Left-Click Boost + Right-Click Jump</span>
            <span className="text-cyan-400">AI Studio Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
