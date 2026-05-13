/** @format */

import { useState, useEffect } from 'react';
import { StatsBar } from '../components/dashboard/StatsBar';
import { ShipmentLeaderboard } from '../components/dashboard/ShipmentLeaderboard';
import { EventFeed } from '../components/dashboard/EventFeed';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { Loading } from '../components/ui/Loading';
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
    api.shipments()
      .then((data) => {
        setShipments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    return <Loading text="Loading shipments..." />;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time supply chain monitoring and risk assessment</p>
      </div>

      <StatsBar />

      <div className="grid grid-cols-3 gap-6">
        {/* Shipments table — 2/3 */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <ShipmentLeaderboard sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        </div>

        {/* Right sidebar — 1/3 */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
            <PendingApprovals />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 min-h-[300px]">
            <EventFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
