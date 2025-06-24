// src/__tests__/services/kafka/scheduleEventHandlers.test.ts

jest.mock('../../../config', () => ({
  config: { topics: { metrics_prefix: 'metrics' } }
}))

const produceMock = jest.fn()
jest.mock('../../../services/kafka/kafkaProducer', () => ({
  produce: produceMock
}))

const setAvailabilityMock = jest.fn()
const getSubscriptionByEventKeyMock = jest.fn()
jest.mock('../../../services/subscriptionService', () => ({
  setAvailability: setAvailabilityMock,
  getSubscriptionByEventKey: getSubscriptionByEventKeyMock
}))

const sendToSessionsMock = jest.fn()
jest.mock('../../../services/websocket/server', () => ({
  sendToSessions: sendToSessionsMock
}))

jest.mock('../../../utils/validators/kafka/scheduleEventValidator', () => ({
  kafkaEventSchema: { validate: jest.fn(() => ({ error: null })) },
  availabilityEventSchema: { validate: jest.fn(() => ({ error: null })) }
}))

import Joi from 'joi'
import { config } from '../../../config'
import { produce } from '../../../services/kafka/kafkaProducer'
import { setAvailability, getSubscriptionByEventKey } from '../../../services/subscriptionService'
import { sendToSessions } from '../../../services/websocket/server'
import {
  validateOrThrow,
  handleSchedulerTrigger,
  handleAvailabilityToggle,
  handleMetricsEvent
} from '../../../services/kafka/subscriptionCallbacks'
import {
  kafkaEventSchema,
  availabilityEventSchema
} from '../../../utils/validators/kafka/scheduleEventValidator'

const validKafkaEvent = { payload: { eventKey: 'E1' } }
const validAvailabilityEvent = { payload: { eventKey: 'E2', data: { available: false } } }

beforeEach(() => {
  jest.clearAllMocks()
  ;(kafkaEventSchema.validate as jest.Mock).mockReturnValue({ error: null })
  ;(availabilityEventSchema.validate as jest.Mock).mockReturnValue({ error: null })
})

describe('validateOrThrow', () => {
  it('does not throw for valid schema', () => {
    expect(() => validateOrThrow<Joi.ObjectSchema>(kafkaEventSchema as any, {})).not.toThrow()
  })
  it('throws for invalid schema', () => {
    (kafkaEventSchema.validate as jest.Mock).mockReturnValue({ error: { message: 'oops' } })
    expect(() => validateOrThrow(kafkaEventSchema as any, {})).toThrow('Invalid Kafka event: oops')
  })
})

describe('handleSchedulerTrigger', () => {
  it('produces to metrics topic', async () => {
    await handleSchedulerTrigger(validKafkaEvent)
    expect(produceMock).toHaveBeenCalledWith(
      `${config.topics.metrics_prefix}.E1`,
      'E1',
      validKafkaEvent
    )
  })
  it('throws on invalid event', async () => {
    (kafkaEventSchema.validate as jest.Mock).mockReturnValue({ error: { message: 'bad' } })
    await expect(handleSchedulerTrigger({})).rejects.toThrow('Invalid Kafka event: bad')
  })
})

describe('handleAvailabilityToggle', () => {
  it('calls setAvailability with correct args', async () => {
    await handleAvailabilityToggle(validAvailabilityEvent)
    expect(setAvailabilityMock).toHaveBeenCalledWith('E2', false)
  })
  it('throws on invalid event', async () => {
    ;(availabilityEventSchema.validate as jest.Mock).mockReturnValue({ error: { message: 'fail' } })
    await expect(handleAvailabilityToggle({})).rejects.toThrow('Invalid Kafka event: fail')
  })
})

describe('handleMetricsEvent', () => {
  it('does nothing when no subscription', async () => {
    getSubscriptionByEventKeyMock.mockResolvedValue(null)
    await handleMetricsEvent(validKafkaEvent)
    expect(sendToSessionsMock).not.toHaveBeenCalled()
  })
  it('does nothing when subscription not available', async () => {
    getSubscriptionByEventKeyMock.mockResolvedValue({ available: false, sessionIds: ['S1'] })
    await handleMetricsEvent(validKafkaEvent)
    expect(sendToSessionsMock).not.toHaveBeenCalled()
  })
  it('sends to all sessions when available', async () => {
    const sub = { available: true, sessionIds: ['A', 'B'] }
    getSubscriptionByEventKeyMock.mockResolvedValue(sub)
    await handleMetricsEvent(validKafkaEvent)
    expect(sendToSessionsMock).toHaveBeenNthCalledWith(1, 'A', JSON.stringify({ eventKey: 'E1', event: validKafkaEvent }))
    expect(sendToSessionsMock).toHaveBeenNthCalledWith(2, 'B', JSON.stringify({ eventKey: 'E1', event: validKafkaEvent }))
  })
  it('throws on invalid event', async () => {
    (kafkaEventSchema.validate as jest.Mock).mockReturnValue({ error: { message: 'bad2' } })
    await expect(handleMetricsEvent({})).rejects.toThrow('Invalid Kafka event: bad2')
  })
})
