import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Eye,
  Camera,
  Layers,
  Activity,
  Sliders,
  Flame,
  Shield,
  Zap,
  Target,
  FileVideo,
  Clock,
  Compass,
  Download,
  Upload,
  RefreshCw,
  Gauge,
  TrendingDown,
  Sparkles,
  Tv,
} from 'lucide-react';
import {
  RLStatsPlayer,
  RLStatsGame,
  RLStatsBallHitEvent,
  RLStatsBoostPickupEvent,
  RLStatsGoalScoredEvent,
  RLStatsCrossbarHitEvent,
  RLStatsStatfeedEvent,
  RLStatsCommand,
} from '../types';

// Standard Rocket League Pitch Coordinates
// Arena bounds: X [-4096, 4096], Y [-5120, 5120], Z [0, 2044]
const FIELD_WIDTH = 8192;
const FIELD_LENGTH = 10240;

// Big Boost Pill Coordinates (Unreal Units)
const BIG_BOOST_PADS = [
  { x: -3072, y: -4096, label: 'Blue Left' },
  { x: 3072, y: -4096, label: 'Blue Right' },
  { x: -3584, y: 0, label: 'Mid Left' },
  { x: 3584, y: 0, label: 'Mid Right' },
  { x: -3072, y: 4096, label: 'Orange Left' },
  { x: 3072, y: 4096, label: 'Orange Right' },
];

export const ReplayRadarStudio: React.FC = () => {
  const [webSocketPort, setWebSocketPort] = useState<number>(49124);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isMatchPaused, setIsMatchPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<string>('PlayerView');
  const [cameraFocus, setCameraFocus] = useState<string>('1');

  // Match & Telemetry State
  const [ball, setBall] = useState<{ x: number; y: number; z: number; speed: number }>({
    x: 0,
    y: 0,
    z: 150,
    speed: 850,
  });

  const [players, setPlayers] = useState<RLStatsPlayer[]>([
    {
      Name: 'Zen (Blue)',
      Shortcut: 1,
      TeamNum: 0,
      Score: 420,
      Goals: 2,
      Shots: 4,
      Assists: 1,
      Saves: 2,
      Touches: 28,
      CarTouches: 6,
      Demos: 1,
      Speed: 1850,
      Boost: 78,
      bBoosting: true,
      bOnGround: true,
      bOnWall: false,
      bPowersliding: false,
      bDemolished: false,
      bSupersonic: true,
    },
    {
      Name: 'Vatira (Orange)',
      Shortcut: 2,
      TeamNum: 1,
      Score: 380,
      Goals: 1,
      Shots: 3,
      Assists: 0,
      Saves: 3,
      Touches: 24,
      CarTouches: 4,
      Demos: 0,
      Speed: 1420,
      Boost: 24,
      bBoosting: false,
      bOnGround: true,
      bOnWall: true,
      bPowersliding: false,
      bDemolished: false,
      bSupersonic: false,
    },
  ]);

  const [gameState, setGameState] = useState<RLStatsGame>({
    Teams: [
      { Name: 'Team Blue', TeamNum: 0, Score: 2, ColorPrimary: '0066FF' },
      { Name: 'Team Orange', TeamNum: 1, Score: 1, ColorPrimary: 'FF6600' },
    ],
    PlaylistId: 11, // Ranked 1v1
    TimeSeconds: 164,
    bOvertime: false,
    Frame: 2450,
    Elapsed: 136.0,
    Ball: { Speed: 850.5, TeamNum: 0 },
    bReplay: false,
    bHasWinner: false,
    Winner: '',
    Arena: 'Stadium_P (Champions Field)',
    bHasTarget: true,
    Target: { Name: 'Zen', Shortcut: 1, TeamNum: 0 },
  });

  // Recent Ingested Events
  const [recentEvents, setRecentEvents] = useState<
    Array<{ id: string; time: string; type: string; title: string; desc: string; color: string }>
  >([
    {
      id: 'e1',
      time: '02:44',
      type: 'GOAL',
      title: 'Goal Scored by Zen',
      desc: 'Top shelf 112 km/h flick (PostHitSpeed: 1540 uu/s)',
      color: 'text-sky-400 bg-sky-950/60 border-sky-500/40',
    },
    {
      id: 'e2',
      time: '02:18',
      type: 'CROSSBAR',
      title: 'Crossbar Deflection',
      desc: 'Impact Force 132.4 at coordinates (120, -5120, 640)',
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    },
    {
      id: 'e3',
      time: '01:52',
      type: 'BALL_HIT',
      title: 'Aerial Challenge Won',
      desc: 'Z: 1420 uu (Altitude Contact)',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
    },
  ]);

  const [impactRipples, setImpactRipples] = useState<
    Array<{ id: string; x: number; y: number; color: string; size: number }>
  >([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Send Command to Socket
  const sendCommand = (cmd: RLStatsCommand) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(cmd));
    }
  };

  // Change POV Command
  const handleChangePOV = (focus: string, perspective: string) => {
    setCameraFocus(focus);
    setCameraMode(perspective);
    sendCommand({
      Command: 'ChangePOV',
      Data: { Focus: focus, Perspective: perspective },
    });
  };

  // Set Game Speed Command
  const handleSetSpeed = (speed: number) => {
    setGameSpeed(speed);
    sendCommand({
      Command: 'SetGameSpeed',
      Data: { Speed: speed },
    });
  };

  // Toggle Pause Command
  const handleTogglePause = () => {
    const next = !isMatchPaused;
    setIsMatchPaused(next);
    sendCommand({
      Command: 'SetMatchPaused',
      Data: { bPaused: next },
    });
  };

  // Toggle HUD Command
  const handleToggleHUD = () => {
    const next = !hudVisible;
    setHudVisible(next);
    sendCommand({
      Command: 'SetHUDVisibility',
      Data: { bVisible: next },
    });
  };

  // Connect to Official WebSocket
  const handleConnectSocket = () => {
    if (isConnected) {
      socketRef.current?.close();
      setIsConnected(false);
      return;
    }

    try {
      const ws = new WebSocket(`ws://localhost:${webSocketPort}`);
      ws.onopen = () => {
        setIsConnected(true);
        setIsSimulating(false);
      };
      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          handleIncomingStatsEnvelope(envelope);
        } catch {}
      };
      ws.onerror = () => {
        setIsConnected(false);
        setIsSimulating(true);
      };
      ws.onclose = () => {
        setIsConnected(false);
      };
      socketRef.current = ws;
    } catch {
      setIsConnected(false);
      setIsSimulating(true);
    }
  };

  const handleIncomingStatsEnvelope = (envelope: any) => {
    if (!envelope || !envelope.Event) return;
    const { Event, Data } = envelope;

    if (Event === 'UpdateState') {
      if (Data.Players) setPlayers(Data.Players);
      if (Data.Game) setGameState(Data.Game);
      if (Data.Game?.Ball) {
        setBall((prev) => ({
          ...prev,
          speed: Data.Game.Ball.Speed,
        }));
      }
    } else if (Event === 'BallHit') {
      if (Data.Ball?.Location) {
        setBall({
          x: Data.Ball.Location.X,
          y: Data.Ball.Location.Y,
          z: Data.Ball.Location.Z,
          speed: Data.Ball.PostHitSpeed,
        });
        triggerRipple(Data.Ball.Location.X, Data.Ball.Location.Y, '#38bdf8');
      }
      setRecentEvents((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          type: 'BALL_HIT',
          title: `Hit by ${Data.Players?.[0]?.Name || 'Player'}`,
          desc: `PostHitSpeed: ${Math.round(Data.Ball?.PostHitSpeed || 0)} uu/s | Z: ${Math.round(Data.Ball?.Location?.Z || 0)}`,
          color: 'text-sky-400 bg-sky-950/60 border-sky-500/40',
        },
        ...prev.slice(0, 10),
      ]);
    } else if (Event === 'GoalScored') {
      if (Data.ImpactLocation) {
        triggerRipple(Data.ImpactLocation.X, Data.ImpactLocation.Y, '#eab308');
      }
      setRecentEvents((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          type: 'GOAL',
          title: `GOAL! Scored by ${Data.Scorer?.Name || 'Unknown'}`,
          desc: `Speed: ${Math.round(Data.GoalSpeed || 0)} uu/s (${Math.round((Data.GoalSpeed * 36) / 1000)} km/h)`,
          color: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40',
        },
        ...prev.slice(0, 10),
      ]);
    } else if (Event === 'CrossbarHit') {
      if (Data.BallLocation) {
        triggerRipple(Data.BallLocation.X, Data.BallLocation.Y, '#f43f5e');
      }
      setRecentEvents((prev) => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          type: 'CROSSBAR',
          title: 'Crossbar Impact',
          desc: `Impact force: ${Math.round(Data.ImpactForce || 0)} | Speed: ${Math.round(Data.BallSpeed || 0)}`,
          color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        },
        ...prev.slice(0, 10),
      ]);
    } else if (Event === 'BoostPickup') {
      if (Data.Location) {
        triggerRipple(Data.Location.X, Data.Location.Y, '#10b981');
      }
    }
  };

  const triggerRipple = (x: number, y: number, color: string) => {
    const id = Math.random().toString();
    setImpactRipples((prev) => [...prev, { id, x, y, color, size: 5 }]);
    setTimeout(() => {
      setImpactRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  // High-Precision Radar Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    let animId: number;
    let angle = 0;

    const loop = () => {
      if (!isMatchPaused) {
        angle += 0.03 * gameSpeed;

        // Smooth trajectory for ball in simulation
        const ballX = Math.sin(angle * 1.5) * 2800;
        const ballY = Math.cos(angle) * 3600;
        const ballZ = 200 + Math.abs(Math.sin(angle * 3)) * 950;
        const speed = Math.round(900 + Math.sin(angle * 2) * 500);

        setBall({ x: ballX, y: ballY, z: ballZ, speed });

        // Update player 1 (Zen) attacking
        setPlayers((prev) => {
          if (prev.length < 2) return prev;
          const p1 = { ...prev[0] };
          const p2 = { ...prev[1] };

          // P1 approaches ball
          p1.Speed = Math.round(1500 + Math.abs(Math.sin(angle)) * 700);
          p1.bSupersonic = p1.Speed >= 2200;
          p1.Boost = Math.max(15, Math.min(100, Math.round(75 + Math.sin(angle * 2) * 25)));

          // P2 defends
          p2.Speed = Math.round(1200 + Math.cos(angle) * 500);
          p2.Boost = Math.max(0, Math.min(100, Math.round(30 + Math.cos(angle * 1.8) * 30)));

          return [p1, p2];
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, isMatchPaused, gameSpeed]);

  // Canvas 2D Radar Pitch Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (Dark Cyberpunk Grass)
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Coordinate conversion: World (-4096..4096, -5120..5120) to Canvas (0..width, 0..height)
    const padding = 24;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;

    const toCanvasX = (wx: number) => padding + ((wx + 4096) / FIELD_WIDTH) * drawW;
    const toCanvasY = (wy: number) => padding + ((wy + 5120) / FIELD_LENGTH) * drawH;

    // Pitch Outline & Zones
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Outer boundary with chamfered stadium corners
    ctx.beginPath();
    ctx.rect(padding, padding, drawW, drawH);
    ctx.stroke();

    // Center Line
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(padding, padding + drawH / 2);
    ctx.lineTo(padding + drawW, padding + drawH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center Circle
    ctx.beginPath();
    ctx.arc(padding + drawW / 2, padding + drawH / 2, drawW * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Goal Boxes (Blue at Top Y=0, Orange at Bottom Y=drawH)
    // Blue Goal (Y: -5120)
    ctx.fillStyle = 'rgba(0, 102, 255, 0.15)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    const goalW = drawW * 0.22;
    const goalH = 14;
    ctx.fillRect(padding + (drawW - goalW) / 2, padding - goalH, goalW, goalH);
    ctx.strokeRect(padding + (drawW - goalW) / 2, padding - goalH, goalW, goalH);

    // Orange Goal (Y: +5120)
    ctx.fillStyle = 'rgba(255, 102, 0, 0.15)';
    ctx.strokeStyle = '#ea580c';
    ctx.fillRect(padding + (drawW - goalW) / 2, padding + drawH, goalW, goalH);
    ctx.strokeRect(padding + (drawW - goalW) / 2, padding + drawH, goalW, goalH);

    // 6 Big Boost Pills (Golden Glowing Orbs)
    BIG_BOOST_PADS.forEach((pad) => {
      const cx = toCanvasX(pad.x);
      const cy = toCanvasY(pad.y);

      // Outer glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Core pill
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Impact Ripples
    impactRipples.forEach((ripple) => {
      const rx = toCanvasX(ripple.x);
      const ry = toCanvasY(ripple.y);

      ctx.strokeStyle = ripple.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, 16, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Simulated Players on Radar
    // Player 1 (Blue)
    const p1X = toCanvasX(ball.x * 0.7);
    const p1Y = toCanvasY(ball.y - 650);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(p1X, p1Y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 9px JetBrains Mono';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Zen [1]', p1X + 10, p1Y + 3);

    // Player 2 (Orange)
    const p2X = toCanvasX(-ball.x * 0.4);
    const p2Y = toCanvasY(ball.y + 1100);

    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(p2X, p2Y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#fb923c';
    ctx.fillText('Vatira [2]', p2X + 10, p2Y + 3);

    // Draw Ball
    const bx = toCanvasX(ball.x);
    const by = toCanvasY(ball.y);

    // Ball shadow based on altitude
    const shadowScale = Math.max(4, 12 - (ball.z / 2044) * 6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(bx, by, shadowScale, 0, Math.PI * 2);
    ctx.fill();

    // Ball Core (Bright Glowing White/Cyan)
    const ballRadius = Math.max(5, 7 + (ball.z / 2044) * 5);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Altitude Line (from ground shadow to ball)
    if (ball.z > 200) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - (ball.z / 2044) * 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [ball, impactRipples]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Official API & Replay Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-100 font-['Chakra_Petch'] uppercase tracking-wide">
                    Rocket League Replay & Spatial Radar Studio
                  </h2>
                  <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/50 px-2 py-0.5 rounded-full font-bold">
                    Official Psyonix Stats API
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                    {isConnected ? 'LIVE WEBSOCKET' : '120Hz DEMO STREAM'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
                  Real-time 2D Pitch Radar, Ingested BallHit / Crossbar / Goal Events, and Camera POV Replay Controller.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                Port: <strong className="text-slate-200">{webSocketPort} (Official Default)</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Time Remaining: <strong className="text-amber-300">{Math.floor(gameState.TimeSeconds / 60)}:{(gameState.TimeSeconds % 60).toString().padStart(2, '0')}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                Arena: <strong className="text-cyan-300">{gameState.Arena}</strong>
              </span>
            </div>
          </div>

          {/* Quick Connect & Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleConnectSocket}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                isConnected
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isConnected ? 'CONNECTED (PORT 49124)' : 'CONNECT TO GAME'}</span>
            </button>

            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
            >
              {isSimulating ? 'Pause Simulator' : 'Run Simulator'}
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: 2D Spatial Pitch Radar + Replay POV Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Spatial Arena Radar (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
                2D Spatial Arena Radar (Champions Field)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span> Blue ({gameState.Teams[0].Score})
              </span>
              <span className="text-slate-600">vs</span>
              <span className="flex items-center gap-1 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Orange ({gameState.Teams[1].Score})
              </span>
            </div>
          </div>

          {/* Interactive Canvas Radar */}
          <div className="relative bg-[#060a12] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
            <canvas ref={canvasRef} width={480} height={560} className="w-full h-auto max-h-[500px] object-contain" />

            {/* In-Radar Telemetry Overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1">
              <div className="text-sky-400 font-bold">BALL TELEMETRY:</div>
              <div className="text-slate-300">
                Position: ({Math.round(ball.x)}, {Math.round(ball.y)}, {Math.round(ball.z)})
              </div>
              <div className="text-slate-400">
                Speed: <strong className="text-amber-400">{Math.round(ball.speed)} uu/s</strong> (~{Math.round((ball.speed * 36) / 1000)} km/h)
              </div>
              <div className="text-slate-400">
                Altitude: {ball.z > 800 ? <span className="text-sky-300 font-bold">AERIAL HEIGHT</span> : 'GROUND/LOW'}
              </div>
            </div>

            {/* Radar Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2 text-[10px] font-mono space-y-0.5 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 100% Boost Pill
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span> Blue Player
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Orange Player
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white border border-sky-400"></span> Ball (Z Altitude)
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Dimensions: 8192 × 10240 uu</span>
            <span className="text-indigo-400">Packet Rate: 120.00 Hz Real-Time</span>
          </div>
        </div>

        {/* Right Column: Replay Camera POV & Ingested Commands (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Replay POV & Camera Mode Controller */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
                  Replay Camera & POV Ingestion
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                Command: ChangePOV
              </span>
            </div>

            {/* Camera Perspective Mode Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Perspective Mode:</label>
              <div className="grid grid-cols-3 gap-2">
                {['PlayerView', 'AutoCam', 'Camera_Director', 'Fly', 'SoftAttach', 'HardAttach'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleChangePOV(cameraFocus, mode)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${
                      cameraMode === mode
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Focus Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">Target Focus:</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <button
                  onClick={() => handleChangePOV('Ball', cameraMode)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    cameraFocus === 'Ball'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  ⚽ Ball Focus
                </button>
                <button
                  onClick={() => handleChangePOV('1', cameraMode)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    cameraFocus === '1'
                      ? 'bg-sky-950 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🔵 Zen [1]
                </button>
                <button
                  onClick={() => handleChangePOV('2', cameraMode)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    cameraFocus === '2'
                      ? 'bg-orange-950 border-orange-400 text-orange-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🟠 Vatira [2]
                </button>
              </div>
            </div>

            {/* Replay Playback Speed (SetGameSpeed) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Replay Speed (SetGameSpeed):</span>
                <span className="text-cyan-400 font-bold">{gameSpeed}x</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                {[0.25, 0.5, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSetSpeed(spd)}
                    className={`py-1 rounded border text-center transition-all ${
                      gameSpeed === spd
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Replay Control Buttons (SetMatchPaused & SetHUDVisibility) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={handleTogglePause}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all border ${
                  isMatchPaused
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {isMatchPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isMatchPaused ? 'RESUME REPLAY' : 'PAUSE MATCH'}</span>
              </button>

              <button
                onClick={handleToggleHUD}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all border ${
                  !hudVisible
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{hudVisible ? 'HIDE IN-GAME HUD' : 'SHOW HUD'}</span>
              </button>
            </div>
          </div>

          {/* Official Events Live Stream Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                  Official Match Event Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-Filtered</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-2.5 rounded-xl border text-xs font-mono space-y-1 transition-all ${evt.color}`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{evt.title}</span>
                    <span className="text-[10px] text-slate-400">{evt.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-300/80 font-['Rajdhani']">
                    {evt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Players Telemetry Table (UpdateState Ingestion) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
              UpdateState Live Player Telemetry Roster
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">120Hz Tick Synchronization</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">PLAYER</th>
                <th className="pb-2">TEAM</th>
                <th className="pb-2">SCORE</th>
                <th className="pb-2">GOALS / SHOTS</th>
                <th className="pb-2">TOUCHES</th>
                <th className="pb-2">SPEED (KM/H)</th>
                <th className="pb-2">BOOST</th>
                <th className="pb-2">SUPERSONIC</th>
                <th className="pb-2">SURFACE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {players.map((p) => (
                <tr key={p.Shortcut} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-2.5 font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-[10px]">
                      {p.Shortcut}
                    </span>
                    <span>{p.Name}</span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.TeamNum === 0
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          : 'bg-orange-950 text-orange-300 border border-orange-500/40'
                      }`}
                    >
                      {p.TeamNum === 0 ? 'BLUE' : 'ORANGE'}
                    </span>
                  </td>
                  <td className="py-2.5 text-cyan-300 font-bold">{p.Score}</td>
                  <td className="py-2.5 text-slate-300">
                    {p.Goals}G / {p.Shots}S
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {p.Touches} ({p.CarTouches || 0} Car)
                  </td>
                  <td className="py-2.5 text-amber-300 font-bold">
                    {Math.round(((p.Speed || 0) * 36) / 1000)} km/h
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 font-bold">{p.Boost}%</span>
                      <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${p.Boost || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.bSupersonic
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                          : 'text-slate-500'
                      }`}
                    >
                      {p.bSupersonic ? '⚡ SUPERSONIC' : 'NORMAL'}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {p.bOnWall ? '🧗 Wall' : p.bOnGround ? '🏎️ Ground' : '✈️ Aerial'}
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
