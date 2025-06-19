import express from 'express';
import { config } from './config';
import { consume } from './services/kafka/kafkaConsumer';
import { produce } from './services/kafka/kafkaProducer';

const app = express();
const PORT = config.PORT;
const TOPIC = 'scheduler-events';

app.get('/', (_, res) => {
  res.json({ project: 'Kafka Subscription Manager Microservice' });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

consume(TOPIC, (msg) => {
  console.log('Consumed:', msg);
}).catch(err => console.error('Consumer error:', err));

setInterval(() => {
  const payload = { event: 'heartbeat', ts: Date.now() };
  produce(TOPIC, payload).catch(err =>
    console.error('Producer error:', err)
  );
}, 5_000);
