jest.mock('../../../config', () => ({
  config: {
    kafka_consumer_group: 'test-group',
  },
}))

const connectFn = jest.fn()
const subscribeFn = jest.fn()
const runFn = jest.fn()

const consumerMockFactory = jest.fn((cfg) => ({
  connect: connectFn,
  subscribe: subscribeFn,
  run: runFn,
}))

jest.mock('../../../services/kafka/client', () => ({
  kafka: {
    consumer: consumerMockFactory,
  },
}))

jest.mock('../../../index', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

import { kafka } from '../../../services/kafka/client'
import { logger } from '../../../index'
import {
  parsePayloadHelper,
  startConsumers,
} from '../../../services/kafka/kafkaConsumer'

const infoMock = logger.info as jest.Mock
const warnMock = logger.warn as jest.Mock
const errorMock = logger.error as jest.Mock

describe('kafkaConsumer', () => {
  beforeEach(() => {
    // Only clear instance methods & logger spies, not the factory
    connectFn.mockClear()
    subscribeFn.mockClear()
    runFn.mockClear()
    infoMock.mockClear()
    warnMock.mockClear()
    errorMock.mockClear()
  })

  it('creates the consumer once at module load with correct groupId', () => {
    expect(consumerMockFactory).toHaveBeenCalledTimes(1)
    expect(consumerMockFactory).toHaveBeenCalledWith({
      groupId: 'test-group',
    })
  })

  describe('parsePayloadHelper', () => {
    it('parses valid JSON', () => {
      const result = parsePayloadHelper<{ x: number }>('{"x":10}')
      expect(result).toEqual({ x: 10 })
    })

    it('falls back on invalid JSON and logs warning', () => {
      const raw = 'nope'
      const result = parsePayloadHelper<string>(raw)
      expect(result).toBe(raw)
      expect(warnMock).toHaveBeenCalledWith(
        { raw, err: expect.any(Error) },
        'Non-JSON payload, treating as string'
      )
    })
  })

  describe('startConsumers', () => {
    it('connects, subscribes, and runs the consumer', async () => {
      const handler = { topic: 't1', onMessage: jest.fn() }
      await startConsumers([handler])

      expect(infoMock).toHaveBeenCalledWith('[Kafka] Consumer connecting…')
      expect(infoMock).toHaveBeenCalledWith('[Kafka] Subscribing to t1')

      expect(connectFn).toHaveBeenCalledTimes(1)
      expect(subscribeFn).toHaveBeenCalledWith({
        topic: 't1',
        fromBeginning: true,
      })
      expect(runFn).toHaveBeenCalledWith(
        expect.objectContaining({ eachMessage: expect.any(Function) })
      )
    })

    it('dispatches JSON messages and logs success', async () => {
      const onMessage = jest.fn()
      await startConsumers([{ topic: 'topicX', onMessage }])

      const eachMessage = (runFn.mock.calls[0][0] as any).eachMessage as Function
      await eachMessage({
        topic: 'topicX',
        partition: 3,
        message: {
          offset: '7',
          value: Buffer.from(JSON.stringify({ foo: 'bar' })),
        },
      })

      expect(onMessage).toHaveBeenCalledWith({ foo: 'bar' }, 'topicX')
      expect(infoMock).toHaveBeenCalledWith(
        { topic: 'topicX', partition: 3, offset: '7' },
        'Handled by topicX'
      )
    })

    it('treats non-JSON payloads as strings and still dispatches', async () => {
      const onMessage = jest.fn()
      await startConsumers([{ topic: 'plain', onMessage }])

      const eachMessage = (runFn.mock.calls[0][0] as any).eachMessage as Function
      await eachMessage({
        topic: 'plain',
        partition: 1,
        message: { offset: '9', value: Buffer.from('just text') },
      })

      expect(onMessage).toHaveBeenCalledWith('just text', 'plain')
      expect(warnMock).toHaveBeenCalled() // from parsePayloadHelper
    })

    it('logs errors when a handler throws', async () => {
      const bad = jest.fn().mockRejectedValue(new Error('boom'))
      await startConsumers([{ topic: /fail/, onMessage: bad }])

      const eachMessage = (runFn.mock.calls[0][0] as any).eachMessage as Function
      const payload = { a: 1 }
      await eachMessage({
        topic: 'fail',
        partition: 5,
        message: {
          offset: '12',
          value: Buffer.from(JSON.stringify(payload)),
        },
      })

      expect(errorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'fail',
          partition: 5,
          offset: '12',
          payload,
          error: expect.any(Error),
        }),
        'Error in Kafka handler'
      )
    })
  })
})
