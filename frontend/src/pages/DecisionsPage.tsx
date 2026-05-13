/** @format */

import { useState, useEffect } from 'react';
import { GitPullRequest, ArrowRight, CheckCircle2, Zap, XCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { usePigeonStore } from '../store/usePigeonStore';
import { useToastStore } from '../store/useToastStore';
import { DecisionCard } from '../components/decision/DecisionCard';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { formatUSD, formatRelativeTime } from '../lib/formatters';
import type { DecisionRecord } from '../lib/types';

function PendingRow({ decision }: { decision: DecisionRecord }) {
  const shipments = usePigeonStore((s) => s.shipments);
  const addToast = useToastStore((s) => s.addToast);
  const shipment = shipments.get(decision.shipment_id);
  const recommended = decision.options[0];
  const [expanded, setExpanded] = useState(false);

  async function handleApproveRecommended() {
    if (!recommended) return;
    try {
      await api.approveDecision(decision.decision_id, recommended.option_id);
      usePigeonStore.getState().resolveDecision(decision.decision_id, 'approved');
      usePigeonStore.getState().pushFeedItem({
        id: `approved-${decision.decision_id}`,
        type: 'approved',
        message: `Approved ${decision.decision_id} for ${decision.shipment_id}`,
        timestamp: +new Date(),
      });
      addToast({ message: `Approved ${decision.decision_id}`, type: 'success' });
    } catch {
      addToast({ message: 'Failed to approve decision', type: 'error' });
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{decision.decision_id}</span>
            <span className="text-sm font-mono font-semibold text-gray-900">{decision.shipment_id}</span>
          </div>
          {shipment && (
            <span className="text-sm text-gray-500">
              {shipment.origin.port} → {shipment.destination.port}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Risk:</span>
            <span className={`text-sm font-mono font-semibold ${
              (shipment?.weighted_risk_score ?? 0) >= 70 ? 'text-red-600' :
              (shipment?.weighted_risk_score ?? 0) >= 40 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {shipment?.weighted_risk_score ?? '-'}
            </span>
          </div>
          {recommended && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-emerald-600 font-semibold">{recommended.label}</span>
              <span className="text-gray-400">({formatUSD(recommended.expected_loss_usd ?? recommended.cost_delta_usd)})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={handleApproveRecommended}>
            Approve
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Review'}
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-5">
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
    auto_executed: { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Auto-executed' },
    approved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Approved' },
    overridden: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
    pending_approval: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  };

  const config = statusConfig[decision.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50/50 transition-colors rounded-lg">
      <div className="flex items-center gap-5">
        <span className="text-xs font-mono text-gray-400 w-24">{decision.decision_id}</span>
        <span className="text-sm font-mono font-semibold text-gray-900 w-24">{decision.shipment_id}</span>
        {shipment && (
          <span className="text-sm text-gray-500">
            {shipment.origin.port} → {shipment.destination.port}
          </span>
        )}
      </div>
      <div className="flex items-center gap-5">
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color} ${config.bg}`}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
        {decision.selected_option_id && (
          <span className="text-xs font-mono text-gray-400">{decision.selected_option_id}</span>
        )}
        {decision.resolved_at && (
          <span className="text-xs text-gray-400">{formatRelativeTime(decision.resolved_at)}</span>
        )}
      </div>
    </div>
  );
}

export function DecisionsPage() {
  const pending = usePigeonStore((s) => s.pendingDecisions);
  const auditLog = usePigeonStore((s) => s.auditLog);
  const setAuditLog = usePigeonStore((s) => s.setAuditLog);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.pendingDecisions(), api.auditLog()])
      .then(([pendingData, auditData]) => {
        const store = usePigeonStore.getState();
        pendingData.forEach((d) => store.addDecision(d));
        setAuditLog(auditData);
        setLoading(false);
      })
      .catch((err) => {
        addToast({ message: err.message || 'Failed to load decisions', type: 'error' });
        setLoading(false);
      });
  }, [setAuditLog, addToast]);

  if (loading) {
    return <Loading text="Loading decisions..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Decisions</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pending.length} pending · {auditLog.length} resolved
        </p>
      </div>

      {/* Pending Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-indigo-500" />
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No pending decisions
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((decision) => (
              <PendingRow key={decision.decision_id} decision={decision} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Resolved ({auditLog.length})
        </h2>
        {auditLog.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            No resolved decisions yet
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
            {auditLog.map((decision) => (
              <AuditRow key={`${decision.decision_id}-${decision.resolved_at}`} decision={decision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
