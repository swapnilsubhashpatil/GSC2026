/** @format */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, ArrowRight } from 'lucide-react';
import { usePigeonStore } from '../store/usePigeonStore';
import { RiskBadge } from '../components/ui/RiskBadge';

export function ScanShipmentPage() {
  const shipments = usePigeonStore((s) => s.shipments);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = Array.from(shipments.values()).filter((s) =>
    s.shipment_id.toLowerCase().includes(query.toLowerCase()) ||
    s.carrier.toLowerCase().includes(query.toLowerCase()) ||
    s.origin.port.toLowerCase().includes(query.toLowerCase()) ||
    s.destination.port.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && results.length > 0) {
      navigate(`/shipments/${results[0].shipment_id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Scan</h1>
        <p className="text-sm text-gray-500 mt-1">Quick search any shipment by ID, carrier, or route</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          autoFocus
          placeholder="Type to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {query && results.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No shipments found</div>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {results.map((s, i) => (
            <button
              key={s.shipment_id}
              onClick={() => navigate(`/shipments/${s.shipment_id}`)}
              className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors ${i !== results.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-gray-900">{s.shipment_id}</span>
                    <RiskBadge score={s.weighted_risk_score} showLabel={false} size="sm" />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.carrier} · {s.origin.port} → {s.destination.port}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>
      )}

      {!query && (
        <div className="grid grid-cols-2 gap-4">
          {Array.from(shipments.values()).slice(0, 6).map((s) => (
            <button
              key={s.shipment_id}
              onClick={() => navigate(`/shipments/${s.shipment_id}`)}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-mono font-bold text-gray-900 truncate">{s.shipment_id}</div>
                <div className="text-xs text-gray-500 truncate">{s.origin.port} → {s.destination.port}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
