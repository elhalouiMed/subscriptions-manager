import express, { Request, Response } from 'express'
import pino from 'pino'
import subscriptionRoutes from './routes/subscriptionRoutes'
import { config } from './config'
import { startConsumers } from './services/kafka/kafkaConsumer'
import { initProducer } from './services/kafka/kafkaProducer'
import { connectDB } from './utils/db'
import { startWebSocketServer } from './services/websocket/server'
import { handleAvailabilityToggle, handleMetricsEvent, handleSchedulerTrigger } from './services/kafka/subscriptionCallbacks'

export const logger = pino()
const app = express()
const SERVER_PORT = config.server_port
const WEBSOCKET_PORT = config.websocket_port

app.use(express.json())
app.use('/subscriptions', subscriptionRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.json({ project: config.project_name })
})

app.use((err: unknown, _req: Request, res: Response) => {
  logger.error(err, 'Unhandled error')
  const status = (err as any)?.status || 500
  const message = (err as any)?.message || 'Internal Server Error'
  res.status(status).json({ error: message })
})

const start = async (): Promise<void> => {
  await connectDB()

  await initProducer()
  logger.info('Kafka producer initialized')

  startWebSocketServer()
  logger.info(`WebSocket server started on ws://<host>:${WEBSOCKET_PORT}`)

  app.listen(SERVER_PORT, () => {
    logger.info(`HTTP server listening on http://localhost:${SERVER_PORT}`)
  })

  try {
    const { metrics_prefix } = config.topics;
    const metricsRe = new RegExp(`^${metrics_prefix}\\..*`);
    await startConsumers([
      { topic: config.topics.scheduler_trigger, onMessage: handleSchedulerTrigger },
      { topic: config.topics.availability, onMessage: handleAvailabilityToggle },
      { topic: metricsRe, onMessage: handleMetricsEvent }
    ])

  } catch (err) {
    logger.error(err, 'Kafka consumer failed to start')
    process.exit(1)
  }
}

start().catch(err => {
  logger.error(err, 'Fatal startup error')
  process.exit(1)
})
