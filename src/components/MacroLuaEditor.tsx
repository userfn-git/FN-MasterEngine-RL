import React, { useState, useMemo, useRef } from 'react';
import {
  Copy,
  Download,
  Check,
  FileCode,
  Sliders,
  Shield,
  Terminal,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Search,
  Columns,
  Maximize2,
  Minimize2,
  AlignLeft,
  ArrowDownToLine,
  Filter
} from 'lucide-react';
import { MacroConfig } from '../types';
import { generateLuaScript } from '../data/defaultConfig';
import { MacroValidator } from '../utils/MacroValidator';
import { MacroValidatorPanel } from './MacroValidatorPanel';

interface MacroLuaEditorProps {
  config: MacroConfig;
  onUpdateConfig: (newConfig: MacroConfig) => void;
}

export const MacroLuaEditor: React.FC<MacroLuaEditorProps> = ({ config, onUpdateConfig }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [linkedGHub, setLinkedGHub] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'bindings' | 'math'>('bindings');
  const [exportWarningModal, setExportWarningModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'copy' | 'download' | 'link' | null>(null);

  // Side-by-Side Real-Time Preview Pane State
  const [viewMode, setViewMode] = useState<'split-equal' | 'split-wide' | 'code-full'>('split-equal');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [syncPulse, setSyncPulse] = useState<boolean>(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const generatedScript = useMemo(() => {
    return generateLuaScript(config);
  }, [config]);

  const scriptLines = useMemo(() => {
    return generatedScript.split('\n');
  }, [generatedScript]);

  const validationReport = useMemo(() => {
    return MacroValidator.validate(generatedScript, config);
  }, [generatedScript, config]);

  // Real-time update dispatcher that triggers live sync pulse
  const updateConfigWithPulse = (delta: Partial<MacroConfig>) => {
    onUpdateConfig({ ...config, ...delta });
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 800);
  };

  const jumpToSection = (targetText: string) => {
    const lineIndex = scriptLines.findIndex((line) => line.toLowerCase().includes(targetText.toLowerCase()));
    if (lineIndex >= 0) {
      const el = document.getElementById(`lua-line-${lineIndex + 1}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-cyan-500/40');
        setTimeout(() => el.classList.remove('bg-cyan-500/40'), 1400);
      }
    }
  };

  const executeCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeDownload = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RocketLeague_MasterEngine_v4.0.2.lua';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const executeLinkGHub = () => {
    navigator.clipboard.writeText(generatedScript);
    setLinkedGHub(true);
    setTimeout(() => setLinkedGHub(false), 4000);
  };

  const handleCopy = () => {
    if (validationReport.errorCount > 0) {
      setPendingAction('copy');
      setExportWarningModal(true);
      return;
    }
    executeCopy();
  };

  const handleDownload = () => {
    if (validationReport.errorCount > 0) {
      setPendingAction('download');
      setExportWarningModal(true);
      return;
    }
    executeDownload();
  };

  const handleLinkGHub = () => {
    if (validationReport.errorCount > 0) {
      setPendingAction('link');
      setExportWarningModal(true);
      return;
    }
    executeLinkGHub();
  };

  const confirmExportAnyway = () => {
    setExportWarningModal(false);
    if (pendingAction === 'copy') executeCopy();
    else if (pendingAction === 'download') executeDownload();
    else if (pendingAction === 'link') executeLinkGHub();
    setPendingAction(null);
  };

  const handleCopyGHubPath = () => {
    navigator.clipboard.writeText('%LOCALAPPDATA%\\LGHUB\\scripts\\RocketLeague_MasterEngine.lua');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Search match count
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return scriptLines.filter((l) => l.toLowerCase().includes(q)).length;
  }, [scriptLines, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Top Banner and Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h2 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase">
              Logitech G-Hub Lua Engine (v4.0.2 Pro)
            </h2>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded">
              SINGLE-THREADED OnEvent
            </span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
              DZ: 0.05 / 0.05
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Rajdhani'] mt-1">
            Engineered for zero-conflict single-threaded execution inside Logitech G-Hub. Features continuous radial deadzone curve, anti-backflip dodge gate, and safe mouse click dispatcher.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLinkGHub}
            title="Auto-copy script and initiate Logitech G-HUB link"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-500/20"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>{linkedGHub ? 'COPIED & READY FOR G-HUB' : 'START LOGITECH & LINK'}</span>
          </button>

          <button
            onClick={handleCopyGHubPath}
            title="Copy default Logitech G-Hub scripts path"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
          >
            {copiedPath ? <Check className="w-4 h-4 text-emerald-400" /> : <Terminal className="w-4 h-4 text-amber-400" />}
            <span>{copiedPath ? 'PATH COPIED' : 'COPY G-HUB PATH'}</span>
          </button>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>G-Hub Guide</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY SCRIPT'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD .LUA</span>
          </button>
        </div>
      </div>

      {/* Linked to G-HUB Banner */}
      {linkedGHub && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/50 rounded-xl p-3.5 text-xs font-mono text-purple-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>
              <strong>Logitech G-HUB Link Active:</strong> Script copied to Clipboard! In PowerShell or Desktop Form, click <strong>"Start Logitech G HUB"</strong> or paste with <kbd className="bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-500/40 text-white">Ctrl + V</kbd> into your profile scripting console.
            </span>
          </div>
          <span className="text-[10px] bg-purple-900 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/40">
            0ms LATENCY
          </span>
        </div>
      )}

      {/* G-Hub Installation Guide Drawer */}
      {showGuide && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl p-4 text-xs font-['Rajdhani'] space-y-2.5 animate-fadeIn">
          <h3 className="font-['Chakra_Petch'] font-bold text-sm text-cyan-300 uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4" /> How to install in Logitech G-Hub:
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
            <li>Open <strong className="text-white">Logitech G HUB</strong> desktop software.</li>
            <li>Click on your active <strong className="text-white">Rocket League</strong> profile (or Desktop: Default).</li>
            <li>Click the <strong className="text-cyan-400">"Scripting"</strong> link below the profile name banner.</li>
            <li>Click <strong className="text-white">Script &gt; New Lua Script</strong> (or replace existing content).</li>
            <li>Paste this script completely, then press <strong className="text-white">Ctrl + S</strong> to Save.</li>
            <li>In the script editor, click <strong className="text-white">Script &gt; Save & Run</strong>. Look for <span className="text-emerald-400 font-mono">"ROCKET LEAGUE MASTER ENGINE v4.0.2 STATUS: ONLINE"</span> in the bottom output log.</li>
            <li>Press <strong className="text-amber-400 font-mono">Middle Mouse Button</strong> in-game to toggle script enable/disable anytime!</li>
          </ol>
        </div>
      )}

      {/* Real-Time MacroValidator In-Editor Warning System */}
      <MacroValidatorPanel report={validationReport} />

      {/* Side-by-Side View Mode Selector & Real-Time Sync Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Columns className="w-4 h-4 text-cyan-400" /> Layout Mode:
          </span>
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('split-equal')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                viewMode === 'split-equal' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              50:50 Split
            </button>
            <button
              onClick={() => setViewMode('split-wide')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                viewMode === 'split-wide' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              40:60 Wide Code
            </button>
            <button
              onClick={() => setViewMode('code-full')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                viewMode === 'code-full' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Code Fullscreen
            </button>
          </div>
        </div>

        {/* Real-Time Sync Status */}
        <div className="flex items-center gap-2">
          {syncPulse ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/60 text-[11px] font-bold animate-pulse shadow-sm shadow-cyan-500/20">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>REAL-TIME LIVE SYNC (0ms)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>LIVE PREVIEW ACTIVE</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Config Knobs + Live Lua Code Inspector */}
      <div className={`grid gap-4 ${
        viewMode === 'split-equal'
          ? 'grid-cols-1 lg:grid-cols-2'
          : viewMode === 'split-wide'
          ? 'grid-cols-1 lg:grid-cols-12'
          : 'grid-cols-1'
      }`}>
        {/* Left Column: Live Controls (Hidden in code-full mode) */}
        {viewMode !== 'code-full' && (
          <div className={`${viewMode === 'split-wide' ? 'lg:col-span-5' : ''} space-y-4`}>
          {/* Sub Navigation */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSubTab('bindings')}
              className={`flex-1 py-1.5 rounded transition-all ${
                activeSubTab === 'bindings' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Key Bindings
            </button>
            <button
              onClick={() => setActiveSubTab('math')}
              className={`flex-1 py-1.5 rounded transition-all ${
                activeSubTab === 'math' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Math & Deadzones
            </button>
            <button
              onClick={() => setActiveSubTab('editor')}
              className={`flex-1 py-1.5 rounded transition-all ${
                activeSubTab === 'editor' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Delays & Timers
            </button>
          </div>

          {/* Bindings Tab */}
          {activeSubTab === 'bindings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Mouse & G-Key Bindings
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Script Toggle Button:</span>
                  <select
                    value={config.mouseToggle}
                    onChange={(e) => onUpdateConfig({ ...config, mouseToggle: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-400 focus:outline-none"
                  >
                    <option value={3}>Mouse 3 (Middle Click)</option>
                    <option value={4}>Mouse 4 (Back)</option>
                    <option value={5}>Mouse 5 (Forward)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">MB4 Speedflip:</span>
                  <select
                    value={config.mouseSpeedflip}
                    onChange={(e) => onUpdateConfig({ ...config, mouseSpeedflip: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-400 focus:outline-none"
                  >
                    <option value={4}>Mouse 4 (MB4)</option>
                    <option value={5}>Mouse 5 (MB5)</option>
                    <option value={3}>Mouse 3 (Middle Click)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">MB5 Chain Dash:</span>
                  <select
                    value={config.mouseChaindash}
                    onChange={(e) => onUpdateConfig({ ...config, mouseChaindash: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-cyan-400 focus:outline-none"
                  >
                    <option value={5}>Mouse 5 (MB5)</option>
                    <option value={4}>Mouse 4 (MB4)</option>
                  </select>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-xs font-['Chakra_Petch'] font-bold text-slate-300 uppercase block mb-2">
                    In-Game Key Mappings
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">FORWARD</label>
                      <input
                        type="text"
                        value={config.keyForward}
                        onChange={(e) => onUpdateConfig({ ...config, keyForward: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">BACK (PITCH UP)</label>
                      <input
                        type="text"
                        value={config.keyBack}
                        onChange={(e) => onUpdateConfig({ ...config, keyBack: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">LEFT</label>
                      <input
                        type="text"
                        value={config.keyLeft}
                        onChange={(e) => onUpdateConfig({ ...config, keyLeft: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">RIGHT</label>
                      <input
                        type="text"
                        value={config.keyRight}
                        onChange={(e) => onUpdateConfig({ ...config, keyRight: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">BOOST</label>
                      <input
                        type="text"
                        value={config.keyBoost}
                        onChange={(e) => onUpdateConfig({ ...config, keyBoost: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">JUMP</label>
                      <input
                        type="text"
                        value={config.keyJump}
                        onChange={(e) => onUpdateConfig({ ...config, keyJump: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">AIR ROLL LEFT</label>
                      <input
                        type="text"
                        value={config.keyAirrollL}
                        onChange={(e) => onUpdateConfig({ ...config, keyAirrollL: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">AIR ROLL RIGHT</label>
                      <input
                        type="text"
                        value={config.keyAirrollR}
                        onChange={(e) => onUpdateConfig({ ...config, keyAirrollR: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Logitech Mouse Button Reference Callout */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1.5">
                  <div className="text-cyan-400 font-bold flex items-center justify-between">
                    <span>Logitech G-HUB Button Reference:</span>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">SafePress Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                    <div><span className="text-amber-400 font-bold">mouse1</span> = Primary / Left Click (G1)</div>
                    <div><span className="text-amber-400 font-bold">mouse2</span> = Secondary / Right Click (G2)</div>
                    <div><span className="text-slate-400 font-bold">mouse3</span> = Middle Click / Wheel (G3)</div>
                    <div><span className="text-cyan-400 font-bold">mouse4</span> = MB4 / Back Thumb (G4)</div>
                    <div><span className="text-cyan-400 font-bold">mouse5</span> = MB5 / Forward Thumb (G5)</div>
                    <div className="text-emerald-400 font-semibold">Zero "invalid argument" error</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Math & Deadzones Tab */}
          {activeSubTab === 'math' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Math Engine & Filtering
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Internal Deadzone:</span>
                    <span className="text-cyan-400">{config.internalDeadzone.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.2}
                    step={0.01}
                    value={config.internalDeadzone}
                    onChange={(e) => onUpdateConfig({ ...config, internalDeadzone: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-['Rajdhani']">
                    Values below this threshold are truncated to zero to eliminate mouse drift.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Dodge Deadzone:</span>
                    <span className="text-cyan-400">{config.dodgeDeadzone.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    value={config.dodgeDeadzone}
                    onChange={(e) => onUpdateConfig({ ...config, dodgeDeadzone: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-['Rajdhani']">
                    Prevents accidental backflips or side-dodges during vertical fast aerials.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Hardware Jitter Filter:</span>
                    <span className="text-cyan-400">{config.hardwareJitter} units</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    step={1}
                    value={config.hardwareJitter}
                    onChange={(e) => onUpdateConfig({ ...config, hardwareJitter: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Ground Sensitivity Multiplier:</span>
                    <span className="text-cyan-400">{config.groundSense.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={config.groundSense}
                    onChange={(e) => onUpdateConfig({ ...config, groundSense: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Aerial Sensitivity Multiplier:</span>
                    <span className="text-cyan-400">{config.aerialSense.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={config.aerialSense}
                    onChange={(e) => onUpdateConfig({ ...config, aerialSense: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delays Tab */}
          {activeSubTab === 'editor' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200">
                Macro Sleep Delays (Milliseconds)
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Fast Aerial Jump 1 Duration:</span>
                    <span className="text-cyan-400">{config.fastAerialJump1}ms</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={280}
                    value={config.fastAerialJump1}
                    onChange={(e) => onUpdateConfig({ ...config, fastAerialJump1: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Fast Aerial Jump 2 Delay:</span>
                    <span className="text-cyan-400">{config.fastAerialJump2Delay}ms</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={60}
                    value={config.fastAerialJump2Delay}
                    onChange={(e) => onUpdateConfig({ ...config, fastAerialJump2Delay: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Fast Aerial Cancel Delay:</span>
                    <span className="text-cyan-400">{config.fastAerialCancelDelay}ms</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={250}
                    value={config.fastAerialCancelDelay}
                    onChange={(e) => onUpdateConfig({ ...config, fastAerialCancelDelay: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Chain Dash Pause Window:</span>
                    <span className="text-cyan-400">{config.chaindashPause}ms</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={90}
                    value={config.chaindashPause}
                    onChange={(e) => onUpdateConfig({ ...config, chaindashPause: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Right Column: Interactive Real-Time Lua Code Preview Pane */}
        <div className={`${
          viewMode === 'split-wide' ? 'lg:col-span-7' : 'w-full'
        } bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl`}>
          {/* Top Header of Preview Pane */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200 ml-1">
                RocketLeague_MasterEngine.lua
              </span>

              {validationReport.isValid ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Syntax Verified
                </span>
              ) : (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> {validationReport.errorCount} Issue{validationReport.errorCount > 1 ? 's' : ''}
                </span>
              )}

              {syncPulse && (
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-500/50 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> SYNCED
                </span>
              )}
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Filter */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2" />
                <input
                  type="text"
                  placeholder="Search code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 focus:w-44 transition-all font-mono"
                />
                {searchMatchCount > 0 && (
                  <span className="ml-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                    {searchMatchCount}
                  </span>
                )}
              </div>

              {/* Word Wrap Toggle */}
              <button
                onClick={() => setWordWrap(!wordWrap)}
                title="Toggle Word Wrap"
                className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
                  wordWrap
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Wrap</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                {scriptLines.length} lines
              </span>
            </div>
          </div>

          {/* Quick Jump Anchor Bar */}
          <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-400 shrink-0">
            <span className="text-slate-500 flex items-center gap-1 shrink-0">
              <ArrowDownToLine className="w-3 h-3 text-cyan-400" /> Jump:
            </span>
            <button
              onClick={() => jumpToSection('[1] CORE CONFIGURATION')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              CONFIG
            </button>
            <button
              onClick={() => jumpToSection('[3] KEY CONFIGURATION')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              BINDINGS
            </button>
            <button
              onClick={() => jumpToSection('[4] SAFE INPUT DISPATCHER')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              SAFE DISPATCHER
            </button>
            <button
              onClick={() => jumpToSection('MacroFastAerial')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              FAST AERIAL
            </button>
            <button
              onClick={() => jumpToSection('MacroMouseSpeedflip')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              SPEEDFLIP (MB4)
            </button>
            <button
              onClick={() => jumpToSection('MacroChainDash')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
            >
              CHAIN DASH (MB5)
            </button>
            <button
              onClick={() => jumpToSection('function OnEvent')}
              className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-colors shrink-0 font-bold"
            >
              OnEvent()
            </button>
          </div>

          {/* Code Viewer Body with Line Numbers Gutter */}
          <div
            ref={codeContainerRef}
            className="p-4 overflow-y-auto max-h-[620px] font-mono text-xs text-slate-300 leading-relaxed selection:bg-cyan-500/30"
          >
            {scriptLines.map((line, index) => {
              const lineNum = index + 1;
              const isMatch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
              const isComment = line.trim().startsWith('--');
              const isHeader = line.includes('---') || line.includes('===');
              const isFunc = line.includes('function ');
              const isBindings = line.includes('BINDINGS') || line.includes('BUTTONS');

              return (
                <div
                  key={lineNum}
                  id={`lua-line-${lineNum}`}
                  className={`flex items-start group rounded transition-colors duration-200 py-0.5 ${
                    isMatch
                      ? 'bg-amber-500/20 text-amber-200 font-bold'
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  {/* Line Number Gutter */}
                  <span className="w-10 select-none text-right pr-3 text-slate-600 font-mono text-[11px] shrink-0 border-r border-slate-800/80 mr-3 group-hover:text-slate-400">
                    {lineNum}
                  </span>

                  {/* Code Line */}
                  <span
                    className={`font-['JetBrains_Mono'] ${
                      wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
                    } flex-1 ${
                      isComment
                        ? 'text-slate-500 italic'
                        : isHeader
                        ? 'text-cyan-500/80 font-bold'
                        : isFunc
                        ? 'text-cyan-300 font-bold'
                        : isBindings
                        ? 'text-emerald-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pre-Export Warning Modal when Conflicts or Syntax Errors Exist */}
      {exportWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white uppercase">
                  Macro Validation Warning
                </h3>
                <p className="text-xs text-slate-400 font-['Rajdhani']">
                  MacroValidator flagged {validationReport.errorCount} critical issue{validationReport.errorCount > 1 ? 's' : ''} in the Lua script.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto text-xs font-mono">
              {validationReport.issues
                .filter((i) => i.severity === 'error')
                .map((issue) => (
                  <div key={issue.id} className="text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-500/30">
                    <strong className="text-rose-400 block">{issue.title}:</strong>
                    <span>{issue.message}</span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-slate-400 font-['Rajdhani']">
              Exporting a script with syntax or button collisions can cause Logitech G-Hub script engine halts or unexpected input loops.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setExportWarningModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors"
              >
                Review & Fix Issues
              </button>
              <button
                onClick={confirmExportAnyway}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-rose-600/30"
              >
                Export Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
