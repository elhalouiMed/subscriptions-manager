const connectFn = jest.fn()
const sendFn = jest.fn()
const producerMockFactory = jest.fn(() => ({
  connect: connectFn,
  send: sendFn
}))

jest.mock('../../../services/kafka/client', () => ({
  kafka: {
    producer: producerMockFactory
  }
}))

jest.mock('../../../index', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

import { kafka } from '../../../services/kafka/client'
import { logger } from '../../../index'
import { initProducer, produce } from '../../../services/kafka/kafkaProducer'

const infoMock = logger.info as jest.Mock
const errorMock = logger.error as jest.Mock

describe('kafkaProducer module', () => {
  beforeEach(() => {
    connectFn.mockClear()
    sendFn.mockClear()
    infoMock.mockClear()
    errorMock.mockClear()
  })

  it('creates the producer once at module load', () => {
    expect(producerMockFactory).toHaveBeenCalledTimes(1)
  })

  describe('initProducer', () => {
    it('logs and connects the producer', async () => {
      await initProducer()
      expect(infoMock).toHaveBeenCalledWith('[Kafka] Producer connecting…')
      expect(connectFn).toHaveBeenCalledTimes(1)
      expect(infoMock).toHaveBeenCalledWith('[Kafka] Producer connected')
    })
  })

  describe('produce', () => {
    it('sends a string message as-is', async () => {
      await produce('topicA', 'keyA', 'hello world')
      expect(sendFn).toHaveBeenCalledWith({
        topic: 'topicA',
        messages: [{ key: 'keyA', value: 'hello world' }]
      })
    })

    it('serializes non-string messages to JSON', async () => {
      const msg = { foo: 'bar', num: 42 }
      await produce('topicB', 'keyB', msg)
      expect(sendFn).toHaveBeenCalledWith({
        topic: 'topicB',
        messages: [
          { key: 'keyB', value: JSON.stringify(msg) }
        ]
      })
    })

    it('handles errors by rejecting', async () => {
      const error = new Error('send failed')
      sendFn.mockRejectedValueOnce(error)
      await expect(produce('t', 'k', { a: 1 })).rejects.toThrow('send failed')
    })
  })
})
