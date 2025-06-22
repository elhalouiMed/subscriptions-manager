import WebSocket, { Data } from 'ws'
import { config }             from '../../config'
import { logger } from '../..'

class WebSocketClient {
  private ws?: WebSocket
  private reconnectTimer?: NodeJS.Timeout

  constructor(
    private readonly uri: string,
    private readonly reconnectInterval = 1_000
  ) {}

  init(): void {
    this.cleanup()
    this.ws = new WebSocket(this.uri)
    this.ws.on('open', this.onOpen)
    this.ws.on('message', this.onMessage)
    this.ws.on('error', this.onError)
    this.ws.on('close', this.onClose)
  }

  send(payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    } else {
      logger.warn('[WebSocket] not connected, cannot send message', payload)
    }
  }

  close(): void {
    this.clearReconnect()
    this.cleanup()
  }

  private onOpen = (): void => {
    logger.info('[WebSocket] connected')
  }

  private onMessage = (data: Data): void => {
    logger.info('[WebSocket] received:', data.toString())
  }

  private onError = (err: Error): void => {
    logger.error('[WebSocket] error', err)
  }

  private onClose = (code: number, reason: Buffer): void => {
    logger.info(
      `[WebSocket] disconnected (code=${code}, reason=${reason.toString()}); reconnecting in ${this.reconnectInterval}ms`
    )
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined
      this.init()
    }, this.reconnectInterval)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  private cleanup(): void {
    if (!this.ws) return
    this.ws.removeAllListeners()
    if (this.ws.readyState === WebSocket.OPEN) this.ws.close()
    else this.ws.terminate()
    this.ws = undefined
  }
}

export const webSocketClient = new WebSocketClient(config.websocket_uri)
