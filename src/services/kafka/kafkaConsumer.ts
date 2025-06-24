import { kafka } from './client'
import { config } from '../../config'
import { logger } from '../..'

const consumer = kafka.consumer({ groupId: config.kafka_consumer_group })

export const parsePayloadHelper = <T>(raw: string): T => {
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    logger.warn({ raw, err }, 'Non-JSON payload, treating as string')
    return raw as unknown as T
  }
}

export const startConsumers = async <T = unknown>(
  handlers: Array<{
    topic: string | RegExp
    onMessage: (message: T, topic: string) => Promise<void> | void
  }>
): Promise<void> => {
  logger.info('[Kafka] Consumer connecting…')
  await consumer.connect()

  for (const { topic } of handlers) {
    logger.info(`[Kafka] Subscribing to ${topic}`)
    await consumer.subscribe({ topic, fromBeginning: true })
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw     = message.value?.toString() ?? ''
      const payload = parsePayloadHelper<T>(raw)
      const meta    = { topic, partition, offset: message.offset }
      try {
        for (const { topic: t, onMessage } of handlers) {
          const matches = typeof t === 'string' ? t === topic : t.test(topic)
          if (matches) {
            await onMessage(payload, topic)
            logger.info(meta, `Handled by ${String(t)}`)
            break
          }
        }
      } catch (error) {
        logger.error({ ...meta, error, payload }, 'Error in Kafka handler')
      }
    }
  })
}
