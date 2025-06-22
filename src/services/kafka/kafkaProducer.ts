import { kafka } from './client'
import { logger } from '../..'

const producer = kafka.producer()

export const initProducer = async (): Promise<void> => {
  logger.info('[Kafka] Producer connecting…')
  await producer.connect()
  logger.info('[Kafka] Producer connected')
}

export const produce = async <T = any>(
  topic: string,
  message: T
): Promise<void> => {
  const value =
    typeof message === 'string'
      ? message
      : JSON.stringify(message)

  await producer.send({
    topic,
    messages: [{ value }],
  })
}

