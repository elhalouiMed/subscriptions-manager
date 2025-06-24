import { WebSocket } from 'ws'
import { logger } from '../..'

const sessions = new Map<string, WebSocket>()

export const addSession = (sessionId: string, socket: WebSocket): void => {
  logger.info('new session created : ', sessionId)
  sessions.set(sessionId, socket)
}

export const removeSession = (sessionId: string): void => {
  logger.info('session deleted : ', sessionId)
  sessions.delete(sessionId)
}

export const getSession = (sessionId: string): WebSocket | undefined =>
  sessions.get(sessionId)


export const cleanupDeadSessions = (): void => {
  for (const [sessionId, socket] of sessions.entries()) {
    if (socket.readyState !== WebSocket.OPEN) {
      sessions.delete(sessionId)
    }
  }
}
