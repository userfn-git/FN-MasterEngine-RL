import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, GitBranch, Sparkles, CheckCircle2, AlertCircle, ExternalLink, X, ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react';

export interface ReleaseInfo {
  repository: string;
  has_releases: boolean;
  current_installed_version: string;
  latest_version: string;
  release_name: string;
  published_at: string | null;
  html_url: string;
  body: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

interface UpdateNotifierModalProps {
  release: ReleaseInfo;
  isOpen: boolean;
  onClose: () => void;
  onTriggerUpdate: () => void;
}

export const UpdateNotifierModal: React.FC<UpdateNotifierModalProps> = ({
  release,
  isOpen,
  onClose,
  onTriggerUpdate,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const updateScript = `# Run in your Windows PowerShell as Administrator:
Set-Location "C:\\FN-MasterEngine-RL"
Invoke-WebRequest -Uri "https://ais-dev-7xgtk3pserxiaohmdbn4eh-174192677837.europe-west1.run.app/api/build-exe/download" -OutFile "build-executable.ps1" -UseBasicParsing
& ".\\build-executable.ps1"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(updateScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadExe = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = '/api/build-exe/download';
    link.download = 'build-executable.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 p-6 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-wide text-white uppercase font-mono">
                  New Version Available
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {release.latest_version}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                GitHub Repository: <span className="font-mono text-cyan-300">{release.repository}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Comparison Matrix */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">Currently Installed</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-slate-300">{release.current_installed_version}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Local Machine</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono">Latest Upstream</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-emerald-400">{release.latest_version}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Ready to Install</span>
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="mb-5">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Release Highlights & Changelog
          </h4>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/60 max-h-40 overflow-y-auto text-xs font-mono text-slate-300 space-y-1.5">
            <p className="text-emerald-400 font-semibold">• Direct C:\Program Files\Epic Games (64-bit) Launch Integration</p>
            <p className="text-cyan-400">• Standalone Single-File Executable (PS2EXE & Win32 Interop Kernel)</p>
            <p className="text-slate-300">• Embedded SQLite persistence & 120Hz sub-tick mechanics profiler</p>
            {release.body && release.body !== 'Official RLCS master engine release' && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-slate-400 whitespace-pre-wrap">
                {release.body}
              </div>
            )}
          </div>
        </div>

        {/* One-click Update PowerShell Snippet */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Automated PowerShell Update Command:
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              {copiedScript ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {copiedScript ? 'Copied to Clipboard!' : 'Copy Command'}
            </button>
          </div>
          <pre className="p-2.5 rounded-lg bg-black/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all">
            {updateScript}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <a
            href={release.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Remind Later
            </button>
            <button
              onClick={handleDownloadExe}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {downloading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Latest Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
