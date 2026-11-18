import { useEffect, useRef, useState } from 'react';
import { AUTH_TOKEN_KEY } from '@/services/api';

export type ReviewWSConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';

export interface ReviewWSNotification {
  type: 'connected' | 'review.created' | 'review.resolved' | 'pong';
  event_id?: string;
  tenant_id?: string;
  case_id?: string;
  execution_id?: string;
  agent_id?: string;
  agent_name?: string;
  status?: string;
  decision?: string;
  timestamp?: string;
}

interface UseReviewWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: ReviewWSNotification) => void;
}

const VALID_TYPES = new Set<ReviewWSNotification['type']>([
  'connected',
  'review.created',
  'review.resolved',
  'pong',
]);

const BASE_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;

function buildReviewWebSocketUrl(): string {
  const configuredBase = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (configuredBase && (configuredBase.startsWith('ws://') || configuredBase.startsWith('wss://'))) {
    return `${configuredBase.replace(/\/$/, '')}/ws/reviews`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/reviews`;
}

function parseNotification(raw: unknown): ReviewWSNotification | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    const msgType = parsed.type;
    if (typeof msgType !== 'string' || !VALID_TYPES.has(msgType as ReviewWSNotification['type'])) {
      return null;
    }
    return {
      type: msgType as ReviewWSNotification['type'],
      event_id: typeof parsed.event_id === 'string' ? parsed.event_id : undefined,
      tenant_id: typeof parsed.tenant_id === 'string' ? parsed.tenant_id : undefined,
      case_id: typeof parsed.case_id === 'string' ? parsed.case_id : undefined,
      execution_id: typeof parsed.execution_id === 'string' ? parsed.execution_id : undefined,
      agent_id: typeof parsed.agent_id === 'string' ? parsed.agent_id : undefined,
      agent_name: typeof parsed.agent_name === 'string' ? parsed.agent_name : undefined,
      status: typeof parsed.status === 'string' ? parsed.status : undefined,
      decision: typeof parsed.decision === 'string' ? parsed.decision : undefined,
      timestamp: typeof parsed.timestamp === 'string' ? parsed.timestamp : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Connects to the tenant-scoped Review Queue WebSocket (/ws/reviews).
 * Uses first-message JWT authentication (never passes credentials in URL parameters).
 * REST API remains the single source of truth; incoming events are intended to trigger
 * React Query invalidation and refetching.
 */
export function useReviewWebSocket({
  enabled = true,
  onEvent,
}: UseReviewWebSocketOptions): { status: ReviewWSConnectionStatus } {
  const [status, setStatus] = useState<ReviewWSConnectionStatus>('offline');
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    // # Migrate JWT auth storage from localStorage to HttpOnly SameSite cookies app-wide.
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;
    let disposed = false;

    const connect = () => {
      if (disposed) return;

      const latestToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!latestToken) {
        setStatus('offline');
        return;
      }

      setStatus(attempt === 0 ? 'connecting' : 'reconnecting');

      try {
        socket = new WebSocket(buildReviewWebSocketUrl());
      } catch {
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        if (disposed || !socket) return;
        // Authenticate via first message so the JWT never appears in URLs or access logs.
        socket.send(JSON.stringify({ type: 'auth', token: latestToken }));
      };

      socket.onmessage = (event: MessageEvent) => {
        if (disposed) return;
        const msg = parseNotification(event.data);
        if (!msg) return;

        if (msg.type === 'connected') {
          attempt = 0;
          setStatus('connected');
          return;
        }

        if (msg.type === 'review.created' || msg.type === 'review.resolved') {
          onEventRef.current?.(msg);
        }
      };

      socket.onerror = () => {
        // Browser fires onclose immediately after onerror; reconnect is handled there.
      };

      socket.onclose = (closeEvent: CloseEvent) => {
        if (disposed) return;
        // Stop reconnecting on explicit authentication or RBAC rejection.
        if (closeEvent.code === 4001 || closeEvent.code === 4003) {
          setStatus('offline');
          return;
        }
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      attempt += 1;
      setStatus('reconnecting');
      const delay = Math.min(BASE_RECONNECT_MS * 2 ** (attempt - 1), MAX_RECONNECT_MS);
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, delay);
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close(1000, 'component unmounted');
      }
      setStatus('offline');
    };
  }, [enabled]);

  return { status };
}
