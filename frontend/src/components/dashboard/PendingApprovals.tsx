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
  const pushFeedItem = usePigeonStore((s) => s.pushFeedItem);
  const navigate = useNavigate();

  async function handleApprove(decisionId: string, optionId: string) {
    try {
      await api.approveDecision(decisionId, optionId);
      resolveDecision(decisionId, 'approved');
      pushFeedItem({
        id: `approved-${decisionId}`,
        type: 'approved',
        message: `Approved ${decisionId}`,
        timestamp: +new Date(),
      });
    } catch (err) {
      console.error('Approve failed:', err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-indigo-500" />
          Pending Approvals
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              {pending.length}
            </span>
          )}
        </h3>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <CheckCircleIcon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          All caught up
        </div>
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 4).map((decision) => {
            const shipment = shipments.get(decision.shipment_id);
            const recommended = decision.options[0];

            return (
              <div
                key={decision.decision_id}
                className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">{decision.decision_id}</span>
                    <span className="text-sm font-mono font-semibold text-gray-900">{decision.shipment_id}</span>
                  </div>
                  {shipment && (
                    <span className="text-xs text-gray-500">
                      {shipment.origin.port} → {shipment.destination.port}
                    </span>
                  )}
                </div>

                {recommended && (
                  <div className="mb-3 text-sm text-gray-600">
                    Recommended:{' '}
                    <span className="text-emerald-600 font-semibold">{recommended.label}</span>
                    <span className="text-gray-400 ml-1">
                      (+${recommended.cost_delta_usd.toLocaleString()}, {recommended.eta_delta_hours}h)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => recommended && handleApprove(decision.decision_id, recommended.option_id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/shipments/${decision.shipment_id}`)}
                  >
                    Review
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {pending.length > 4 && (
            <button
              onClick={() => navigate('/decisions')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              View {pending.length - 4} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
