import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Check,
  Copy,
  Download,
  Search,
  Sliders,
  Filter,
  Star,
  Users,
  Terminal,
  FileCode,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { MacroConfig } from '../types';
import { generateLuaScript, DEFAULT_MACRO_CONFIG } from '../data/defaultConfig';

export interface CommunityPreset {
  id: string;
  name: string;
  category: 'Competitive' | 'Freestyler' | 'Ground Control' | 'Low-Latency';
  author: string;
  rating: number;
  downloads: number;
  badge: string;
  description: string;
  highlights: string[];
  config: MacroConfig;
  recommendedHotkeys: {
    speedflip: string;
    chaindash: string;
    fastAerial: string;
  };
}

export const COMMUNITY_MACRO_PRESETS: CommunityPreset[] = [
  {
    id: 'competitive-rlcs',
    name: 'Competitive RLCS LAN Standard',
    category: 'Competitive',
    author: 'Zen / Vitality Meta',
    rating: 4.98,
    downloads: 14820,
    badge: 'RLCS LAN CERTIFIED',
    description: 'The tournament-proven competitive standard. Tight 0.05 radial deadzones prevent accidental backflips on kickoff while maintaining 100% directional aerial authority.',
    highlights: ['0.05 Internal Deadzone', '1.30 Ground / 1.50 Aerial Sense', '30ms Speedflip Cancel', 'Zero Hardware Jitter'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.05,
      dodgeDeadzone: 0.05,
      hardwareJitter: 1,
      groundSense: 1.3,
      aerialSense: 1.5,
      curveExponent: 1.4,
      fastAerialBoostHold: 300,
      fastAerialJump1: 200,
      fastAerialJump2Delay: 30,
      fastAerialCancelDelay: 150,
      speedflipJump1: 30,
      speedflipJump2Delay: 30,
      speedflipCancelHold: 600,
      chaindashJump1: 30,
      chaindashPause: 60,
    },
  },
  {
    id: 'freestyler-aerial',
    name: 'Freestyler Aerial Ascender',
    category: 'Freestyler',
    author: 'Pulse Clan / Evample',
    rating: 4.95,
    downloads: 11340,
    badge: 'FREESTYLE GOD',
    description: 'Engineered for high-altitude multi-flip resets and continuous directional air roll spins. Features elevated 1.80 aerial multiplier and an expanded 240ms fast aerial first jump.',
    highlights: ['1.80 Aerial Multiplier', '0.02 Ultra-Reactive Deadzone', '240ms Jump 1 Duration', 'Dual Air-Roll Smooth Gate'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.02,
      dodgeDeadzone: 0.04,
      hardwareJitter: 2,
      groundSense: 1.2,
      aerialSense: 1.8,
      curveExponent: 1.15,
      fastAerialBoostHold: 350,
      fastAerialJump1: 240,
      fastAerialJump2Delay: 25,
      fastAerialCancelDelay: 180,
      speedflipJump1: 25,
      speedflipJump2Delay: 25,
      speedflipCancelHold: 650,
      chaindashJump1: 30,
      chaindashPause: 50,
    },
  },
  {
    id: 'ground-control',
    name: 'Ground Control & Dribble Master',
    category: 'Ground Control',
    author: 'Flakes 1v1 Meta',
    rating: 4.92,
    downloads: 9850,
    badge: '1v1 DRIBBLE KING',
    description: 'Stabilized ground physics profile preventing accidental dodges when carrying the ball atop your roof. Linearized 0.08 deadzone gives pixel-perfect flick placement.',
    highlights: ['0.08 Antidrift Deadzone', '1.15 Controlled Ground Sense', '0.08 Dodge Threshold', 'Anti-Jitter Filter Level 3'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.08,
      dodgeDeadzone: 0.08,
      hardwareJitter: 3,
      groundSense: 1.15,
      aerialSense: 1.35,
      curveExponent: 1.6,
      fastAerialBoostHold: 280,
      fastAerialJump1: 180,
      fastAerialJump2Delay: 35,
      fastAerialCancelDelay: 140,
      speedflipJump1: 35,
      speedflipJump2Delay: 35,
      speedflipCancelHold: 550,
      chaindashJump1: 25,
      chaindashPause: 65,
    },
  },
  {
    id: 'kickoff-demon',
    name: 'Kickoff Demon (30ms Flip-Cancel)',
    category: 'Competitive',
    author: 'Scrub Killa',
    rating: 4.96,
    downloads: 13910,
    badge: 'SUB-FRAME KICKOFF',
    description: 'Zero-latency diagonal speedflip macro. Fires micro-timed 30ms jump cancels into automated powerslide roll recovery for consistent kickoff beatdowns.',
    highlights: ['30ms Micro-Timed Cancel', '0.03 Dodge Trigger', 'Instant Powerslide Recovery', '100% First-Touch Rate'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.03,
      dodgeDeadzone: 0.03,
      hardwareJitter: 1,
      groundSense: 1.35,
      aerialSense: 1.45,
      curveExponent: 1.3,
      fastAerialBoostHold: 300,
      fastAerialJump1: 190,
      fastAerialJump2Delay: 25,
      fastAerialCancelDelay: 140,
      speedflipJump1: 30,
      speedflipJump2Delay: 25,
      speedflipJump2: 20,
      speedflipCancelHold: 600,
      chaindashJump1: 25,
      chaindashPause: 45,
    },
  },
  {
    id: 'chain-dasher',
    name: 'Infinite Wall Chain-Dasher',
    category: 'Ground Control',
    author: 'AyyJayy Wall Tech',
    rating: 4.89,
    downloads: 8740,
    badge: 'SUPERSONIC RECOVERY',
    description: 'Optimized specifically for MB5 continuous wheel-contact chain dashes. Rapidly accelerates across side walls and curves with minimal boost expenditure.',
    highlights: ['45ms Rapid Contact Loop', 'MB5 Mouse Rebound Gate', '1.50 Wall Sensitivity', 'Zero-Boost Supersonic'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.04,
      dodgeDeadzone: 0.05,
      hardwareJitter: 1,
      groundSense: 1.5,
      aerialSense: 1.4,
      curveExponent: 1.4,
      fastAerialBoostHold: 280,
      fastAerialJump1: 180,
      fastAerialJump2Delay: 30,
      fastAerialCancelDelay: 130,
      speedflipJump1: 30,
      speedflipJump2Delay: 30,
      speedflipCancelHold: 550,
      chaindashJump1: 25,
      chaindashPause: 45,
      chaindashJump2: 25,
    },
  },
  {
    id: 'low-latency-240hz',
    name: '240Hz Low-Latency Ultra Pro',
    category: 'Low-Latency',
    author: 'Firstkiller Rig',
    rating: 4.97,
    downloads: 12450,
    badge: 'SUB-1MS POLLING',
    description: 'Engineered for 240Hz+ OLED monitors and 4000Hz Logitech G-Hub polling sensors. Features instantaneous sub-millisecond dispatch and hardware jitter suppression.',
    highlights: ['4000Hz USB Compatible', '0.02 Internal Deadzone', '0.03 Dodge Threshold', '4.16ms Physics Commit'],
    recommendedHotkeys: { speedflip: 'Mouse 4 (MB4)', chaindash: 'Mouse 5 (MB5)', fastAerial: 'G6 (Side)' },
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.02,
      dodgeDeadzone: 0.03,
      hardwareJitter: 1,
      groundSense: 1.35,
      aerialSense: 1.55,
      curveExponent: 1.35,
      fastAerialBoostHold: 280,
      fastAerialJump1: 180,
      fastAerialJump2Delay: 20,
      fastAerialCancelDelay: 120,
      speedflipJump1: 25,
      speedflipJump2Delay: 20,
      speedflipCancelHold: 580,
      chaindashJump1: 20,
      chaindashPause: 40,
      chaindashJump2: 20,
    },
  },
];

interface MacroLibraryProps {
  currentConfig: MacroConfig;
  onApplyPreset: (presetConfig: MacroConfig, presetName?: string) => void;
  onOpenLuaEditor?: () => void;
}

export const MacroLibrary: React.FC<MacroLibraryProps> = ({
  currentConfig,
  onApplyPreset,
  onOpenLuaEditor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);
  const [previewPreset, setPreviewPreset] = useState<CommunityPreset | null>(null);
  const [copiedLuaId, setCopiedLuaId] = useState<string | null>(null);

  const categories = ['All', 'Competitive', 'Freestyler', 'Ground Control', 'Low-Latency'];

  const filteredPresets = useMemo(() => {
    return COMMUNITY_MACRO_PRESETS.filter((preset) => {
      const matchesCategory = selectedCategory === 'All' || preset.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        preset.name.toLowerCase().includes(q) ||
        preset.author.toLowerCase().includes(q) ||
        preset.description.toLowerCase().includes(q) ||
        preset.badge.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleApply = (preset: CommunityPreset) => {
    onApplyPreset(preset.config, preset.name);
    setAppliedPresetId(preset.id);
    setTimeout(() => setAppliedPresetId(null), 2500);
  };

  const handleCopyLua = (preset: CommunityPreset) => {
    const luaScript = generateLuaScript(preset.config);
    navigator.clipboard.writeText(luaScript);
    setCopiedLuaId(preset.id);
    setTimeout(() => setCopiedLuaId(null), 2000);
  };

  const handleDownloadLua = (preset: CommunityPreset) => {
    const luaScript = generateLuaScript(preset.config);
    const blob = new Blob([luaScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RocketLeague_${preset.name.replace(/\s+/g, '_')}_GHub.lua`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 uppercase tracking-wide">
                Community Macro Presets Library
              </h2>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                PRO VERIFIED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Explore pre-calibrated, tournament-tested Logitech G-Hub macro configurations crafted by competitive RLCS pros, freestylers, and 1v1 specialists. Apply any preset with a single click.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300">
            <div className="text-center px-2">
              <span className="text-cyan-400 font-bold block text-base">{COMMUNITY_MACRO_PRESETS.length}</span>
              <span className="text-[10px] text-slate-500 uppercase">Presets</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-center px-2">
              <span className="text-amber-400 font-bold block text-base">4.95</span>
              <span className="text-[10px] text-slate-500 uppercase">Avg Rating</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-center px-2">
              <span className="text-emerald-400 font-bold block text-base">71k+</span>
              <span className="text-[10px] text-slate-500 uppercase">Downloads</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? COMMUNITY_MACRO_PRESETS.length
                  : COMMUNITY_MACRO_PRESETS.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1 rounded-full ${
                    selectedCategory === cat ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by preset, author, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64 sm:w-72 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => {
          const isApplied = appliedPresetId === preset.id;
          const isCurrentlyActive =
            currentConfig.internalDeadzone === preset.config.internalDeadzone &&
            currentConfig.dodgeDeadzone === preset.config.dodgeDeadzone &&
            currentConfig.groundSense === preset.config.groundSense &&
            currentConfig.aerialSense === preset.config.aerialSense;

          return (
            <div
              key={preset.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl group relative overflow-hidden ${
                isCurrentlyActive
                  ? 'border-cyan-500/80 shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {isCurrentlyActive && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-cyan-600 text-slate-950 font-bold text-[9px] font-mono uppercase px-3 py-0.5 rounded-bl-xl shadow-md">
                  Active in Engine
                </div>
              )}

              <div>
                {/* Header: Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                    preset.category === 'Competitive'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : preset.category === 'Freestyler'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : preset.category === 'Ground Control'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {preset.category}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{preset.rating.toFixed(2)}</span>
                    <span className="text-slate-500 text-[10px]">({preset.downloads.toLocaleString()})</span>
                  </div>
                </div>

                {/* Preset Title & Author */}
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 mb-2.5">
                  by <strong className="text-slate-300">{preset.author}</strong>
                </p>

                {/* Description */}
                <p className="text-xs text-slate-300 font-['Rajdhani'] leading-relaxed mb-3.5 line-clamp-3">
                  {preset.description}
                </p>

                {/* Highlights Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {preset.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Config Snapshot Strip */}
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono grid grid-cols-2 gap-2 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Deadzone:</span>
                    <span className="text-cyan-400 font-bold">{preset.config.internalDeadzone.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dodge DZ:</span>
                    <span className="text-cyan-400 font-bold">{preset.config.dodgeDeadzone.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ground Sense:</span>
                    <span className="text-slate-200">{preset.config.groundSense.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Aerial Sense:</span>
                    <span className="text-slate-200">{preset.config.aerialSense.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApply(preset)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                      isApplied
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : isCurrentlyActive
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                    }`}
                  >
                    {isApplied ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    <span>{isApplied ? 'APPLIED!' : isCurrentlyActive ? 'RE-APPLY' : 'APPLY PRESET'}</span>
                  </button>

                  <button
                    onClick={() => setPreviewPreset(preset)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors border border-slate-700"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PREVIEW LUA</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <button
                    onClick={() => handleCopyLua(preset)}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    {copiedLuaId === preset.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadLua(preset)}
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .LUA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Lua Code Inspector Modal */}
      {previewPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 uppercase">
                    {previewPreset.name} • Lua Script Preview
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Category: <strong className="text-cyan-400">{previewPreset.category}</strong> by {previewPreset.author}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewPreset(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Generated Script Body */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/90 overflow-y-auto max-h-[380px] font-['JetBrains_Mono'] text-slate-300 leading-relaxed selection:bg-cyan-500/30">
              <pre className="whitespace-pre-wrap">
                {generateLuaScript(previewPreset.config)}
              </pre>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
              <div className="text-[11px] text-slate-400">
                <span>Fast Aerial: {previewPreset.config.fastAerialJump1}ms | Speedflip Cancel: {previewPreset.config.speedflipCancelHold}ms</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLua(previewPreset)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  {copiedLuaId === previewPreset.id ? 'COPIED!' : 'COPY SCRIPT'}
                </button>
                <button
                  onClick={() => handleDownloadLua(previewPreset)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  DOWNLOAD .LUA
                </button>
                <button
                  onClick={() => {
                    handleApply(previewPreset);
                    setPreviewPreset(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  APPLY PRESET NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
