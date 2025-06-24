import Joi from 'joi'
import { config } from '../../config'
import { produce } from './kafkaProducer'
import { setAvailability, getSubscriptionByEventKey } from '../subscriptionService'
import { sendToSessions } from '../websocket/server'
import { KafkaEvent } from '../../models/subscription'
import { availabilityEventSchema, kafkaEventSchema } from '../../utils/validators/kafka/scheduleEventValidator'

export const validateOrThrow: <T>(
  schema: Joi.ObjectSchema,
  event: unknown
) => asserts event is T = <T>(
  schema: Joi.ObjectSchema,
  event: unknown
): asserts event is T => {
  const { error } = schema.validate(event)
  if (error) {
    throw new Error(`Invalid Kafka event: ${error.message}`)
  }
}

export const handleSchedulerTrigger = async (
  event: unknown
): Promise<void> => {
  validateOrThrow<KafkaEvent>(kafkaEventSchema, event)
  const { eventKey } = event.payload
  const metricsTopic = `${config.topics.metrics_prefix}.${eventKey}`
  await produce(metricsTopic, eventKey, event)
}

export const handleAvailabilityToggle = async (
  event: unknown
): Promise<void> => {
  validateOrThrow<KafkaEvent<{ available: boolean }>>(availabilityEventSchema, event)
  const {
    payload: { eventKey, data: { available } },
  } = event
  await setAvailability(eventKey, available)
}

export const handleMetricsEvent = async (
  event: unknown
): Promise<void> => {
  validateOrThrow<KafkaEvent>(kafkaEventSchema, event)
  const { payload: { eventKey } } = event
  const sub = await getSubscriptionByEventKey(eventKey)
  if (!sub?.available) return
  const msg = { eventKey, event }
  sub.sessionIds.forEach(sessionId =>
    sendToSessions(sessionId, JSON.stringify(msg))
  )
}

