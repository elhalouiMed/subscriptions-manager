import express from 'express'
import subscriptionRoutes from './routes/subscriptionRoutes'
import { config } from './config'
import { consume } from './services/kafka/kafkaConsumer'
import { connectDB } from './utils/db'
import { webSocketClient } from './services/websocket/websocketClient'

const app = express()
connectDB()
webSocketClient.init()
const PORT = config.PORT
const TOPIC = 'scheduler-events'

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ project: config.PROJECT_NAME })
})

app.use('/subscriptions', subscriptionRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

consume(TOPIC, msg => {
  console.log('Consumed:', msg)
}).catch(err => console.error('Consumer error:', err))

