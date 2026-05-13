/** @format */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Anchor, Ship, Truck, Train, Plane, Package, AlertTriangle, Zap } from 'lucide-react';
import { Loading } from '../components/ui/Loading';
import { useToastStore } from '../store/useToastStore';
import { api } from '../lib/api';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { getRouteDisplay } from '../lib/constants';
import { slaRemaining, riskColor } from '../lib/formatters';
import type { Shipment, Leg, CascadeImpactReport, DecisionRecord } from '../lib/types';
import { DecisionCard } from '../components/decision/DecisionCard';

const LEG_ICONS: Record<string, React.ElementType> = {
  trucking: Truck, ocean: Ship, port: Anchor, rail: Train, air: Plane, 'last-mile': Package,
};

function LegBreakdown({ legs }: { legs: Leg[] }) {
  return (
    <div className="space-y-3">
      {legs.map((leg) => {
        const Icon = LEG_ICONS[leg.type] ?? Truck;
        return (
          <div key={leg.leg_id} className="flex items-center gap-4">
            <div className="w-28 flex items-center gap-2 shrink-0">
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">{leg.leg_id}</span>
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${leg.risk_score >= 70 ? 'bg-red-500' : leg.risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${leg.risk_score}%` }} />
            </div>
            <span className={`w-10 text-right text-sm font-mono font-bold ${riskColor(leg.risk_score)}`}>{leg.risk_score}</span>
            {leg.risk_score >= 70 && <AlertTriangle className="w-4 h-4 text-red-500" />}
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
    api.simulateCascade(shipment.shipment_id, delayHours).then(setReport).finally(() => setLoading(false));
  }, [shipment.shipment_id, delayHours]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Cascade Impact</h3>
        <select value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} className="bg-white border border-gray-200 rounded-lg text-sm text-gray-700 px-3 py-1.5 outline-none focus:border-indigo-300">
          {[6, 12, 18, 24, 48].map((h) => <option key={h} value={h}>{h}h delay</option>)}
        </select>
      </div>
      {loading ? <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-gray-400 animate-spin" /></div> : report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[{ l: 'Affected', v: report.affected_shipments.length }, { l: 'POs', v: report.affected_purchase_orders.length }, { l: 'Customers', v: report.affected_customers.length }, { l: 'Exposure', v: `$${report.total_sla_exposure_usd.toLocaleString()}`, c: 'text-red-600' }].map((s) => (
              <div key={s.l} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">{s.l}</div>
                <div className={`text-lg font-mono font-bold ${s.c || 'text-gray-900'}`}>{s.v}</div>
              </div>
            ))}
          </div>
          {report.cascade_nodes.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50"><tr className="border-b border-gray-100 text-xs uppercase text-gray-500"><th className="px-4 py-2">Shipment</th><th className="px-4 py-2">Hop</th><th className="px-4 py-2">Delay</th><th className="px-4 py-2">SLA</th><th className="px-4 py-2 text-right">Exposure</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {report.cascade_nodes.map((n) => (
                    <tr key={n.shipment_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono font-semibold">{n.shipment_id}</td>
                      <td className="px-4 py-2.5 text-gray-500">{n.hop_depth}</td>
                      <td className="px-4 py-2.5 font-mono">{n.delay_hours}h</td>
                      <td className="px-4 py-2.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${n.sla_breached ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{n.sla_breached ? 'Breached' : 'OK'}</span></td>
                      <td className="px-4 py-2.5 font-mono text-right">${n.sla_exposure_usd.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : <div className="text-sm text-gray-400 py-6">No cascade data.</div>}
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

  useEffect(() => { if (!id) return; api.shipment(id).then(setShipment).catch(() => {}).finally(() => setLoading(false)); }, [id]);

  async function handleRefresh() {
    if (!id) return; setRefreshing(true);
    try { const updated = await api.refreshRisk(id); setShipment(updated); addToast({ message: 'Refreshed', type: 'success' }); } catch { addToast({ message: 'Failed', type: 'error' }); } finally { setRefreshing(false); }
  }

  async function handleGenerateDecision() {
    if (!id) return; setGenerating(true);
    try { const record = await api.generateDecision(id); setDecision(record); addToast({ message: record.status === 'auto_executed' ? 'Auto-executed' : 'Generated', type: 'success' }); } catch { addToast({ message: 'Failed', type: 'error' }); } finally { setGenerating(false); }
  }

  if (loading) return <Loading text="Loading shipment..." />;
  if (!shipment) return <div className="h-full flex items-center justify-center"><div className="text-center"><p className="text-gray-400 text-sm">Not found</p><Button variant="ghost" onClick={() => navigate('/shipments')} className="mt-4"><ArrowLeft className="w-4 h-4" />Back</Button></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="w-4 h-4" />Back</button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{shipment.shipment_id}</h1>
              <CopyButton text={shipment.shipment_id} />
              <RiskBadge score={shipment.weighted_risk_score} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-1">{shipment.carrier} · {getRouteDisplay(shipment)} · SLA {slaRemaining(shipment.SLA_deadline)}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 text-center">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Weighted Risk Score</div>
        <div className={`text-7xl font-mono font-bold tracking-tighter ${riskColor(shipment.weighted_risk_score)}`}>{shipment.weighted_risk_score}</div>
        <div className="text-xs text-gray-400 mt-2">Composite {shipment.composite_risk_score} · Multiplier {shipment.sla_urgency_multiplier}x</div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-6">
          <div className={`h-full rounded-full ${shipment.weighted_risk_score >= 70 ? 'bg-red-500' : shipment.weighted_risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${shipment.weighted_risk_score}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Leg Breakdown</h3>
        <LegBreakdown legs={shipment.legs} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <CascadeSection shipment={shipment} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Decision Engine</h3>
            <p className="text-xs text-gray-400 mt-0.5">AI-powered reroute recommendations</p>
          </div>
          {!decision && !generating && <Button variant="primary" onClick={handleGenerateDecision}><Zap className="w-4 h-4" />Generate</Button>}
        </div>
        {generating && <div className="space-y-6"><div className="h-6 bg-gray-100 rounded animate-pulse" /><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}</div></div>}
        {decision && !generating && <DecisionCard decision={decision} onUpdate={setDecision} />}
      </div>
    </div>
  );
}
