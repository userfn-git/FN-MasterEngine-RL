import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, GitBranch, ArrowUpCircle, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { UpdateNotifierModal, ReleaseInfo } from './UpdateNotifierModal';

interface BackgroundUpdateCheckerProps {
  currentVersion?: string;
  onOpenSettingsTab?: () => void;
}

export const BackgroundUpdateChecker: React.FC<BackgroundUpdateCheckerProps> = ({
  currentVersion = 'v4.0.2',
  onOpenSettingsTab,
}) => {
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Just now');
  const [dismissedNotice, setDismissedNotice] = useState<boolean>(false);

  const checkCountRef = useRef<number>(0);

  const performCheck = async (isManual = false) => {
    if (checking) return;
    setChecking(true);

    try {
      const res = await fetch('/api/github/check-releases');
      if (res.ok) {
        const data: ReleaseInfo = await res.json();
        setReleaseInfo(data);

        // Normalize version strings (e.g., 'v4.0.2', 'v4.0.3', '4.0.3')
        const cleanLatest = (data.latest_version || '').replace(/^v/, '').trim();
        const cleanCurrent = currentVersion.replace(/^v/, '').trim();

        // Compare version strings semantically or as release tags
        const isNewer = cleanLatest !== '' && cleanLatest !== cleanCurrent && cleanLatest > cleanCurrent;

        // If repo has releases or if version is newer
        if (isNewer || (data.has_releases && data.latest_version !== currentVersion)) {
          setUpdateAvailable(true);
          // Show popup automatically on discovery
          if (!dismissedNotice) {
            setModalOpen(true);
          }
        } else {
          setUpdateAvailable(false);
        }

        setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      // Local or offline mode fallback
    } finally {
      setChecking(false);
      checkCountRef.current += 1;
    }
  };

  // Background interval polling (every 3 minutes)
  useEffect(() => {
    performCheck();
    const interval = setInterval(() => {
      performCheck();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Banner Notice when Update is available */}
      {updateAvailable && !dismissedNotice && releaseInfo && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-emerald-950/90 border-b border-cyan-500/30 px-4 py-2 text-xs font-mono flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 font-semibold uppercase tracking-wider">New GitHub Update Found:</span>
            <span className="text-emerald-400 font-bold">{releaseInfo.latest_version}</span>
            <span className="hidden sm:inline text-slate-400">
              (Repo: userfn-git/FN-MasterEngine-RL)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-1 font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Update Installation</span>
            </button>
            <button
              onClick={() => setDismissedNotice(true)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Dismiss banner"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Persistent Status Badge in Header / Bottom status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
        <button
          onClick={() => performCheck(true)}
          disabled={checking}
          className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Click to check userfn-git/FN-MasterEngine-RL releases"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">GitHub Sync:</span>
          {checking ? (
            <span className="text-cyan-400">Checking...</span>
          ) : updateAvailable ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Update Ready
            </span>
          ) : (
            <span className="text-slate-400">v4.0.2 (Up to date)</span>
          )}
        </button>

        {updateAvailable && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors font-bold cursor-pointer"
          >
            Install
          </button>
        )}
      </div>

      {/* Full Modal */}
      {releaseInfo && (
        <UpdateNotifierModal
          release={releaseInfo}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onTriggerUpdate={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
