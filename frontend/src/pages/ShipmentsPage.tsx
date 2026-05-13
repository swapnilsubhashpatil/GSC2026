/** @format */

import { useState, useEffect, useMemo } from 'react';
import { Search, X, LayoutGrid, Table2 } from 'lucide-react';
import { usePigeonStore } from '../store/usePigeonStore';
import { api } from '../lib/api';
import { ShipmentLeaderboard } from '../components/dashboard/ShipmentLeaderboard';
import { ShipmentGrid } from '../components/dashboard/ShipmentGrid';
import { Loading } from '../components/ui/Loading';

type StatusFilter = 'all' | 'in_transit' | 'delayed' | 'at_port' | 'delivered' | 'pending';
type ViewMode = 'table' | 'grid';

export function ShipmentsPage() {
  const setShipments = usePigeonStore((s) => s.setShipments);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [minRiskFilter, setMinRiskFilter] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    api.shipments().then((data) => { setShipments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [setShipments]);

  const activeFilters = useMemo(() => {
    const f = [];
    if (statusFilter !== 'all') f.push({ label: statusFilter.replace('_', ' '), onRemove: () => setStatusFilter('all') });
    if (minRiskFilter != null) f.push({ label: `Risk ≥ ${minRiskFilter}`, onRemove: () => setMinRiskFilter(null) });
    if (searchQuery) f.push({ label: `"${searchQuery}"`, onRemove: () => setSearchQuery('') });
    return f;
  }, [statusFilter, minRiskFilter, searchQuery]);

  if (loading) return <Loading text="Loading shipments..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and filter all active shipments</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Table2 className="w-4 h-4" />Table</button>
          <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid className="w-4 h-4" />Grid</button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by ID, carrier, route..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-indigo-300 appearance-none cursor-pointer">
          <option value="all">All Statuses</option><option value="in_transit">In Transit</option><option value="delayed">Delayed</option><option value="at_port">At Port</option><option value="pending">Pending</option><option value="delivered">Delivered</option>
        </select>
        <select value={minRiskFilter ?? ''} onChange={(e) => setMinRiskFilter(e.target.value ? Number(e.target.value) : null)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-indigo-300 appearance-none cursor-pointer">
          <option value="">All Risk</option><option value="70">Critical</option><option value="40">Elevated</option>
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          {activeFilters.map((f, i) => <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">{f.label}<button onClick={f.onRemove}><X className="w-3 h-3" /></button></span>)}
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <ShipmentLeaderboard searchQuery={searchQuery} statusFilter={statusFilter} minRiskFilter={minRiskFilter} />
        </div>
      ) : (
        <ShipmentGrid searchQuery={searchQuery} statusFilter={statusFilter} minRiskFilter={minRiskFilter} />
      )}
    </div>
  );
}
