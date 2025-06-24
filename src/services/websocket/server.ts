import { WebSocketServer, WebSocket } from 'ws'
import { addSession, removeSession, cleanupDeadSessions, getSession } from './connectionRegistry'
import { logger } from '../..'
import { config } from '../../config'

export const startWebSocketServer = (): void => {
  const wss = new WebSocketServer({ port: config.websocket_port })

  wss.on('connection', (ws: WebSocket, req) => {
    const qs = req.url?.split('?')[1] ?? ''
    const sessionId = new URLSearchParams(qs).get('sessionId')
    if (!sessionId) {
      ws.close(1008, 'Missing sessionId')
      return
    }

    addSession(sessionId, ws)

    ws.on('close', () => {
      removeSession(sessionId)
    })

    ws.on('error', () => {
      removeSession(sessionId)
    })

    ws.on('ping', () => {
      ws.pong()
    })
  })

  setInterval(() => {
    cleanupDeadSessions()
    for (const socket of wss.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.ping()
      }
    }
  }, 30_000)

  logger.info('[WebSocket] Server listening on port', config.websocket_port)
}

export const sendToSessions = (
  sessionIds: string | string[],
  message: unknown
): void => {
  const payload = typeof message === 'string' ? message : JSON.stringify(message)
  const ids = Array.isArray(sessionIds) ? sessionIds : [sessionIds]

  ids.forEach(id => {
    const socket = getSession(id)
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(payload)
    } else {
      logger.warn(`[WebSocket] cannot send to ${id}, socket not open`)
    }
  })
}