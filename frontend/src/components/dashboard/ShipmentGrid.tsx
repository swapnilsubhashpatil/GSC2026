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
    <div onClick={() => navigate(`/shipments/${shipment.shipment_id}`)} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm font-bold text-gray-900">{shipment.shipment_id}</span>
          </div>
          <p className="text-sm text-gray-500">{getRouteDisplay(shipment)}</p>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${
          shipment.weighted_risk_score >= 70 ? 'bg-red-50 text-red-700' :
          shipment.weighted_risk_score >= 40 ? 'bg-amber-50 text-amber-700' :
          'bg-emerald-50 text-emerald-700'
        }`}>{shipment.weighted_risk_score}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Carrier</span><span className="text-gray-700">{shipment.carrier}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />SLA</span><span className={`font-mono font-medium ${slaRemaining(shipment.SLA_deadline) === 'BREACHED' ? 'text-red-600' : 'text-gray-700'}`}>{slaRemaining(shipment.SLA_deadline)}</span></div>
      </div>
      <div className="mt-4 flex justify-end">
        <span className="text-xs text-gray-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">Details<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></span>
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
    if (searchQuery) { const q = searchQuery.toLowerCase(); arr = arr.filter((s) => s.shipment_id.toLowerCase().includes(q) || s.carrier.toLowerCase().includes(q) || s.origin.port.toLowerCase().includes(q) || s.destination.port.toLowerCase().includes(q) || getRouteDisplay(s).toLowerCase().includes(q)); }
    if (statusFilter && statusFilter !== 'all') arr = arr.filter((s) => s.status === statusFilter);
    if (minRiskFilter != null) arr = arr.filter((s) => s.weighted_risk_score >= minRiskFilter);
    return arr.sort((a, b) => b.weighted_risk_score - a.weighted_risk_score);
  }, [shipments, searchQuery, statusFilter, minRiskFilter]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.length === 0 && <div className="col-span-full text-center py-12 text-sm text-gray-400">No shipments found</div>}
      {filtered.map((s) => <ShipmentCard key={s.shipment_id} shipment={s} />)}
    </div>
  );
}
