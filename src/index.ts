import express from 'express';
import { config } from './config';
import { registerRoutes } from './routes/subscription.routes';

const app = express();
const port = config.PORT || 3000;

app.use(express.json());

registerRoutes(app);

app.listen(port, () => {
  console.log(`Subscription Manager API listening on port ${port}`);
});