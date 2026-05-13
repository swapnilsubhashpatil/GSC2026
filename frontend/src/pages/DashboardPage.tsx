/** @format */

import { useState, useEffect } from 'react';
import { StatsBar } from '../components/dashboard/StatsBar';
import { ShipmentLeaderboard } from '../components/dashboard/ShipmentLeaderboard';
import { EventFeed } from '../components/dashboard/EventFeed';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { usePigeonStore } from '../store/usePigeonStore';
import { api } from '../lib/api';

type SortKey = 'score' | 'deadline' | 'id';
type SortDir = 'asc' | 'desc';

export function DashboardPage() {
  const setShipments = usePigeonStore((s) => s.setShipments);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shipments().then((data) => {
      setShipments(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [setShipments]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xs text-slate-500 animate-pulse">Loading command center...</div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 flex gap-6">
      {/* Left column — 60% */}
      <div className="w-[60%] flex flex-col gap-6">
        <StatsBar />
        <div className="flex-1 min-h-0 border border-slate-800 rounded-sm bg-slate-900/30 p-4">
          <ShipmentLeaderboard sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        </div>
      </div>

      {/* Right column — 40% */}
      <div className="w-[40%] flex flex-col gap-6">
        <div className="border border-slate-800 rounded-sm bg-slate-900/30 p-4">
          <PendingApprovals />
        </div>
        <div className="flex-1 min-h-0 border border-slate-800 rounded-sm bg-slate-900/30 p-4">
          <EventFeed />
        </div>
      </div>
    </div>
  );
}
