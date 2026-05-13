/** @format */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Ship, Calendar, AlertCircle } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { RiskBadge } from '../ui/RiskBadge';
import { LegSparkline } from '../ui/LegSparkline';
import { slaRemaining } from '../../lib/formatters';
import { getRouteDisplay } from '../../lib/constants';
import type { Shipment } from '../../lib/types';

interface ShipmentGridProps {
  searchQuery?: string;
  statusFilter?: string;
  minRiskFilter?: number | null;
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const navigate = useNavigate();
  const isCritical = shipment.weighted_risk_score >= 70;

  return (
    <div
      onClick={() => navigate(`/shipments/${shipment.shipment_id}`)}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-4 h-4 text-gray-400" />
            <span className="font-mono text-sm font-bold text-gray-900">{shipment.shipment_id}</span>
          </div>
          <p className="text-sm text-gray-500">{getRouteDisplay(shipment)}</p>
        </div>
        <RiskBadge score={shipment.weighted_risk_score} size="sm" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Carrier</span>
          <span className="text-sm text-gray-700">{shipment.carrier}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            SLA
          </span>
          <span className={`text-sm font-mono font-medium ${
            slaRemaining(shipment.SLA_deadline) === 'BREACHED' ? 'text-red-600' : 'text-gray-700'
          }`}>
            {slaRemaining(shipment.SLA_deadline)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs capitalize text-gray-600">{shipment.status.replace('_', ' ')}</span>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <LegSparkline legs={shipment.legs} />
            {isCritical && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                Critical
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs text-gray-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
          View details
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}

export function ShipmentGrid({ searchQuery = '', statusFilter = 'all', minRiskFilter }: ShipmentGridProps) {
  const shipments = usePigeonStore((s) => s.shipments);

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

    return arr.sort((a, b) => b.weighted_risk_score - a.weighted_risk_score);
  }, [shipments, searchQuery, statusFilter, minRiskFilter]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-sm text-gray-400">
          No shipments match your filters
        </div>
      )}
      {filtered.map((shipment) => (
        <ShipmentCard key={shipment.shipment_id} shipment={shipment} />
      ))}
    </div>
  );
}
