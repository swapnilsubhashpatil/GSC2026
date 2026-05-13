/** @format */

import { Clock, CheckCircle2, AlertTriangle, Ship, Anchor, Truck, Package } from 'lucide-react';
import type { Shipment, Leg } from '../../lib/types';

const LEG_ICONS: Record<string, React.ElementType> = {
  trucking: Truck,
  ocean: Ship,
  port: Anchor,
  rail: Ship,
  air: Ship,
  'last-mile': Package,
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Pending' },
  in_transit: { icon: Ship, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'In Transit' },
  at_port: { icon: Anchor, color: 'text-amber-500', bg: 'bg-amber-50', label: 'At Port' },
  delayed: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Delayed' },
  delivered: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Delivered' },
};

interface ShipmentTimelineProps {
  shipment: Shipment;
}

export function ShipmentTimeline({ shipment }: ShipmentTimelineProps) {
  const statusConfig = STATUS_CONFIG[shipment.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
        <span className="text-sm font-semibold text-gray-900">Journey Timeline</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

        {/* Timeline items */}
        <div className="space-y-0">
          {shipment.legs.map((leg, index) => {
            const Icon = LEG_ICONS[leg.type] || Truck;
            const isActive = index <= getActiveLegIndex(shipment);
            const isCurrent = index === getActiveLegIndex(shipment);

            return (
              <TimelineItem
                key={leg.leg_id}
                leg={leg}
                Icon={Icon}
                isActive={isActive}
                isCurrent={isCurrent}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  leg,
  Icon,
  isActive,
  isCurrent,
}: {
  leg: Leg;
  Icon: React.ElementType;
  isActive: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="relative flex items-start gap-4 py-3">
      {/* Dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            isCurrent
              ? 'bg-indigo-50 border-indigo-500'
              : isActive
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-gray-50 border-gray-200'
          }`}
        >
          <Icon
            className={`w-3.5 h-3.5 ${
              isCurrent ? 'text-indigo-500' : isActive ? 'text-emerald-500' : 'text-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-900 capitalize">{leg.type}</span>
            <span className="text-xs text-gray-400 ml-2">{leg.leg_id}</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold ${
              leg.risk_score >= 70
                ? 'text-red-600'
                : leg.risk_score >= 40
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            }`}
          >
            {leg.risk_score}
          </span>
        </div>
        {(leg.origin || leg.destination) && (
          <p className="text-xs text-gray-500 mt-0.5">
            {leg.origin && <span>From: {leg.origin}</span>}
            {leg.origin && leg.destination && <span className="mx-1">→</span>}
            {leg.destination && <span>To: {leg.destination}</span>}
          </p>
        )}
        {isCurrent && (
          <span className="inline-block mt-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </div>
    </div>
  );
}

function getActiveLegIndex(shipment: Shipment): number {
  switch (shipment.status) {
    case 'pending':
      return -1;
    case 'in_transit':
      return shipment.legs.findIndex((l) => l.type === 'ocean') !== -1
        ? shipment.legs.findIndex((l) => l.type === 'ocean')
        : 0;
    case 'at_port':
      return shipment.legs.findIndex((l) => l.type === 'port') !== -1
        ? shipment.legs.findIndex((l) => l.type === 'port')
        : 1;
    case 'delayed':
      return Math.min(2, shipment.legs.length - 1);
    case 'delivered':
      return shipment.legs.length - 1;
    default:
      return 0;
  }
}
