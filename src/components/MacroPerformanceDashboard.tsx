import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Award,
  Sparkles,
  Download,
  Filter,
  Flame,
  Layers,
  Gauge,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MacroConfig } from '../types';

export interface TimingAttemptRecord {
  attempt: number;
  mechanic: 'Speedflip' | 'Fast Aerial' | 'Chain Dash';
  targetDelayMs: number;
  measuredDelayMs: number;
  timingErrorMs: number;
  success: boolean;
  successRateRolling: number;
  jitterMs: number;
  timestamp: string;
}

interface MacroPerformanceDashboardProps {
  config: MacroConfig;
  activePresetName?: string;
  onUpdateConfig?: (newConfig: MacroConfig) => void;
}

export const MacroPerformanceDashboard: React.FC<MacroPerformanceDashboardProps> = ({
  config,
  activePresetName = 'v4.0.2 Competitive',
  onUpdateConfig,
}) => {
  const [selectedMechanic, setSelectedMechanic] = useState<'all' | 'Speedflip' | 'Fast Aerial' | 'Chain Dash'>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [dataPointsCount, setDataPointsCount] = useState<number>(25);

  // Generate realistic historical data based on active MacroConfig parameters
  const [historyData, setHistoryData] = useState<TimingAttemptRecord[]>(() => {
    return generateHistoricalAttempts(config, 25);
  });

  // Re-generate or adapt baseline data when config changes
  useEffect(() => {
    setHistoryData((prev) => {
      if (prev.length === 0) return generateHistoricalAttempts(config, dataPointsCount);
      return prev;
    });
  }, [config]);

  // Simulation engine helper
  function generateHistoricalAttempts(cfg: MacroConfig, count: number): TimingAttemptRecord[] {
    const list: TimingAttemptRecord[] = [];
    const mechanics: Array<'Speedflip' | 'Fast Aerial' | 'Chain Dash'> = ['Speedflip', 'Fast Aerial', 'Chain Dash'];
    let cumulativeSuccesses = 0;

    for (let i = 1; i <= count; i++) {
      const mech = mechanics[(i - 1) % mechanics.length];
      let target = cfg.speedflipJump2Delay;
      if (mech === 'Fast Aerial') target = cfg.fastAerialJump2Delay;
      if (mech === 'Chain Dash') target = cfg.chaindashPause;

      // Realistic jitter based on hardwareJitter (Level 1: 0.1ms, Level 2: 0.25ms, Level 3: 0.5ms)
      const maxJitter = cfg.hardwareJitter * 0.22;
      const jitter = (Math.random() - 0.48) * maxJitter;
      const measured = Number((target + jitter).toFixed(2));
      const error = Number(Math.abs(measured - target).toFixed(2));

      // Success defined as landing within strict 120Hz sub-tick tolerance (< 0.8ms error)
      const isSuccess = error <= 0.85;
      if (isSuccess) cumulativeSuccesses++;
      const rollingRate = Number(((cumulativeSuccesses / i) * 100).toFixed(1));

      list.push({
        attempt: i,
        mechanic: mech,
        targetDelayMs: target,
        measuredDelayMs: measured,
        timingErrorMs: error,
        success: isSuccess,
        successRateRolling: rollingRate,
        jitterMs: Number(jitter.toFixed(2)),
        timestamp: new Date(Date.now() - (count - i) * 45000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    }

    return list;
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (selectedMechanic === 'all') return historyData;
    return historyData.filter((d) => d.mechanic === selectedMechanic);
  }, [historyData, selectedMechanic]);

  // Summary Metrics Calculations
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalAttempts: 0,
        successRatePct: 0,
        avgTimingDrift: 0,
        stdDeviation: 0,
        fastestExecution: 0,
        slowestExecution: 0,
        consistencyRating: 'INSUFFICIENT DATA',
      };
    }

    const total = filteredData.length;
    const successes = filteredData.filter((d) => d.success).length;
    const rate = Number(((successes / total) * 100).toFixed(1));

    const errors = filteredData.map((d) => d.timingErrorMs);
    const avgDrift = Number((errors.reduce((a, b) => a + b, 0) / total).toFixed(2));

    const delays = filteredData.map((d) => d.measuredDelayMs);
    const meanDelay = delays.reduce((a, b) => a + b, 0) / total;
    const variance = delays.reduce((acc, val) => acc + Math.pow(val - meanDelay, 2), 0) / total;
    const stdDev = Number(Math.sqrt(variance).toFixed(2));

    const fastest = Math.min(...delays);
    const slowest = Math.max(...delays);

    let rating = 'EXCELLENT (RLCS LAN READY)';
    if (rate < 90 || stdDev > 0.6) rating = 'ACCEPTABLE (MINOR JITTER)';
    if (rate < 80 || stdDev > 1.2) rating = 'ELEVATED DRIFT DETECTED';

    return {
      totalAttempts: total,
      successRatePct: rate,
      avgTimingDrift: avgDrift,
      stdDeviation: stdDev,
      fastestExecution: fastest,
      slowestExecution: slowest,
      consistencyRating: rating,
    };
  }, [filteredData]);

  // Trigger Live Simulation of 10 new attempts
  const handleSimulateBatch = async () => {
    setIsSimulating(true);
    const currentMax = historyData.length;
    const newItems: TimingAttemptRecord[] = [];

    for (let step = 1; step <= 10; step++) {
      await new Promise((r) => setTimeout(r, 60));
      const idx = currentMax + step;
      const mechList: Array<'Speedflip' | 'Fast Aerial' | 'Chain Dash'> = ['Speedflip', 'Fast Aerial', 'Chain Dash'];
      const mech = mechList[Math.floor(Math.random() * mechList.length)];
      let target = config.speedflipJump2Delay;
      if (mech === 'Fast Aerial') target = config.fastAerialJump2Delay;
      if (mech === 'Chain Dash') target = config.chaindashPause;

      const maxJitter = config.hardwareJitter * 0.2;
      const jitter = (Math.random() - 0.49) * maxJitter;
      const measured = Number((target + jitter).toFixed(2));
      const error = Number(Math.abs(measured - target).toFixed(2));
      const isSuccess = error <= 0.85;

      const previousSuccesses = historyData.filter((d) => d.success).length;
      const currentSuccesses = previousSuccesses + (isSuccess ? 1 : 0);
      const rollingRate = Number(((currentSuccesses / idx) * 100).toFixed(1));

      newItems.push({
        attempt: idx,
        mechanic: mech,
        targetDelayMs: target,
        measuredDelayMs: measured,
        timingErrorMs: error,
        success: isSuccess,
        successRateRolling: rollingRate,
        jitterMs: Number(jitter.toFixed(2)),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    }

    setHistoryData((prev) => [...prev, ...newItems].slice(-40));
    setIsSimulating(false);
  };

  const handleResetData = () => {
    setHistoryData(generateHistoricalAttempts(config, 25));
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (historyData.length === 0) return;
    const header = 'Attempt,Timestamp,Mechanic,Target_Delay_ms,Measured_Delay_ms,Timing_Error_ms,Success,Rolling_Success_Rate_pct\n';
    const rows = historyData
      .map(
        (r) =>
          `${r.attempt},"${r.timestamp}","${r.mechanic}",${r.targetDelayMs},${r.measuredDelayMs},${r.timingErrorMs},${r.success},${r.successRateRolling}%`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FN_Macro_Timing_Consistency_${activePresetName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-sky-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-500/40">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Macro Execution Timing Performance Dashboard
              </h2>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-bold">
                RECHARTS TELEMETRY ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Real-time statistical profiler tracking sub-frame cancellation timing, hardware debounce variance, and consistency success rates across consecutive macro activations for preset <strong className="text-sky-300">[{activePresetName}]</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateBatch}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
                isSimulating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'fill-current'}`} />
              <span>{isSimulating ? 'SIMULATING 10 ATTEMPTS...' : 'SIMULATE 10 ATTEMPTS'}</span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset sample pool"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Overall Success Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Timing Success Rate:</span>
            <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-emerald-400">
            {stats.successRatePct}%
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Optimal Window (&lt; 0.85ms):</span>
            <strong className="text-slate-300">{stats.totalAttempts} samples</strong>
          </div>
        </div>

        {/* Metric 2: Standard Deviation (Consistency) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Timing Stability (Std Dev):</span>
            <span className="p-1 rounded bg-sky-950 text-sky-400 border border-sky-500/30">
              <Gauge className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-sky-300">
            ±{stats.stdDeviation} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Target Tolerance:</span>
            <span className="text-slate-300 font-bold">&lt; 0.50 ms</span>
          </div>
        </div>

        {/* Metric 3: Average Timing Drift */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Error / Drift:</span>
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-amber-300">
            {stats.avgTimingDrift} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Hardware Jitter Filter:</span>
            <span className="text-slate-300 font-bold">Lvl {config.hardwareJitter}</span>
          </div>
        </div>

        {/* Metric 4: Esports Consistency Tier */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Consistency Rating:</span>
            <span className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-sm font-bold font-['Chakra_Petch'] text-purple-300 truncate">
            {stats.consistencyRating}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Range:</span>
            <span className="text-slate-300 font-bold">{stats.fastestExecution}ms - {stats.slowestExecution}ms</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Filter By Mechanic:</span>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'Speedflip', 'Fast Aerial', 'Chain Dash'] as const).map((mech) => (
              <button
                key={mech}
                onClick={() => setSelectedMechanic(mech)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedMechanic === mech
                    ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {mech === 'all' ? 'All Mechanics Combined' : mech}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Active Preset: <strong>{activePresetName}</strong></span>
        </div>
      </div>

      {/* Main Charts Grid: Chart 1 (Timeline Consistency) & Chart 2 (Rolling Success Rate) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Measured Delay vs Target Window (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 uppercase">
                Execution Delay vs Target Window (ms)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Tolerance Band: ±0.85ms
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="attempt" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TimingAttemptRecord;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-mono shadow-2xl space-y-1">
                          <div className="font-bold text-white flex items-center justify-between gap-3">
                            <span>Attempt #{data.attempt}</span>
                            <span className={data.success ? 'text-emerald-400' : 'text-rose-400'}>
                              {data.success ? 'OPTIMAL' : 'OUT-OF-WINDOW'}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px]">Mechanic: {data.mechanic}</div>
                          <div className="text-sky-300">Measured: {data.measuredDelayMs} ms</div>
                          <div className="text-slate-400 text-[11px]">Target: {data.targetDelayMs} ms</div>
                          <div className="text-amber-400 text-[11px]">Drift: ±{data.timingErrorMs} ms</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line
                  type="monotone"
                  dataKey="measuredDelayMs"
                  name="Measured Delay (ms)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="step"
                  dataKey="targetDelayMs"
                  name="Target Optimal (ms)"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rolling Cumulative Success Rate & Error Magnitude (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 uppercase">
                Rolling Timing Success Rate (%)
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold">
              {stats.successRatePct}% Target
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="attempt" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TimingAttemptRecord;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-mono shadow-2xl space-y-1">
                          <div className="font-bold text-white">Attempt #{data.attempt}</div>
                          <div className="text-emerald-400 font-bold">Success Rate: {data.successRateRolling}%</div>
                          <div className="text-slate-400 text-[11px]">Time: {data.timestamp}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area
                  type="monotone"
                  dataKey="successRateRolling"
                  name="Rolling Success %"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <ReferenceLine y={95} stroke="#34d399" strokeDasharray="3 3" label={{ value: '95% Pro Threshold', fill: '#34d399', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Attempts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 uppercase">
              Recent Execution Telemetry Log (Last {filteredData.length} Attempts)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Logging frequency: Live Sub-Tick
          </span>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
              <tr>
                <th className="py-2 px-2">Attempt</th>
                <th className="py-2 px-2">Timestamp</th>
                <th className="py-2 px-2">Mechanic</th>
                <th className="py-2 px-2">Target</th>
                <th className="py-2 px-2">Measured</th>
                <th className="py-2 px-2">Drift Error</th>
                <th className="py-2 px-2">Success Rate</th>
                <th className="py-2 px-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.slice(-15).reverse().map((row) => (
                <tr key={row.attempt} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-2 font-bold text-slate-200">#{row.attempt}</td>
                  <td className="py-2 px-2 text-slate-400 text-[10px]">{row.timestamp}</td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                      {row.mechanic}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">{row.targetDelayMs} ms</td>
                  <td className="py-2 px-2 font-bold text-sky-300">{row.measuredDelayMs} ms</td>
                  <td className="py-2 px-2">
                    <span className={row.timingErrorMs <= 0.4 ? 'text-emerald-400' : 'text-amber-400'}>
                      ±{row.timingErrorMs} ms
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-300">{row.successRateRolling}%</td>
                  <td className="py-2 px-2 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        row.success
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-950 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {row.success ? 'PASS (120Hz)' : 'DRIFT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
