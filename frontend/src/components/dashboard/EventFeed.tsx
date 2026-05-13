/** @format */

import { useRef, useEffect } from 'react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { formatRelativeTime } from '../../lib/formatters';
import { Activity, AlertTriangle, GitBranch, GitPullRequest, Zap, CheckCircle2, XCircle } from 'lucide-react';

const FEED_ICONS: Record<string, React.ElementType> = {
  risk_update: Activity, disruption: AlertTriangle, cascade: GitBranch,
  decision_pending: GitPullRequest, auto_executed: Zap, approved: CheckCircle2, overridden: XCircle,
};
const FEED_COLORS: Record<string, string> = {
  risk_update: 'text-indigo-500', disruption: 'text-red-500', cascade: 'text-amber-500',
  decision_pending: 'text-indigo-500', auto_executed: 'text-emerald-500', approved: 'text-emerald-500', overridden: 'text-red-500',
};

export function EventFeed() {
  const feed = usePigeonStore((s) => s.eventFeed);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = 0; }, [feed.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Feed</h3>
        <span className="text-[10px] font-mono text-gray-400">{feed.length}</span>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 space-y-0.5 pr-1">
        {feed.length === 0 && <div className="text-center py-6 text-gray-400 text-xs">Waiting for events...</div>}
        {feed.map((item) => {
          const Icon = FEED_ICONS[item.type] ?? Activity;
          const color = FEED_COLORS[item.type] ?? 'text-gray-400';
          return (
            <div key={item.id} className="flex items-start gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-600 leading-snug truncate">{item.message}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(new Date(item.timestamp).toISOString())}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
