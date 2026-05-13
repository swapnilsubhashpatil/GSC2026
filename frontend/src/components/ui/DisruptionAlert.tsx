/** @format */

import { useEffect, useRef, useState } from 'react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { AlertTriangle, X } from 'lucide-react';

export function DisruptionAlert() {
  const disruptions = usePigeonStore((s) => s.disruptions);
  const [showFlash, setShowFlash] = useState(false);
  const lastCountRef = useRef(disruptions.length);

  useEffect(() => {
    if (disruptions.length > lastCountRef.current) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 2000);
      lastCountRef.current = disruptions.length;
      return () => clearTimeout(timer);
    }
  }, [disruptions.length]);

  if (!showFlash) return null;

  return <div className="fixed inset-0 z-[250] pointer-events-none animate-flash-red" />;
}

export function ActiveDisruptionBanner() {
  const disruptions = usePigeonStore((s) => s.disruptions);
  const active = disruptions.filter((d) => !d.resolved);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = active.filter((d) => !dismissed.includes(d.event_id));

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 space-y-1 px-4">
      {visible.map((d) => (
        <div key={d.event_id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-400">DISRUPTION</span>
            <span className="text-xs text-gray-400">{d.subtype} in {d.affected_region} — Severity {(d.severity * 100).toFixed(0)}%</span>
          </div>
          <button onClick={() => setDismissed((prev) => [...prev, d.event_id])} className="text-gray-600 hover:text-gray-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
