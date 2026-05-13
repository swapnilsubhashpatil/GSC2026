/** @format */

import { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { usePigeonStore } from '../store/usePigeonStore';
import { useToastStore } from '../store/useToastStore';
import { api } from '../lib/api';
import { formatRelativeTime } from '../lib/formatters';
import { Loading } from '../components/ui/Loading';
import { AlertTriangle, GitBranch, GitPullRequest, Zap, CheckCircle2, XCircle } from 'lucide-react';

const FEED_ICONS: Record<string, React.ElementType> = {
  risk_update: Activity, disruption: AlertTriangle, cascade: GitBranch,
  decision_pending: GitPullRequest, auto_executed: Zap, approved: CheckCircle2, overridden: XCircle,
};
const FEED_COLORS: Record<string, string> = {
  risk_update: 'text-indigo-500', disruption: 'text-red-500', cascade: 'text-amber-500',
  decision_pending: 'text-indigo-500', auto_executed: 'text-emerald-500', approved: 'text-emerald-500', overridden: 'text-red-500',
};

export function ActivityPage() {
  const feed = usePigeonStore((s) => s.eventFeed);
  const setShipments = usePigeonStore((s) => s.setShipments);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shipments()
      .then((data) => { setShipments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setShipments]);

  if (loading) return <Loading text="Loading activity..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Activity</h1>
          <p className="text-sm text-gray-500 mt-1">Live event feed from all systems</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            api.shipments().then((data) => { setShipments(data); addToast({ message: 'Refreshed', type: 'success' }); }).catch(() => addToast({ message: 'Failed', type: 'error' })).finally(() => setLoading(false));
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {feed.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No events yet. Waiting for live updates...</div>
          )}
          {feed.map((item) => {
            const Icon = FEED_ICONS[item.type] ?? Activity;
            const color = FEED_COLORS[item.type] ?? 'text-gray-400';
            return (
              <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(new Date(item.timestamp).toISOString())}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
