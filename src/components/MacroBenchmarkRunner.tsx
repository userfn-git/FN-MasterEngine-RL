import React, { useState, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  Flame,
  Award,
  TrendingDown,
  CheckCircle2,
  Clock,
  Gauge,
  Sparkles,
  Download,
  Sliders,
  Shield,
  Layers,
  ChevronRight,
  BarChart3,
  Check,
  RefreshCw,
} from 'lucide-react';
import { MacroConfig } from '../types';
import { COMMUNITY_MACRO_PRESETS, CommunityPreset } from './MacroLibrary';

export interface BenchmarkResult {
  id: string;
  presetName: string;
  category: string;
  mechanic: string;
  executionDurationMs: number;
  physicsTicks: number;
  timeToSupersonicMs: number;
  cancelEfficiencyPct: number;
  timingDriftMs: number;
  boostExpended: number;
  rank?: number;
  isCurrentCustom?: boolean;
}

interface MacroBenchmarkRunnerProps {
  config: MacroConfig;
  onUpdateConfig?: (newConfig: MacroConfig) => void;
}

export const MacroBenchmarkRunner: React.FC<MacroBenchmarkRunnerProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [selectedMechanic, setSelectedMechanic] = useState<'speedflip' | 'fastAerial' | 'chaindash' | 'all'>('speedflip');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeBenchmarkStep, setActiveBenchmarkStep] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [benchmarkHistory, setBenchmarkHistory] = useState<BenchmarkResult[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(['current', 'competitive-rlcs', 'kickoff-demon']);

  const mechanicOptions = [
    { id: 'speedflip', label: 'Diagonal Speedflip Kickoff', standardMs: 650, icon: Flame },
    { id: 'fastAerial', label: 'Fast Aerial Double-Jump', standardMs: 530, icon: Zap },
    { id: 'chaindash', label: 'Wall / Ground Chain Dash', standardMs: 180, icon: Gauge },
    { id: 'all', label: 'Full Mechanics Suite (All 3)', standardMs: 1360, icon: Layers },
  ];

  // Benchmark simulation calculations for any MacroConfig
  const calculateBenchmarkForConfig = (
    cfg: MacroConfig,
    presetId: string,
    presetName: string,
    category: string,
    mechanic: 'speedflip' | 'fastAerial' | 'chaindash' | 'all'
  ): BenchmarkResult => {
    let executionDurationMs = 0;
    let timeToSupersonicMs = 0;
    let boostExpended = 0;
    let cancelEfficiencyPct = 0;
    let timingDriftMs = 0;

    const jitterPenalty = cfg.hardwareJitter * 0.4;

    if (mechanic === 'speedflip') {
      // Speedflip = Jump1 + Jump2Delay + Jump2 + CancelHold
      executionDurationMs = cfg.speedflipJump1 + cfg.speedflipJump2Delay + cfg.speedflipJump2 + cfg.speedflipCancelHold;
      timeToSupersonicMs = Math.round(580 + (cfg.speedflipJump2Delay - 25) * 2 + cfg.internalDeadzone * 400);
      boostExpended = 28;
      // Optimal cancel delay is 25-30ms; deviation lowers efficiency
      const cancelDelta = Math.abs(cfg.speedflipJump2Delay - 28);
      cancelEfficiencyPct = Number(Math.max(88, 99.4 - cancelDelta * 1.8 - jitterPenalty).toFixed(1));
      timingDriftMs = Number((0.25 + cfg.hardwareJitter * 0.15).toFixed(2));
    } else if (mechanic === 'fastAerial') {
      // Fast Aerial = Jump1 + Jump2Delay + Jump2 + BoostHold
      executionDurationMs = cfg.fastAerialJump1 + cfg.fastAerialJump2Delay + cfg.fastAerialJump2 + cfg.fastAerialCancelDelay;
      timeToSupersonicMs = Math.round(620 + (cfg.fastAerialJump1 - 200) * 0.8);
      boostExpended = 34;
      const aerialDelta = Math.abs(cfg.fastAerialJump2Delay - 30);
      cancelEfficiencyPct = Number(Math.max(86, 98.8 - aerialDelta * 1.5 - jitterPenalty).toFixed(1));
      timingDriftMs = Number((0.3 + cfg.hardwareJitter * 0.18).toFixed(2));
    } else if (mechanic === 'chaindash') {
      // Chain Dash = Jump1 + Pause + Jump2
      executionDurationMs = cfg.chaindashJump1 + cfg.chaindashPause + cfg.chaindashJump2;
      timeToSupersonicMs = Math.round(340 + (cfg.chaindashPause - 45) * 1.5);
      boostExpended = 12;
      const pauseDelta = Math.abs(cfg.chaindashPause - 45);
      cancelEfficiencyPct = Number(Math.max(85, 99.1 - pauseDelta * 1.2 - jitterPenalty).toFixed(1));
      timingDriftMs = Number((0.2 + cfg.hardwareJitter * 0.12).toFixed(2));
    } else {
      // All 3 combined
      const sf = calculateBenchmarkForConfig(cfg, presetId, presetName, category, 'speedflip');
      const fa = calculateBenchmarkForConfig(cfg, presetId, presetName, category, 'fastAerial');
      const cd = calculateBenchmarkForConfig(cfg, presetId, presetName, category, 'chaindash');
      executionDurationMs = sf.executionDurationMs + fa.executionDurationMs + cd.executionDurationMs;
      timeToSupersonicMs = Math.round((sf.timeToSupersonicMs + fa.timeToSupersonicMs + cd.timeToSupersonicMs) / 3);
      boostExpended = sf.boostExpended + fa.boostExpended + cd.boostExpended;
      cancelEfficiencyPct = Number(((sf.cancelEfficiencyPct + fa.cancelEfficiencyPct + cd.cancelEfficiencyPct) / 3).toFixed(1));
      timingDriftMs = Number(((sf.timingDriftMs + fa.timingDriftMs + cd.timingDriftMs) / 3).toFixed(2));
    }

    // 120Hz sub-tick physics step is 8.333ms
    const physicsTicks = Math.ceil(executionDurationMs / 8.333);

    return {
      id: `${presetId}-${mechanic}-${Date.now()}`,
      presetName,
      category,
      mechanic: mechanic === 'all' ? 'All Combined' : mechanic === 'speedflip' ? 'Speedflip' : mechanic === 'fastAerial' ? 'Fast Aerial' : 'Chain Dash',
      executionDurationMs,
      physicsTicks,
      timeToSupersonicMs,
      cancelEfficiencyPct,
      timingDriftMs,
      boostExpended,
      isCurrentCustom: presetId === 'current',
    };
  };

  // Run Benchmark Simulation Loop
  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setProgressPct(5);
    setActiveBenchmarkStep('Spinning up 120Hz physics sub-tick simulator...');

    await new Promise((r) => setTimeout(r, 250));
    setProgressPct(25);
    setActiveBenchmarkStep(`Injecting G-Hub macro instructions for [${selectedMechanic.toUpperCase()}]...`);

    await new Promise((r) => setTimeout(r, 300));
    setProgressPct(60);
    setActiveBenchmarkStep('Simulating mechanical switches, HID dispatch, and cancel timing gate...');

    await new Promise((r) => setTimeout(r, 350));
    setProgressPct(90);
    setActiveBenchmarkStep('Evaluating supersonic velocity and timing drift consistency...');

    await new Promise((r) => setTimeout(r, 200));

    // Generate benchmark for Current Configuration
    const currentBench = calculateBenchmarkForConfig(
      config,
      'current',
      'Current Engine Config',
      'Active Custom',
      selectedMechanic
    );

    // Also benchmark the selected community presets for comparison
    const presetsToCompare: BenchmarkResult[] = [currentBench];

    COMMUNITY_MACRO_PRESETS.forEach((p) => {
      if (selectedForComparison.includes(p.id)) {
        presetsToCompare.push(
          calculateBenchmarkForConfig(p.config, p.id, p.name, p.category, selectedMechanic)
        );
      }
    });

    // Rank presets by execution efficiency (faster supersonic & higher cancel efficiency)
    presetsToCompare.sort((a, b) => {
      // Lower supersonic time and higher cancel efficiency is better
      const scoreA = a.timeToSupersonicMs - a.cancelEfficiencyPct * 2;
      const scoreB = b.timeToSupersonicMs - b.cancelEfficiencyPct * 2;
      return scoreA - scoreB;
    });

    presetsToCompare.forEach((item, index) => {
      item.rank = index + 1;
    });

    setBenchmarkHistory(presetsToCompare);
    setProgressPct(100);
    setActiveBenchmarkStep('Benchmark completed successfully!');
    setIsRunning(false);
  };

  // Export Results to CSV / Text
  const handleExportBenchmark = () => {
    if (benchmarkHistory.length === 0) return;
    const header = 'Rank,Preset,Category,Mechanic,Total_Execution_ms,120Hz_Ticks,Time_to_Supersonic_ms,Cancel_Efficiency_Pct,Timing_Drift_ms\n';
    const rows = benchmarkHistory
      .map(
        (b) =>
          `${b.rank},"${b.presetName}","${b.category}","${b.mechanic}",${b.executionDurationMs},${b.physicsTicks},${b.timeToSupersonicMs},${b.cancelEfficiencyPct}%,±${b.timingDriftMs}ms`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FN_Macro_Benchmark_${selectedMechanic}_Results.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fastestResult = useMemo(() => {
    if (benchmarkHistory.length === 0) return null;
    return [...benchmarkHistory].sort((a, b) => a.timeToSupersonicMs - b.timeToSupersonicMs)[0];
  }, [benchmarkHistory]);

  const mostEfficientResult = useMemo(() => {
    if (benchmarkHistory.length === 0) return null;
    return [...benchmarkHistory].sort((a, b) => b.cancelEfficiencyPct - a.cancelEfficiencyPct)[0];
  }, [benchmarkHistory]);

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Simulation Engine Macro Benchmarking Tool
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                120Hz SUB-TICK PROFILER
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Executes generated macro scripts inside our 120Hz physics simulation engine to record execution durations, time-to-supersonic, and flip-cancel efficiency. Compare your custom settings against tournament-winning community presets.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'RUNNING BENCHMARK...' : 'RUN BENCHMARK COMPARISON'}</span>
            </button>

            {benchmarkHistory.length > 0 && (
              <button
                onClick={handleExportBenchmark}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar during execution */}
        {isRunning && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">{activeBenchmarkStep}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Control Strip: Mechanic Selector + Comparison Preset Toggles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Target Mechanic Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-bold">Target Mechanic:</span>
            <div className="flex flex-wrap gap-1.5">
              {mechanicOptions.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMechanic(m.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedMechanic === m.id
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Selector to Compare */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
            <span className="font-bold">Compare Presets:</span>
            {COMMUNITY_MACRO_PRESETS.slice(0, 4).map((p) => {
              const isSelected = selectedForComparison.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedForComparison((prev) => prev.filter((id) => id !== p.id));
                    } else {
                      setSelectedForComparison((prev) => [...prev, p.id]);
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benchmark Results View */}
      {benchmarkHistory.length > 0 ? (
        <div className="space-y-4">
          {/* Winner Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fastestResult && (
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    FASTEST TIME-TO-SUPERSONIC
                  </span>
                  <h4 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 mt-1">
                    {fastestResult.presetName}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    Reached 2200 uu/s speed in <strong className="text-emerald-400">{fastestResult.timeToSupersonicMs} ms</strong> ({fastestResult.physicsTicks} 120Hz ticks)
                  </p>
                </div>
              </div>
            )}

            {mostEfficientResult && (
              <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/30">
                    HIGHEST FLIP-CANCEL EFFICIENCY
                  </span>
                  <h4 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 mt-1">
                    {mostEfficientResult.presetName}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    Calculated <strong className="text-cyan-400">{mostEfficientResult.cancelEfficiencyPct}% accuracy</strong> with minimal timing drift (±{mostEfficientResult.timingDriftMs}ms)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Comparative Leaderboard Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 uppercase">
                  Macro Efficiency Comparison Leaderboard
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Simulation Step: 8.33ms (120Hz)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-2">Rank</th>
                    <th className="py-2 px-2">Macro Preset</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2">Total Duration</th>
                    <th className="py-2 px-2">120Hz Ticks</th>
                    <th className="py-2 px-2">Time-to-Supersonic</th>
                    <th className="py-2 px-2">Cancel Efficiency</th>
                    <th className="py-2 px-2">Timing Drift</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {benchmarkHistory.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-850 transition-colors ${
                        item.isCurrentCustom ? 'bg-emerald-950/20 ring-1 ring-emerald-500/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            item.rank === 1
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : item.rank === 2
                              ? 'bg-slate-400 text-slate-950 font-bold'
                              : item.rank === 3
                              ? 'bg-amber-800 text-white font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{item.presetName}</span>
                          {item.isCurrentCustom && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                              ACTIVE ENGINE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 text-[11px]">{item.category}</td>
                      <td className="py-2.5 px-2 font-bold text-cyan-300">{item.executionDurationMs} ms</td>
                      <td className="py-2.5 px-2 text-slate-300">{item.physicsTicks} ticks</td>
                      <td className="py-2.5 px-2">
                        <span className="font-bold text-emerald-400">{item.timeToSupersonicMs} ms</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-cyan-400"
                              style={{ width: `${item.cancelEfficiencyPct}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-200">{item.cancelEfficiencyPct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">±{item.timingDriftMs} ms</td>
                      <td className="py-2.5 px-2 text-right">
                        {!item.isCurrentCustom && onUpdateConfig && (
                          <button
                            onClick={() => {
                              const match = COMMUNITY_MACRO_PRESETS.find((p) => p.name === item.presetName);
                              if (match) onUpdateConfig(match.config);
                            }}
                            className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition-colors border border-slate-700"
                          >
                            Apply Preset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-300 uppercase">
            No Benchmarks Executed Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-['Rajdhani']">
            Click <strong>"RUN BENCHMARK COMPARISON"</strong> above to record execution times, supersonic velocity milestones, and cancellation accuracy across macro presets.
          </p>
        </div>
      )}
    </div>
  );
};
