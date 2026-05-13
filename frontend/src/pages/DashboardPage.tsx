/** @format */

import { useState, useEffect } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { StatsBar } from '../components/dashboard/StatsBar';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { usePigeonStore } from '../store/usePigeonStore';
import { useToastStore } from '../store/useToastStore';
import { api } from '../lib/api';

export function DashboardPage() {
  const setShipments = usePigeonStore((s) => s.setShipments);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shipments().then((data) => { setShipments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [setShipments]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time supply chain command center</p>
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

      <StatsBar />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Shipments at Risk</h3>
              <a href="/shipments" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></a>
            </div>
            <RiskShipmentsMini />
          </div>
        </div>
        <div className="space-y-6">
          <RiskDistribution />
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5"><PendingApprovals /></div>
        </div>
      </div>
    </div>
  );
}

function RiskShipmentsMini() {
  const shipments = usePigeonStore((s) => s.shipments);
  const atRisk = Array.from(shipments.values()).filter((s) => s.weighted_risk_score >= 40).slice(0, 5);

  if (atRisk.length === 0) return <div className="text-center py-8 text-sm text-gray-400">No shipments at risk</div>;

  return (
    <div className="space-y-3">
      {atRisk.map((s) => (
        <a key={s.shipment_id} href={`/shipments/${s.shipment_id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-gray-900">{s.shipment_id}</span>
            <span className="text-sm text-gray-500">{s.origin.port} → {s.destination.port}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-mono font-bold ${s.weighted_risk_score >= 70 ? 'text-red-600' : 'text-amber-600'}`}>{s.weighted_risk_score}</span>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
}
