/** @format */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { RiskBadge } from '../ui/RiskBadge';
import { slaRemaining } from '../../lib/formatters';
import { getRouteDisplay } from '../../lib/constants';

export function ShipmentLeaderboard({ searchQuery = '', statusFilter = 'all', minRiskFilter }: {
  searchQuery?: string; statusFilter?: string; minRiskFilter?: number | null;
}) {
  const shipments = usePigeonStore((s) => s.shipments);
  const navigate = useNavigate();

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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400">
            <th className="px-5 py-3 font-semibold">Shipment</th>
            <th className="px-5 py-3 font-semibold">Risk</th>
            <th className="px-5 py-3 font-semibold">Route</th>
            <th className="px-5 py-3 font-semibold">Carrier</th>
            <th className="px-5 py-3 font-semibold">SLA</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No shipments found</td></tr>}
          {filtered.map((s) => (
            <tr key={s.shipment_id} onClick={() => navigate(`/shipments/${s.shipment_id}`)} className="group cursor-pointer hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4"><span className="font-mono text-sm font-semibold text-gray-900">{s.shipment_id}</span></td>
              <td className="px-5 py-4"><RiskBadge score={s.weighted_risk_score} size="sm" /></td>
              <td className="px-5 py-4 text-sm text-gray-600">{getRouteDisplay(s)}</td>
              <td className="px-5 py-4 text-sm text-gray-500">{s.carrier}</td>
              <td className="px-5 py-4"><span className={`text-xs font-mono font-medium ${slaRemaining(s.SLA_deadline) === 'BREACHED' ? 'text-red-600' : 'text-gray-500'}`}>{slaRemaining(s.SLA_deadline)}</span></td>
              <td className="px-5 py-4"><span className="text-xs text-gray-400 capitalize">{s.status.replace('_', ' ')}</span></td>
              <td className="px-5 py-4"><ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
