/** @format */

import { useEffect, useRef, useState } from 'react';
import { useProgressStore } from '../../store/useProgressStore';
import { Zap, Terminal, Check } from 'lucide-react';

const LOG_LINES = [
  'Initializing signal fetchers...',
  'Connecting to weather satellite...',
  'Polling vessel positions...',
  'Analyzing port congestion...',
  'Fetching traffic data...',
  'Running geopolitical NLP...',
  'Computing composite risk scores...',
  'Running XGBoost classifier...',
  'Propagating urgency multipliers...',
  'Syncing with decision engine...',
  'Broadcasting updates...',
];

export function GlobalScanOverlay() {
  const { isLoading, message } = useProgressStore();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const progressRef = useRef(0);
  const logsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => { setProgress(0); setLogs([]); progressRef.current = 0; logsRef.current = []; }, 600);
      return () => clearTimeout(t);
    }

    progressRef.current = 0;
    logsRef.current = [];

    const interval = setInterval(() => {
      const next = Math.min(progressRef.current + Math.random() * 12, 95);
      progressRef.current = next;
      setProgress(next);

      const logIndex = Math.floor((next / 100) * LOG_LINES.length);
      const line = LOG_LINES[logIndex];
      if (line && !logsRef.current.includes(line)) {
        logsRef.current = [...logsRef.current, line];
        setLogs(logsRef.current);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && progressRef.current > 0) {
      progressRef.current = 100;
      setProgress(100);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-lg px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Global Scan</h2>
              <p className="text-xs text-gray-500">Refreshing all shipment risk scores</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-600">{message}</span>
            <span className="text-xs font-mono text-gray-500">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 h-48 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Log</span>
          </div>
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600 font-mono animate-fade-in">
                <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span>
                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                {log}
              </div>
            ))}
            {isLoading && <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono"><span className="animate-pulse">_</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
