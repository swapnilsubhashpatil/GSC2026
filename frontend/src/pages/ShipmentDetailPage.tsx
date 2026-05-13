/** @format */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Anchor, Ship, Truck, Train, Plane, Package, AlertTriangle } from 'lucide-react';
import { Loading } from '../components/ui/Loading';
import { DecisionCardSkeleton } from '../components/ui/Skeleton';
import { useToastStore } from '../store/useToastStore';
import { api } from '../lib/api';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { getRouteDisplay } from '../lib/constants';
import { slaRemaining, riskColor } from '../lib/formatters';
import type { Shipment, Leg, CascadeImpactReport, DecisionRecord } from '../lib/types';
import { DecisionCard } from '../components/decision/DecisionCard';

const LEG_ICONS: Record<string, React.ElementType> = {
  trucking: Truck,
  ocean: Ship,
  port: Anchor,
  rail: Train,
  air: Plane,
  'last-mile': Package,
};

function LegBreakdown({ legs }: { legs: Leg[] }) {
  return (
    <div className="space-y-3">
      {legs.map((leg) => {
        const Icon = LEG_ICONS[leg.type] ?? Truck;
        const isCritical = leg.risk_score >= 70;
        return (
          <div key={leg.leg_id} className="flex items-center gap-4">
            <div className="w-28 flex items-center gap-2 shrink-0">
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase">{leg.leg_id}</span>
              <span className="text-xs text-gray-400 capitalize">{leg.type}</span>
            </div>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  leg.risk_score >= 70
                    ? 'bg-red-500'
                    : leg.risk_score >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${leg.risk_score}%` }}
              />
            </div>
            <span className={`w-10 text-right text-sm font-mono font-semibold ${riskColor(leg.risk_score)}`}>
              {leg.risk_score}
            </span>
            {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function CascadeSection({ shipment }: { shipment: Shipment }) {
  const [report, setReport] = useState<CascadeImpactReport | null>(null);
  const [delayHours, setDelayHours] = useState(18);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.simulateCascade(shipment.shipment_id, delayHours)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [shipment.shipment_id, delayHours]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Cascade Impact Simulation</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Delay scenario:</span>
          <select
            value={delayHours}
            onChange={(e) => setDelayHours(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-lg text-sm text-gray-700 px-3 py-1.5 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {[6, 12, 18, 24, 48].map((h) => (
              <option key={h} value={h}>{h} hours</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Simulating cascade effects...
          </div>
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Affected Shipments" value={`${report.affected_shipments.length}`} color="text-gray-900" />
            <StatCard label="Purchase Orders" value={`${report.affected_purchase_orders.length}`} color="text-gray-900" />
            <StatCard label="Customers" value={`${report.affected_customers.length}`} color="text-gray-900" />
            <StatCard label="Total Exposure" value={`$${report.total_sla_exposure_usd.toLocaleString()}`} color="text-red-600" />
          </div>

          {report.cascade_nodes.length > 0 && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Shipment</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Hop</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Delay</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">SLA</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right">Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.cascade_nodes.map((node) => (
                    <tr key={node.shipment_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{node.shipment_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{node.hop_depth}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{node.delay_hours}h</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${node.sla_breached ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {node.sla_breached ? 'Breached' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700 text-right">
                        ${node.sla_exposure_usd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400 py-6">No cascade data available.</div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
    </div>
  );
}

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.shipment(id)
      .then(setShipment)
      .catch((err) => {
        addToast({ message: err.message || 'Failed to load shipment', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id, addToast]);

  async function handleRefresh() {
    if (!id) return;
    setRefreshing(true);
    try {
      const updated = await api.refreshRisk(id);
      setShipment(updated);
      addToast({ message: 'Risk scores refreshed', type: 'success' });
    } catch {
      addToast({ message: 'Failed to refresh risk scores', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleGenerateDecision() {
    if (!id) return;
    setGenerating(true);
    try {
      const record = await api.generateDecision(id);
      setDecision(record);
      addToast({
        message: record.status === 'auto_executed'
          ? 'Decision auto-executed by Pigeon'
          : 'Decision generated — awaiting approval',
        type: 'success',
      });
    } catch {
      addToast({ message: 'Failed to generate decision options', type: 'error' });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <Loading text="Loading shipment..." />;
  }

  if (!shipment) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Shipment not found</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to overview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{shipment.shipment_id}</h1>
              <RiskBadge score={shipment.weighted_risk_score} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {shipment.carrier} · {getRouteDisplay(shipment)} · SLA: {new Date(shipment.SLA_deadline).toLocaleDateString()} ({slaRemaining(shipment.SLA_deadline)})
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Risk
        </Button>
      </div>

      {/* Risk Score */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Weighted Risk Score</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Composite: {shipment.composite_risk_score} · Urgency multiplier: {shipment.sla_urgency_multiplier}x
            </p>
          </div>
          <span className="text-3xl font-mono font-bold text-gray-900">{shipment.weighted_risk_score}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              shipment.weighted_risk_score >= 70
                ? 'bg-red-500'
                : shipment.weighted_risk_score >= 40
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${shipment.weighted_risk_score}%` }}
          />
        </div>
      </div>

      {/* Legs Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Leg Breakdown</h3>
        <LegBreakdown legs={shipment.legs} />
      </div>

      {/* Cascade */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <CascadeSection shipment={shipment} />
      </div>

      {/* Decision Engine */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Decision Engine</h3>
            <p className="text-xs text-gray-500 mt-0.5">AI-powered reroute recommendations</p>
          </div>
          {!decision && !generating && (
            <Button variant="primary" onClick={handleGenerateDecision}>
              Generate Options
            </Button>
          )}
        </div>

        {generating && <DecisionCardSkeleton />}
        {decision && !generating && <DecisionCard decision={decision} onUpdate={setDecision} />}
      </div>
    </div>
  );
}
