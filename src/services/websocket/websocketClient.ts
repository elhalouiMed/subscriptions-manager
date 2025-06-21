import WebSocket from 'ws'
import { config } from '../../config'

class WebSocketClient {
  private ws?: WebSocket

  constructor(private readonly uri: string) {}

  init(): void {
    this.ws = new WebSocket(this.uri)
    this.ws.on('open', () => console.log('[WebSocket] connected'))
    this.ws.on('error', err => console.error('[WebSocket] error', err))
    this.ws.on('message', data => {
      const msg = data.toString()
      console.log('[WebSocket] received:', msg)
    })
    this.ws.on('close', () => {
      console.log('[WebSocket] disconnected, retrying in 1s')
      setTimeout(() => this.init(), 1000)
    })
  }

  send(payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    } else {
      console.warn('[WebSocket] not connected, cannot send message', payload)
    }
  }
}

export const webSocketClient = new WebSocketClient(config.WEBSOCKET_URI)