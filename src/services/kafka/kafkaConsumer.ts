import { kafka } from './client'
import { config } from '../../config'
import { logger } from '../..'

const consumer = kafka.consumer({ groupId: config.kafka_consumer_group })

const parsePayloadHelper = <T>(raw: string): T => {
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    logger.warn({ raw, err }, 'Non-JSON payload, treating as string')
    return raw as unknown as T
  }
}

export const initConsumer = async <T = unknown>(
  topic: string,
  onMessage: (message: T) => Promise<void> | void
): Promise<void> => {
  logger.info('[Kafka] Consumer connecting…')
  await consumer.connect()
  logger.info(`[Kafka] Subscribing to topic "${topic}"`)
  await consumer.subscribe({ topic, fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue   = message.value?.toString() ?? ''
      const payload    = parsePayloadHelper<T>(rawValue)
      const meta       = { topic, partition, offset: message.offset }

      try {
        await onMessage(payload)
        logger.debug(meta, 'Successfully processed Kafka message')
      } catch (error) {
        logger.error({ ...meta, error, payload }, 'Failed to process Kafka message')
      }
    }
  })

}
