/** @format */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Anchor, Ship, Truck, Train, Plane, Package, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { usePigeonStore } from '../store/usePigeonStore';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { getRouteDisplay } from '../lib/constants';
import { slaRemaining, riskColor, formatEtaDelta } from '../lib/formatters';
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
    <div className="space-y-2">
      {legs.map((leg) => {
        const Icon = LEG_ICONS[leg.type] ?? Truck;
        const isCritical = leg.risk_score >= 70;
        return (
          <div key={leg.leg_id} className="flex items-center gap-3">
            <div className="w-24 flex items-center gap-1.5 shrink-0">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{leg.leg_id}</span>
              <span className="text-[10px] text-slate-600 capitalize">{leg.type}</span>
            </div>
            <div className="flex-1 h-2 bg-slate-800 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm ${
                  leg.risk_score >= 70
                    ? 'bg-red-400'
                    : leg.risk_score >= 40
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                }`}
                style={{ width: `${leg.risk_score}%` }}
              />
            </div>
            <span className={`w-8 text-right text-xs font-mono ${riskColor(leg.risk_score)}`}>
              {leg.risk_score}
            </span>
            {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

function CascadeSection({ shipment }: { shipment: Shipment }) {
  const [report, setReport] = useState<CascadeImpactReport | null>(null);
  const [delayHours, setDelayHours] = useState(18);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.simulateCascade(shipment.shipment_id, delayHours)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [shipment.shipment_id, delayHours]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Cascade Impact</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Simulate delay:</span>
          <select
            value={delayHours}
            onChange={(e) => setDelayHours(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-sm text-xs text-slate-300 px-2 py-1 outline-none focus:border-sky-500/50"
          >
            {[6, 12, 18, 24, 48].map((h) => (
              <option key={h} value={h}>{h}h</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 animate-pulse">Simulating cascade...</div>
      ) : report ? (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Affected</div>
              <div className="text-sm font-mono text-slate-200">{report.affected_shipments.length} shipments</div>
            </div>
            <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">POs</div>
              <div className="text-sm font-mono text-slate-200">{report.affected_purchase_orders.length}</div>
            </div>
            <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Customers</div>
              <div className="text-sm font-mono text-slate-200">{report.affected_customers.length}</div>
            </div>
            <div className="p-2.5 rounded-sm border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Exposure</div>
              <div className="text-sm font-mono text-red-400">
                ${report.total_sla_exposure_usd.toLocaleString()}
              </div>
            </div>
          </div>

          {report.cascade_nodes.length > 0 && (
            <div className="border border-slate-800 rounded-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50">
                  <tr className="border-b border-slate-800">
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">Shipment</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">Hop</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">Delay</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">SLA</th>
                    <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 text-right">Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {report.cascade_nodes.map((node) => (
                    <tr key={node.shipment_id} className="hover:bg-slate-900/50">
                      <td className="px-3 py-2 text-xs font-mono text-slate-200">{node.shipment_id}</td>
                      <td className="px-3 py-2 text-xs text-slate-400">{node.hop_depth}</td>
                      <td className="px-3 py-2 text-xs font-mono text-slate-300">{node.delay_hours}h</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs ${node.sla_breached ? 'text-red-400' : 'text-emerald-400'}`}>
                          {node.sla_breached ? 'Breached' : 'OK'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-slate-300 text-right">
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
        <div className="text-xs text-slate-600">No cascade data available.</div>
      )}
    </div>
  );
}

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.shipment(id)
      .then(setShipment)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRefresh() {
    if (!id) return;
    setRefreshing(true);
    try {
      const updated = await api.refreshRisk(id);
      setShipment(updated);
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
    } catch (err) {
      console.error('Decision generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xs text-slate-500 animate-pulse">Loading shipment...</div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xs text-slate-500">Shipment not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">{shipment.shipment_id}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {shipment.carrier} · {getRouteDisplay(shipment)} · SLA: {new Date(shipment.SLA_deadline).toLocaleDateString()} {slaRemaining(shipment.SLA_deadline)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Risk
        </Button>
      </div>

      {/* Risk Score */}
      <div className="p-6 rounded-sm border border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-4 mb-2">
          <RiskBadge score={shipment.weighted_risk_score} size="lg" />
          <span className="text-xs text-slate-500">Composite: {shipment.composite_risk_score} · Multiplier: {shipment.sla_urgency_multiplier}x</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-sm overflow-hidden mt-4">
          <div
            className={`h-full rounded-sm ${
              shipment.weighted_risk_score >= 70
                ? 'bg-red-400'
                : shipment.weighted_risk_score >= 40
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
            }`}
            style={{ width: `${shipment.weighted_risk_score}%` }}
          />
        </div>
      </div>

      {/* Legs Breakdown */}
      <div className="p-6 rounded-sm border border-slate-800 bg-slate-900/30">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Leg Breakdown</h3>
        <LegBreakdown legs={shipment.legs} />
      </div>

      {/* Cascade */}
      <div className="p-6 rounded-sm border border-slate-800 bg-slate-900/30">
        <CascadeSection shipment={shipment} />
      </div>

      {/* Decision Engine */}
      <div className="p-6 rounded-sm border border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Decision Engine</h3>
          {!decision && (
            <Button variant="primary" onClick={handleGenerateDecision} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Options with AI'
              )}
            </Button>
          )}
        </div>

        {decision && <DecisionCard decision={decision} onUpdate={setDecision} />}
      </div>
    </div>
  );
}
