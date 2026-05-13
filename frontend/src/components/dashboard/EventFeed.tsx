/** @format */

import { useEffect, useRef } from 'react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { formatRelativeTime } from '../../lib/formatters';
import {
  Activity,
  AlertTriangle,
  GitBranch,
  GitPullRequest,
  Zap,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const FEED_ICONS: Record<string, React.ElementType> = {
  risk_update: Activity,
  disruption: AlertTriangle,
  cascade: GitBranch,
  decision_pending: GitPullRequest,
  auto_executed: Zap,
  approved: CheckCircle2,
  overridden: XCircle,
};

const FEED_COLORS: Record<string, string> = {
  risk_update: 'text-indigo-500',
  disruption: 'text-red-500',
  cascade: 'text-amber-500',
  decision_pending: 'text-indigo-500',
  auto_executed: 'text-emerald-500',
  approved: 'text-emerald-500',
  overridden: 'text-red-500',
};

const FEED_BG: Record<string, string> = {
  risk_update: 'bg-indigo-50',
  disruption: 'bg-red-50',
  cascade: 'bg-amber-50',
  decision_pending: 'bg-indigo-50',
  auto_executed: 'bg-emerald-50',
  approved: 'bg-emerald-50',
  overridden: 'bg-red-50',
};

export function EventFeed() {
  const feed = usePigeonStore((s) => s.eventFeed);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [feed.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Live Events</h3>
        <span className="text-xs text-gray-400 font-mono">{feed.length}</span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
        {feed.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            <Activity className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            Waiting for events...
          </div>
        )}
        {feed.map((item) => {
          const Icon = FEED_ICONS[item.type] ?? Activity;
          const color = FEED_COLORS[item.type] ?? 'text-gray-400';
          const bg = FEED_BG[item.type] ?? 'bg-gray-50';
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in"
            >
              <div className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeTime(new Date(item.timestamp).toISOString())}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
