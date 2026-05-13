/** @format */

import { useState, useEffect } from 'react';
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
  compact?: boolean;
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
      className={`flex flex-col rounded-sm border p-4 transition-opacity ${
        isAutoExecuted && !isSelected
          ? 'border-slate-800/50 opacity-50'
          : isSelected
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-slate-800 bg-slate-900/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">{String.fromCharCode(0x2460 + index)}</span>
          <span
            className={`text-xs font-semibold ${
              option.label === 'Safe'
                ? 'text-emerald-400'
                : option.label === 'Aggressive'
                  ? 'text-sky-400'
                  : 'text-slate-400'
            }`}
          >
            {option.label.toUpperCase()}
          </span>
          {option.auto_executable && <Zap className="w-3 h-3 text-amber-400" />}
        </div>
      </div>

      {/* Action */}
      <div className="text-xs text-slate-400 mb-1 capitalize">{option.action.replace('_', ' ')}</div>
      {option.carrier && (
        <div className="text-[10px] text-slate-500 mb-3">via {option.carrier}</div>
      )}

      {/* Expected Loss — headline */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Expected Loss</div>
        <div className={`text-2xl font-mono font-semibold ${rankColor(allLosses, option.expected_loss_usd ?? option.cost_delta_usd)}`}>
          {formatUSD(option.expected_loss_usd ?? option.cost_delta_usd)}
        </div>
      </div>

      {/* Stack bar */}
      {percents && (
        <div className="flex h-1.5 rounded-sm overflow-hidden mb-3 bg-slate-800">
          {percents.direct > 0 && (
            <div className="bg-sky-400" style={{ width: `${percents.direct}%` }} />
          )}
          {percents.penalty > 0 && (
            <div className="bg-red-400" style={{ width: `${percents.penalty}%` }} />
          )}
          {percents.cascade > 0 && (
            <div className="bg-amber-400" style={{ width: `${percents.cascade}%` }} />
          )}
        </div>
      )}

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Direct cost</span>
            <span className="font-mono text-slate-300">{formatUSD(breakdown.direct_cost)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">SLA penalty</span>
            <span className="font-mono text-slate-300">{formatUSD(breakdown.sla_penalty)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Cascade exp.</span>
            <span className="font-mono text-slate-300">{formatUSD(breakdown.cascade_exposure)}</span>
          </div>
        </div>
      )}

      {/* ETA / SLA */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">ETA</span>
          <span className="font-mono text-slate-300">{formatEtaDelta(option.eta_delta_hours)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">SLA</span>
          <span className={`flex items-center gap-1 ${sla.color}`}>
            <span>{sla.icon === 'Check' ? '✓' : sla.icon === 'X' ? '✗' : '⚠'}</span>
            {sla.label}
          </span>
        </div>
        {(option.breach_hours ?? 0) > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Breach</span>
            <span className="font-mono text-red-400">+{option.breach_hours}h</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Confidence</span>
          <span className="font-mono text-slate-300">{(option.confidence_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-[11px] text-slate-400 leading-relaxed mb-4 italic border-l-2 border-slate-700 pl-2.5">
        "{option.rationale}"
      </p>

      {/* Action */}
      {isAutoExecuted && isSelected ? (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-auto">
          <Zap className="w-3.5 h-3.5" />
          PIGEON CHOSE THIS
        </div>
      ) : decision.status === 'pending_approval' && onApprove ? (
        <Button variant="primary" size="sm" className="w-full mt-auto" onClick={onApprove} disabled={disabled}>
          Approve
        </Button>
      ) : null}
    </div>
  );
}

export function DecisionCard({ decision, onUpdate, compact }: DecisionCardProps) {
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
        timestamp: Date.now(),
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
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Reject failed:', err);
    }
  }

  if (compact) {
    return (
      <div className="p-3 rounded-sm border border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-500">{decision.decision_id}</span>
          {isAutoExecuted && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <Zap className="w-3 h-3" />
              Auto-executed
            </span>
          )}
        </div>
        <div className="text-xs text-slate-300">
          {decision.options[0]?.label} — {formatUSD(decision.options[0]?.expected_loss_usd ?? 0)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Strip */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">AI DECISION</span>
          <span className="text-[10px] font-mono text-slate-500">{decision.decision_id}</span>
          <span className="text-[10px] font-mono text-slate-500">{decision.shipment_id}</span>
        </div>
        {isAutoExecuted && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-sm">
            <Zap className="w-3 h-3" />
            Auto-executed by Pigeon
          </span>
        )}
        {decision.status === 'pending_approval' && (
          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-sm">
            <AlertTriangle className="w-3 h-3" />
            Pending Approval
          </span>
        )}
        {decision.status === 'approved' && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-sm">
            <CheckCircle2 className="w-3 h-3" />
            Approved by Manager
          </span>
        )}
        {decision.status === 'overridden' && (
          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-sm">
            <X className="w-3 h-3" />
            Rejected
          </span>
        )}
      </div>

      {/* ML Prediction */}
      {decision.delay_prediction && (
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">ML Prediction</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm font-mono font-semibold ${breachColor(decision.delay_prediction.breach_probability)}`}>
                P(breach) = {formatBreachProbability(decision.delay_prediction.breach_probability)}
              </span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm ${breachColor(decision.delay_prediction.breach_probability).replace('text-', 'bg-')}`}
                  style={{ width: `${decision.delay_prediction.breach_probability * 100}%` }}
                />
              </div>
              {decision.delay_prediction.breach_likely && (
                <span className="text-[10px] text-red-400 font-medium">BREACH LIKELY</span>
              )}
            </div>
          </div>
          {decision.estimated_delay_hours !== undefined && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Assumed Delay</span>
              <div className="text-sm font-mono text-slate-300 mt-0.5">{decision.estimated_delay_hours}h</div>
            </div>
          )}
          {decision.cascade_exposure_usd !== undefined && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Cascade Exposure</span>
              <div className="text-sm font-mono text-amber-400 mt-0.5">
                {formatUSD(decision.cascade_exposure_usd)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-3">
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
        <div className="flex justify-end">
          <Button variant="danger" size="sm" onClick={handleReject}>
            <X className="w-3.5 h-3.5" />
            Reject All
          </Button>
        </div>
      )}
    </div>
  );
}
