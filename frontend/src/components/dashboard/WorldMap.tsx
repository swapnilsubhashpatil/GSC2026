/** @format */

import { useMemo } from 'react';
import { usePigeonStore } from '../../store/usePigeonStore';

const PORT_COORDS: Record<string, { x: number; y: number }> = {
  CNSHA: { x: 78, y: 38 }, NLRTM: { x: 48, y: 28 }, DEHAM: { x: 50, y: 27 },
  USLAX: { x: 18, y: 36 }, GBFXT: { x: 46, y: 29 }, JPYOK: { x: 82, y: 37 },
  SGSIN: { x: 72, y: 55 }, INNSA: { x: 62, y: 45 }, KRPUS: { x: 80, y: 36 },
  USNYC: { x: 28, y: 35 }, AUMEL: { x: 85, y: 72 },
};

export function WorldMap() {
  const shipments = usePigeonStore((s) => s.shipments);

  const routes = useMemo(() => {
    const seen = new Set<string>();
    return Array.from(shipments.values()).map((s) => {
      const from = PORT_COORDS[s.origin.port];
      const to = PORT_COORDS[s.destination.port];
      if (!from || !to) return null;
      const key = `${s.origin.port}-${s.destination.port}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const isCritical = s.weighted_risk_score >= 70;
      return { from, to, count: 1, isCritical, origin: s.origin.port, dest: s.destination.port };
    }).filter(Boolean);
  }, [shipments]);

  return (
    <div className="rounded-xl border border-white/5 bg-bg-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Lanes</h3>
        <span className="text-[10px] text-gray-600">{routes.length} routes</span>
      </div>
      <div className="relative w-full aspect-[2/1] rounded-lg border border-white/5 bg-bg-primary overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice">
          {/* Simplified world map background dots */}
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={10 + (i % 10) * 9} cy={10 + Math.floor(i / 10) * 25} r="0.3" fill="rgba(255,255,255,0.03)" />
          ))}

          {/* Routes */}
          {routes.map((route, i) => {
            if (!route) return null;
            const { from, to, isCritical } = route;
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2 - 8; // Curve upward
            return (
              <g key={i}>
                <path
                  d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.15)'}
                  strokeWidth={isCritical ? '0.5' : '0.3'}
                  className={isCritical ? 'animate-pulse' : ''}
                />
                {/* Animated dot traveling */}
                <circle r="0.8" fill={isCritical ? '#EF4444' : '#6366F1'}>
                  <animateMotion dur={`${3 + (i % 3) * 0.7}s`} repeatCount="indefinite" path={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`} />
                </circle>
              </g>
            );
          })}

          {/* Ports */}
          {Object.entries(PORT_COORDS).map(([code, pos]) => (
            <g key={code}>
              <circle cx={pos.x} cy={pos.y} r="1.2" fill="rgba(99,102,241,0.3)" />
              <circle cx={pos.x} cy={pos.y} r="0.6" fill="#6366F1" />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-indigo-500/30" />
            <span className="text-[9px] text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-red-500/30" />
            <span className="text-[9px] text-gray-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
