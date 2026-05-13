/** @format */

import { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../lib/constants';
import { usePigeonStore } from '../store/usePigeonStore';
import type { SseEvent } from '../lib/types';

export function useSSE() {
  const updateShipmentScore = usePigeonStore((s) => s.updateShipmentScore);
  const addDisruption = usePigeonStore((s) => s.addDisruption);
  const addDecision = usePigeonStore((s) => s.addDecision);
  const pushFeedItem = usePigeonStore((s) => s.pushFeedItem);
  const setConnected = usePigeonStore((s) => s.setConnected);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function connect() {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource(`${API_BASE_URL}/events`);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const event: SseEvent = JSON.parse(e.data);

          switch (event.type) {
            case 'risk_update': {
              updateShipmentScore(
                event.shipment_id,
                event.composite_risk_score,
                event.weighted_risk_score
              );
              pushFeedItem({
                id: `${event.shipment_id}-risk-${+new Date()}`,
                type: 'risk_update',
                message: `Risk update: ${event.shipment_id} now at ${event.weighted_risk_score}`,
                timestamp: +new Date(),
                payload: event,
              });
              break;
            }
            case 'disruption': {
              addDisruption(event.event);
              pushFeedItem({
                id: event.event.event_id,
                type: 'disruption',
                message: `Disruption: ${event.event.subtype} in ${event.event.affected_region}`,
                timestamp: +new Date(),
                payload: event.event,
              });
              break;
            }
            case 'cascade_report': {
              pushFeedItem({
                id: `cascade-${event.report.trigger_shipment}-${+new Date()}`,
                type: 'cascade',
                message: `Cascade: $${event.report.total_sla_exposure_usd.toLocaleString()} exposure from ${event.report.trigger_shipment}`,
                timestamp: +new Date(),
                payload: event.report,
              });
              break;
            }
            case 'decision_pending': {
              addDecision(event.record);
              pushFeedItem({
                id: event.record.decision_id,
                type: 'decision_pending',
                message: `Decision pending: ${event.record.decision_id}`,
                timestamp: +new Date(),
                payload: event.record,
              });
              break;
            }
            case 'decision_auto_executed': {
              addDecision(event.record);
              pushFeedItem({
                id: event.record.decision_id,
                type: 'auto_executed',
                message: `Auto-executed: ${event.record.shipment_id}`,
                timestamp: +new Date(),
                payload: event.record,
              });
              break;
            }
          }
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      esRef.current?.close();
      setConnected(false);
    };
  }, [updateShipmentScore, addDisruption, addDecision, pushFeedItem, setConnected]);
}
