/** @format */

import { useState, useEffect } from 'react';
import { GitPullRequest, ArrowRight, CheckCircle2, Zap, XCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { usePigeonStore } from '../store/usePigeonStore';
import { DecisionCard } from '../components/decision/DecisionCard';
import { Button } from '../components/ui/Button';
import { formatUSD, formatRelativeTime } from '../lib/formatters';
import type { DecisionRecord } from '../lib/types';

function PendingRow({ decision, onExpand }: { decision: DecisionRecord; onExpand: () => void }) {
  const shipments = usePigeonStore((s) => s.shipments);
  const shipment = shipments.get(decision.shipment_id);
  const recommended = decision.options[0];
  const [expanded, setExpanded] = useState(false);

  async function handleApproveRecommended() {
    if (!recommended) return;
    try {
      await api.approveDecision(decision.decision_id, recommended.option_id);
      // Refresh will happen via store update
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="border border-slate-800 rounded-sm bg-slate-900/30">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">{decision.decision_id}</span>
            <span className="text-xs font-mono text-slate-200">{decision.shipment_id}</span>
          </div>
          {shipment && (
            <span className="text-xs text-slate-400">
              {shipment.origin.port} → {shipment.destination.port}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Risk:</span>
            <span className={`text-xs font-mono font-medium ${
              (shipment?.weighted_risk_score ?? 0) >= 70 ? 'text-red-400' :
              (shipment?.weighted_risk_score ?? 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {shipment?.weighted_risk_score ?? '-'}
            </span>
          </div>
          {recommended && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{recommended.label}</span>
              <span>({formatUSD(recommended.expected_loss_usd ?? recommended.cost_delta_usd)})</span>
              <span className="text-slate-600">·</span>
              <span>{recommended.eta_delta_hours}h</span>
              <span className="text-slate-600">·</span>
              <span>{(recommended.confidence_score * 100).toFixed(0)}% conf</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={handleApproveRecommended}>
            Approve Recommended
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Review Options'}
            <ArrowRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800/50 pt-4">
          <DecisionCard decision={decision} />
        </div>
      )}
    </div>
  );
}

function AuditRow({ decision }: { decision: DecisionRecord }) {
  const shipments = usePigeonStore((s) => s.shipments);
  const shipment = shipments.get(decision.shipment_id);

  const statusConfig = {
    auto_executed: { icon: Zap, color: 'text-emerald-400', label: 'Auto-executed' },
    approved: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Approved' },
    overridden: { icon: XCircle, color: 'text-red-400', label: 'Rejected' },
    pending_approval: { icon: Clock, color: 'text-amber-400', label: 'Pending' },
  };

  const config = statusConfig[decision.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-900/50 transition-colors rounded-sm">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-slate-500 w-20">{decision.decision_id}</span>
        <span className="text-xs font-mono text-slate-200 w-20">{decision.shipment_id}</span>
        {shipment && (
          <span className="text-xs text-slate-400">
            {shipment.origin.port} → {shipment.destination.port}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className={`flex items-center gap-1.5 text-xs ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
        {decision.selected_option_id && (
          <span className="text-[10px] font-mono text-slate-500">{decision.selected_option_id}</span>
        )}
        {decision.resolved_at && (
          <span className="text-[10px] text-slate-600">{formatRelativeTime(decision.resolved_at)}</span>
        )}
      </div>
    </div>
  );
}

export function DecisionsPage() {
  const pending = usePigeonStore((s) => s.pendingDecisions);
  const auditLog = usePigeonStore((s) => s.auditLog);
  const setAuditLog = usePigeonStore((s) => s.setAuditLog);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.pendingDecisions(), api.auditLog()])
      .then(([pendingData, auditData]) => {
        // Seed the store with fetched data if empty
        const store = usePigeonStore.getState();
        if (store.pendingDecisions.length === 0) {
          pendingData.forEach((d) => store.addDecision(d));
        }
        setAuditLog(auditData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setAuditLog]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xs text-slate-500 animate-pulse">Loading decisions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pending.length} pending · {auditLog.length} resolved
          </p>
        </div>
      </div>

      {/* Pending Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs border border-dashed border-slate-800 rounded-sm">
            No pending decisions
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((decision) => (
              <PendingRow key={decision.decision_id} decision={decision} onExpand={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Resolved ({auditLog.length})
        </h2>
        {auditLog.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs border border-dashed border-slate-800 rounded-sm">
            No resolved decisions yet
          </div>
        ) : (
          <div className="border border-slate-800 rounded-sm divide-y divide-slate-800/50">
            {auditLog.map((decision) => (
              <AuditRow key={`${decision.decision_id}-${decision.resolved_at}`} decision={decision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
