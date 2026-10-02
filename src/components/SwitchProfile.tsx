import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Zap,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Gauge,
  Info,
  Layers,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MacroConfig } from '../types';

export interface MechanicalSwitchPreset {
  id: string;
  name: string;
  category: 'linear' | 'tactile' | 'clicky' | 'optical' | 'membrane';
  stemColor: string;
  accentBorder: string;
  accentBg: string;
  actuationForceG: number;
  preTravelMm: number;
  totalTravelMm: number;
  debounceLatencyMs: number;
  hysteresisMm: number;
  description: string;
  typicalSwitches: string[];
  offsets: {
    speedflipJump2Delay: number;
    fastAerialJump2Delay: number;
    chaindashPause: number;
    hardwareJitter: number;
    speedflipCancelHold: number;
  };
}

export const SWITCH_PRESETS: MechanicalSwitchPreset[] = [
  {
    id: 'optical',
    name: 'Ultra-Fast Optical / Hall Effect',
    category: 'optical',
    stemColor: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
    accentBorder: 'border-purple-500/50 hover:border-purple-400',
    accentBg: 'from-purple-950/40 via-slate-900 to-slate-950',
    actuationForceG: 40,
    preTravelMm: 0.8,
    totalTravelMm: 3.4,
    debounceLatencyMs: 0.2,
    hysteresisMm: 0.05,
    description: 'Light barrier or magnetic hall-effect sensors with zero physical contact bounce. Enables instant sub-frame flip cancels.',
    typicalSwitches: ['Razer Optical Gen-3', 'Wooting Lekker Magnetic', 'Logitech Lightforce Hybrid', 'SteelSeries OmniPoint'],
    offsets: {
      speedflipJump2Delay: 24,
      fastAerialJump2Delay: 24,
      chaindashPause: 46,
      hardwareJitter: 1,
      speedflipCancelHold: 580,
    },
  },
  {
    id: 'linear',
    name: 'Linear Mechanical (Red / Speed)',
    category: 'linear',
    stemColor: 'text-rose-400 bg-rose-500/20 border-rose-500/50',
    accentBorder: 'border-rose-500/50 hover:border-rose-400',
    accentBg: 'from-rose-950/40 via-slate-900 to-slate-950',
    actuationForceG: 45,
    preTravelMm: 1.8,
    totalTravelMm: 3.8,
    debounceLatencyMs: 1.5,
    hysteresisMm: 0.15,
    description: 'Smooth, consistent downward keystroke without tactile resistance. Favored by RLCS pros for rapid double-taps.',
    typicalSwitches: ['Cherry MX Red / Speed Silver', 'Gateron Oil King / Yellow', 'TTC Gold Pink', 'Kailh Box Red'],
    offsets: {
      speedflipJump2Delay: 28,
      fastAerialJump2Delay: 28,
      chaindashPause: 54,
      hardwareJitter: 1,
      speedflipCancelHold: 600,
    },
  },
  {
    id: 'tactile',
    name: 'Tactile Mechanical (Brown / Panda)',
    category: 'tactile',
    stemColor: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
    accentBorder: 'border-amber-500/50 hover:border-amber-400',
    accentBg: 'from-amber-950/40 via-slate-900 to-slate-950',
    actuationForceG: 55,
    preTravelMm: 2.0,
    totalTravelMm: 4.0,
    debounceLatencyMs: 3.2,
    hysteresisMm: 0.35,
    description: 'Provides a tactile bump at the actuation point. Requires slightly expanded timing windows to account for return spring reset.',
    typicalSwitches: ['Cherry MX Brown', 'Glorious Panda', 'Boba U4T', 'Durock T1 / Koala'],
    offsets: {
      speedflipJump2Delay: 32,
      fastAerialJump2Delay: 32,
      chaindashPause: 62,
      hardwareJitter: 2,
      speedflipCancelHold: 620,
    },
  },
  {
    id: 'clicky',
    name: 'Clicky Mechanical (Blue / Box White)',
    category: 'clicky',
    stemColor: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
    accentBorder: 'border-cyan-500/50 hover:border-cyan-400',
    accentBg: 'from-cyan-950/40 via-slate-900 to-slate-950',
    actuationForceG: 60,
    preTravelMm: 2.2,
    totalTravelMm: 4.0,
    debounceLatencyMs: 5.5,
    hysteresisMm: 0.7,
    description: 'Click jacket or click bar produces crisp acoustic feedback with noticeable hysteresis reset distance before rebound.',
    typicalSwitches: ['Cherry MX Blue / Green', 'Kailh Box White / Jade', 'Razer Green Clicky'],
    offsets: {
      speedflipJump2Delay: 36,
      fastAerialJump2Delay: 35,
      chaindashPause: 70,
      hardwareJitter: 3,
      speedflipCancelHold: 650,
    },
  },
  {
    id: 'membrane',
    name: 'Membrane / Scissor / High Debounce',
    category: 'membrane',
    stemColor: 'text-slate-400 bg-slate-700/30 border-slate-600/50',
    accentBorder: 'border-slate-700 hover:border-slate-500',
    accentBg: 'from-slate-900 via-slate-950 to-slate-950',
    actuationForceG: 65,
    preTravelMm: 2.5,
    totalTravelMm: 3.5,
    debounceLatencyMs: 9.0,
    hysteresisMm: 0.9,
    description: 'Rubber dome contact sheets with gradual resistance curve and high electrical contact bounce. Uses robust smoothing filters.',
    typicalSwitches: ['Standard Office Membrane', 'Laptop Scissor Switches', 'Low-Profile Dome'],
    offsets: {
      speedflipJump2Delay: 40,
      fastAerialJump2Delay: 38,
      chaindashPause: 76,
      hardwareJitter: 3,
      speedflipCancelHold: 680,
    },
  },
];

interface SwitchProfileProps {
  config: MacroConfig;
  onUpdateConfig: (newConfig: MacroConfig) => void;
}

export const SwitchProfile: React.FC<SwitchProfileProps> = ({ config, onUpdateConfig }) => {
  const [selectedSwitchId, setSelectedSwitchId] = useState<string>('linear');
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  const selectedPreset = useMemo(() => {
    return SWITCH_PRESETS.find((p) => p.id === selectedSwitchId) || SWITCH_PRESETS[1];
  }, [selectedSwitchId]);

  // Handle applying switch offsets to MacroConfig
  const handleApplySwitchProfile = (preset: MechanicalSwitchPreset) => {
    onUpdateConfig({
      ...config,
      speedflipJump2Delay: preset.offsets.speedflipJump2Delay,
      fastAerialJump2Delay: preset.offsets.fastAerialJump2Delay,
      chaindashPause: preset.offsets.chaindashPause,
      hardwareJitter: preset.offsets.hardwareJitter,
      speedflipCancelHold: preset.offsets.speedflipCancelHold,
    });

    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-500/40">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Mechanical Switch Profile Calibrator
              </h2>
              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                PHYSICAL ACTUATION COMPENSATION
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Every mechanical keyboard and mouse switch features distinct pre-travel distances, debounce chatter, and hysteresis return gaps. Select your hardware switch type below to automatically recalibrate all macro cancellation and delay intervals.
            </p>
          </div>

          <button
            onClick={() => handleApplySwitchProfile(selectedPreset)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition-all shadow-md active:scale-95 ${
              appliedNotification
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
            }`}
          >
            {appliedNotification ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{appliedNotification ? 'SWITCH TIMINGS APPLIED!' : 'APPLY PROFILE TO ENGINE'}</span>
          </button>
        </div>
      </div>

      {/* Switch Type Selection Cards Grid (5 Types) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {SWITCH_PRESETS.map((preset) => {
          const isSelected = selectedSwitchId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setSelectedSwitchId(preset.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden bg-gradient-to-b ${
                preset.accentBg
              } ${
                isSelected
                  ? 'border-rose-400 ring-2 ring-rose-500/40 shadow-xl shadow-rose-500/10 scale-[1.02]'
                  : `${preset.accentBorder} opacity-85 hover:opacity-100`
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${preset.stemColor}`}>
                    {preset.category}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-rose-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 leading-snug">
                  {preset.name}
                </h3>

                <p className="text-[11px] text-slate-400 font-['Rajdhani'] mt-1.5 line-clamp-3 leading-tight">
                  {preset.description}
                </p>
              </div>

              {/* Physical Specs Strip */}
              <div className="space-y-1 pt-2 border-t border-slate-800 text-[10px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actuation:</span>
                  <strong className="text-white">{preset.actuationForceG}g • {preset.preTravelMm}mm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Debounce:</span>
                  <span className="text-cyan-400 font-bold">~{preset.debounceLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hysteresis:</span>
                  <span>{preset.hysteresisMm} mm</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Switch Analysis & Offset Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Timing Offset Calibration Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-rose-400" />
              <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 uppercase">
                Calibrated Timing Offsets: {selectedPreset.name}
              </h3>
            </div>
            <span className="text-xs text-slate-400">Current vs Recommended</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Speedflip 2nd Jump Delay */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Speedflip Jump 2 Delay</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 line-through text-xs">{config.speedflipJump2Delay} ms</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-base font-bold text-rose-300 font-['Chakra_Petch']">
                  {selectedPreset.offsets.speedflipJump2Delay} ms
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                {selectedPreset.offsets.speedflipJump2Delay < config.speedflipJump2Delay
                  ? `-${config.speedflipJump2Delay - selectedPreset.offsets.speedflipJump2Delay}ms tighter cancel`
                  : `+${selectedPreset.offsets.speedflipJump2Delay - config.speedflipJump2Delay}ms debounce buffer`}
              </span>
            </div>

            {/* 2. Fast Aerial 2nd Jump Delay */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Fast Aerial 2nd Jump Delay</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 line-through text-xs">{config.fastAerialJump2Delay} ms</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-base font-bold text-rose-300 font-['Chakra_Petch']">
                  {selectedPreset.offsets.fastAerialJump2Delay} ms
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Microsecond pitch-up compensation
              </span>
            </div>

            {/* 3. Chain Dash Pause */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Chain Dash Pause Window</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 line-through text-xs">{config.chaindashPause} ms</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-base font-bold text-rose-300 font-['Chakra_Petch']">
                  {selectedPreset.offsets.chaindashPause} ms
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Wheel/switch rebound settle interval
              </span>
            </div>

            {/* 4. Hardware Jitter Smoothing */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Hardware Jitter Filter</span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 line-through text-xs">Level {config.hardwareJitter}</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-base font-bold text-rose-300 font-['Chakra_Petch']">
                  Level {selectedPreset.offsets.hardwareJitter}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                Debounce contact filter strength
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleApplySwitchProfile(selectedPreset)}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>APPLY [{selectedPreset.name.toUpperCase()}] TIMINGS TO ENGINE</span>
            </button>
          </div>
        </div>

        {/* Right Column: Switch Physics & Compatibility Guide (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl text-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200 uppercase">
              Physical Switch Characteristics
            </h4>
          </div>

          <div className="space-y-2 font-['Rajdhani'] text-slate-300 leading-relaxed">
            <p>
              When a mechanical switch actuates, electrical contacts physically chatter before settling into a closed circuit (contact bounce). Logitech G-Hub and Rocket League input hooks must filter this bounce.
            </p>
            <p>
              Selecting <strong>{selectedPreset.name}</strong> automatically calibrates the Lua engine to anticipate your exact physical actuation profile, eliminating backflip dodge-deadzone misfires.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <span className="text-slate-400 font-bold block">Popular Matching Keyboards &amp; Mice:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedPreset.typicalSwitches.map((name, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
