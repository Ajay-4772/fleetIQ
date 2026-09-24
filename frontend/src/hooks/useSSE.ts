import { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardEvent } from '../types';

export type SSEConnectionStatus = 'LIVE' | 'RECONNECTING' | 'DISCONNECTED';

interface UseSSEReturn {
  status: SSEConnectionStatus;
  events: DashboardEvent[];
  lastEvent: DashboardEvent | null;
  reconnect: () => void;
  clearEvents: () => void;
}

export function useSSE(onEventReceived?: (event: DashboardEvent) => void): UseSSEReturn {
  const [status, setStatus] = useState<SSEConnectionStatus>('DISCONNECTED');
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<DashboardEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const onEventReceivedRef = useRef(onEventReceived);

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived;
  }, [onEventReceived]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const streamUrl = '/api/dashboard/stream';
    setStatus('RECONNECTING');

    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setStatus('LIVE');
      reconnectAttemptsRef.current = 0;
    };

    es.onerror = () => {
      setStatus('DISCONNECTED');
      es.close();

      const backoff = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 15000);
      reconnectAttemptsRef.current += 1;

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = window.setTimeout(() => {
        setStatus('RECONNECTING');
        connect();
      }, backoff);
    };

    const handleIncoming = (e: MessageEvent) => {
      try {
        const parsed: DashboardEvent = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        setLastEvent(parsed);
        setEvents((prev) => [parsed, ...prev.slice(0, 49)]);

        if (onEventReceivedRef.current) {
          onEventReceivedRef.current(parsed);
        }
      } catch (err) {
        // Skip unparseable heartbeat or strings
      }
    };

    // Generic and specific event names
    const eventTypes = [
      'message',
      'VEHICLE_EVENT_RECEIVED',
      'EVENT_NORMALIZED',
      'EVENT_PROCESSING_FAILED',
      'DECISION_CREATED',
      'ACTION_CREATED',
      'ACTION_UPDATED',
      'CRITICAL_EVENT',
      'AI_DECISION_COMPLETED',
      'AI_FALLBACK',
      'FLEET_METRIC_UPDATED',
      'SYSTEM_HEALTH_CHANGED',
      'ENGINE_FAULT',
      'MAINTENANCE_DUE',
      'EXCESSIVE_IDLE',
      'BATTERY_WARNING',
      'TIRE_PRESSURE_LOW',
      'LOW_UTILIZATION',
      'TELEMETRY_NORMAL'
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, handleIncoming);
    });

    es.addEventListener('HEARTBEAT', () => {
      setStatus('LIVE');
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    events,
    lastEvent,
    reconnect: connect,
    clearEvents
  };
}
