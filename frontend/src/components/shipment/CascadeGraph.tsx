/** @format */

import { useEffect, useState } from 'react';
import { GitBranch, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Loading } from '../ui/Loading';
import { EmptyState } from '../ui/EmptyState';
import type { CascadeImpactReport } from '../../lib/types';

interface CascadeGraphProps {
  shipmentId: string;
}

export function CascadeGraph({ shipmentId }: CascadeGraphProps) {
  const [graph, setGraph] = useState<Record<string, string[]>>({});
  const [report, setReport] = useState<CascadeImpactReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.cascadeGraph(), api.simulateCascade(shipmentId, 18)])
      .then(([graphData, reportData]) => {
        setGraph(graphData);
        setReport(reportData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="py-8">
        <Loading text="Loading dependency graph..." />
      </div>
    );
  }

  const dependents = graph[shipmentId] || [];

  if (dependents.length === 0) {
    return (
      <EmptyState
        title="No dependencies"
        description="This shipment has no downstream dependencies."
        icon="box"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-gray-900">Dependency Chain</span>
      </div>

      <div className="relative">
        {/* Root node */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-indigo-700">{shipmentId}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Trigger Shipment</div>
            <div className="text-xs text-gray-500">Root of cascade</div>
          </div>
        </div>

        {/* Connector line */}
        <div className="absolute left-5 top-10 w-0.5 h-6 bg-gray-200" />

        {/* Dependent nodes */}
        <div className="ml-8 space-y-3">
          {dependents.map((depId, i) => {
            const nodeReport = report?.cascade_nodes.find((n) => n.shipment_id === depId);
            return (
              <div key={depId} className="flex items-center gap-3 relative">
                <div className="absolute -left-6 top-1/2 w-4 h-0.5 bg-gray-200" />
                <ArrowRight className="w-4 h-4 text-gray-300 absolute -left-3" />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  nodeReport?.sla_breached ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'
                }`}>
                  <span className={`text-xs font-mono font-bold ${
                    nodeReport?.sla_breached ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    {depId}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Hop {i + 1}</div>
                  {nodeReport && (
                    <div className="text-xs text-gray-500">
                      {nodeReport.delay_hours}h delay · {' '}
                      {nodeReport.sla_breached ? (
                        <span className="text-red-600 font-medium">SLA Breached</span>
                      ) : (
                        <span className="text-emerald-600">SLA OK</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
