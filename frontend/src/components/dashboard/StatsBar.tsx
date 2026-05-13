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

  // Calculate total SLA exposure from active disruptions or high-risk shipments
  const totalExposure = all
    .filter((s) => s.weighted_risk_score >= 70)
    .reduce((sum) => {
      // Rough estimate: $50k per high-risk shipment
      return sum + 50000;
    }, 0);

  const stats = [
    {
      label: 'Critical',
      value: critical,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
    {
      label: 'Elevated',
      value: amber,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Normal',
      value: green,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Active Disruptions',
      value: disruptions.length,
      icon: Boxes,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      label: 'Est. Exposure',
      value: formatUSD(totalExposure),
      icon: DollarSign,
      color: 'text-slate-300',
      bg: 'bg-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-slate-800 bg-slate-900/50"
          >
            <div className={`w-7 h-7 rounded-sm ${stat.bg} flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-sm font-mono font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
