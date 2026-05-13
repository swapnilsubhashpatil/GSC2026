/** @format */

import { AlertTriangle, Boxes, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { formatUSD } from '../../lib/formatters';

export function StatsBar() {
  const shipments = usePigeonStore((s) => s.shipments);
  const disruptions = usePigeonStore((s) => s.disruptions);

  const all = Array.from(shipments.values());
  const critical = all.filter((s) => s.weighted_risk_score >= 70).length;
  const amber = all.filter((s) => s.weighted_risk_score >= 40 && s.weighted_risk_score < 70).length;
  const green = all.filter((s) => s.weighted_risk_score < 40).length;

  const totalExposure = all
    .filter((s) => s.weighted_risk_score >= 70)
    .reduce((sum) => sum + 50000, 0);

  const stats = [
    {
      label: 'Critical',
      value: critical,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      label: 'Elevated',
      value: amber,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Normal',
      value: green,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Disruptions',
      value: disruptions.length,
      icon: Boxes,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      label: 'Est. Exposure',
      value: formatUSD(totalExposure),
      icon: DollarSign,
      color: 'text-gray-700',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl border ${stat.border} bg-white shadow-sm`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
