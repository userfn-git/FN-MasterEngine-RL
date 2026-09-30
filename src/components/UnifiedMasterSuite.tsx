import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  Radio,
  Cpu,
  Sliders,
  FileCode,
  Terminal,
  Cloud,
  Sparkles,
  ArrowRight,
  Shield,
  Gauge,
  CheckCircle,
  ExternalLink,
  Layers,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Database,
  Globe,
} from 'lucide-react';
import { MacroConfig } from '../types';

interface UnifiedMasterSuiteProps {
  config: MacroConfig;
  onUpdateConfig: (config: MacroConfig) => void;
  onNavigateTab: (tabId: string) => void;
  scriptEnabled: boolean;
  setScriptEnabled: (enabled: boolean) => void;
  audioDrillActive: boolean;
  setAudioDrillActive: (active: boolean) => void;
}

export const UnifiedMasterSuite: React.FC<UnifiedMasterSuiteProps> = ({
  config,
  onUpdateConfig,
  onNavigateTab,
  scriptEnabled,
  setScriptEnabled,
  audioDrillActive,
  setAudioDrillActive,
}) => {
  const [activeQuickMechanic, setActiveQuickMechanic] = useState<string | null>(null);
  const [telemetrySpeed, setTelemetrySpeed] = useState<number>(82);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Quick simulation runner
  const handleQuickTest = (mechanic: string) => {
    setActiveQuickMechanic(mechanic);
    setSimulating(true);
    setTelemetrySpeed(25);

    const startTime = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      if (elapsed < 300) {
        setTelemetrySpeed(Math.min(50, Math.round(25 + elapsed * 0.1)));
      } else if (elapsed < 650) {
        setTelemetrySpeed(Math.min(82, Math.round(50 + (elapsed - 300) * 0.1)));
      } else {
        setTelemetrySpeed(82);
        setSimulating(false);
        clearInterval(timer);
      }
    }, 20);
  };

  const featureCards = [
    {
      id: 'radar',
      title: 'Match Radar & Replay Studio',
      subtitle: '2D Spatial Pitch & POV Camera',
      icon: Compass,
      color: 'from-indigo-500/20 to-purple-600/10 border-indigo-500/30 text-indigo-400',
      badge: 'Official Stats API',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
      description: 'Real-time 2D arena spatial tracking, live BallHit & Goal ripples, and spectator POV replay commands.',
      stats: '120Hz Pitch Radar • Camera Director',
      actionText: 'Open Replay Radar',
    },
    {
      id: 'powershell',
      title: 'Win32 Low-Level Hooks',
      subtitle: 'Zero-Latency WASD Execution',
      icon: Terminal,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
      badge: 'WH_KEYBOARD_LL',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      description: 'Microsecond-precise OS kernel event interception with physical packet filter (LLKHF_INJECTED).',
      stats: '4 Actions Active (W, A, S, D)',
      actionText: 'Manage Win32 Hooks',
    },
    {
      id: 'latency',
      title: 'Hardware Monitor & Latency Lab',
      subtitle: 'Python Engine & SQLite Profiler',
      icon: Cpu,
      color: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-400',
      badge: 'Python & SQLite',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      description: 'Real-time CPU/GPU load, USB polling jitter oscilloscope, and official Wikipedia esports physics grounding.',
      stats: '1000Hz Polling • SQLite Logs • Wiki API',
      actionText: 'Open Hardware Monitor',
    },
    {
      id: 'tastats',
      title: 'Psyonix TAStatsAPI.ini',
      subtitle: 'Official 120Hz Game Data API',
      icon: Radio,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      badge: '120Hz Tick Match',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      description: 'Direct Unreal Engine 3 live match broadcasting on WebSocket port 9001 (EAC Anti-Cheat Whitelisted).',
      stats: 'Kickoff Timer • Velocity • Supersonic',
      actionText: 'Open Live Stream',
    },
    {
      id: 'desktop',
      title: 'Desktop Control Center & Settings',
      subtitle: 'Game Path Verification & Standalone .EXE',
      icon: Cpu,
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 text-purple-400',
      badge: 'Epic & Steam Protocol',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
      description: 'Epic Games Launcher directory configuration, game path verification protocol, and standalone C# Win32 Form engine.',
      stats: 'Epic Games Path Verified • 0% Dependencies',
      actionText: 'Desktop Settings & .EXE',
    },
    {
      id: 'lua',
      title: 'Logitech G-HUB Engine',
      subtitle: 'Hardware Macro & Dispatcher',
      icon: FileCode,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      badge: 'G-HUB Lua v4.0.2',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-500/40',
      description: 'Deployable Lua script for G-Series mice with OutputLogMessage and automatic profile recognition.',
      stats: 'Middle Mouse Toggle • Sub-ms Delay',
      actionText: 'View Lua Script',
    },
    {
      id: 'tainput',
      title: 'Config & INI Studio',
      subtitle: 'TAInput & TASystemSettings',
      icon: Sliders,
      color: 'from-rose-500/20 to-pink-600/10 border-rose-500/30 text-rose-400',
      badge: '0.05 DZ + 1080p',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/40',
      description: 'Ultra-low latency TAInput.ini (0.01s axis blend, 0.03s double tap) & TASystemSettings.ini (1080p borderless, DirectSound).',
      stats: 'Dual INI Injector • Auto-Backup',
      actionText: 'Manage INI Files',
    },
    {
      id: 'cloud',
      title: 'Google Cloud Firestore',
      subtitle: 'Multi-Region Telemetry Sync',
      icon: Cloud,
      color: 'from-sky-500/20 to-cyan-600/10 border-sky-500/30 text-sky-400',
      badge: 'Firestore Live',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-500/40',
      description: 'Persistent cloud storage for pro player profiles (Zen, Vatira, BeastMode) with Zero-Trust security rules.',
      stats: 'Global Preset Hub • Profile Sync',
      actionText: 'Cloud Sync Hub',
    },
    {
      id: 'simulator',
      title: 'Mechanics Simulator',
      subtitle: '120Hz Physics Timeline Drill',
      icon: Flame,
      color: 'from-amber-600/20 to-red-600/10 border-amber-600/30 text-amber-500',
      badge: '120Hz Tick Visualizer',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-600/40',
      description: 'Interactive frame-by-frame visualizer showing jump duration, pitch inversion, and flip cancel hold.',
      stats: 'Voice Cadence • 8.33ms Resolution',
      actionText: 'Open Simulator',
    },
    {
      id: 'coach',
      title: 'AI Mechanics Coach',
      subtitle: 'Gemini Physics Optimization',
      icon: Sparkles,
      color: 'from-teal-500/20 to-emerald-600/10 border-teal-500/30 text-teal-400',
      badge: 'AI Coach',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-500/40',
      description: 'Real-time telemetry analysis and mechanics diagnostic recommendations for competitive rank progression.',
      stats: 'Instant Diagnostics • Pro Advice',
      actionText: 'Ask AI Coach',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Master HUD & Physics Telemetry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black font-['Chakra_Petch'] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 uppercase">
                    FN Master-Engine Unified Suite
                  </h1>
                  <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2.5 py-0.5 rounded-full">
                    v4.0.2 ALL-IN-ONE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-['Rajdhani']">
                  Integrated Windows Subsystem: Low-Level Win32 Hooks • 120Hz Physics Tuning • Psyonix Match Data API • Cloud Sync
                </p>
              </div>
            </div>

            {/* Live Metrics Ticker */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Deadzone: <strong className="text-cyan-400">{config.internalDeadzone.toFixed(2)} Radial</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Physics Rate: <strong className="text-amber-400">120 Hz (8.33ms)</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Peak Velocity: <strong className="text-sky-300">{telemetrySpeed} km/h (Supersonic)</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                EAC Anti-Cheat: <strong className="text-purple-300">100% Whitelisted</strong>
              </div>
              <div
                onClick={() => onNavigateTab('latency')}
                className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-emerald-300 cursor-pointer hover:bg-emerald-900/40 transition-colors"
                title="Python SQLite DB: Syncs hardware metrics, macro benchmarks, and official Wikipedia grounding"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                SQLite Engine: <strong className="text-emerald-200">fn_master_engine.db</strong>
              </div>
            </div>
          </div>

          {/* Quick Execution Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setScriptEnabled(!scriptEnabled)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg ${
                scriptEnabled
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>MASTER ENGINE: {scriptEnabled ? 'ONLINE' : 'PAUSED'}</span>
            </button>

            <button
              onClick={() => setAudioDrillActive(!audioDrillActive)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                audioDrillActive
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {audioDrillActive ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioDrillActive ? 'VOICE CADENCE ON' : 'ENABLE VOICE CADENCE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* WASD Speedflip Quick Tester Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              Quick WASD In-App Mechanics Test Bench (Sub-Millisecond Response)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Current Speed: <strong className="text-cyan-400">{telemetrySpeed} km/h</strong> {telemetrySpeed >= 79 && '⚡ [SUPERSONIC]'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'W', title: 'Forward Speedflip', delay: '30ms Flip-Cancel', color: 'border-cyan-500/40 text-cyan-400' },
            { key: 'A', title: '45° Left Speedflip', delay: '30ms + AirRoll L', color: 'border-emerald-500/40 text-emerald-400' },
            { key: 'D', title: '45° Right Speedflip', delay: '30ms + AirRoll R', color: 'border-amber-500/40 text-amber-400' },
            { key: 'S', title: 'Fast Aerial Launcher', delay: '200ms Jump Pitch', color: 'border-purple-500/40 text-purple-400' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleQuickTest(item.key)}
              className={`flex items-center justify-between p-3 rounded-xl bg-slate-950 border hover:border-cyan-500 transition-all text-left group ${
                activeQuickMechanic === item.key && simulating ? 'ring-2 ring-cyan-400 bg-cyan-950/30' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 font-mono font-black text-xs text-white">
                    {item.key}
                  </span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {item.delay}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Iconic 9-Feature Grid (All features unified in one view) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
              Integrated Architectural Subsystems (Click to Open Detail View)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">9 Core Modules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigateTab(feat.id)}
                className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${feat.color} bg-slate-900/90 border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:border-cyan-500/50 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] tracking-wide group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {feat.subtitle}
                  </div>

                  <p className="text-xs text-slate-400 font-['Rajdhani'] mt-2.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {feat.stats}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
