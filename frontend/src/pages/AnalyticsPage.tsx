/** @format */

import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, AlertTriangle, Clock, CheckCircle, Zap, DollarSign } from 'lucide-react';
import { usePigeonStore } from '../store/usePigeonStore';
import { useToastStore } from '../store/useToastStore';
import { api } from '../lib/api';
import { Loading } from '../components/ui/Loading';
import { formatUSD, riskColor } from '../lib/formatters';

export function AnalyticsPage() {
  const shipments = usePigeonStore((s) => s.shipments);
  const disruptions = usePigeonStore((s) => s.disruptions);
  const setShipments = usePigeonStore((s) => s.setShipments);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.shipments()
      .then((data) => { setShipments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setShipments]);

  const all = Array.from(shipments.values());
  const stats = useMemo(() => {
    const critical = all.filter((s) => s.weighted_risk_score >= 70).length;
    const elevated = all.filter((s) => s.weighted_risk_score >= 40 && s.weighted_risk_score < 70).length;
    const low = all.filter((s) => s.weighted_risk_score < 40).length;
    const totalExposure = all.filter((s) => s.weighted_risk_score >= 70).reduce((sum) => sum + 50000, 0);
    const avgRisk = all.length > 0 ? all.reduce((sum, s) => sum + s.weighted_risk_score, 0) / all.length : 0;
    const byCarrier = all.reduce<Record<string, { count: number; avgRisk: number; total: number }>>((acc, s) => {
      if (!acc[s.carrier]) acc[s.carrier] = { count: 0, avgRisk: 0, total: 0 };
      acc[s.carrier].count++;
      acc[s.carrier].total += s.weighted_risk_score;
      acc[s.carrier].avgRisk = acc[s.carrier].total / acc[s.carrier].count;
      return acc;
    }, {});
    const byStatus = all.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});
    return { critical, elevated, low, totalExposure, avgRisk: Math.round(avgRisk), byCarrier, byStatus };
  }, [all]);

  if (loading) return <Loading text="Loading analytics..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Fleet-wide risk and performance metrics</p>
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

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Elevated', value: stats.elevated, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Normal', value: stats.low, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Disruptions', value: disruptions.length, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Exposure', value: formatUSD(stats.totalExposure), icon: DollarSign, color: 'text-gray-900', bg: 'bg-gray-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk by Carrier</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCarrier).sort((a, b) => b[1].avgRisk - a[1].avgRisk).map(([carrier, data]) => (
              <div key={carrier} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600 truncate">{carrier}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${data.avgRisk >= 70 ? 'bg-red-500' : data.avgRisk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(data.avgRisk, 100)}%` }} />
                </div>
                <span className={`w-10 text-right text-sm font-mono font-bold ${riskColor(data.avgRisk)}`}>{Math.round(data.avgRisk)}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{data.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = (count / all.length) * 100;
              const color = status === 'delayed' ? 'bg-red-500' : status === 'in_transit' ? 'bg-indigo-500' : status === 'at_port' ? 'bg-amber-500' : status === 'delivered' ? 'bg-emerald-500' : 'bg-gray-400';
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-mono font-bold text-gray-900 w-8 text-right">{count}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Fleet Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Total Shipments</div>
            <div className="text-2xl font-mono font-bold text-gray-900">{all.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Avg Risk</div>
            <div className="text-2xl font-mono font-bold text-gray-900">{stats.avgRisk}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Carriers</div>
            <div className="text-2xl font-mono font-bold text-gray-900">{Object.keys(stats.byCarrier).length}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Active Disruptions</div>
            <div className="text-2xl font-mono font-bold text-gray-900">{disruptions.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
