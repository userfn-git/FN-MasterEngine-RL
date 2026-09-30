import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, ShieldAlert, CheckCircle2, Sliders, Volume2, Sparkles, AlertTriangle, Crosshair, Radio } from 'lucide-react';
import { MECHANICS_CATALOG } from '../data/defaultConfig';
import { MechanicDefinition, MechanicStep, MacroConfig, InferredSpatialEvent } from '../types';

interface MechanicsTimelineProps {
  config: MacroConfig;
  onUpdateConfig: (newConfig: MacroConfig) => void;
  audioDrillActive: boolean;
  liveSpatialEvents?: InferredSpatialEvent[];
}

export const MechanicsTimeline: React.FC<MechanicsTimelineProps> = ({
  config,
  onUpdateConfig,
  audioDrillActive,
  liveSpatialEvents = [],
}) => {
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('speedflip-left');
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 0.5x, 0.25x
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mechanic = MECHANICS_CATALOG.find((m) => m.id === selectedMechanicId) || MECHANICS_CATALOG[0];

  // Playback timer loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setCurrentTimeMs((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= mechanic.totalDurationMs) {
            setIsPlaying(false);
            return mechanic.totalDurationMs;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, mechanic.totalDurationMs]);

  // Audio cues when playing
  useEffect(() => {
    if (!isPlaying || !audioDrillActive) return;

    // Web Audio synthesizer for crisp tick cues
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play sound cues for key transitions
    const step = mechanic.steps.find((s) => Math.abs(s.startMs - currentTimeMs) < 15);
    if (step) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (step.name.includes('Cancel')) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch for cancel
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (step.name.includes('Jump')) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 jump beep
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    }
  }, [currentTimeMs, isPlaying, audioDrillActive, mechanic]);

  // Current active step
  const activeStep = mechanic.steps.find(
    (step) => currentTimeMs >= step.startMs && currentTimeMs <= step.startMs + step.durationMs
  ) || mechanic.steps[mechanic.steps.length - 1];

  // Active keys pressed at currentTimeMs
  const activeKeys = activeStep ? activeStep.keys : [];

  // Canvas visual car orientation simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid / field background
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ground plane line
    const groundY = height - 50;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Goal zone markings
    ctx.fillStyle = '#0ea5e922';
    ctx.fillRect(0, groundY, width, 50);

    // Compute car physics position based on currentTimeMs
    const progress = Math.min(1, Math.max(0, currentTimeMs / mechanic.totalDurationMs));
    const carX = 120 + progress * (width - 240);

    // Altitude: Jump 1 and Jump 2 profile
    let altitude = 0;
    let pitchAngle = 0;
    let rollAngle = 0;

    if (mechanic.id.includes('speedflip')) {
      if (currentTimeMs < 30) {
        altitude = (currentTimeMs / 30) * 15;
        pitchAngle = 0.1;
      } else if (currentTimeMs < 80) {
        altitude = 15 + ((currentTimeMs - 30) / 50) * 35;
        pitchAngle = 0.45; // Initiating diagonal flip forward
        rollAngle = selectedMechanicId === 'speedflip-left' ? -0.7 : 0.7;
      } else if (currentTimeMs < 600) {
        altitude = 50 - ((currentTimeMs - 80) / 520) * 45;
        // Flip cancel locks pitch near 0 while air roll levels car!
        pitchAngle = 0.05;
        const rollProgress = (currentTimeMs - 80) / 520;
        rollAngle = selectedMechanicId === 'speedflip-left' ? (-0.7 * (1 - rollProgress)) : (0.7 * (1 - rollProgress));
      } else {
        altitude = 2; // touching down
        pitchAngle = 0;
        rollAngle = 0;
      }
    } else if (mechanic.id === 'fast-aerial') {
      altitude = Math.min(180, (currentTimeMs / mechanic.totalDurationMs) * 180);
      pitchAngle = currentTimeMs < 200 ? -0.8 : (currentTimeMs < 400 ? -0.6 : -0.3);
    } else if (mechanic.id === 'chain-dash') {
      altitude = Math.sin((currentTimeMs / 100) * Math.PI) * 12;
      pitchAngle = Math.sin((currentTimeMs / 100) * Math.PI) * 0.2;
    } else if (mechanic.id === 'half-flip') {
      altitude = Math.sin(progress * Math.PI) * 30;
      pitchAngle = progress < 0.3 ? -0.7 : (progress < 0.6 ? 0.8 : 0);
      rollAngle = progress > 0.4 ? (progress - 0.4) * 3.14 : 0;
    }

    const carY = groundY - 24 - altitude;

    // Draw Rocket Boost Flame
    if (activeKeys.includes('Boost')) {
      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(pitchAngle);

      // Boost plume gradient
      const flameGradient = ctx.createLinearGradient(-30, 0, -90, (Math.random() - 0.5) * 8);
      flameGradient.addColorStop(0, '#fef08a');
      flameGradient.addColorStop(0.3, '#f97316');
      flameGradient.addColorStop(0.8, '#ef4444');
      flameGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.moveTo(-28, -6);
      ctx.lineTo(-75 - Math.random() * 25, 0);
      ctx.lineTo(-28, 6);
      ctx.closePath();
      ctx.fill();

      // Core blue plasma jet
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(-28, -2);
      ctx.lineTo(-45, 0);
      ctx.lineTo(-28, 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Draw Car Body (Dominus/Octane aerodynamic profile)
    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(pitchAngle);

    // Car chassis shadow on ground
    const shadowY = groundY - carY;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, shadowY, 36, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Octane/Dominus Chassis
    // Main Body
    const carGradient = ctx.createLinearGradient(-35, -15, 35, 15);
    carGradient.addColorStop(0, '#0284c7');
    carGradient.addColorStop(0.5, '#0ea5e9');
    carGradient.addColorStop(1, '#38bdf8');

    ctx.fillStyle = carGradient;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(-32, 8); // rear bottom
    ctx.lineTo(30, 8); // front bottom
    ctx.lineTo(34, 2); // front bumper
    ctx.lineTo(26, -5); // hood
    ctx.lineTo(10, -14); // windshield
    ctx.lineTo(-18, -14); // roof
    ctx.lineTo(-28, -4); // rear window
    ctx.lineTo(-34, -4); // spoiler mount
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windshield glass
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(9, -12);
    ctx.lineTo(23, -5);
    ctx.lineTo(8, -5);
    ctx.closePath();
    ctx.fill();

    // Rear Spoiler
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-34, -18, 10, 4);

    // Wheels (Front & Rear)
    const wheelY = 8;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    // Rear wheel
    ctx.beginPath();
    ctx.arc(-20, wheelY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-20, wheelY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Front wheel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(20, wheelY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(20, wheelY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Drift smoke / spark effect if Powerslide is active near ground
    if (activeKeys.includes('Powerslide') && altitude < 15) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-25 - Math.random() * 20, wheelY + 4 + Math.random() * 4, 3 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flip Cancel Vector Arrow indicator
    if (activeStep && activeStep.name.includes('Cancel')) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-25, -20);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-25, -20);
      ctx.lineTo(-20, -12);
      ctx.lineTo(-15, -22);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Telemetry overlay HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(15, 15, 210, 85);
    ctx.strokeRect(15, 15, 210, 85);

    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`TELEMETRY HUD [120Hz TICK]`, 25, 32);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`TIME: ${currentTimeMs.toFixed(0)} ms / TICK: ${Math.floor(currentTimeMs / 8.33)}`, 25, 48);
    ctx.fillText(`ALTITUDE: ${altitude.toFixed(1)} uu`, 25, 62);
    ctx.fillText(`PITCH: ${(pitchAngle * (180 / Math.PI)).toFixed(1)}° | ROLL: ${(rollAngle * 100).toFixed(0)}%`, 25, 76);
    ctx.fillText(`STATUS: ${activeStep ? activeStep.name : 'IDLE'}`, 25, 90);
  }, [currentTimeMs, mechanic, selectedMechanicId, activeKeys, activeStep]);

  return (
    <div className="space-y-4">
      {/* Mechanic Selection & Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {MECHANICS_CATALOG.map((m) => {
          const isSelected = m.id === selectedMechanicId;
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMechanicId(m.id);
                setCurrentTimeMs(0);
                setIsPlaying(false);
              }}
              className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
              )}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-['Chakra_Petch'] font-bold text-sm text-slate-100">
                  {m.title}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  m.difficulty === 'RLCS Pro'
                    ? 'bg-amber-950 text-amber-400 border-amber-600/40'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-600/40'
                }`}>
                  {m.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-['Rajdhani'] line-clamp-2 leading-relaxed">
                {m.description}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
                <span className="text-cyan-400">BIND: {m.hotkey}</span>
                <span>{m.totalDurationMs}ms</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Viewport */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Simulation Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
            <h2 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 uppercase tracking-wide">
              {mechanic.title} • Virtual Physics Preview
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
              {Math.floor(currentTimeMs / 8.33)} / {Math.floor(mechanic.totalDurationMs / 8.33)} Ticks
            </span>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentTimeMs(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Timeline to 0ms"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition-all ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'SIMULATE'}</span>
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs font-mono">
              {[
                { label: '0.25x', val: 0.25 },
                { label: '0.5x', val: 0.5 },
                { label: '1.0x', val: 1.0 },
              ].map((sp) => (
                <button
                  key={sp.val}
                  onClick={() => setPlaybackSpeed(sp.val)}
                  className={`px-2 py-1 rounded transition-colors ${
                    playbackSpeed === sp.val ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2D Physics Canvas */}
        <div className="relative bg-[#070a10]">
          <canvas
            ref={canvasRef}
            width={900}
            height={260}
            className="w-full h-56 sm:h-64 object-cover"
          />

          {/* Active Key Indicators Floater */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 pointer-events-none">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Virtual Controller Inputs
            </span>
            <div className="flex flex-wrap justify-end gap-1.5 max-w-xs">
              {['Boost', 'Jump 1', 'Jump 2', 'Forward (W)', 'Back (S)', 'Left (A)', 'Right (D)', 'AirRoll Left (Q)', 'AirRoll Right (E)', 'Powerslide'].map((k) => {
                const isHeld = activeKeys.some((ak) => ak.toLowerCase().includes(k.split(' ')[0].toLowerCase()));
                return (
                  <span
                    key={k}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all border ${
                      isHeld
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-md shadow-cyan-500/40 scale-105'
                        : 'bg-slate-950/80 border-slate-800 text-slate-600 opacity-60'
                    }`}
                  >
                    {k}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Pro Tip Callout Card */}
          <div className="absolute bottom-4 left-4 max-w-md bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3 backdrop-blur-md hidden sm:block">
            <div className="flex items-center gap-1.5 text-cyan-400 font-['Chakra_Petch'] font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>RLCS Pro Timing Secret</span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] leading-relaxed">
              {mechanic.proTip}
            </p>
          </div>
        </div>

        {/* Interactive Timeline Scrubber & Phase Breakdown */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-4">
          {/* Time Scrubber Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-semibold">
                CURRENT TIMESTAMP: <span className="text-white text-sm">{currentTimeMs.toFixed(0)}ms</span>
              </span>
              <span className="text-slate-400">
                TOTAL WINDOW: <span className="text-slate-200">{mechanic.totalDurationMs}ms</span>
              </span>
            </div>

            <div className="relative pt-1 pb-2">
              <input
                type="range"
                min={0}
                max={mechanic.totalDurationMs}
                step={1}
                value={currentTimeMs}
                onChange={(e) => {
                  setCurrentTimeMs(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />

              {/* Step Segment Markers on the timeline track */}
              <div className="relative w-full h-2 mt-1">
                {mechanic.steps.map((st, i) => {
                  const leftPct = (st.startMs / mechanic.totalDurationMs) * 100;
                  const widthPct = (st.durationMs / mechanic.totalDurationMs) * 100;
                  const isCurrent = currentTimeMs >= st.startMs && currentTimeMs <= st.startMs + st.durationMs;
                  return (
                    <div
                      key={i}
                      onClick={() => setCurrentTimeMs(st.startMs)}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className={`absolute top-0 h-2 rounded cursor-pointer transition-all border ${
                        isCurrent
                          ? 'border-white shadow-sm ring-2 ring-cyan-400/50'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                      title={`${st.name} (${st.startMs}ms - ${st.startMs + st.durationMs}ms)`}
                    >
                      <div className="w-full h-full rounded" style={{ backgroundColor: st.color }}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Steps Progression Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            {mechanic.steps.map((step, idx) => {
              const isCurrent = currentTimeMs >= step.startMs && currentTimeMs <= step.startMs + step.durationMs;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentTimeMs(step.startMs);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-850 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span className="text-cyan-400 font-bold">PHASE {idx + 1}</span>
                    <span>{step.durationMs}ms</span>
                  </div>
                  <h4 className="font-['Chakra_Petch'] font-semibold text-xs text-slate-100 line-clamp-1 mb-1" style={{ color: isCurrent ? step.color : undefined }}>
                    {step.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-['Rajdhani'] leading-tight line-clamp-2">
                    {step.actionDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {step.keys.slice(0, 2).map((k) => (
                      <span key={k} className="text-[9px] font-mono bg-slate-950 text-slate-300 px-1 py-0.5 rounded border border-slate-800">
                        {k.split(' ')[0]}
                      </span>
                    ))}
                    {step.keys.length > 2 && (
                      <span className="text-[9px] font-mono text-slate-500">+{step.keys.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature 2: Spatial Mechanics Inferred Events Stream (From Psyonix Stats API) */}
          <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-sky-400" />
                <h4 className="font-['Chakra_Petch'] font-bold text-xs uppercase text-slate-200">
                  Spatial Mechanics Event Timeline (Live BallHit Stream)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40">
                  Psyonix 120Hz Inferred
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {liveSpatialEvents.length} Inferred Events Detected
              </span>
            </div>

            {liveSpatialEvents.length === 0 ? (
              <div className="text-[11px] font-mono text-slate-500 py-2 text-center bg-slate-950/60 rounded-lg border border-slate-800">
                Awaiting BallHit telemetry from TAStatsAPI.ini (Aerials: Z&gt;800 | Wall Hits: |X|&gt;3500 | Power: Spd&gt;1000)
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {liveSpatialEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          evt.type === 'AERIAL'
                            ? 'bg-sky-950 text-sky-300 border border-sky-500/50'
                            : evt.type === 'WALL_HIT'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'bg-purple-950 text-purple-300 border border-purple-500/50'
                        }`}
                      >
                        {evt.type}
                      </span>
                      <span className="text-slate-500">[{evt.timestamp}]</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">
                      {evt.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      XYZ: ({Math.round(evt.location.x)}, {Math.round(evt.location.y)}, {Math.round(evt.location.z)}) | Spd: {Math.round(evt.postHitSpeed)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Macro Delay Adjuster Knobs */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 mt-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-['Chakra_Petch'] font-bold text-sm text-slate-200">
                  Live Timing Calibrator (Modifies Engine & Lua Delays)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">1 Tick = 8.33ms (120Hz)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Jump 1 Tap Hold:</span>
                  <span className="text-cyan-400">{config.speedflipJump1}ms</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={config.speedflipJump1}
                  onChange={(e) => onUpdateConfig({ ...config, speedflipJump1: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Jump 2 Delay:</span>
                  <span className="text-cyan-400">{config.speedflipJump2Delay}ms</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={config.speedflipJump2Delay}
                  onChange={(e) => onUpdateConfig({ ...config, speedflipJump2Delay: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Jump 2 Tap Hold:</span>
                  <span className="text-cyan-400">{config.speedflipJump2}ms</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  value={config.speedflipJump2}
                  onChange={(e) => onUpdateConfig({ ...config, speedflipJump2: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Cancel Hold Time:</span>
                  <span className="text-cyan-400">{config.speedflipCancelHold}ms</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={800}
                  step={10}
                  value={config.speedflipCancelHold}
                  onChange={(e) => onUpdateConfig({ ...config, speedflipCancelHold: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
