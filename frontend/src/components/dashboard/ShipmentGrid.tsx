/** @format */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Ship, Calendar } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { slaRemaining } from '../../lib/formatters';
import { getRouteDisplay } from '../../lib/constants';
import type { Shipment } from '../../lib/types';

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/shipments/${shipment.shipment_id}`)}
      className="group cursor-pointer rounded-xl border border-white/5 bg-bg-elevated p-5 hover:border-white/10 hover:bg-bg-hover transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-sm font-bold text-white">{shipment.shipment_id}</span>
          </div>
          <p className="text-sm text-gray-500">{getRouteDisplay(shipment)}</p>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${
          shipment.weighted_risk_score >= 70 ? 'bg-red-500/10 text-red-400' :
          shipment.weighted_risk_score >= 40 ? 'bg-amber-500/10 text-amber-400' :
          'bg-emerald-500/10 text-emerald-400'
        }`}>
          {shipment.weighted_risk_score}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Carrier</span><span className="text-sm text-gray-400">{shipment.carrier}</span></div>
        <div className="flex items-center justify-between"><span className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />SLA</span><span className={`text-sm font-mono font-medium ${slaRemaining(shipment.SLA_deadline) === 'BREACHED' ? 'text-red-400' : 'text-gray-400'}`}>{slaRemaining(shipment.SLA_deadline)}</span></div>
        <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Status</span><span className="text-xs capitalize text-gray-500">{shipment.status.replace('_', ' ')}</span></div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs text-gray-700 group-hover:text-indigo-400 transition-colors flex items-center gap-1">View details<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></span>
      </div>
    </div>
  );
}

export function ShipmentGrid({ searchQuery = '', statusFilter = 'all', minRiskFilter }: {
  searchQuery?: string; statusFilter?: string; minRiskFilter?: number | null;
}) {
  const shipments = usePigeonStore((s) => s.shipments);

  const filtered = useMemo(() => {
    let arr = Array.from(shipments.values());
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter((s) => s.shipment_id.toLowerCase().includes(q) || s.carrier.toLowerCase().includes(q) || s.origin.port.toLowerCase().includes(q) || s.destination.port.toLowerCase().includes(q) || getRouteDisplay(s).toLowerCase().includes(q));
    }
    if (statusFilter && statusFilter !== 'all') arr = arr.filter((s) => s.status === statusFilter);
    if (minRiskFilter != null) arr = arr.filter((s) => s.weighted_risk_score >= minRiskFilter);
    return arr.sort((a, b) => b.weighted_risk_score - a.weighted_risk_score);
  }, [shipments, searchQuery, statusFilter, minRiskFilter]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.length === 0 && <div className="col-span-full text-center py-12 text-sm text-gray-600">No shipments match your filters</div>}
      {filtered.map((s) => <ShipmentCard key={s.shipment_id} shipment={s} />)}
    </div>
  );
}
