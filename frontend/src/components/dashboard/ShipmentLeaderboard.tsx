/** @format */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { RiskBadge } from '../ui/RiskBadge';
import { LegSparkline } from '../ui/LegSparkline';
import { slaRemaining } from '../../lib/formatters';
import { getRouteDisplay } from '../../lib/constants';

type SortKey = 'score' | 'deadline' | 'id';
type SortDir = 'asc' | 'desc';

interface ShipmentLeaderboardProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  searchQuery?: string;
  statusFilter?: string;
  minRiskFilter?: number | null;
}

export function ShipmentLeaderboard({
  sortKey,
  sortDir,
  onSort,
  searchQuery = '',
  statusFilter = 'all',
  minRiskFilter,
}: ShipmentLeaderboardProps) {
  const shipments = usePigeonStore((s) => s.shipments);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let arr = Array.from(shipments.values());

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(
        (s) =>
          s.shipment_id.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.origin.port.toLowerCase().includes(q) ||
          s.destination.port.toLowerCase().includes(q) ||
          getRouteDisplay(s).toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      arr = arr.filter((s) => s.status === statusFilter);
    }

    if (minRiskFilter !== null && minRiskFilter !== undefined) {
      arr = arr.filter((s) => s.weighted_risk_score >= minRiskFilter);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return arr.sort((a, b) => {
      if (sortKey === 'score') return (a.weighted_risk_score - b.weighted_risk_score) * dir;
      if (sortKey === 'deadline')
        return (new Date(a.SLA_deadline).getTime() - new Date(b.SLA_deadline).getTime()) * dir;
      return a.shipment_id.localeCompare(b.shipment_id) * dir;
    });
  }, [shipments, sortKey, sortDir, searchQuery, statusFilter, minRiskFilter]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />
    );
  };

  const headerCell = (label: string, column: SortKey) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
    >
      {label}
      <SortIcon column={column} />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Shipments</h3>
        <span className="text-xs text-gray-400 font-mono">{filtered.length} of {shipments.size}</span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4">{headerCell('Shipment', 'id')}</th>
              <th className="pb-3 pr-4">{headerCell('Risk', 'score')}</th>
              <th className="pb-3 pr-4">Route</th>
              <th className="pb-3 pr-4">Carrier</th>
              <th className="pb-3 pr-4">SLA</th>
              <th className="pb-3 pr-4">Legs</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  No shipments match your filters
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr
                key={s.shipment_id}
                onClick={() => navigate(`/shipments/${s.shipment_id}`)}
                className="group cursor-pointer hover:bg-gray-50/80 transition-colors"
              >
                <td className="py-3.5 pr-4">
                  <span className="font-mono text-sm font-semibold text-gray-900">{s.shipment_id}</span>
                </td>
                <td className="py-3.5 pr-4">
                  <RiskBadge score={s.weighted_risk_score} size="sm" />
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-sm text-gray-700">{getRouteDisplay(s)}</span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-sm text-gray-500">{s.carrier}</span>
                </td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`text-sm font-mono font-medium ${
                      slaRemaining(s.SLA_deadline) === 'BREACHED' ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {slaRemaining(s.SLA_deadline)}
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <LegSparkline legs={s.legs} />
                </td>
                <td className="py-3.5">
                  <span className="text-xs text-gray-400 capitalize">{s.status.replace('_', ' ')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
