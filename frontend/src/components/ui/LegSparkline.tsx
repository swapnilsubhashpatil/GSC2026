/** @format */

import type { Leg } from '../../lib/types';

interface LegSparklineProps {
  legs: Leg[];
}

export function LegSparkline({ legs }: LegSparklineProps) {
  return (
    <div className="flex items-center gap-1.5">
      {legs.map((leg) => (
        <div
          key={leg.leg_id}
          className={`w-2 h-2 rounded-full ${
            leg.risk_score >= 70
              ? 'bg-red-400'
              : leg.risk_score >= 40
                ? 'bg-amber-400'
                : 'bg-emerald-400'
          }`}
          title={`${leg.leg_id}: ${leg.type} (${leg.risk_score})`}
        />
      ))}
    </div>
  );
}
