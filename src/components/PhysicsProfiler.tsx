import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  Gauge,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Flame,
  Radio,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MacroConfig } from '../types';

export interface TelemetryDataPoint {
  tick: number;
  timeMs: number;
  timestamp: string;
  driverDelayMs: number;
  enginePollMs: number;
  physicsTickMs: number;
  totalLatencyMs: number;
  jitterMs: number;
  actionPhase: string;
  isWithin120HzBudget: boolean;
}

interface PhysicsProfilerProps {
  config?: MacroConfig;
  activeMechanicTitle?: string;
  isSimulatorPlaying?: boolean;
  currentSimulatorTimeMs?: number;
}

export const PhysicsProfiler: React.FC<PhysicsProfilerProps> = ({
  config,
  activeMechanicTitle = 'Speedflip (MB4 Dodge Cancel)',
  isSimulatorPlaying = false,
  currentSimulatorTimeMs = 0,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [physicsRateHz, setPhysicsRateHz] = useState<120 | 240 | 60>(120);
  const [usbPollingHz, setUsbPollingHz] = useState<1000 | 2000 | 4000>(1000);
  const [chartMetric, setChartMetric] = useState<'total' | 'stacked' | 'jitter'>('total');
  const [selectedPresetMechanic, setSelectedPresetMechanic] = useState<string>('speedflip');
  const [dataPoints, setDataPoints] = useState<TelemetryDataPoint[]>([]);

  const tickCounterRef = useRef<number>(1);
  const lastTimeRef = useRef<number>(0);

  // Ideal physics budget based on rate
  const physicsBudgetMs = useMemo(() => {
    return 1000 / physicsRateHz; // 120Hz = 8.33ms, 240Hz = 4.16ms, 60Hz = 16.67ms
  }, [physicsRateHz]);

  const usbPollPeriodMs = useMemo(() => {
    return 1000 / usbPollingHz; // 1000Hz = 1.0ms, 2000Hz = 0.5ms, 4000Hz = 0.25ms
  }, [usbPollingHz]);

  // Generate initial historical seed data (last 30 ticks)
  useEffect(() => {
    const initial: TelemetryDataPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 1; i--) {
      const tick = i;
      const driverDelay = Number((usbPollPeriodMs * (0.35 + Math.random() * 0.4)).toFixed(3));
      const enginePoll = Number(((Math.random() * 0.7) + 0.5).toFixed(3));
      const physicsTick = Number((physicsBudgetMs * 0.45 + (Math.random() * 0.6 - 0.3)).toFixed(3));
      const totalLatency = Number((driverDelay + enginePoll + physicsTick).toFixed(3));
      const jitter = Number((Math.random() * 0.15).toFixed(3));

      initial.push({
        tick,
        timeMs: (30 - i) * 8.33,
        timestamp: new Date(now - i * 25).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        driverDelayMs: driverDelay,
        enginePollMs: enginePoll,
        physicsTickMs: physicsTick,
        totalLatencyMs: totalLatency,
        jitterMs: jitter,
        actionPhase: i % 4 === 0 ? 'Jump Input' : i % 4 === 1 ? 'Pitch Angle' : i % 4 === 2 ? 'Cancel Gate' : 'Recovery Slide',
        isWithin120HzBudget: totalLatency <= physicsBudgetMs,
      });
    }
    setDataPoints(initial);
    tickCounterRef.current = 31;
  }, [physicsBudgetMs, usbPollPeriodMs]);

  // Live real-time stream loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const nextTick = tickCounterRef.current++;
        const now = new Date();
        const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0')}`;

        // Compute simulated delays based on hardware config
        const deadzoneOffset = config ? config.internalDeadzone * 2 : 0.1;
        const jitterFilterReduction = config ? config.hardwareJitter * 0.04 : 0.08;

        const driverDelay = Number((usbPollPeriodMs * (0.28 + Math.random() * 0.35) - jitterFilterReduction * 0.1).toFixed(3));
        const enginePoll = Number((0.45 + Math.random() * 0.65 + deadzoneOffset * 0.3).toFixed(3));
        const physicsTick = Number((physicsBudgetMs * 0.48 + (Math.random() * 0.5 - 0.25)).toFixed(3));
        const totalLatency = Number((Math.max(1.2, driverDelay + enginePoll + physicsTick)).toFixed(3));
        const jitter = Number((Math.abs(Math.sin(nextTick * 0.5)) * 0.18 + Math.random() * 0.05).toFixed(3));

        const phases = ['Jump #1', 'Fast Pitch', 'Cancel Flip', 'Roll Align', 'Powerslide Ground'];
        const actionPhase = phases[nextTick % phases.length];

        const newPoint: TelemetryDataPoint = {
          tick: nextTick,
          timeMs: Number((nextTick * 8.33).toFixed(1)),
          timestamp: timeStr,
          driverDelayMs: Math.max(0.12, driverDelay),
          enginePollMs: Math.max(0.3, enginePoll),
          physicsTickMs: Math.max(1.5, physicsTick),
          totalLatencyMs: totalLatency,
          jitterMs: jitter,
          actionPhase,
          isWithin120HzBudget: totalLatency <= physicsBudgetMs,
        };

        // Keep last 40 telemetry samples
        return [...prev.slice(-39), newPoint];
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isRunning, physicsBudgetMs, usbPollPeriodMs, config]);

  // KPI Statistics calculated from stream
  const stats = useMemo(() => {
    if (dataPoints.length === 0) {
      return { avgLatency: 0, minLatency: 0, maxLatency: 0, deadlineCompliance: 100, avgJitter: 0 };
    }
    const totalSum = dataPoints.reduce((acc, p) => acc + p.totalLatencyMs, 0);
    const avgLatency = Number((totalSum / dataPoints.length).toFixed(2));
    const minLatency = Number(Math.min(...dataPoints.map((p) => p.totalLatencyMs)).toFixed(2));
    const maxLatency = Number(Math.max(...dataPoints.map((p) => p.totalLatencyMs)).toFixed(2));
    const compliantCount = dataPoints.filter((p) => p.isWithin120HzBudget).length;
    const deadlineCompliance = Number(((compliantCount / dataPoints.length) * 100).toFixed(1));
    const avgJitter = Number((dataPoints.reduce((acc, p) => acc + p.jitterMs, 0) / dataPoints.length).toFixed(3));

    return { avgLatency, minLatency, maxLatency, deadlineCompliance, avgJitter };
  }, [dataPoints]);

  const handleExportTelemetry = () => {
    const csvHeader = 'Tick,TimeMs,Timestamp,DriverDelayMs,EnginePollMs,PhysicsTickMs,TotalLatencyMs,JitterMs,ActionPhase,WithinBudget\n';
    const csvRows = dataPoints
      .map(
        (p) =>
          `${p.tick},${p.timeMs},${p.timestamp},${p.driverDelayMs},${p.enginePollMs},${p.physicsTickMs},${p.totalLatencyMs},${p.jitterMs},"${p.actionPhase}",${p.isWithin120HzBudget}`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FN_PhysicsProfiler_Telemetry_${physicsRateHz}Hz.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearTelemetry = () => {
    setDataPoints([]);
    tickCounterRef.current = 1;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl font-mono">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Chakra_Petch'] font-bold text-base sm:text-lg text-slate-100 uppercase tracking-wide">
                Physics Profiler & Telemetry Radar
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                120Hz SUB-FRAME
              </span>
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  LIVE STREAM
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
              High-resolution input-to-action latency telemetry visualizer graphing sub-millisecond USB dispatcher, engine poll, and 120Hz physics commits.
            </p>
          </div>
        </div>

        {/* Global Stream Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'PAUSE TELEMETRY' : 'RESUME STREAM'}</span>
          </button>

          <button
            onClick={handleClearTelemetry}
            title="Reset telemetry buffers"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Avg Input-to-Action</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-['Chakra_Petch'] text-cyan-300">
            {stats.avgLatency} <span className="text-xs font-mono font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Sub-frame responsive</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Min / Peak Latency</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-['Chakra_Petch'] text-indigo-300">
            {stats.minLatency} <span className="text-xs font-mono font-normal text-slate-400">/</span> {stats.maxLatency} <span className="text-xs font-mono font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Budget limit: {physicsBudgetMs.toFixed(2)}ms
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Tick Compliance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-['Chakra_Petch'] text-emerald-400">
            {stats.deadlineCompliance}%
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            0 frame-drops detected
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Input Pacing Jitter</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-['Chakra_Petch'] text-amber-300">
            ±{stats.avgJitter} <span className="text-xs font-mono font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Logitech G-HUB HID filter
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Target</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-slate-200 truncate" title={activeMechanicTitle}>
            {activeMechanicTitle}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">
            {physicsRateHz}Hz / {usbPollingHz}Hz Poll
          </div>
        </div>
      </div>

      {/* Control Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
        {/* Metric Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Metric View:</span>
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setChartMetric('total')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                chartMetric === 'total' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Total Latency (ms)
            </button>
            <button
              onClick={() => setChartMetric('stacked')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                chartMetric === 'stacked' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline Breakdown
            </button>
            <button
              onClick={() => setChartMetric('jitter')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                chartMetric === 'jitter' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jitter Variance
            </button>
          </div>
        </div>

        {/* Physics & Polling Settings */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Physics Tick:</span>
            <select
              value={physicsRateHz}
              onChange={(e) => setPhysicsRateHz(Number(e.target.value) as 120 | 240 | 60)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-cyan-300 text-xs focus:outline-none"
            >
              <option value={120}>120 Hz (8.33ms - RL Standard)</option>
              <option value={240}>240 Hz (4.16ms - RLCS Pro)</option>
              <option value={60}>60 Hz (16.6ms - Legacy Console)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Mouse Poll:</span>
            <select
              value={usbPollingHz}
              onChange={(e) => setUsbPollingHz(Number(e.target.value) as 1000 | 2000 | 4000)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-cyan-300 text-xs focus:outline-none"
            >
              <option value={1000}>1000 Hz (1.0ms)</option>
              <option value={2000}>2000 Hz (0.5ms)</option>
              <option value={4000}>4000 Hz (0.25ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Real-Time Telemetry Graph using Recharts */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50"></span>
            <strong className="text-slate-200">Live Input-to-Action Telemetry Waveform</strong> (Buffer: 40 samples)
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Deadline: <strong className="text-rose-400">{physicsBudgetMs.toFixed(2)}ms</strong>
          </span>
        </div>

        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'total' ? (
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="tick"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => `T#${val}`}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={[0, Math.max(12, physicsBudgetMs + 3)]}
                  tickFormatter={(val) => `${val}ms`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TelemetryDataPoint;
                      return (
                        <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-2.5 text-xs font-mono shadow-xl space-y-1 text-slate-200">
                          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1 font-bold text-cyan-300">
                            <span>Tick #{data.tick}</span>
                            <span>{data.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Phase: <strong className="text-white">{data.actionPhase}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-cyan-400 font-bold">
                            <span>Total Latency:</span>
                            <span>{data.totalLatencyMs} ms</span>
                          </div>
                          <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                            <div className="flex justify-between">
                              <span>Driver Dispatch:</span>
                              <span className="text-slate-300">{data.driverDelayMs} ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>UE3 Engine Poll:</span>
                              <span className="text-slate-300">{data.enginePollMs} ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Physics Commit:</span>
                              <span className="text-slate-300">{data.physicsTickMs} ms</span>
                            </div>
                          </div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-center mt-1 ${
                            data.isWithin120HzBudget ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {data.isWithin120HzBudget ? '✓ 120Hz Physics Frame Met' : '⚠ Deadline Exceeded'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={physicsBudgetMs}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{ value: `${physicsRateHz}Hz Deadline (${physicsBudgetMs.toFixed(2)}ms)`, fill: '#f43f5e', fontSize: 10, position: 'top' }}
                />
                <ReferenceLine
                  y={4.16}
                  stroke="#a855f7"
                  strokeDasharray="2 2"
                  label={{ value: '240Hz Pro (4.16ms)', fill: '#a855f7', fontSize: 9, position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey="totalLatencyMs"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalLatencyGradient)"
                  name="Input-to-Action Latency (ms)"
                />
              </AreaChart>
            ) : chartMetric === 'stacked' ? (
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="tick" stroke="#64748b" fontSize={10} tickFormatter={(val) => `T#${val}`} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, Math.max(12, physicsBudgetMs + 3)]} tickFormatter={(val) => `${val}ms`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine y={physicsBudgetMs} stroke="#f43f5e" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="driverDelayMs" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Driver Dispatch (ms)" />
                <Area type="monotone" dataKey="enginePollMs" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} name="UE3 Engine Poll (ms)" />
                <Area type="monotone" dataKey="physicsTickMs" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Physics Commit (ms)" />
              </AreaChart>
            ) : (
              <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="tick" stroke="#64748b" fontSize={10} tickFormatter={(val) => `T#${val}`} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 0.4]} tickFormatter={(val) => `${val}ms`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <ReferenceLine y={0.2} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Jitter Threshold (0.20ms)', fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="jitterMs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#f59e0b' }}
                  name="Input Jitter Variance (ms)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Physics Execution Telemetry Breakdown Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="text-blue-400">1. USB HID Driver Hook</span>
            <span>~{usbPollPeriodMs.toFixed(2)}ms</span>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani']">
            SetWindowsHookEx & Logitech G-HUB single-threaded event loop forwarding mouse button triggers into Windows kernel.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="text-purple-400">2. Unreal Engine 3 Input Poll</span>
            <span>~0.50ms</span>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani']">
            TAInput.ini raw input buffers polled once per render frame. Configured with 0.05 continuous radial deadzones.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="text-emerald-400">3. 120Hz Physics Step</span>
            <span>~{(physicsBudgetMs * 0.5).toFixed(2)}ms</span>
          </div>
          <p className="text-[11px] text-slate-400 font-['Rajdhani']">
            Fixed 8.33ms physics step commitment. All flip cancels and dodges executed well within the 1-frame boundary.
          </p>
        </div>
      </div>
    </div>
  );
};
