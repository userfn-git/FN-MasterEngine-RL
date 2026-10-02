import React, { useState } from 'react';
import { Flame, Zap, Shield, FileCode, Sliders, Terminal, Cpu, Sparkles, Volume2, VolumeX, Download, Cloud, Radio, Globe, ExternalLink, X, Layers, Compass, Settings, Info, BookOpen, Check } from 'lucide-react';
import { BackgroundUpdateChecker } from './BackgroundUpdateChecker';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scriptEnabled: boolean;
  setScriptEnabled: (enabled: boolean) => void;
  activePreset: string;
  onSelectPreset: (presetName: string) => void;
  audioDrillActive: boolean;
  setAudioDrillActive: (active: boolean) => void;
  onExportAll: () => void;
  onSyncGHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  scriptEnabled,
  setScriptEnabled,
  activePreset,
  onSelectPreset,
  audioDrillActive,
  setAudioDrillActive,
  onExportAll,
  onSyncGHub,
}) => {
  const [portalsModalOpen, setPortalsModalOpen] = useState<boolean>(false);
  const [syncedGHub, setSyncedGHub] = useState<boolean>(false);

  const officialLinks = [
    {
      title: 'RLCS Official Esports Portal',
      url: 'https://esports.rocketleague.com',
      desc: 'Official Rocket League Championship Series standards & LAN rules',
      badge: 'RLCS LAN',
      color: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
    },
    {
      title: 'Psyonix Game Data API',
      url: 'https://www.rocketleague.com',
      desc: 'MatchStatsExporter_TA 120Hz live JSON match broadcasting engine',
      badge: 'Unreal Engine 3',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
    },
    {
      title: 'Logitech G-HUB Developer Hub',
      url: 'https://www.logitechg.com/en-us/innovation/g-hub.html',
      desc: 'Official hardware Lua scripting & driver integration specs',
      badge: 'Logitech Lua',
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/40',
    },
    {
      title: 'Microsoft Win32 Low-Level Hooks',
      url: 'https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexw',
      desc: 'SetWindowsHookEx (WH_KEYBOARD_LL) microsecond kernel docs',
      badge: 'Microsoft Learn',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
    },
    {
      title: 'Google Cloud Firestore',
      url: 'https://cloud.google.com/firestore',
      desc: 'Enterprise multi-region reactive NoSQL database infrastructure',
      badge: 'Google Cloud',
      color: 'text-orange-400 border-orange-500/30 bg-orange-950/40',
    },
    {
      title: 'GitHub Official Repository',
      url: 'https://github.com/userfn-git/FN-MasterEngine-RL',
      desc: 'Source code, releases, standalone C# engine & batch compiler',
      badge: 'userfn-git',
      color: 'text-slate-200 border-slate-700 bg-slate-900',
    },
  ];
  const tabs = [
    { id: 'suite', label: 'Master Suite Hub', icon: Layers, badge: 'All-in-One' },
    { id: 'radar', label: 'Match Radar & Replay', icon: Compass, badge: 'Official API' },
    { id: 'desktop', label: 'Desktop Settings & Form', icon: Cpu, badge: 'Launcher & EXE' },
    { id: 'tastats', label: 'Psyonix TAStatsAPI', icon: Radio, badge: 'Official API' },
    { id: 'cloud', label: 'Google Cloud Hub', icon: Cloud, badge: 'Firestore' },
    { id: 'simulator', label: 'Mechanics Simulator', icon: Flame, badge: '120Hz' },
    { id: 'library', label: 'Macro Presets', icon: BookOpen, badge: 'Community' },
    { id: 'lua', label: 'Logitech Lua Engine', icon: FileCode, badge: 'G-Hub' },
    { id: 'powershell', label: 'PowerShell Win32 Hooks', icon: Terminal, badge: 'C# Raw' },
    { id: 'tainput', label: 'INI Config Studio', icon: Sliders, badge: 'Input & System' },
    { id: 'latency', label: 'Curve & Latency Lab', icon: Zap, badge: 'Math' },
    { id: 'coach', label: 'AI Mechanics Coach', icon: Sparkles, badge: 'Gemini' },
    { id: 'settings', label: 'Settings & GitHub', icon: Settings, badge: 'GitHub' },
  ];

  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 shadow-xl shadow-cyan-500/25 border-2 border-cyan-400 select-none group">
            <span className="font-['Chakra_Petch'] font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-amber-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              FN
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-['Chakra_Petch'] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300">
                FN Master-Engine
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/50 rounded font-bold">
                FN PRO v4.0.2
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-amber-950/70 text-amber-300 border border-amber-500/40 rounded">
                DZ: 0.05 / 0.05
              </span>
            </div>
            <p className="text-xs text-slate-400 font-['Rajdhani'] font-medium">
              FN Pro Rocket League Input Engine • Logitech G-Hub • Standalone EXE • TAInput.ini • 120Hz Speedflips
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Preset:</span>
            <select
              value={activePreset}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="v402" className="bg-slate-900 text-slate-200">RL Master-Engine v4.0.2 (Default)</option>
              <option value="kickoff" className="bg-slate-900 text-slate-200">Kickoff Demon (30ms Flip-Cancel)</option>
              <option value="aerial" className="bg-slate-900 text-slate-200">Freestyle & Aerial Ascender</option>
              <option value="chaindash" className="bg-slate-900 text-slate-200">Infinite Wall Chain-Dasher</option>
              <option value="comp240" className="bg-slate-900 text-slate-200">240Hz Low-Latency Ultra</option>
            </select>
          </div>

          {/* Engine Master Toggle */}
          <button
            onClick={() => setScriptEnabled(!scriptEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              scriptEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}
            title="Toggle Engine Active State (Same as Middle Mouse Button in Logitech Lua)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ENGINE: {scriptEnabled ? 'ONLINE' : 'BYPASS'}</span>
          </button>

          {/* Audio Drill Cue Metronome Button */}
          <button
            onClick={() => setAudioDrillActive(!audioDrillActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              audioDrillActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Audio Drill Cadence: Plays voice & sound metronome cues for jump cancel timing drills"
          >
            {audioDrillActive ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">VOICE DRILLS</span>
          </button>

          {/* Official Portals Modal Trigger */}
          <button
            onClick={() => setPortalsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold transition-all shadow-sm"
            title="Open Official Standards & Portals (RLCS, Psyonix API, Logitech G, Microsoft Win32, Google Cloud, GitHub)"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">OFFICIAL PORTALS</span>
          </button>

          {/* Background GitHub Update Service Indicator */}
          <BackgroundUpdateChecker
            currentVersion="v4.0.2"
            onOpenSettingsTab={() => setActiveTab('settings')}
          />

          {/* Sync to G-Hub Button with Descriptive Hover Tooltip */}
          <div className="relative group flex items-center">
            <button
              onClick={() => {
                if (onSyncGHub) onSyncGHub();
                setSyncedGHub(true);
                setTimeout(() => setSyncedGHub(false), 2500);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95 border ${
                syncedGHub
                  ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/30'
                  : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/40 text-purple-300 hover:text-purple-200'
              }`}
              title="Sync to Logitech G-Hub: Exports formatted JSON profile with embedded Lua script"
              aria-label="Sync to Logitech G-Hub JSON Profile"
            >
              {syncedGHub ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              )}
              <span>{syncedGHub ? 'G-HUB PROFILE SYNCED!' : 'SYNC TO G-HUB'}</span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/40 px-1 py-0.2 rounded font-mono hidden md:inline">
                JSON
              </span>
            </button>

            {/* Hover Tooltip Popover Explaining G-Hub JSON Profile */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-72 bg-slate-900 border border-purple-500/40 rounded-xl p-3.5 shadow-2xl shadow-black/80 backdrop-blur-md pointer-events-none animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-['Chakra_Petch'] font-bold text-xs text-white uppercase tracking-wider">
                    Logitech G-Hub Profile
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                  IMPORT READY
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-['Rajdhani'] mb-2.5 leading-snug">
                Exports your active configuration, macro bindings, and compiled Lua engine as a formatted Logitech G-Hub JSON profile (<code className="text-purple-300">.json</code>).
              </p>

              <div className="space-y-1.5 text-[10px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                <div className="text-purple-400 font-bold">How to import into Logitech G HUB:</div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>Open Logitech G HUB &gt; Profiles</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>Click &quot;Import Profile&quot; &amp; select this JSON</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>Auto-loads button bindings &amp; Lua script!</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-purple-300/80 flex items-center justify-between">
                <span>Format: .json profile</span>
                <span>Logitech G-Hub v2026.x</span>
              </div>
            </div>
          </div>

          {/* Export Bundle with Descriptive Hover Tooltip & Helper Text */}
          <div className="relative group flex items-center">
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/25 hover:bg-cyan-500/35 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold transition-all shadow-sm hover:shadow-cyan-500/20 active:scale-95"
              aria-label="Export All Engine Files Bundle"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT ALL</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1 py-0.2 rounded font-mono hidden md:inline">
                4-in-1
              </span>
            </button>

            {/* Information Helper Icon Trigger */}
            <div
              className="cursor-help text-slate-400 hover:text-cyan-400 transition-colors p-1 ml-0.5"
              title="Bundles Lua script, TAInput.ini, TASystemSettings.ini, and PowerShell Win32 hooks"
            >
              <Info className="w-3.5 h-3.5" />
            </div>

            {/* Hover Tooltip Popover Explaining Bundled Files */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-72 bg-slate-900 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl shadow-black/80 backdrop-blur-md pointer-events-none animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-['Chakra_Petch'] font-bold text-xs text-white uppercase tracking-wider">
                    Full Engine Bundle
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold">
                  4 FILES BUNDLED
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-['Rajdhani'] mb-2.5 leading-snug">
                Exports all essential Rocket League configuration & script files into a single deployable package:
              </p>

              <ul className="space-y-1.5 text-[11px] font-mono">
                <li className="flex items-start gap-2 bg-slate-950/70 p-1.5 rounded border border-slate-800/80">
                  <span className="text-cyan-400 font-bold shrink-0">1.</span>
                  <div>
                    <strong className="text-slate-200 block text-[10px]">Logitech G-HUB Lua Script</strong>
                    <span className="text-[10px] text-slate-400">RocketLeague_MasterEngine.lua (0.00ms)</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/70 p-1.5 rounded border border-slate-800/80">
                  <span className="text-cyan-400 font-bold shrink-0">2.</span>
                  <div>
                    <strong className="text-slate-200 block text-[10px]">TAInput.ini Bindings</strong>
                    <span className="text-[10px] text-slate-400">Rocket League raw input overrides</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/70 p-1.5 rounded border border-slate-800/80">
                  <span className="text-cyan-400 font-bold shrink-0">3.</span>
                  <div>
                    <strong className="text-slate-200 block text-[10px]">TASystemSettings.ini</strong>
                    <span className="text-[10px] text-slate-400">120Hz/240Hz physics tick rate optimization</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-slate-950/70 p-1.5 rounded border border-slate-800/80">
                  <span className="text-cyan-400 font-bold shrink-0">4.</span>
                  <div>
                    <strong className="text-slate-200 block text-[10px]">PowerShell Win32 Hooks</strong>
                    <span className="text-[10px] text-slate-400">Low-level SetWindowsHookEx C# driver</span>
                  </div>
                </li>
              </ul>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-300/80 flex items-center justify-between">
                <span>Format: .txt / All-in-One</span>
                <span>Ready to deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Authoritative Portals Modal */}
      {portalsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] uppercase tracking-wide">
                    Official Authoritative Standards & Portals
                  </h3>
                  <p className="text-xs text-slate-400 font-['Rajdhani']">
                    Official documentation hubs, tournament rules, and live APIs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPortalsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {officialLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 transition-all group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-sky-300 transition-colors">
                        {link.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${link.color}`}>
                        {link.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-['Rajdhani']">
                      {link.desc}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 shrink-0 ml-3 transition-colors" />
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Author: <strong className="text-slate-200">@userfn-git</strong></span>
              <button
                onClick={() => setPortalsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-['Rajdhani'] font-semibold tracking-wide whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
