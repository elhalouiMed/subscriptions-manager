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
  key: string,
  message: T
): Promise<void> => {
  const serializedValue =
    typeof message === 'string' ? message : JSON.stringify(message)

  await producer.send({
    topic,
    messages: [
      {
        key,
        value: serializedValue
      }
    ]
  })
}