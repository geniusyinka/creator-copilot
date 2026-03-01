import type { WSClientMessage, WSServerMessage } from '../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Array<(msg: WSServerMessage) => void> = [];
  private closeHandlers: Array<() => void> = [];
  private errorHandlers: Array<(error: Event) => void> = [];

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          this.handleClose();
        };

        this.ws.onerror = (event: Event) => {
          this.handleError(event);
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection failed'));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WSClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', message.type);
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  onMessage(handler: (msg: WSServerMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onClose(handler: () => void): void {
    this.closeHandlers.push(handler);
  }

  onError(handler: (error: Event) => void): void {
    this.errorHandlers.push(handler);
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WSServerMessage;
      for (const handler of this.messageHandlers) {
        handler(message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(): void {
    this.ws = null;
    for (const handler of this.closeHandlers) {
      handler();
    }
  }

  private handleError(error: Event): void {
    for (const handler of this.errorHandlers) {
      handler(error);
    }
  }
}
