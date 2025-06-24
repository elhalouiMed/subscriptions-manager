import { Kafka } from 'kafkajs';
import { config } from '../../config';

export const kafka = new Kafka({
  clientId: 'subscription-service',
  brokers: [config.kafka_uri],
});