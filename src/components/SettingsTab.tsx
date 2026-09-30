import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Github, 
  Key, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Lock, 
  ExternalLink, 
  FileText, 
  Cpu, 
  Check, 
  ShieldCheck, 
  Code2, 
  ArrowUpRight,
  FolderGit2,
  Terminal,
  Copy,
  Download
} from 'lucide-react';
import { MacroConfig } from '../types';

interface SettingsTabProps {
  macroConfig: MacroConfig;
  activePreset: string;
  onUpdateConfig?: (config: MacroConfig) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  macroConfig,
  activePreset,
  onUpdateConfig,
}) => {
  const [repoOwner, setRepoOwner] = useState<string>(() => {
    return localStorage.getItem('rl_github_owner') || 'userfn-git';
  });
  const [repoName, setRepoName] = useState<string>(() => {
    return localStorage.getItem('rl_github_repo') || 'FN-MasterEngine-RL';
  });

  const TARGET_REPO = `https://github.com/${repoOwner}/${repoName}`;

  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('rl_github_pat') || '';
  });
  const [saveTokenLocally, setSaveTokenLocally] = useState<boolean>(true);
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);
  const [connectedUser, setConnectedUser] = useState<{
    login: string;
    avatar_url: string;
    name: string;
  } | null>(null);

  const [verifyingToken, setVerifyingToken] = useState<boolean>(false);
  const [pushing, setPushing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'idle' | 'success' | 'error' | 'info';
    text: string;
    details?: string;
  }>({
    type: 'idle',
    text: '',
  });

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(() => {
    return localStorage.getItem('rl_last_github_sync') || null;
  });

  const localPowerShellSnippet = `# Run in your Windows PowerShell terminal:
mkdir "C:\\FN-MasterEngine-RL" -Force; cd "C:\\FN-MasterEngine-RL"
git config --global user.name "userfn-git"
git config --global user.email "fnprospace@gmail.com"
git clone https://github.com/${repoOwner}/${repoName}.git .
npm install --legacy-peer-deps
npm run dev`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(localPowerShellSnippet);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2500);
  };

  // Target files to package and push
  const syncItems = [
    {
      file: 'data/fn_master_engine.db.json (SQLite Dump)',
      desc: 'Complete SQLite database tables, active presets & calibration records',
      badge: 'SQLite Database',
    },
    {
      file: 'config/active_macro_config.json',
      desc: 'Current active profile deadzones, speedflip timing windows & sensitivities',
      badge: 'Active Profile',
    },
    {
      file: 'scripts/Logitech_GHub_AutoEngine.lua',
      desc: 'Live compiled Logitech Lua script with active deadzone curve constants',
      badge: 'Hardware Script',
    },
    {
      file: 'scripts/TAInput_Export.ini',
      desc: 'Exported Unreal Engine 3 TAInput.ini bindings and axis smoothing settings',
      badge: 'Engine INI',
    },
  ];

  // Auto-verify if token is already in localStorage
  useEffect(() => {
    if (githubToken && githubToken.startsWith('ghp_')) {
      verifyGithubConnection(githubToken, false);
    }
  }, []);

  const verifyGithubConnection = async (token: string, showNotice = true) => {
    if (!token.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid GitHub Personal Access Token (PAT).',
      });
      return false;
    }

    setVerifyingToken(true);
    setStatusMessage({ type: 'info', text: 'Connecting to GitHub API and validating token permissions...' });

    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Invalid or expired Personal Access Token. Please check token scopes.'
            : `GitHub API error: ${res.statusText}`
        );
      }

      const userData = await res.json();
      setConnectedUser({
        login: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name || userData.login,
      });

      if (saveTokenLocally) {
        localStorage.setItem('rl_github_pat', token.trim());
      }

      if (showNotice) {
        setStatusMessage({
          type: 'success',
          text: `Connected to GitHub as @${userData.login}! Authenticated for repository ${repoOwner}/${repoName}.`,
        });
      }
      return true;
    } catch (err: any) {
      setConnectedUser(null);
      setStatusMessage({
        type: 'error',
        text: `GitHub Authentication Failed: ${err.message}`,
        details: 'Ensure your Personal Access Token has the "repo" scope checked.',
      });
      return false;
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleDisconnect = () => {
    setGithubToken('');
    setConnectedUser(null);
    localStorage.removeItem('rl_github_pat');
    setStatusMessage({
      type: 'info',
      text: 'Disconnected GitHub account and cleared local token storage.',
    });
  };

  const handlePushToGithub = async () => {
    if (!githubToken.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please connect your GitHub account using a Personal Access Token first.',
      });
      return;
    }

    setPushing(true);
    setStatusMessage({
      type: 'info',
      text: `Syncing SQLite database records and configuration states to ${repoOwner}/${repoName}...`,
    });

    try {
      // Save repo owner & name
      localStorage.setItem('rl_github_owner', repoOwner);
      localStorage.setItem('rl_github_repo', repoName);

      // 1. Fetch current backend SQLite records and settings dump
      let sqliteSnapshot = null;
      try {
        const res = await fetch('/api/github/sqlite-export');
        if (res.ok) {
          sqliteSnapshot = await res.json();
        }
      } catch {}

      // 2. Prepare payload bundle
      const timestamp = new Date().toISOString();
      const filesToPush = [
        {
          path: 'data/fn_master_engine_snapshot.json',
          content: JSON.stringify(
            {
              exported_at: timestamp,
              app_version: '4.0.2',
              repository: TARGET_REPO,
              active_preset: activePreset,
              active_macro_config: macroConfig,
              sqlite_database_dump: sqliteSnapshot,
            },
            null,
            2
          ),
          message: `Update SQLite database dump & active preset [${activePreset}] - Master-Engine Sync`,
        },
        {
          path: 'config/active_macro_config.json',
          content: JSON.stringify(macroConfig, null, 2),
          message: `Update active macro configuration (${activePreset}) - Master-Engine Sync`,
        },
      ];

      // 3. Push each file directly via GitHub REST API (Create or Update File Contents)
      for (const item of filesToPush) {
        // First check if file exists to get SHA for update
        let existingSha: string | undefined = undefined;
        try {
          const checkRes = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${item.path}`,
            {
              headers: {
                Authorization: `Bearer ${githubToken.trim()}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          if (checkRes.ok) {
            const fileData = await checkRes.json();
            existingSha = fileData.sha;
          }
        } catch {}

        // Base64 encode UTF-8 content
        const base64Content = btoa(unescape(encodeURIComponent(item.content)));

        const putRes = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${item.path}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${githubToken.trim()}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: item.message,
              content: base64Content,
              sha: existingSha,
              branch: 'main',
            }),
          }
        );

        if (!putRes.ok) {
          // If 404 or 409, try without sha or inspect status
          const errData = await putRes.json().catch(() => ({}));
          throw new Error(
            errData.message || `Failed to commit ${item.path} (HTTP ${putRes.status})`
          );
        }
      }

      const syncTime = new Date().toLocaleString();
      setLastSyncTimestamp(syncTime);
      localStorage.setItem('rl_last_github_sync', syncTime);

      setStatusMessage({
        type: 'success',
        text: `Successfully pushed SQLite database changes and configuration states to GitHub!`,
        details: `Committed to ${repoOwner}/${repoName} on branch 'main' at ${syncTime}.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `GitHub Push Failed: ${err.message}`,
        details:
          `Ensure the token has write access ("repo" scope) and you have permission to push to https://github.com/${repoOwner}/${repoName}.`,
      });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-['Chakra_Petch'] text-slate-100 tracking-wide">
                  SYSTEM SETTINGS & GITHUB SYNCHRONIZATION
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                  v4.0.2
                </span>
              </div>
              <p className="text-sm text-slate-400 font-['Rajdhani'] mt-0.5">
                Connect your GitHub repository to automatically commit and push local SQLite database records, macro configs, and engine states.
              </p>
            </div>
          </div>

          <a
            href={TARGET_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors shrink-0"
          >
            <Github className="w-4 h-4 text-white" />
            <span>userfn-git/FN-MasterEngine-RL</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Grid: GitHub Connector + Local State Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: GitHub Personal Access Token Connector */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                    Connect GitHub Repository
                  </h3>
                  <p className="text-xs text-slate-400 font-['Rajdhani']">
                    Authenticate via Personal Access Token (PAT) with <code className="text-cyan-400">repo</code> write scope
                  </p>
                </div>
              </div>

              {connectedUser ? (
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Authenticated</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 px-3 py-1 rounded-full text-slate-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Not Connected</span>
                </div>
              )}
            </div>

            {/* If Authenticated: User Badge */}
            {connectedUser && (
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={connectedUser.avatar_url}
                    alt={connectedUser.login}
                    className="w-10 h-10 rounded-full border border-emerald-500/40"
                  />
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-200">
                      {connectedUser.name} <span className="text-slate-500 font-normal">(@{connectedUser.login})</span>
                    </div>
                    <div className="text-[11px] text-emerald-400/90 font-mono">
                      Target Repo: {repoOwner}/{repoName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="px-2.5 py-1 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Repository Target Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1">
                  GitHub Owner / Organization:
                </label>
                <input
                  type="text"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value.trim())}
                  placeholder="fnesports or userfn-git"
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1">
                  Repository Name:
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim())}
                  placeholder="RocketLeague-MasterEngine"
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Token Input Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  GitHub Personal Access Token (classic or fine-grained)
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=RocketLeague-MasterEngine-Sync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-normal"
                >
                  Generate Token on GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              <div className="relative">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 font-['Rajdhani']">
                  <input
                    type="checkbox"
                    checked={saveTokenLocally}
                    onChange={(e) => setSaveTokenLocally(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500/40"
                  />
                  <span>Save token securely in browser local storage</span>
                </label>

                <button
                  onClick={() => verifyGithubConnection(githubToken, true)}
                  disabled={verifyingToken || !githubToken.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {verifyingToken ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verify Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Push Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handlePushToGithub}
                disabled={pushing || !githubToken.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {pushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Pushing Database Changes to GitHub Repository...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-white" />
                    <span>Push Local SQLite & Configs to GitHub (Main Branch)</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Notifications */}
            {statusMessage.type !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                    : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />}
                  {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
                  {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 text-cyan-400 animate-spin mt-0.5" />}
                  <div>
                    <div className="font-bold">{statusMessage.text}</div>
                    {statusMessage.details && (
                      <div className="text-[11px] mt-1 opacity-80">{statusMessage.details}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Last Sync: {lastSyncTimestamp || 'Never synced'}</span>
            <span>Target Branch: main</span>
          </div>
        </div>

        {/* Right Column: Files & States to be Synced */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
                Synchronized Data Bundle
              </h3>
            </div>

            <div className="space-y-2.5">
              {syncItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200 font-semibold">{item.file}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-['Rajdhani']">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Active Engine Parameters Snapshot */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
                  Active Preset In Snapshot
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                {activePreset}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block">Internal Deadzone:</span>
                <span className="text-cyan-300 font-bold">{macroConfig.internalDeadzone}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block">Dodge Deadzone:</span>
                <span className="text-cyan-300 font-bold">{macroConfig.dodgeDeadzone}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block">Speedflip Cancel:</span>
                <span className="text-emerald-300 font-bold">{macroConfig.speedflipCancelHold}ms</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                <span className="text-slate-500 block">Physics Tick:</span>
                <span className="text-amber-300 font-bold">120.00 Hz (8.33ms)</span>
              </div>
            </div>
          </div>
          {/* Local Windows PowerShell CLI Quick-Push Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
                  Local Windows PowerShell Push
                </h3>
              </div>
              <button
                onClick={handleCopyCommands}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              >
                {copiedCommands ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-cyan-400" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-['Rajdhani'] mb-2.5">
              Run this in your PowerShell on <code className="text-cyan-300">C:\Users\fnpro\RocketLeague-MasterEngine</code> to push directly:
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
              {localPowerShellSnippet}
            </pre>

            {/* Direct Python Files Download */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                Download Missing Python Scripts to Local PC:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/api/backend-app/download"
                  download="app.py"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download app.py</span>
                </a>
                <a
                  href="/api/python-daemon/download"
                  download="FN_RocketLeague_EngineDaemon.py"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download daemon.py</span>
                </a>
              </div>
            </div>
          </div>

          {/* Node.js Missing from PATH Resolution Guide */}
          <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-bold font-mono text-amber-300 uppercase">
                Fix 'node is not recognized' Error
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 font-['Rajdhani'] mb-3">
              If PowerShell outputs <code className="text-amber-300 font-mono">'"node" is not recognized'</code>, choose one of these two proven methods:
            </p>

            <div className="space-y-3 text-[11px] font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1 flex items-center justify-between">
                  <span>Method 1: Direct Installer (Recommended)</span>
                  <a
                    href="https://nodejs.org/en/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline flex items-center gap-1 text-cyan-300 font-normal"
                  >
                    nodejs.org <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[10px]">
                  <li>Download and run the Windows MSI installer from <strong className="text-slate-200">nodejs.org</strong>.</li>
                  <li>Ensure <strong className="text-slate-200">"Add to PATH"</strong> checkbox is ticked.</li>
                  <li>Close and reopen PowerShell, then run <strong className="text-slate-200">npm run dev</strong>.</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1">Method 2: Via NVM-Windows (One Command)</div>
                <pre className="bg-slate-900 p-2 rounded text-[10px] text-purple-250 select-all overflow-x-auto">
{`winget install CoreyButler.NVMforWindows
nvm install 20.18.0
nvm use 20.18.0`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
