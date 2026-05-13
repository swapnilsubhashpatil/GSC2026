/** @format */

import { useState } from 'react';
import { CheckCircle2, Zap, X, AlertTriangle } from 'lucide-react';
import type { DecisionRecord, DecisionOption } from '../../lib/types';
import { api } from '../../lib/api';
import { usePigeonStore } from '../../store/usePigeonStore';
import { Button } from '../ui/Button';
import {
  formatUSD,
  breachColor,
  formatBreachProbability,
  formatEtaDelta,
  slaOutcomeBadge,
  lossBreakdownPercents,
  rankColor,
} from '../../lib/formatters';

interface DecisionCardProps {
  decision: DecisionRecord;
  onUpdate?: (d: DecisionRecord) => void;
}

function OptionColumn({
  option,
  index,
  isSelected,
  isAutoExecuted,
  allLosses,
  onApprove,
  disabled,
}: {
  option: DecisionOption;
  index: number;
  isSelected: boolean;
  isAutoExecuted: boolean;
  allLosses: number[];
  onApprove?: () => void;
  disabled: boolean;
}) {
  const sla = slaOutcomeBadge(option.sla_outcome);
  const breakdown = option.expected_loss_breakdown;
  const percents = breakdown ? lossBreakdownPercents(breakdown) : null;

  return (
    <div
      className={`flex flex-col rounded-xl border p-5 transition-all ${
        isAutoExecuted && !isSelected
          ? 'border-gray-100 bg-gray-50/50 opacity-60'
          : isSelected
            ? 'border-emerald-200 bg-emerald-50/30 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-mono font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span
            className={`text-sm font-semibold ${
              option.label === 'Safe'
                ? 'text-emerald-600'
                : option.label === 'Aggressive'
                  ? 'text-indigo-600'
                  : 'text-gray-600'
            }`}
          >
            {option.label}
          </span>
          {option.auto_executable && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold">
              Auto
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="text-sm text-gray-600 mb-1 capitalize">{option.action.replace('_', ' ')}</div>
      {option.carrier && (
        <div className="text-xs text-gray-400 mb-4">via {option.carrier}</div>
      )}

      {/* Expected Loss */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Expected Loss</div>
        <div className={`text-2xl font-mono font-bold ${rankColor(allLosses, option.expected_loss_usd ?? option.cost_delta_usd)}`}>
          {formatUSD(option.expected_loss_usd ?? option.cost_delta_usd)}
        </div>
      </div>

      {/* Stack bar */}
      {percents && (
        <div className="flex h-2 rounded-full overflow-hidden mb-4 bg-gray-100">
          {percents.direct > 0 && (
            <div className="bg-indigo-400 transition-all" style={{ width: `${percents.direct}%` }} />
          )}
          {percents.penalty > 0 && (
            <div className="bg-red-400 transition-all" style={{ width: `${percents.penalty}%` }} />
          )}
          {percents.cascade > 0 && (
            <div className="bg-amber-400 transition-all" style={{ width: `${percents.cascade}%` }} />
          )}
        </div>
      )}

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Direct cost</span>
            <span className="font-mono text-gray-700">{formatUSD(breakdown.direct_cost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">SLA penalty</span>
            <span className="font-mono text-gray-700">{formatUSD(breakdown.sla_penalty)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cascade exp.</span>
            <span className="font-mono text-gray-700">{formatUSD(breakdown.cascade_exposure)}</span>
          </div>
        </div>
      )}

      {/* ETA / SLA */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ETA delta</span>
          <span className="font-mono text-gray-700">{formatEtaDelta(option.eta_delta_hours)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">SLA outcome</span>
          <span className={`flex items-center gap-1 text-sm font-medium ${sla.color}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
            {sla.label}
          </span>
        </div>
        {(option.breach_hours ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Breach</span>
            <span className="font-mono text-red-600 font-medium">+{option.breach_hours}h</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Confidence</span>
          <span className="font-mono text-gray-700">{(option.confidence_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-gray-500 leading-relaxed mb-5 italic border-l-2 border-gray-200 pl-3">
        "{option.rationale}"
      </p>

      {/* Action */}
      {isAutoExecuted && isSelected ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mt-auto px-3 py-2 rounded-lg bg-emerald-50">
          <Zap className="w-4 h-4" />
          Auto-selected by Pigeon
        </div>
      ) : decision.status === 'pending_approval' && onApprove ? (
        <Button variant="primary" size="sm" className="w-full mt-auto" onClick={onApprove} disabled={disabled}>
          Approve This Option
        </Button>
      ) : null}
    </div>
  );
}

export function DecisionCard({ decision, onUpdate }: DecisionCardProps) {
  const [approving, setApproving] = useState<string | null>(null);
  const resolveDecision = usePigeonStore((s) => s.resolveDecision);
  const pushFeedItem = usePigeonStore((s) => s.pushFeedItem);

  const isAutoExecuted = decision.status === 'auto_executed';
  const allLosses = decision.options.map((o) => o.expected_loss_usd ?? o.cost_delta_usd);

  async function handleApprove(optionId: string) {
    setApproving(optionId);
    try {
      const updated = await api.approveDecision(decision.decision_id, optionId);
      resolveDecision(decision.decision_id, 'approved');
      onUpdate?.(updated);
      pushFeedItem({
        id: `approved-${decision.decision_id}`,
        type: 'approved',
        message: `Approved ${decision.decision_id} for ${decision.shipment_id}`,
        timestamp: +new Date(),
      });
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setApproving(null);
    }
  }

  async function handleReject() {
    try {
      const updated = await api.rejectDecision(decision.decision_id);
      resolveDecision(decision.decision_id, 'overridden');
      onUpdate?.(updated);
      pushFeedItem({
        id: `rejected-${decision.decision_id}`,
        type: 'overridden',
        message: `Rejected ${decision.decision_id} for ${decision.shipment_id}`,
        timestamp: +new Date(),
      });
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Strip */}
      <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Decision</span>
          <span className="text-xs font-mono text-gray-400">{decision.decision_id}</span>
          <span className="text-xs font-mono text-gray-400">{decision.shipment_id}</span>
        </div>
        {isAutoExecuted && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            Auto-executed
          </span>
        )}
        {decision.status === 'pending_approval' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        )}
        {decision.status === 'approved' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        )}
        {decision.status === 'overridden' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
            <X className="w-3.5 h-3.5" />
            Rejected
          </span>
        )}
      </div>

      {/* ML Prediction */}
      {decision.delay_prediction && (
        <div className="flex items-center gap-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-medium">ML Breach Probability</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-lg font-mono font-bold ${breachColor(decision.delay_prediction.breach_probability)}`}>
                {formatBreachProbability(decision.delay_prediction.breach_probability)}
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    decision.delay_prediction.breach_probability >= 0.7
                      ? 'bg-red-500'
                      : decision.delay_prediction.breach_probability >= 0.4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${decision.delay_prediction.breach_probability * 100}%` }}
                />
              </div>
              {decision.delay_prediction.breach_likely && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Breach Likely</span>
              )}
            </div>
          </div>
          {decision.estimated_delay_hours !== undefined && (
            <div className="pl-6 border-l border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Assumed Delay</span>
              <div className="text-lg font-mono text-gray-900 mt-1">{decision.estimated_delay_hours}h</div>
            </div>
          )}
          {decision.cascade_exposure_usd !== undefined && (
            <div className="pl-6 border-l border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Cascade Exposure</span>
              <div className="text-lg font-mono text-red-600 mt-1">
                {formatUSD(decision.cascade_exposure_usd)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-4">
        {decision.options.map((option, i) => (
          <OptionColumn
            key={option.option_id}
            option={option}
            index={i}
            isSelected={option.option_id === decision.selected_option_id}
            isAutoExecuted={isAutoExecuted}
            allLosses={allLosses}
            onApprove={
              decision.status === 'pending_approval'
                ? () => handleApprove(option.option_id)
                : undefined
            }
            disabled={approving === option.option_id}
          />
        ))}
      </div>

      {/* Reject All */}
      {decision.status === 'pending_approval' && (
        <div className="flex justify-end pt-2">
          <Button variant="danger" size="sm" onClick={handleReject}>
            <X className="w-4 h-4" />
            Reject All Options
          </Button>
        </div>
      )}
    </div>
  );
}
