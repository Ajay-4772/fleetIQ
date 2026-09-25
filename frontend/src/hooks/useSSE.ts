import { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardEvent } from '../types';
import { api } from '../services/api';

export type SSEConnectionStatus = 'LIVE' | 'RECONNECTING' | 'DISCONNECTED';

interface UseSSEReturn {
  status: SSEConnectionStatus;
  events: DashboardEvent[];
  lastEvent: DashboardEvent | null;
  reconnect: () => void;
  clearEvents: () => void;
  reloadEvents: () => Promise<void>;
}

export function useSSE(onEventReceived?: (event: DashboardEvent) => void, enabled: boolean = true): UseSSEReturn {
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

  const fetchHistoricalEvents = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.getEvents(0, 50);
      if (res && res.content) {
        const mapped: DashboardEvent[] = res.content.map((evt) => ({
          eventId: evt.eventId,
          vehicleId: evt.vehicleId,
          make: evt.source || 'OEM',
          source: evt.source || 'TOYOTA',
          eventType: evt.eventType || 'TELEMETRY_NORMAL',
          severity: evt.severity || 'LOW',
          timestamp: evt.timestamp,
          status: evt.status || 'NORMAL',
          data: evt.faultCode ? { faultCode: evt.faultCode } : undefined,
          estimatedImpact: 0,
          recommendedAction: evt.faultCode ? `Inspect DTC ${evt.faultCode}` : 'Normal operational telemetry logged'
        }));

        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.eventId || `${e.vehicleId}-${e.timestamp}`));
          const newItems = mapped.filter((m) => !existingIds.has(m.eventId || `${m.vehicleId}-${m.timestamp}`));
          return [...prev, ...newItems].slice(0, 50);
        });
      }
    } catch (err) {
      console.warn('Initial event stream hydration failed:', err);
    }
  }, [enabled]);

  useEffect(() => {
    fetchHistoricalEvents();
  }, [fetchHistoricalEvents]);

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
        setEvents((prev) => [
          parsed,
          ...prev.filter(
            (p) =>
              (p.eventId || `${p.vehicleId}-${p.timestamp}`) !==
              (parsed.eventId || `${parsed.vehicleId}-${parsed.timestamp}`)
          ).slice(0, 49)
        ]);

        if (onEventReceivedRef.current) {
          onEventReceivedRef.current(parsed);
        }
      } catch (err) {
        // Skip unparseable heartbeat strings
      }
    };

    // Listen to standard message and specific event names
    const eventTypes = [
      'message',
      'VEHICLE_EVENT_RECEIVED',
      'EVENT_NORMALIZED',
      'DECISION_CREATED',
      'ACTION_CREATED',
      'ACTION_UPDATED',
      'CRITICAL_EVENT',
      'AI_DECISION_COMPLETED',
      'AI_FALLBACK',
      'BATTERY_WARNING',
      'ENGINE_FAULT',
      'MAINTENANCE_DUE',
      'TIRE_PRESSURE_LOW',
      'TELEMETRY_NORMAL'
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, handleIncoming);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setStatus('DISCONNECTED');
      return;
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, enabled]);

  return {
    status,
    events,
    lastEvent,
    reconnect: connect,
    clearEvents,
    reloadEvents: fetchHistoricalEvents
  };
}
