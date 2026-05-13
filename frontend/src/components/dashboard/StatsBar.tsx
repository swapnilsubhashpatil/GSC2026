/** @format */

import { AlertTriangle, Clock, CheckCircle, Zap, DollarSign } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { formatUSD } from '../../lib/formatters';

export function StatsBar() {
  const shipments = usePigeonStore((s) => s.shipments);
  const disruptions = usePigeonStore((s) => s.disruptions);

  const all = Array.from(shipments.values());
  const critical = all.filter((s) => s.weighted_risk_score >= 70).length;
  const elevated = all.filter((s) => s.weighted_risk_score >= 40 && s.weighted_risk_score < 70).length;
  const low = all.filter((s) => s.weighted_risk_score < 40).length;
  const totalExposure = all.filter((s) => s.weighted_risk_score >= 70).reduce((sum) => sum + 50000, 0);

  const stats = [
    { label: 'Critical', value: critical, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Elevated', value: elevated, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Normal', value: low, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Disruptions', value: disruptions.length, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Exposure', value: formatUSD(totalExposure), icon: DollarSign, color: 'text-gray-900', bg: 'bg-gray-50' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((stat) => {
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
  );
}
