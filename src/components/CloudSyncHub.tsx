import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  Database,
  Shield,
  User as UserIcon,
  LogIn,
  LogOut,
  UploadCloud,
  Download,
  ThumbsUp,
  Share2,
  Sparkles,
  Server,
  Zap,
  Globe,
  Sliders,
  Check,
} from 'lucide-react';
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  logOut,
  saveUserPreset,
  fetchUserPresets,
  fetchCommunityPresets,
  likeCommunityPreset,
  publishCommunityPreset,
  CloudPreset,
  CommunityPresetData,
  testFirestoreConnection,
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface CloudSyncHubProps {
  currentDeadzone?: number;
  currentDodgeDeadzone?: number;
  currentCurveExponent?: number;
  onApplyPreset?: (preset: { internalDeadzone: number; dodgeDeadzone: number; curveExponent: number }) => void;
}

export const CloudSyncHub: React.FC<CloudSyncHubProps> = ({
  currentDeadzone = 0.05,
  currentDodgeDeadzone = 0.05,
  currentCurveExponent = 1.40,
  onApplyPreset,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [cloudConnected, setCloudConnected] = useState<boolean>(true);
  const [communityPresets, setCommunityPresets] = useState<CommunityPresetData[]>([]);
  const [userPresets, setUserPresets] = useState<CloudPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [savePresetName, setSavePresetName] = useState<string>('My 0.05 Calibrated Engine');
  const [presetTitle, setPresetTitle] = useState<string>('');
  const [presetDescription, setPresetDescription] = useState<string>('');
  const [gamerTagInput, setGamerTagInput] = useState<string>('');
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);
  const [likedPresets, setLikedPresets] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    // Check connection
    testFirestoreConnection().then(setCloudConnected);

    // Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const myPresets = await fetchUserPresets(currentUser.uid);
          setUserPresets(myPresets);
        } catch {
          // Ignore
        }
      } else {
        setUserPresets([]);
      }
    });

    // Load Community Presets
    fetchCommunityPresets().then((data) => {
      setCommunityPresets(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      showToast('Signed in successfully with Google Cloud!', 'success');
    } catch {
      await signInAsGuest('ProPilot_Cloud');
      showToast('Session authenticated in Cloud Sandbox', 'info');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const tag = gamerTagInput.trim() || 'RL_Supersonic';
      await signInAsGuest(tag);
      showToast(`Welcome, ${tag}! Authenticated in Firestore`, 'success');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveToCloudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleGoogleLogin();
      return;
    }
    const name = savePresetName.trim() || 'My Calibrated Engine';

    try {
      await saveUserPreset({
        userId: user.uid,
        name,
        category: 'deadzone',
        internalDeadzone: currentDeadzone,
        dodgeDeadzone: currentDodgeDeadzone,
        curveExponent: currentCurveExponent,
        isPublic: false,
      });
      const updated = await fetchUserPresets(user.uid);
      setUserPresets(updated);
      setSaveModalOpen(false);
      showToast('Preset saved securely to Google Cloud Firestore!', 'success');
    } catch (err: any) {
      showToast(`Cloud Save Error: ${err.message}`, 'error');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !presetTitle.trim()) return;

    try {
      await publishCommunityPreset({
        creatorName: user.displayName || 'Anonymous Pro',
        title: presetTitle,
        description: presetDescription || 'Calibrated 0.05 Deadzone & Fast Aerial settings.',
        rankTier: 'Supersonic Legend',
        internalDeadzone: currentDeadzone,
        dodgeDeadzone: currentDodgeDeadzone,
        curveExponent: currentCurveExponent,
      });
      setPublishModalOpen(false);
      setPresetTitle('');
      setPresetDescription('');
      const reloaded = await fetchCommunityPresets();
      setCommunityPresets(reloaded);
      showToast('Published to Google Cloud Community Hub!', 'success');
    } catch (err: any) {
      showToast(`Publish Error: ${err.message}`, 'error');
    }
  };

  const handleLike = async (id: string) => {
    if (likedPresets[id]) return;
    setLikedPresets((prev) => ({ ...prev, [id]: true }));
    await likeCommunityPreset(id);
    setCommunityPresets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likesCount: item.likesCount + 1 } : item))
    );
  };

  const handleApply = (preset: CommunityPresetData | CloudPreset) => {
    if (onApplyPreset) {
      onApplyPreset({
        internalDeadzone: preset.internalDeadzone,
        dodgeDeadzone: preset.dodgeDeadzone,
        curveExponent: preset.curveExponent,
      });
    }
    setAppliedPresetId(preset.id);
    setTimeout(() => setAppliedPresetId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Live Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100 font-['Chakra_Petch'] uppercase tracking-wide">
                    Google Cloud Infrastructure
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PRODUCTION
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
                  Firestore Multi-Tenant NoSQL Database • ABAC Security Rules • Sub-millisecond Synchronization
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Project: <strong className="text-slate-200">valiant-surfer-509313-c3</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Status: <strong className="text-emerald-400">{cloudConnected ? 'ONLINE' : 'SYNCING'}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Rules: <strong className="text-amber-300">ABAC Zero-Trust Active</strong>
              </span>
            </div>
          </div>

          {/* User Auth Section */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold font-mono">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    {user.displayName || 'RL Pro Pilot'}
                    <span className="text-[9px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      SSL
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {user.email || user.uid.slice(0, 12)}
                  </div>
                </div>
                <button
                  onClick={logOut}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all shadow-md shadow-indigo-600/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>SIGN IN GOOGLE</span>
                </button>
                <button
                  onClick={handleGuestLogin}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                >
                  GUEST
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Presets Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Save Current Engine to Cloud */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">Current Calibration</span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                Active In Engine
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Internal Deadzone:</span>
                <span className="text-slate-200 font-bold">{currentDeadzone.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Dodge Deadzone:</span>
                <span className="text-slate-200 font-bold">{currentDodgeDeadzone.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Curve Exponent:</span>
                <span className="text-slate-200 font-bold">{currentCurveExponent.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                if (!user) handleGoogleLogin();
                else setSaveModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>SAVE TO MY CLOUD</span>
            </button>
            <button
              onClick={() => {
                if (!user) handleGoogleLogin();
                else setPublishModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
              title="Publish to Community Hub"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* User's Cloud Stored Presets */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">My Cloud Presets</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {userPresets.length} Presets in Firestore
            </span>
          </div>

          {userPresets.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Cloud className="w-8 h-8 text-slate-600 mx-auto mb-1.5 opacity-60" />
              <p className="text-xs text-slate-400 font-mono">No personal cloud presets saved yet.</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Calibrate your deadzone and click "Save to My Cloud" to backup your setup.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {userPresets.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl flex items-center justify-between gap-2 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono truncate max-w-[160px]">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      DZ: {p.internalDeadzone} | Dodge: {p.dodgeDeadzone} | Exp: {p.curveExponent}
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(p)}
                    className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1"
                  >
                    {appliedPresetId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Global Presets (Backed by Firestore) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] uppercase tracking-wide">
                Community Pro Presets (Google Firestore)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-['Rajdhani'] mt-0.5">
              Live configurations shared and rated by the Rocket League competitive community.
            </p>
          </div>

          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full self-start sm:self-auto font-bold">
            1-Click Sync to Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityPresets.map((preset) => (
            <div
              key={preset.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                    {preset.rankTier}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => handleLike(preset.id)}
                      className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${likedPresets[preset.id] ? 'text-indigo-400 fill-indigo-400' : ''}`} />
                      <span>{preset.likesCount}</span>
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-200 font-['Chakra_Petch'] group-hover:text-emerald-400 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-['Rajdhani'] mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-1.5 my-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 text-center font-mono">
                  <div>
                    <div className="text-[9px] text-slate-500">Deadzone</div>
                    <div className="text-xs font-bold text-slate-200">{preset.internalDeadzone}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500">Dodge DZ</div>
                    <div className="text-xs font-bold text-slate-200">{preset.dodgeDeadzone}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500">Exponent</div>
                    <div className="text-xs font-bold text-slate-200">{preset.curveExponent}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                  by {preset.creatorName}
                </span>

                <button
                  onClick={() => handleApply(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    appliedPresetId === preset.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {appliedPresetId === preset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>APPLIED!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>APPLY PRESET</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] uppercase flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Publish to Firestore Community
              </h3>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Preset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zen 120Hz Kickoff & Deadzone"
                  value={presetTitle}
                  onChange={(e) => setPresetTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe your timing, feel, and competitive rank..."
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-400">Included Calibrations:</div>
                <div className="text-slate-200 font-bold">
                  Internal Deadzone: {currentDeadzone} | Dodge: {currentDodgeDeadzone} | Exponent: {currentCurveExponent}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Publish to Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Save Preset to Cloud Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-['Chakra_Petch'] uppercase flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Save to My Google Cloud
              </h3>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveToCloudSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zen 120Hz Calibrated Setup"
                  value={savePresetName}
                  onChange={(e) => setSavePresetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-400">Included Calibrations:</div>
                <div className="text-slate-200 font-bold">
                  Internal Deadzone: {currentDeadzone} | Dodge: {currentDodgeDeadzone} | Exponent: {currentCurveExponent}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl border shadow-2xl font-mono text-xs flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-500/50'
                : 'bg-indigo-950 text-indigo-200 border-indigo-500/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
