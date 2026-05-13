/** @format */

import { useNavigate } from 'react-router-dom';
import { GitPullRequest, ArrowRight } from 'lucide-react';
import { usePigeonStore } from '../../store/usePigeonStore';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

export function PendingApprovals() {
  const pending = usePigeonStore((s) => s.pendingDecisions);
  const shipments = usePigeonStore((s) => s.shipments);
  const resolveDecision = usePigeonStore((s) => s.resolveDecision);
  const navigate = useNavigate();

  async function handleApprove(decisionId: string, optionId: string) {
    try {
      await api.approveDecision(decisionId, optionId);
      resolveDecision(decisionId, 'approved');
    } catch (err) {
      console.error('Approve failed:', err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
          Pending Approvals
          {pending.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 text-[10px] font-mono">
              {pending.length}
            </span>
          )}
        </h3>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-6 text-slate-600 text-xs border border-dashed border-slate-800 rounded-sm">
          No pending approvals
        </div>
      ) : (
        <div className="space-y-2">
          {pending.slice(0, 5).map((decision) => {
            const shipment = shipments.get(decision.shipment_id);
            const recommended = decision.options[0];

            return (
              <div
                key={decision.decision_id}
                className="p-3 rounded-sm border border-slate-800 bg-slate-900/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{decision.decision_id}</span>
                    <span className="text-xs font-mono text-slate-200">{decision.shipment_id}</span>
                  </div>
                  {shipment && (
                    <span className="text-[10px] text-slate-500">
                      {shipment.origin.port} → {shipment.destination.port}
                    </span>
                  )}
                </div>

                {recommended && (
                  <div className="mb-2.5 text-xs text-slate-400">
                    Recommended:{' '}
                    <span className="text-emerald-400 font-medium">{recommended.label}</span>
                    <span className="text-slate-500 ml-1">
                      (+${recommended.cost_delta_usd.toLocaleString()}, {recommended.eta_delta_hours}h)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      recommended && handleApprove(decision.decision_id, recommended.option_id)
                    }
                  >
                    Approve Recommended
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/shipments/${decision.shipment_id}`)}
                  >
                    Review
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
          {pending.length > 5 && (
            <button
              onClick={() => navigate('/decisions')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-1 transition-colors"
            >
              + {pending.length - 5} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
