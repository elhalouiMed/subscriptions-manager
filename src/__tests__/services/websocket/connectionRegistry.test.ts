import { WebSocket } from 'ws'
import {
  addSession,
  removeSession,
  getSession,
  cleanupDeadSessions
} from '../../../services/websocket/connectionRegistry'

jest.mock('../../../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

const mockedLogger = require('../../../index').logger

describe('connectionRegistry', () => {
  let mockSocket: WebSocket

  beforeEach(() => {
    mockSocket = {
      readyState: WebSocket.OPEN
    } as WebSocket

    jest.clearAllMocks()
  })

  it('should add a session and log it', () => {
    addSession('session-1', mockSocket)

    expect(getSession('session-1')).toBe(mockSocket)
    expect(mockedLogger.info).toHaveBeenCalledWith('new session created : ', 'session-1')
  })

  it('should remove a session and log it', () => {
    addSession('session-2', mockSocket)
    removeSession('session-2')

    expect(getSession('session-2')).toBeUndefined()
    expect(mockedLogger.info).toHaveBeenCalledWith('session deleted : ', 'session-2')
  })

  it('should clean up sessions with non-OPEN sockets', () => {
    const deadSocket = { readyState: WebSocket.CLOSED } as WebSocket
    const aliveSocket = { readyState: WebSocket.OPEN } as WebSocket

    addSession('dead-1', deadSocket)
    addSession('alive-1', aliveSocket)

    cleanupDeadSessions()

    expect(getSession('dead-1')).toBeUndefined()
    expect(getSession('alive-1')).toBe(aliveSocket)
  })

  it('getSession should return undefined if session not found', () => {
    expect(getSession('unknown')).toBeUndefined()
  })
})
