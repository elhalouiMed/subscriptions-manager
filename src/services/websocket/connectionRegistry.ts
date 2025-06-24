import { WebSocket } from 'ws'
import { logger } from '../..'

const sessions = new Map<string, WebSocket>()

export const addSession = (sessionId: string, socket: WebSocket): void => {
  sessions.set(sessionId, socket)
}

export const removeSession = (sessionId: string): void => {
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
