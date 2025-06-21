export const config = {
  PORT: process.env.PORT || 3000,
  PROJECT_NAME: 'Kafka Subscription Manager Microservice',
  KAFKA_URI: 'localhost:9092',
  KAFKA_CONSUMER_GROUP: 'SBSCRIPTION_MANAGER',
  MONGODB_URI: 'mongodb://root:example@localhost:27018/subscriptions-manager?authSource=admin',
  WEBSOCKET_URI: 'ws://localhost:8081'
};