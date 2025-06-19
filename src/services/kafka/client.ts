import { Kafka, Partitioners } from 'kafkajs';
import { config } from '../../config';

export const kafka = new Kafka({
  clientId: 'subscription-service',
  brokers: [config.KAFKA_URI],
});