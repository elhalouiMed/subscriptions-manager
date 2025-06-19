// src/services/kafka/kafkaProducer.ts
import { kafka } from './client';

const producer = kafka.producer();

export async function produce<T = any>(
  topic: string,
  message: T
) {
  console.log('[Kafka] Producer connecting…');
  await producer.connect();

  const value =
    typeof message === 'string'
      ? message
      : JSON.stringify(message);

  await producer.send({
    topic,
    messages: [{ value }],
  });

  await producer.disconnect();
}
