import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Volume2, Bot, User, Brain, AlertCircle, RefreshCw, Zap, BookOpen, ExternalLink, ShieldCheck, Flame, Compass } from 'lucide-react';
import { CoachMessage, MacroConfig } from '../types';

interface AICoachPanelProps {
  config: MacroConfig;
  activePreset?: string;
  opponentStarved?: boolean;
  starvationDurationSec?: number;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({
  config,
  activePreset = 'v402',
  opponentStarved = false,
  starvationDurationSec = 0,
}) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: `### 🚀 Welcome to the Rocket League Mechanics & Macro Engineering Coach!\n\nI am your RLCS Pro mechanics specialist and input engine advisor. I specialize in:\n- **120Hz Physics Tick Timings** (Speedflip cancellation windows, first-jump clearance, air-roll recovery)\n- **Logitech G-Hub Lua & PowerShell Scripts** (Threading, deadzone jitter suppression, SendInput latency)\n- **TAInput.ini Optimization** (Digital axis blend time, mouse smoothing elimination, KBM binds)\n\nAsk me anything or choose a preset diagnosis below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.8-flash',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [highThinking, setHighThinking] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Wikipedia Grounding Cache State for Current Active Preset
  const [wikiData, setWikiData] = useState<{
    topic: string;
    title: string;
    summary: string;
    source_url: string;
  } | null>(null);
  const [loadingWiki, setLoadingWiki] = useState<boolean>(false);

  // Fetch Wikipedia Grounding definition based on current active preset
  useEffect(() => {
    let topicToFetch = 'speedflip';
    if (activePreset === 'kickoff') topicToFetch = 'speedflip';
    else if (activePreset === 'aerial') topicToFetch = 'fast_aerial';
    else if (activePreset === 'chaindash') topicToFetch = 'chaindash';
    else if (activePreset === 'comp240') topicToFetch = 'comp240';
    else topicToFetch = 'input_lag';

    setLoadingWiki(true);
    fetch(`/api/wikipedia/summary/${topicToFetch}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.title) {
          setWikiData(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingWiki(false));
  }, [activePreset]);

  const quickPrompts = [
    'Why does my speedflip land sideways or bounce uncontrollably?',
    'How does the 120Hz physics tick rate affect macro sleep delays?',
    'Optimize my TAInput.ini for maximum KBM aerial control',
    'Explain the flip cancel physics vector on Octane vs Dominus',
    'How do I maintain speed while chain dashing on Champions Field curved walls?',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: CoachMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          highThinking,
          context: {
            internalDeadzone: config.internalDeadzone,
            dodgeDeadzone: config.dodgeDeadzone,
            hardwareJitter: config.hardwareJitter,
            groundSense: config.groundSense,
            aerialSense: config.aerialSense,
            keyBindings: {
              boost: config.keyBoost,
              jump: config.keyJump,
              powerslide: config.keyPowerslide,
              airrollL: config.keyAirrollL,
              airrollR: config.keyAirrollR,
            },
            speedflipJump1: config.speedflipJump1,
            speedflipJump2Delay: config.speedflipJump2Delay,
            speedflipCancelHold: config.speedflipCancelHold,
          },
        }),
      });

      const data = await response.json();

      const coachMsg: CoachMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: data.reply || 'No response returned from the engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model || (highThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash'),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'coach',
          text: `⚠️ Connection Issue: ${err.message}. If running locally, check your server connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Play audio drill / speech
  const handlePlayVoice = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgId);

    // Extract first 150 characters of key advice for concise vocal drill
    const shortText = text.replace(/[*#_`]/g, '').slice(0, 160);

    try {
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shortText, voice: 'Puck' }),
      });

      const data = await response.json();

      if (data.audioBase64) {
        // Decode base64 and play via Web Audio
        const binary = atob(data.audioBase64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else {
        // Fallback to browser Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(shortText);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          utterance.onend = () => setPlayingAudioId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingAudioId(null);
        }
      }
    } catch {
      // Fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(shortText);
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAudioId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-['Chakra_Petch'] font-bold text-lg text-slate-100 uppercase">
              AI Mechanics Coach & Timing Diagnostician
            </h2>
            <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
              Powered by Gemini Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Rajdhani'] mt-1">
            Grounded in Rocket League 120Hz physics engine dynamics, Dodge Deadzones, flip-cancel vectors, and KBM input optimization.
          </p>
        </div>

        {/* High Thinking Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Brain className={`w-4 h-4 ${highThinking ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-mono text-slate-300">High Thinking:</span>
          <button
            onClick={() => setHighThinking(!highThinking)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
              highThinking
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {highThinking ? 'ON (Pro Preview)' : 'OFF (Flash)'}
          </button>
        </div>
      </div>

      {/* Feature 1: Coach HUD Opponent Boost Starvation Live Alert */}
      {opponentStarved ? (
        <div className="bg-rose-950/70 border border-rose-500/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-rose-100">
                  🚨 تنبيه المدرب: الخصم بدون بوست (0% Boost)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/60 font-black">
                  فترة الجفاف: {starvationDurationSec}s
                </span>
              </div>
              <p className="text-xs text-rose-200/80 font-['Rajdhani'] mt-0.5">
                الخصم تحت ضغط شديد وعاجز عن صد الكرات الهوائية العالية! احرمه من الـ Big Boost Pads وافرض الحصار الهجومي فوراً.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSendMessage('الخصم حالياً بدون بوست منذ 5 ثوانٍ، ما هو أفضل تكتيك هجومي لاستغلال هذا الضغط؟')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shrink-0 shadow"
          >
            اسأل المدرب عن التكتيك
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Spectator Telemetry: Opponent Boost Tracker Monitoring (Starvation Alert at 5s zero boost)</span>
          </div>
          <span className="text-[10px] text-slate-500">Psyonix Stats API Active</span>
        </div>
      )}

      {/* Feature 2: Official Wikipedia Mechanical Knowledge & Active Preset Tips */}
      {wikiData && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wide">
                    {wikiData.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-semibold">
                    Preset: {activePreset.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Wikipedia REST API
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-['Rajdhani']">
                  Official computer science and physics grounding cached in backend/app.py SQLite
                </div>
              </div>
            </div>

            <a
              href={wikiData.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-colors"
            >
              <span>View Wikipedia Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-300 font-['Rajdhani'] leading-relaxed">
            {wikiData.summary}
          </p>

          {/* Preset-Specific Mechanical Advice */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activePreset === 'kickoff' && 'Kickoff Tip: First Jump 25ms, Jump2 Delay 25ms, Flip Cancel Hold 620ms (Supersonic in 1.7s)'}
                {activePreset === 'aerial' && 'Fast Aerial Tip: First Jump 220ms pitch back, Dodge Deadzone 0.05 to eliminate accidental backflips'}
                {activePreset === 'chaindash' && 'Chaindash Tip: Wall micro-jumps at 25ms with 45ms pause ensures infinite wall momentum'}
                {activePreset === 'comp240' && 'Competitive Tip: Sub-frame USB input at 1000Hz aligns with 120Hz physics ticks (8.33ms)'}
                {activePreset === 'v402' && 'Standard Tip: 0.05 radial deadzone eliminates hardware stick drift with zero step discontinuities'}
              </span>
            </div>

            <button
              onClick={() => handleSendMessage(`اشرح لي بالتفصيل التوجيه التكتيكي والفيزيائي لبروفايل ${activePreset} وكيف أطبقه بدون أخطاء؟`)}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline font-bold"
            >
              تحليل تكتيكي مخصص للبروفايل
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 border border-cyan-400/30 text-white shadow-md shadow-cyan-500/10">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs font-['Rajdhani'] leading-relaxed border ${
                    isUser
                      ? 'bg-cyan-600/20 border-cyan-500/40 text-slate-100 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-cyan-400">
                      {isUser ? 'YOU' : 'RL MECHANICS COACH'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.model && (
                        <span className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 text-purple-400">
                          {msg.model}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.text)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                            playingAudioId === msg.id ? 'text-amber-400 animate-pulse' : 'text-slate-400'
                          }`}
                          title="Play Voice Drill"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs font-mono text-cyan-400 p-2 bg-slate-950/60 rounded-xl border border-slate-800 max-w-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Analyzing mechanics physics telemetry...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 px-1">
            Pro Questions:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-mono text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Prompt Input Box */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about speedflip timing, cancel degrees, aerial ascent, or macro delay tweaks..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SEND</span>
          </button>
        </div>
      </div>
    </div>
  );
};
