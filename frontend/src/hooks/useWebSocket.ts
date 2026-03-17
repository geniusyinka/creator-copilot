import { useState, useCallback, useRef, useEffect } from 'react';
import { WebSocketService } from '../services/WebSocketService';
import type { WSClientMessage, WSServerMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws/session';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSServerMessage | null>(null);
  const serviceRef = useRef<WebSocketService | null>(null);

  const connect = useCallback(async () => {
    const service = new WebSocketService(WS_URL);
    serviceRef.current = service;

    service.onMessage((msg) => setLastMessage(msg));
    service.onClose(() => setIsConnected(false));
    service.onError(() => setIsConnected(false));

    await service.connect();
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
    setIsConnected(false);
  }, []);

  const send = useCallback((message: WSClientMessage) => {
    serviceRef.current?.send(message);
  }, []);

  useEffect(() => {
    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  return { isConnected, lastMessage, connect, disconnect, send };
}
