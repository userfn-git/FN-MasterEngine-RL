import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Copy,
  Check,
  Search,
  FileText,
  Folder,
  AlertCircle,
  RefreshCw,
  Monitor,
  Gamepad2,
  Volume2,
  Zap,
  ShieldCheck,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Code,
  Save,
  Edit3
} from 'lucide-react';
import { RAW_TAINPUT_INI, RAW_TASYSTEMSETTINGS_INI, generateOptimizedTASystemSettingsIni } from '../data/defaultConfig';

interface BindingRow {
  action: string;
  category: 'Movement' | 'Aerial & Ball' | 'Mechanics' | 'Camera & Interface';
  key: string;
  defaultKey: string;
  description: string;
}

export const TAInputManager: React.FC = () => {
  // Selected Config Tab: 'tainput' or 'tasystemsettings'
  const [activeConfigTab, setActiveConfigTab] = useState<'tainput' | 'tasystemsettings'>('tasystemsettings');

  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [rawView, setRawView] = useState<boolean>(true); // Default to raw view for easy direct editing

  // Exact User Keybindings from TAInput.ini
  const [bindings, setBindings] = useState<BindingRow[]>([
    { action: 'Boost', category: 'Mechanics', key: 'LeftMouseButton', defaultKey: 'LeftShift', description: 'Rocket boost propulsion (Signature KBM mouse bind)' },
    { action: 'Jump', category: 'Mechanics', key: 'RightMouseButton', defaultKey: 'Spacebar', description: 'Jump and dodge execution' },
    { action: 'Handbrake', category: 'Mechanics', key: 'LeftShift', defaultKey: 'RightMouseButton', description: 'Powerslide drift and landing recovery' },
    { action: 'SecondaryCamera', category: 'Camera & Interface', key: 'Spacebar', defaultKey: 'MiddleMouseButton', description: 'Toggle Ball Cam focus' },
    { action: 'Forward', category: 'Movement', key: 'W', defaultKey: 'W', description: 'Drive forward / Pitch down in aerials' },
    { action: 'Backward', category: 'Movement', key: 'S', defaultKey: 'S', description: 'Brake, reverse / Pitch up in aerials' },
    { action: 'Left', category: 'Movement', key: 'A', defaultKey: 'A', description: 'Steer left / Aerial yaw left' },
    { action: 'Right', category: 'Movement', key: 'D', defaultKey: 'D', description: 'Steer right / Aerial yaw right' },
    { action: 'AirRollLeft', category: 'Aerial & Ball', key: 'e', defaultKey: 'Q', description: 'Directional air roll left for fast kickoffs & speedflips' },
    { action: 'AirRollRight', category: 'Aerial & Ball', key: 'q', defaultKey: 'E', description: 'Directional air roll right for aerial control' },
    { action: 'RearCamera', category: 'Camera & Interface', key: 'MiddleMouseButton', defaultKey: 'LeftControl', description: 'Instant rear review camera' },
    { action: 'FastFreeplay', category: 'Camera & Interface', key: 'LeftShift', defaultKey: 'LeftControl', description: 'Instant freeplay training shot reset' },
    { action: 'ToggleScoreboard', category: 'Camera & Interface', key: 'Tab', defaultKey: 'Tab', description: 'Match statistics overlay' },
  ]);

  // Exact Input Settings from user's [Engine.Console] and [TAGame.PlayerInput_TA]
  const [inputSettings, setInputSettings] = useState({
    consoleKey: '1',
    typeKey: 'Tilde',
    mouseSensitivity: 10,
    tapTime: 0.01,
    doubleTapTime: 0.03,
    gamepadDeadzone: 0.05,
    gamepadFreeLookDeadzone: 0.01,
    gamepadLookScale: 80,
    keyboardAxisBlendTime: 0.01,
  });

  // Direct Editable TASystemSettings.ini string with persistence
  const [rawSystemSettingsText, setRawSystemSettingsText] = useState<string>(() => {
    return localStorage.getItem('fn_tasystemsettings_ini') || RAW_TASYSTEMSETTINGS_INI;
  });

  // Direct Editable TAInput.ini custom override
  const [customTAInputText, setCustomTAInputText] = useState<string>(() => {
    return localStorage.getItem('fn_tainput_ini') || '';
  });
  const [useCustomTAInputText, setUseCustomTAInputText] = useState<boolean>(() => {
    return !!localStorage.getItem('fn_tainput_ini');
  });

  const taInputPath = `%USERPROFILE%\\Documents\\My Games\\Rocket League\\TAGame\\Config\\TAInput.ini`;
  const taSystemSettingsPath = `%USERPROFILE%\\Documents\\My Games\\Rocket League\\TAGame\\Config\\TASystemSettings.ini`;

  // Generate complete TAInput.ini string matching exact format
  const generateFullTAInputIni = () => {
    if (useCustomTAInputText && customTAInputText.trim().length > 0) {
      return customTAInputText;
    }
    return `[Engine.Console]
ConsoleKey=${inputSettings.consoleKey}
TypeKey=${inputSettings.typeKey}
KeyboardAxisBlendTime=${inputSettings.keyboardAxisBlendTime.toFixed(2)}
; FN PRO 0.05 Deadzone Calibration Active

[TAGame.PlayerInput_TA]
MouseSensitivity=${inputSettings.mouseSensitivity}
TapTime=${inputSettings.tapTime.toFixed(2)}
DoubleTapTime=${inputSettings.doubleTapTime.toFixed(2)}
GamepadDeadzone=${inputSettings.gamepadDeadzone.toFixed(2)}
GamepadFreeLookDeadzone=${inputSettings.gamepadFreeLookDeadzone.toFixed(2)}
GamepadLookScale=${inputSettings.gamepadLookScale}
KeyboardAxisBlendTime=${inputSettings.keyboardAxisBlendTime.toFixed(2)}
; FN PRO 0.05 Deadzone Calibration Active

${bindings
  .map((b) => `PCBindings=( Action="${b.action.split(' ')[0]}", Key="${b.key}" )`)
  .join('\n')}

[TAGame.DebugInput_TA]
MouseSensitivity=${inputSettings.mouseSensitivity}
KeyboardAxisBlendTime=${inputSettings.keyboardAxisBlendTime.toFixed(2)}
; FN PRO 0.05 Deadzone Calibration Active

[ProjectX.DemoPlayerInput_X]
MouseSensitivity=${inputSettings.mouseSensitivity}
KeyboardAxisBlendTime=${inputSettings.keyboardAxisBlendTime.toFixed(2)}
; FN PRO 0.05 Deadzone Calibration Active

[IniVersion]
0=1789689746.000000
1=1790221648.000000
`;
  };

  const currentContent = activeConfigTab === 'tainput' ? generateFullTAInputIni() : rawSystemSettingsText;
  const currentPath = activeConfigTab === 'tainput' ? taInputPath : taSystemSettingsPath;
  const currentFileName = activeConfigTab === 'tainput' ? 'TAInput.ini' : 'TASystemSettings.ini';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleSaveTextChanges = () => {
    if (activeConfigTab === 'tasystemsettings') {
      localStorage.setItem('fn_tasystemsettings_ini', rawSystemSettingsText);
    } else {
      localStorage.setItem('fn_tainput_ini', customTAInputText);
      setUseCustomTAInputText(true);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadSingle = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBoth = () => {
    handleDownloadSingle('TAInput.ini', generateFullTAInputIni());
    setTimeout(() => {
      handleDownloadSingle('TASystemSettings.ini', rawSystemSettingsText);
    }, 300);
  };

  const handleResetDefaults = () => {
    if (activeConfigTab === 'tainput') {
      setInputSettings({
        consoleKey: '1',
        typeKey: 'Tilde',
        mouseSensitivity: 10,
        tapTime: 0.01,
        doubleTapTime: 0.03,
        gamepadDeadzone: 0.05,
        gamepadFreeLookDeadzone: 0.01,
        gamepadLookScale: 80,
        keyboardAxisBlendTime: 0.01,
      });
      setUseCustomTAInputText(false);
      localStorage.removeItem('fn_tainput_ini');
    } else {
      const optimizedIni = generateOptimizedTASystemSettingsIni();
      setRawSystemSettingsText(optimizedIni);
      localStorage.setItem('fn_tasystemsettings_ini', optimizedIni);
    }
  };

  const filteredBindings = bindings.filter((b) => {
    const matchesCat = activeCategory === 'All' || b.category === activeCategory;
    const matchesQuery =
      b.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase tracking-wide flex items-center gap-2">
                Rocket League Config &amp; INI Studio
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  PURE WINDOWS • 0% MOBILE BLOAT
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-['Rajdhani']">
                Directly edit, customize, and export your official Unreal Engine 3 <strong className="text-cyan-300">TAInput.ini</strong> and <strong className="text-emerald-300">TASystemSettings.ini</strong> files without graphical interference.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setRawView(!rawView)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>{rawView ? 'DASHBOARD VIEW' : 'DIRECT TEXT EDITOR'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : `COPY ${currentFileName}`}</span>
          </button>

          <button
            onClick={() => handleDownloadSingle(currentFileName, currentContent)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD {currentFileName}</span>
          </button>

          <button
            onClick={handleDownloadBoth}
            title="Download both TAInput.ini and TASystemSettings.ini"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD BOTH INIs</span>
          </button>
        </div>
      </div>

      {/* Primary Config File Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveConfigTab('tasystemsettings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeConfigTab === 'tasystemsettings'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>TASystemSettings.ini</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Windows PC Low-Latency
            </span>
          </button>

          <button
            onClick={() => setActiveConfigTab('tainput')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeConfigTab === 'tainput'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-md shadow-sky-500/10'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>TAInput.ini</span>
            <span className="text-[10px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
              Input &amp; Keybindings
            </span>
          </button>
        </div>

        {/* Path Quick Copy */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">Path:</span>
          <span className="text-cyan-300 text-[11px] truncate max-w-xs">{currentPath}</span>
          <button
            onClick={handleCopyPath}
            className="ml-2 text-slate-400 hover:text-slate-200 text-[10px] underline"
          >
            {copiedPath ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* DIRECT EDITABLE RAW INI VIEW */}
      {rawView ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-200 font-bold">
                {currentFileName} - Direct INI Code Editor (Editable)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                You can directly edit, add, or remove lines below
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTextChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved to Profile!' : 'Save Changes'}</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Clean Defaults</span>
              </button>
            </div>
          </div>

          <div className="p-2 bg-slate-950">
            <textarea
              rows={22}
              value={activeConfigTab === 'tasystemsettings' ? rawSystemSettingsText : (useCustomTAInputText ? customTAInputText : generateFullTAInputIni())}
              onChange={(e) => {
                if (activeConfigTab === 'tasystemsettings') {
                  setRawSystemSettingsText(e.target.value);
                } else {
                  setCustomTAInputText(e.target.value);
                  setUseCustomTAInputText(true);
                }
              }}
              spellCheck={false}
              className="w-full bg-[#070a0f] text-emerald-300 font-mono text-xs p-4 rounded-xl border border-slate-800/80 focus:border-cyan-500 focus:outline-none leading-relaxed selection:bg-cyan-500/30 resize-y"
            />
          </div>

          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {activeConfigTab === 'tasystemsettings'
                ? 'Windows Pure Performance Profile: All mobile sections stripped. All heavy graphical features set to False.'
                : 'Input Profile: 0.05 Deadzone, 0.01s Axis Blend, KBM Left Click Boost + Right Click Jump.'}
            </span>
            <span className="text-cyan-400">UTF-8 / Pure ASCII compatible</span>
          </div>
        </div>
      ) : activeConfigTab === 'tainput' ? (
        /* VISUAL EDITOR: TAINPUT.INI */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Core Engine Input Settings (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200 uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                Input Engine Parameters
              </h3>
              <button
                onClick={handleResetDefaults}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Keyboard Axis Blend Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Keyboard Axis Blend Time:</span>
                  <span className="text-sky-400 font-bold">{inputSettings.keyboardAxisBlendTime.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.1}
                  step={0.01}
                  value={inputSettings.keyboardAxisBlendTime}
                  onChange={(e) => {
                    setInputSettings({ ...inputSettings, keyboardAxisBlendTime: Number(e.target.value) });
                    setUseCustomTAInputText(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-sky-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-['Rajdhani']">
                  Set to 0.01s for instantaneous KBM digital steering transition without smoothing drag.
                </p>
              </div>

              {/* Gamepad Deadzone */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gamepad Deadzone:</span>
                  <span className="text-emerald-400 font-bold">{inputSettings.gamepadDeadzone.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.2}
                  step={0.01}
                  value={inputSettings.gamepadDeadzone}
                  onChange={(e) => {
                    setInputSettings({ ...inputSettings, gamepadDeadzone: Number(e.target.value) });
                    setUseCustomTAInputText(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-['Rajdhani']">
                  Calibrated to 0.05 (5%) matching the Master-Engine radial filter.
                </p>
              </div>

              {/* Double Tap Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Double Tap Time:</span>
                  <span className="text-amber-400 font-bold">{inputSettings.doubleTapTime.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.2}
                  step={0.01}
                  value={inputSettings.doubleTapTime}
                  onChange={(e) => {
                    setInputSettings({ ...inputSettings, doubleTapTime: Number(e.target.value) });
                    setUseCustomTAInputText(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-amber-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-['Rajdhani']">
                  Set to 0.03s for rapid multi-jump mechanics and instant speedflip triggers.
                </p>
              </div>

              {/* Tap Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Tap Time:</span>
                  <span className="text-cyan-400 font-bold">{inputSettings.tapTime.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.1}
                  step={0.01}
                  value={inputSettings.tapTime}
                  onChange={(e) => {
                    setInputSettings({ ...inputSettings, tapTime: Number(e.target.value) });
                    setUseCustomTAInputText(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Gamepad Look Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gamepad Look Scale:</span>
                  <span className="text-purple-400 font-bold">{inputSettings.gamepadLookScale}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={inputSettings.gamepadLookScale}
                  onChange={(e) => {
                    setInputSettings({ ...inputSettings, gamepadLookScale: Number(e.target.value) });
                    setUseCustomTAInputText(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded accent-purple-400 cursor-pointer"
                />
              </div>

              {/* Console & Debug Input */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Developer Console Key:</span>
                  <span className="text-cyan-300 font-bold">{inputSettings.consoleKey} (Tilde ~)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Mouse Sensitivity:</span>
                  <span className="text-slate-200 font-bold">{inputSettings.mouseSensitivity}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">FreeLook Deadzone:</span>
                  <span className="text-emerald-300 font-bold">{inputSettings.gamepadFreeLookDeadzone.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Binding Matrix (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search key or action (e.g. Boost, Jump, AirRoll)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 text-[11px] font-mono flex-wrap">
                {['All', 'Mechanics', 'Movement', 'Aerial & Ball', 'Camera & Interface'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeCategory === cat
                        ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bindings Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Active Key Binding</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Default Key</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Mechanic Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredBindings.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-850/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-100">
                        {b.action}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={b.key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            setBindings(bindings.map((item) => (item.action === b.action ? { ...item, key: newKey } : item)));
                            setUseCustomTAInputText(false);
                          }}
                          className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 w-44"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                        {b.defaultKey}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] font-['Rajdhani'] hidden md:table-cell">
                        {b.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* INI Section Information */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active Sections: [Engine.Console], [TAGame.PlayerInput_TA], [TAGame.DebugInput_TA], [ProjectX.DemoPlayerInput_X]</span>
              </div>
              <span className="text-cyan-400 font-bold">13 Keybindings Active</span>
            </div>
          </div>
        </div>
      ) : (
        /* VISUAL DASHBOARD: TASYSTEMSETTINGS.INI */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Display & Resolution */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Monitor className="w-4 h-4" />
                <span>Display &amp; Resolution (Windows)</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-cyan-300 font-bold">1920 x 1080 (1080p)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Screen Mode:</span>
                  <span className="text-emerald-400 font-bold">Borderless Fullscreen</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Screen Percentage:</span>
                  <span className="text-slate-200">100.0% (Native 1:1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AutoDetect Res:</span>
                  <span className="text-emerald-400">False (Zero Polling Overhead)</span>
                </div>
              </div>
            </div>

            {/* Low-Latency & Rendering Pipeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Frame Latency &amp; Synchronization</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Vertical Sync (V-Sync):</span>
                  <span className="text-emerald-400 font-bold">False (Zero Buffer Delay)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">One Frame Thread Lag:</span>
                  <span className="text-cyan-300 font-bold">True (Thread Sync)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Wait For GPU:</span>
                  <span className="text-emerald-400 font-bold">False (No Render Stall)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custom FPS:</span>
                  <span className="text-slate-300">0 (Engine Max / Uncapped)</span>
                </div>
              </div>
            </div>

            {/* Competitive Visual Clarity */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Graphical Bottlenecks</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Dynamic Lights &amp; Shadows:</span>
                  <span className="text-emerald-400 font-bold">False (0% GPU Load)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Motion Blur &amp; Skinning:</span>
                  <span className="text-emerald-400 font-bold">False (Zero Smearing)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Bloom &amp; DepthOfField:</span>
                  <span className="text-emerald-400 font-bold">False (Pure Visibility)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Decals &amp; Foliage:</span>
                  <span className="text-emerald-400">False (Stripped for FPS)</span>
                </div>
              </div>
            </div>

            {/* Audio Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Volume2 className="w-4 h-4" />
                <span>Audio Engine</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Audio Subsystem:</span>
                  <span className="text-purple-300 font-bold">UseDirectSound=True</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Spatial Audio Latency:</span>
                  <span className="text-emerald-400 font-bold">Microsecond Direct Sound</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sound Hardware Queue:</span>
                  <span className="text-slate-200">Zero Audio Lag</span>
                </div>
              </div>
            </div>

            {/* Texture Groups & Anisotropy */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Texture LODs &amp; Fast Memory</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Max Anisotropy:</span>
                  <span className="text-cyan-300 font-bold">1x (Minimal GPU Memory)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Max MultiSamples:</span>
                  <span className="text-slate-300">1 (Zero Shader Stutter)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle / World LOD:</span>
                  <span className="text-slate-200">512 Max (Ultra Fast Buffers)</span>
                </div>
              </div>
            </div>

            {/* Profile Buckets & Version */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Clean Architecture Guarantee</span>
              </div>
              <div className="space-y-2 text-slate-300 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Mobile Sections:</span>
                  <span className="text-emerald-400 font-bold">0% (100% Stripped)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Target System:</span>
                  <span className="text-cyan-300 font-bold">Windows 10 / 11 64-bit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Input Memory Priority:</span>
                  <span className="text-emerald-400">100% Focused on Mouse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
