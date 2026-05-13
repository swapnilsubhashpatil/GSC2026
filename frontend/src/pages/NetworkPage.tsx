/** @format */

import { useEffect, useState } from 'react';
import { GitBranch, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Loading } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import type { CascadeImpactReport } from '../lib/types';

export function NetworkPage() {
  const [graph, setGraph] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cascadeGraph()
      .then((data) => { setGraph(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading network..." />;

  const entries = Object.entries(graph).filter(([, deps]) => deps.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Network</h1>
        <p className="text-sm text-gray-500 mt-1">Downstream shipment dependency chains</p>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No dependencies" description="No cascade dependencies found in the current network." icon="box" />
      ) : (
        <div className="space-y-6">
          {entries.map(([shipmentId, dependents]) => (
            <NetworkCard key={shipmentId} shipmentId={shipmentId} dependents={dependents} />
          ))}
        </div>
      )}
    </div>
  );
}

function NetworkCard({ shipmentId, dependents }: { shipmentId: string; dependents: string[] }) {
  const [report, setReport] = useState<CascadeImpactReport | null>(null);

  useEffect(() => {
    api.simulateCascade(shipmentId, 18)
      .then((r) => setReport(r))
      .catch(() => {});
  }, [shipmentId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-900">Dependency Chain</span>
        <span className="text-xs font-mono text-gray-400 ml-auto">{shipmentId}</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-indigo-700">{shipmentId}</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Trigger Shipment</div>
          <div className="text-xs text-gray-500">Root of cascade</div>
        </div>
      </div>

      <div className="ml-5 space-y-3 relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
        {dependents.map((depId, i) => {
          const nodeReport = report?.cascade_nodes.find((n) => n.shipment_id === depId);
          return (
            <div key={depId} className="flex items-center gap-3 relative pl-6">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-gray-200" />
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 absolute left-1" />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${nodeReport?.sla_breached ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <span className={`text-xs font-mono font-bold ${nodeReport?.sla_breached ? 'text-red-700' : 'text-emerald-700'}`}>{depId}</span>
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

      {report && (
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Affected</div>
            <div className="text-lg font-mono font-bold text-gray-900">{report.affected_shipments.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">POs</div>
            <div className="text-lg font-mono font-bold text-gray-900">{report.affected_purchase_orders.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">Customers</div>
            <div className="text-lg font-mono font-bold text-gray-900">{report.affected_customers.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <div className="text-xs text-red-400 mb-1">Exposure</div>
            <div className="text-lg font-mono font-bold text-red-600">${report.total_sla_exposure_usd.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
