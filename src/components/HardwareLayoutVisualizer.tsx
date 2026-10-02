import React, { useState } from 'react';
import {
  MousePointer,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  Flame,
  Shield,
  Info,
  Check,
  ChevronRight,
  RotateCcw,
  Target,
} from 'lucide-react';
import { MacroConfig } from '../types';

interface HardwareLayoutVisualizerProps {
  config: MacroConfig;
  onUpdateConfig?: (newConfig: MacroConfig) => void;
}

export interface G502XButtonInfo {
  id: string;
  name: string;
  logitechCode: string;
  defaultRole: string;
  svgPosition: { x: number; y: number };
  category: 'primary' | 'macro' | 'dpi' | 'wheel';
}

export const G502X_BUTTONS: G502XButtonInfo[] = [
  {
    id: 'mb1',
    name: 'Primary Left Click',
    logitechCode: 'Button 1 / MB1',
    defaultRole: 'In-Game Boost / Primary Action',
    svgPosition: { x: 135, y: 120 },
    category: 'primary',
  },
  {
    id: 'mb2',
    name: 'Secondary Right Click',
    logitechCode: 'Button 2 / MB2',
    defaultRole: 'In-Game Jump / Dodge',
    svgPosition: { x: 265, y: 120 },
    category: 'primary',
  },
  {
    id: 'mb3',
    name: 'Scroll Wheel Click',
    logitechCode: 'Button 3 / MMB',
    defaultRole: 'Master Engine Script Toggle (Bypass / Enable)',
    svgPosition: { x: 200, y: 110 },
    category: 'wheel',
  },
  {
    id: 'wheel_left',
    name: 'Scroll Wheel Tilt Left',
    logitechCode: 'Tilt Left',
    defaultRole: 'Air Roll Left Quick-Spin',
    svgPosition: { x: 175, y: 110 },
    category: 'wheel',
  },
  {
    id: 'wheel_right',
    name: 'Scroll Wheel Tilt Right',
    logitechCode: 'Tilt Right',
    defaultRole: 'Air Roll Right Quick-Spin',
    svgPosition: { x: 225, y: 110 },
    category: 'wheel',
  },
  {
    id: 'wheel_mode',
    name: 'Dual-Mode Wheel Toggle',
    logitechCode: 'Mechanical Switch',
    defaultRole: 'Hyperfast / Click-to-Click Ratchet Scroll',
    svgPosition: { x: 200, y: 155 },
    category: 'wheel',
  },
  {
    id: 'g8',
    name: 'DPI Up Button (G8)',
    logitechCode: 'G8 (Left of MB1)',
    defaultRole: 'DPI Up / Sensitivity Shift (+)',
    svgPosition: { x: 95, y: 105 },
    category: 'dpi',
  },
  {
    id: 'g7',
    name: 'DPI Down Button (G7)',
    logitechCode: 'G7 (Left of MB1)',
    defaultRole: 'Hardware Jitter Smoothing Level (-)',
    svgPosition: { x: 95, y: 145 },
    category: 'dpi',
  },
  {
    id: 'g9',
    name: 'Profile Switch (G9)',
    logitechCode: 'G9 (Behind Wheel)',
    defaultRole: 'Engine Preset Shift (Competitive / Freestyle / Ground)',
    svgPosition: { x: 200, y: 195 },
    category: 'dpi',
  },
  {
    id: 'g6',
    name: 'Reversible DPI Shift / Sniper (G6)',
    logitechCode: 'G6 (Thumb Front)',
    defaultRole: 'Fast Aerial Double-Jump Launch Macro',
    svgPosition: { x: 60, y: 220 },
    category: 'macro',
  },
  {
    id: 'mb4',
    name: 'Forward Side Button (G4 / MB4)',
    logitechCode: 'Button 4 / MB4',
    defaultRole: 'Diagonal Speedflip Kickoff Macro (30ms Flip-Cancel)',
    svgPosition: { x: 65, y: 175 },
    category: 'macro',
  },
  {
    id: 'mb5',
    name: 'Rear Side Button (G5 / MB5)',
    logitechCode: 'Button 5 / MB5',
    defaultRole: 'Continuous Wall / Ground Chain Dash Macro',
    svgPosition: { x: 65, y: 260 },
    category: 'macro',
  },
];

export const HardwareLayoutVisualizer: React.FC<HardwareLayoutVisualizerProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeButtonId, setActiveButtonId] = useState<string>('mb4');
  const [filterCategory, setFilterCategory] = useState<'all' | 'macro' | 'primary' | 'dpi' | 'wheel'>('all');

  // Dynamically resolve what each button triggers based on active MacroConfig
  const getButtonAssignment = (btnId: string) => {
    switch (btnId) {
      case 'mb4':
        return {
          title: config.mouseSpeedflip === 4 ? 'Diagonal Speedflip Kickoff' : 'Custom Secondary Action',
          isMacro: true,
          macroType: 'Speedflip',
          badge: 'ACTIVE MACRO',
          description: `Executes instant 30ms diagonal jump cancel into powerslide roll recovery. Configured delay: ${config.speedflipCancelHold}ms hold.`,
          keysInjected: [config.keyJump, config.keyForward, config.keyLeft, config.keyPowerslide],
          timingDetails: `${config.speedflipJump1}ms jump1 -> ${config.speedflipJump2Delay}ms delay -> ${config.speedflipJump2}ms jump2`,
        };
      case 'mb5':
        return {
          title: config.mouseChaindash === 5 ? 'Continuous Chain Dash' : 'Custom Recovery Action',
          isMacro: true,
          macroType: 'Chaindash',
          badge: 'ACTIVE MACRO',
          description: `Rapid 120Hz contact loop for high-speed wall recovery and zero-boost supersonic propulsion.`,
          keysInjected: [config.keyJump, config.keyPowerslide],
          timingDetails: `${config.chaindashJump1}ms jump -> ${config.chaindashPause}ms pause -> ${config.chaindashJump2}ms rebound`,
        };
      case 'mb3':
        return {
          title: config.mouseToggle === 3 ? 'Master Engine Script Toggle' : 'Middle Click',
          isMacro: true,
          macroType: 'Toggle',
          badge: 'ENGINE TOGGLE',
          description: `Press to instantly engage or bypass Logitech Lua Engine hooks. Green/Red RGB state sync.`,
          keysInjected: ['Hardware Hook Bypass'],
          timingDetails: '0ms hardware state interrupt',
        };
      case 'g6':
        return {
          title: 'Fast Aerial Double-Jump Launch',
          isMacro: true,
          macroType: 'Fast Aerial',
          badge: 'G-KEY MACRO',
          description: `Fires immediate first jump + continuous boost with micro-timed pitch cancel into 2nd aerial jump.`,
          keysInjected: [config.keyJump, config.keyBoost, config.keyBack],
          timingDetails: `${config.fastAerialJump1}ms jump1 -> ${config.fastAerialJump2Delay}ms delay -> ${config.fastAerialCancelDelay}ms pitch cancel`,
        };
      case 'mb1':
        return {
          title: `In-Game Boost (${config.keyBoost.toUpperCase()})`,
          isMacro: false,
          badge: 'IN-GAME ACTION',
          description: 'Primary vehicle propulsion mapped to Logitech Lightforce optical-mechanical left click.',
          keysInjected: [config.keyBoost],
          timingDetails: 'Zero-debounce sub-1ms contact dispatch',
        };
      case 'mb2':
        return {
          title: `In-Game Jump / Dodge (${config.keyJump.toUpperCase()})`,
          isMacro: false,
          badge: 'IN-GAME ACTION',
          description: 'Primary jump, flip trigger, and aerial initiate mapped to right click.',
          keysInjected: [config.keyJump],
          timingDetails: 'Lightforce hybrid switch response',
        };
      case 'wheel_left':
        return {
          title: `Directional Air Roll Left (${config.keyAirrollL.toUpperCase()})`,
          isMacro: false,
          badge: 'TILT CONTROL',
          description: 'Tilt scroll wheel leftward for directional air roll barrel-roll rotations.',
          keysInjected: [config.keyAirrollL],
          timingDetails: 'Instant mechanical tilt trigger',
        };
      case 'wheel_right':
        return {
          title: `Directional Air Roll Right (${config.keyAirrollR.toUpperCase()})`,
          isMacro: false,
          badge: 'TILT CONTROL',
          description: 'Tilt scroll wheel rightward for reverse directional air roll recoveries.',
          keysInjected: [config.keyAirrollR],
          timingDetails: 'Instant mechanical tilt trigger',
        };
      case 'g7':
        return {
          title: `Anti-Jitter Filter Shift (${config.hardwareJitter})`,
          isMacro: false,
          badge: 'HARDWARE UTILITY',
          description: 'Decreases hardware smoothing jitter buffer (Level 1, 2, or 3).',
          keysInjected: ['Engine Jitter Gate'],
          timingDetails: `Current level: ${config.hardwareJitter}`,
        };
      case 'g8':
        return {
          title: 'USB Report Rate / DPI Shift',
          isMacro: false,
          badge: 'HARDWARE UTILITY',
          description: 'Cycles USB polling rate between 1000Hz, 2000Hz, and 4000Hz in Logitech G-Hub.',
          keysInjected: ['HID Polling'],
          timingDetails: '1000Hz (1.0ms) / 2000Hz (0.5ms) / 4000Hz (0.25ms)',
        };
      case 'g9':
        return {
          title: 'Macro Engine Preset Cycle',
          isMacro: false,
          badge: 'PRESET CYCLE',
          description: 'Cycles active physics presets between RLCS LAN, Freestyler, and Ground Control.',
          keysInjected: ['Profile Shift'],
          timingDetails: 'Cycles deadzone & multipliers in memory',
        };
      case 'wheel_mode':
        return {
          title: 'Mechanical Hyperfast Scroll Release',
          isMacro: false,
          badge: 'PHYSICAL SWITCH',
          description: 'Toggles frictionless free-spin scroll wheel mode for rapid multi-jump contacts.',
          keysInjected: ['Hardware Wheel Clutch'],
          timingDetails: 'Mechanical gear clutch toggle',
        };
      default:
        return {
          title: 'Logitech G502X Assignable Control',
          isMacro: false,
          badge: 'ASSIGNABLE',
          description: 'Programmable button ready for macro or key assignment.',
          keysInjected: [],
          timingDetails: 'G-Hub assignable',
        };
    }
  };

  const activeBtn = G502X_BUTTONS.find((b) => b.id === activeButtonId) || G502X_BUTTONS[10];
  const activeAssignment = getButtonAssignment(activeBtn.id);

  const filteredButtons = G502X_BUTTONS.filter((b) => {
    if (filterCategory === 'all') return true;
    return b.category === filterCategory;
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                <MousePointer className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Logitech G502 X Hardware Layout Visualizer
              </h2>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                13 PROGRAMMABLE CONTROLS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Interactive physical schematic of the iconic Logitech G502 X esports gaming mouse. Hover over any physical button or switch to inspect assigned Rocket League macros, in-game actions, and micro-timing loops.
            </p>
          </div>

          {/* Quick Filter Categories */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(['all', 'macro', 'primary', 'dpi', 'wheel'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filterCategory === cat
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All 13 Controls' : cat === 'macro' ? 'Macro Triggers' : cat === 'primary' ? 'Primary Clicks' : cat === 'dpi' ? 'DPI / G-Keys' : 'Wheel Cluster'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Schematic (7 cols) + Button Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Vector Diagram of G502 X (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {/* Subtle Grid Lines in Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Active Highlight Banner */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3 mb-4 z-10">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Target className="w-4 h-4" /> Selected Control:
            </span>
            <span className="text-white font-['Chakra_Petch'] font-bold text-sm bg-slate-900 px-3 py-0.5 rounded-full border border-cyan-500/40">
              {activeBtn.name} ({activeBtn.logitechCode})
            </span>
          </div>

          {/* Vector SVG Schematic of Logitech G502 X */}
          <div className="w-full max-w-[420px] aspect-[4/5] relative z-10 flex items-center justify-center select-none">
            <svg
              viewBox="0 0 400 500"
              className="w-full h-full drop-shadow-[0_0_25px_rgba(6,182,212,0.15)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Mouse Chassis Silhouette */}
              <defs>
                <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="60%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#090d16" />
                </linearGradient>
                <linearGradient id="primaryClickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="thumbWingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#090d16" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Thumb Rest Flange (Left Wing) */}
              <path
                d="M 120 180 C 70 200, 30 250, 40 320 C 50 370, 95 390, 130 400 Z"
                fill="url(#thumbWingGrad)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Textured Grip Ridges on Thumb Rest */}
              <path d="M 60 270 Q 75 285 95 295" stroke="#475569" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 55 290 Q 72 305 92 315" stroke="#475569" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 52 310 Q 70 325 90 335" stroke="#475569" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Main Body Shell */}
              <path
                d="M 130 90 C 130 60, 200 45, 270 90 C 310 130, 335 220, 330 330 C 325 410, 270 470, 200 470 C 130 470, 95 410, 110 330 C 120 250, 110 150, 130 90 Z"
                fill="url(#chassisGrad)"
                stroke="#475569"
                strokeWidth="2.5"
              />

              {/* Palm Rest Ergonomic Sculpt Line */}
              <path
                d="M 140 260 C 180 280, 240 280, 290 260"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                opacity="0.4"
              />

              {/* Logitech G Logo Emitting Glow on Palm */}
              <circle cx="205" cy="370" r="18" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" opacity="0.7" />
              <text
                x="205"
                y="375"
                fill="#38bdf8"
                fontSize="12"
                fontFamily="Chakra Petch"
                fontWeight="bold"
                textAnchor="middle"
              >
                G
              </text>

              {/* --- INTERACTIVE BUTTON PATHS --- */}

              {/* 1. Left Click (MB1) */}
              <path
                id="btn-mb1"
                d="M 128 85 C 135 60, 185 50, 192 50 L 192 190 L 122 180 Z"
                fill={activeButtonId === 'mb1' ? '#0284c7' : 'url(#primaryClickGrad)'}
                stroke={activeButtonId === 'mb1' ? '#38bdf8' : '#64748b'}
                strokeWidth={activeButtonId === 'mb1' ? '3' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('mb1')}
                onClick={() => setActiveButtonId('mb1')}
              />

              {/* 2. Right Click (MB2) */}
              <path
                id="btn-mb2"
                d="M 208 50 C 215 50, 265 60, 272 85 L 285 180 L 208 190 Z"
                fill={activeButtonId === 'mb2' ? '#0284c7' : 'url(#primaryClickGrad)'}
                stroke={activeButtonId === 'mb2' ? '#38bdf8' : '#64748b'}
                strokeWidth={activeButtonId === 'mb2' ? '3' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('mb2')}
                onClick={() => setActiveButtonId('mb2')}
              />

              {/* 3. G8 Button (DPI Up - Left of MB1) */}
              <polygon
                points="95,90 120,95 118,125 90,118"
                fill={activeButtonId === 'g8' ? '#f59e0b' : '#334155'}
                stroke={activeButtonId === 'g8' ? '#fbbf24' : '#64748b'}
                strokeWidth={activeButtonId === 'g8' ? '2.5' : '1'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('g8')}
                onClick={() => setActiveButtonId('g8')}
              />
              <text x="104" y="112" fill="#e2e8f0" fontSize="8" fontWeight="bold" pointerEvents="none">
                G8
              </text>

              {/* 4. G7 Button (DPI Down - Behind G8) */}
              <polygon
                points="90,128 118,135 115,165 88,155"
                fill={activeButtonId === 'g7' ? '#f59e0b' : '#334155'}
                stroke={activeButtonId === 'g7' ? '#fbbf24' : '#64748b'}
                strokeWidth={activeButtonId === 'g7' ? '2.5' : '1'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('g7')}
                onClick={() => setActiveButtonId('g7')}
              />
              <text x="101" y="150" fill="#e2e8f0" fontSize="8" fontWeight="bold" pointerEvents="none">
                G7
              </text>

              {/* 5. Scroll Wheel Well & Wheel Body */}
              <rect x="188" y="70" width="24" height="75" rx="12" fill="#020617" stroke="#475569" strokeWidth="2" />

              {/* Scroll Wheel Texture / Tread */}
              <rect
                x="192"
                y="75"
                width="16"
                height="65"
                rx="8"
                fill={activeButtonId === 'mb3' ? '#06b6d4' : '#1e293b'}
                stroke={activeButtonId === 'mb3' ? '#38bdf8' : '#64748b'}
                strokeWidth={activeButtonId === 'mb3' ? '2.5' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('mb3')}
                onClick={() => setActiveButtonId('mb3')}
              />

              {/* Tilt Left Indicator */}
              <path
                d="M 184 100 L 180 108 L 184 116"
                stroke={activeButtonId === 'wheel_left' ? '#38bdf8' : '#64748b'}
                strokeWidth="2.5"
                fill="none"
                className="cursor-pointer"
                onMouseEnter={() => setActiveButtonId('wheel_left')}
                onClick={() => setActiveButtonId('wheel_left')}
              />

              {/* Tilt Right Indicator */}
              <path
                d="M 216 100 L 220 108 L 216 116"
                stroke={activeButtonId === 'wheel_right' ? '#38bdf8' : '#64748b'}
                strokeWidth="2.5"
                fill="none"
                className="cursor-pointer"
                onMouseEnter={() => setActiveButtonId('wheel_right')}
                onClick={() => setActiveButtonId('wheel_right')}
              />

              {/* 6. Wheel Mode Shift Switch */}
              <rect
                x="193"
                y="152"
                width="14"
                height="18"
                rx="4"
                fill={activeButtonId === 'wheel_mode' ? '#38bdf8' : '#0f172a'}
                stroke="#64748b"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('wheel_mode')}
                onClick={() => setActiveButtonId('wheel_mode')}
              />

              {/* 7. G9 Profile Button */}
              <rect
                x="191"
                y="185"
                width="18"
                height="22"
                rx="5"
                fill={activeButtonId === 'g9' ? '#f59e0b' : '#1e293b'}
                stroke={activeButtonId === 'g9' ? '#fbbf24' : '#64748b'}
                strokeWidth="2"
                className="cursor-pointer hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('g9')}
                onClick={() => setActiveButtonId('g9')}
              />
              <text x="200" y="200" fill="#e2e8f0" fontSize="8" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                G9
              </text>

              {/* 8. MB4 Side Button (Forward Side) */}
              <polygon
                points="50,170 85,185 80,215 45,200"
                fill={activeButtonId === 'mb4' ? '#10b981' : '#1e293b'}
                stroke={activeButtonId === 'mb4' ? '#34d399' : '#64748b'}
                strokeWidth={activeButtonId === 'mb4' ? '3' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('mb4')}
                onClick={() => setActiveButtonId('mb4')}
              />
              <text x="63" y="197" fill="#ffffff" fontSize="9" fontWeight="bold" pointerEvents="none">
                MB4
              </text>

              {/* 9. G6 DPI Shift / Sniper Button (Front Tip of Thumb) */}
              <rect
                x="35"
                y="220"
                width="32"
                height="24"
                rx="6"
                fill={activeButtonId === 'g6' ? '#8b5cf6' : '#1e293b'}
                stroke={activeButtonId === 'g6' ? '#a78bfa' : '#64748b'}
                strokeWidth={activeButtonId === 'g6' ? '3' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('g6')}
                onClick={() => setActiveButtonId('g6')}
              />
              <text x="51" y="236" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                G6
              </text>

              {/* 10. MB5 Side Button (Rear Side) */}
              <polygon
                points="48,252 82,260 76,295 44,285"
                fill={activeButtonId === 'mb5' ? '#10b981' : '#1e293b'}
                stroke={activeButtonId === 'mb5' ? '#34d399' : '#64748b'}
                strokeWidth={activeButtonId === 'mb5' ? '3' : '1.5'}
                className="cursor-pointer transition-all duration-150 hover:brightness-125"
                onMouseEnter={() => setActiveButtonId('mb5')}
                onClick={() => setActiveButtonId('mb5')}
              />
              <text x="61" y="278" fill="#ffffff" fontSize="9" fontWeight="bold" pointerEvents="none">
                MB5
              </text>
            </svg>
          </div>

          {/* Interactive Hint */}
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-2 z-10">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hover or click any button to inspect physical switch specs &amp; micro-timings.</span>
          </div>
        </div>

        {/* Right Column: Button Inspector & Live Mapping Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Button Detailed Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                  {activeAssignment.badge}
                </span>
                <h3 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 mt-1">
                  {activeBtn.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Hardware Code: <strong className="text-cyan-400">{activeBtn.logitechCode}</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400">
                {activeAssignment.isMacro ? <Flame className="w-6 h-6 text-amber-400" /> : <MousePointer className="w-6 h-6 text-cyan-400" />}
              </div>
            </div>

            {/* Current Function Header */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Assigned Macro / Action</span>
              <div className="font-['Chakra_Petch'] font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">
                {activeAssignment.title}
              </div>
              <p className="text-xs text-slate-300 font-['Rajdhani'] leading-relaxed">
                {activeAssignment.description}
              </p>
            </div>

            {/* Timing Pipeline & Virtual Keys Injected */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                <span className="text-slate-400">Simulated Micro-Timing:</span>
                <span className="text-amber-300 font-mono font-bold">{activeAssignment.timingDetails}</span>
              </div>

              {activeAssignment.keysInjected.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Virtual Keys Dispatched:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeAssignment.keysInjected.map((k, idx) => (
                      <kbd
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold shadow-sm"
                      >
                        {k.toUpperCase()}
                      </kbd>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Rebind Action Trigger */}
            {onUpdateConfig && activeAssignment.isMacro && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Target Assignment:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (activeBtn.id === 'mb4') onUpdateConfig({ ...config, mouseSpeedflip: 4 });
                      else if (activeBtn.id === 'mb5') onUpdateConfig({ ...config, mouseChaindash: 5 });
                    }}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-sm"
                  >
                    Set as Default
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* All Buttons Quick List Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl max-h-56 overflow-y-auto pr-1">
            <span className="text-xs font-['Chakra_Petch'] font-bold text-slate-300 uppercase tracking-wide block mb-1">
              Quick Control Directory ({filteredButtons.length})
            </span>
            <div className="space-y-1">
              {filteredButtons.map((btn) => {
                const isSelected = activeButtonId === btn.id;
                const assignment = getButtonAssignment(btn.id);
                return (
                  <div
                    key={btn.id}
                    onClick={() => setActiveButtonId(btn.id)}
                    className={`p-2 rounded-xl border text-xs font-mono cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${assignment.isMacro ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
                      <strong className="text-slate-200">{btn.name}</strong>
                    </div>
                    <span className="text-[11px] text-cyan-400 truncate max-w-[170px] text-right font-medium">
                      {assignment.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
