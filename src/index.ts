import express, { Request, Response, NextFunction } from 'express'
import pino from 'pino'
import subscriptionRoutes from './routes/subscriptionRoutes'
import { config } from './config'
import { initConsumer } from './services/kafka/kafkaConsumer'
import { initProducer } from './services/kafka/kafkaProducer'
import { connectDB } from './utils/db'
import { webSocketClient } from './services/websocket/websocketClient'
import { handleSubscription } from './services/subscriptionHandlers'
import { subscriptionSchema } from './utils/validators/kafka/scheduleEventValidator'

export const logger = pino()
const app = express()
const PORT = config.port
const TOPIC = config.topics.scheduler_events

app.use(express.json())
app.use('/subscriptions', subscriptionRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.json({ project: config.project_name })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err, 'Unhandled error')
  const status = (err as any)?.status || 500
  const message = (err as any)?.message || 'Internal Server Error'
  res.status(status).json({ error: message })
})

const parseRaw = (raw: string): unknown | null => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    logger.error({ raw, err }, 'Invalid JSON payload')
    return null
  }
}

const start = async (): Promise<void> => {
  await connectDB()
  logger.info('MongoDB connected')

  await initProducer()
  logger.info('Kafka producer initialized')

  webSocketClient.init()
  logger.info('WebSocket client initialized')

  app.listen(PORT, () => {
    logger.info(`HTTP server listening on http://localhost:${PORT}`)
  })

  try {
    await initConsumer(TOPIC, async raw => {
      const msg = typeof raw === 'string' ? parseRaw(raw) : raw
      if (!msg) return

      const { error, value } = subscriptionSchema.validate(msg)
      if (error) {
        logger.error({ error }, 'Payload validation failed')
        return
      }

      try {
        await handleSubscription(value)
      } catch (handlerErr) {
        logger.error(handlerErr, 'Subscription handler failed')
      }
    })
  } catch (err) {
    logger.error(err, 'Kafka consumer failed to start')
    process.exit(1)
  }
}

start().catch(err => {
  logger.error(err, 'Fatal startup error')
  process.exit(1)
})
