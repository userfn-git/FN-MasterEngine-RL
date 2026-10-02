import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Cloud,
  Activity,
  Globe,
  RefreshCw,
  Zap,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Gauge,
  Clock,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { MacroConfig } from '../types';

export interface CloudLatencyDataPoint {
  tick: number;
  time: string;
  localLatencyMs: number;
  cloudBaselineMs: number;
  deltaMs: number;
  jitterMs: number;
}

export interface CloudMetricsResponse {
  region: string;
  standardLabel: string;
  standardBaselineMs: number;
  jitterToleranceMs: number;
  currentLocalLatencyMs: number;
  currentCloudRoundtripMs: number;
  currentDeltaMs: number;
  currentJitterMs: number;
  packetLossPct: number;
  serverTickRateHz: number;
  tickIntervalMs: number;
  status: 'OPTIMAL_SUB_TICK' | 'STABLE' | 'ELEVATED_LATENCY';
  history: CloudLatencyDataPoint[];
  timestamp: string;
}

interface CloudLatencyMonitorProps {
  config: MacroConfig;
}

export const CloudLatencyMonitor: React.FC<CloudLatencyMonitorProps> = ({ config }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('rlcs_lan');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<CloudMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regionOptions = [
    { id: 'rlcs_lan', label: 'RLCS LAN Tournament Baseline', standardMs: '0.85 ms', flag: '🏆' },
    { id: 'eu_central', label: 'EU-Central (Frankfurt Tier-1)', standardMs: '2.80 ms', flag: '🇪🇺' },
    { id: 'us_east', label: 'US-East (Virginia Tier-1)', standardMs: '3.40 ms', flag: '🇺🇸' },
    { id: 'us_west', label: 'US-West (Oregon Tier-1)', standardMs: '4.60 ms', flag: '🇺🇸' },
  ];

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cloud/latency-metrics?region=${selectedRegion}`);
      if (res.ok) {
        const data: CloudMetricsResponse = await res.json();
        setMetrics(data);
        setError(null);
      } else {
        setError('Server API returned error response');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch cloud latency metrics');
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-streaming ticker every 2.5 seconds
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      fetchMetrics();
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, fetchMetrics]);

  // Export CSV
  const handleExportCSV = () => {
    if (!metrics || !metrics.history.length) return;
    const header = 'Tick,Time,Local_Latency_ms,Cloud_Baseline_ms,Delta_ms,Jitter_ms\n';
    const rows = metrics.history
      .map((h) => `${h.tick},"${h.time}",${h.localLatencyMs},${h.cloudBaselineMs},${h.deltaMs},${h.jitterMs}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cloud_Latency_Metrics_${selectedRegion}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentLocal = metrics?.currentLocalLatencyMs ?? 0.98;
  const currentBaseline = metrics?.standardBaselineMs ?? 0.85;
  const currentDelta = metrics?.currentDeltaMs ?? 0.13;
  const currentJitter = metrics?.currentJitterMs ?? 0.038;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                <Cloud className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Cloud Latency &amp; Baseline Performance Monitor
              </h2>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Server className="w-3 h-3 text-cyan-400" />
                SERVER API LIVE STREAM
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Streams real-time server-side input polling telemetry from <code className="text-cyan-400">/api/cloud/latency-metrics</code>, comparing local USB driver input latency against official RLCS LAN tournament standards and regional tier-1 cloud baselines.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                isStreaming
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isStreaming ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}</span>
            </button>

            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Local Input Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>User Local Input Pipeline:</span>
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-cyan-300">
            {currentLocal.toFixed(3)} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>USB Polling (1000Hz):</span>
            <strong className="text-slate-300">Sub-Millisecond</strong>
          </div>
        </div>

        {/* Metric 2: Cloud Standard Baseline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Selected Cloud Baseline:</span>
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
              <Globe className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-amber-300">
            {currentBaseline.toFixed(2)} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Target Standard:</span>
            <strong className="text-slate-300 truncate max-w-[150px]">{metrics?.standardLabel || 'RLCS LAN'}</strong>
          </div>
        </div>

        {/* Metric 3: Delta Difference */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Performance Differential (Δ):</span>
            <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <Gauge className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-2xl font-bold font-['Chakra_Petch'] ${currentDelta <= 0.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {currentDelta >= 0 ? `+${currentDelta.toFixed(3)}` : currentDelta.toFixed(3)} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>120Hz Physics Tick:</span>
            <strong className="text-slate-300">8.333 ms budget</strong>
          </div>
        </div>

        {/* Metric 4: Live Jitter Variance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sub-Tick Jitter Variance:</span>
            <span className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-bold font-['Chakra_Petch'] text-purple-300">
            ±{currentJitter.toFixed(3)} ms
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Status:</span>
            <span className="text-emerald-400 font-bold">{metrics?.status || 'OPTIMAL'}</span>
          </div>
        </div>
      </div>

      {/* Region Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-bold">Compare Against Standard:</span>
          <div className="flex flex-wrap gap-1.5">
            {regionOptions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedRegion === reg.id
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{reg.flag}</span>
                <span>{reg.label}</span>
                <span className="text-[10px] text-cyan-300 bg-slate-900 px-1 py-0.2 rounded font-bold">
                  {reg.standardMs}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>120Hz Physics Tick Interval: <strong>8.33ms</strong></span>
        </div>
      </div>

      {/* Main Recharts Telemetry Graph */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-100 uppercase">
              Real-Time Input Latency vs. Cloud Standard Baseline
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sample Window: 24 Live Ticks
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={metrics?.history || []}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="localLatencyArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CloudLatencyDataPoint;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-mono shadow-2xl space-y-1">
                        <div className="font-bold text-white flex items-center justify-between gap-3">
                          <span>Tick #{data.tick}</span>
                          <span className="text-slate-400">{data.time}</span>
                        </div>
                        <div className="text-cyan-300 font-bold">User Local Pipeline: {data.localLatencyMs} ms</div>
                        <div className="text-amber-300">Cloud Standard: {data.cloudBaselineMs} ms</div>
                        <div className="text-emerald-400">Delta (Δ): {data.deltaMs >= 0 ? `+${data.deltaMs}` : data.deltaMs} ms</div>
                        <div className="text-purple-300 text-[11px]">Jitter: ±{data.jitterMs} ms</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area
                type="monotone"
                dataKey="localLatencyMs"
                name="User Local Input (ms)"
                stroke="#38bdf8"
                fill="url(#localLatencyArea)"
                strokeWidth={2}
                dot={{ r: 2, fill: '#38bdf8' }}
              />
              <Line
                type="monotone"
                dataKey="cloudBaselineMs"
                name="Cloud Standard Baseline (ms)"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <ReferenceLine
                y={8.333}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: '120Hz Physics Frame Limit (8.33ms)', fill: '#f87171', fontSize: 10 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
