/** @format */

import { useMemo } from 'react';
import { usePigeonStore } from '../../store/usePigeonStore';

export function RiskDistribution() {
  const shipments = usePigeonStore((s) => s.shipments);

  const distribution = useMemo(() => {
    const all = Array.from(shipments.values());
    const critical = all.filter((s) => s.weighted_risk_score >= 70).length;
    const elevated = all.filter((s) => s.weighted_risk_score >= 40 && s.weighted_risk_score < 70).length;
    const low = all.filter((s) => s.weighted_risk_score < 40).length;
    const total = all.length || 1;

    return {
      critical: { count: critical, percent: (critical / total) * 100 },
      elevated: { count: elevated, percent: (elevated / total) * 100 },
      low: { count: low, percent: (low / total) * 100 },
    };
  }, [shipments]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Risk Distribution</h3>

      <div className="space-y-4">
        <DistributionBar
          label="Critical"
          count={distribution.critical.count}
          percent={distribution.critical.percent}
          color="bg-red-500"
          textColor="text-red-600"
        />
        <DistributionBar
          label="Elevated"
          count={distribution.elevated.count}
          percent={distribution.elevated.percent}
          color="bg-amber-500"
          textColor="text-amber-600"
        />
        <DistributionBar
          label="Low"
          count={distribution.low.count}
          percent={distribution.low.percent}
          color="bg-emerald-500"
          textColor="text-emerald-600"
        />
      </div>

      <div className="mt-5 h-3 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${distribution.critical.percent}%` }}
        />
        <div
          className="h-full bg-amber-500 transition-all duration-500"
          style={{ width: `${distribution.elevated.percent}%` }}
        />
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${distribution.low.percent}%` }}
        />
      </div>
    </div>
  );
}

function DistributionBar({
  label,
  count,
  percent,
  color,
  textColor,
}: {
  label: string;
  count: number;
  percent: number;
  color: string;
  textColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono font-semibold ${textColor}`}>{count}</span>
          <span className="text-xs text-gray-400">{percent.toFixed(0)}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
