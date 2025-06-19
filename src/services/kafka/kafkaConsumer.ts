import { kafka } from './client';
import { config } from '../../config';

const consumer = kafka.consumer({
  groupId: config.KAFKA_CONSUMER_GROUP,
});

export async function consume<T = string>(
  topic: string,
  onMessage: (message: T) => Promise<void> | void
) {
  console.log('[Kafka] Consumer connecting…');
  await consumer.connect();
  console.log(`[Kafka] Subscribing to topic "${topic}"`);
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString() || '';
      let payload: T;
      try {
        payload = JSON.parse(raw) as T;
      } catch {
        payload = (raw as unknown) as T;
      }
      onMessage(payload);
    },
  });
}