/** @format */

import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      pushFeedItem({ id: `approved-${decisionId}`, type: 'approved', message: `Approved ${decisionId}`, timestamp: +new Date() });
    } catch { /* toast handled elsewhere */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Pending Approvals</h3>
        <span className="text-xs text-gray-400 font-mono">{pending.length}</span>
      </div>
      {pending.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50">All caught up</div>
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 3).map((decision) => {
            const shipment = shipments.get(decision.shipment_id);
            const rec = decision.options[0];
            return (
              <div key={decision.decision_id} className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400">{decision.decision_id}</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{decision.shipment_id}</span>
                  </div>
                  {shipment && <span className="text-xs text-gray-500">{shipment.origin.port} → {shipment.destination.port}</span>}
                </div>
                {rec && <div className="mb-3 text-sm text-gray-600">Rec: <span className="text-emerald-600 font-semibold">{rec.label}</span> <span className="text-gray-400">(+${rec.cost_delta_usd.toLocaleString()})</span></div>}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => rec && handleApprove(decision.decision_id, rec.option_id)}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/shipments/${decision.shipment_id}`)}>Review <ArrowRight className="w-3 h-3" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
