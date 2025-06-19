import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'
dotenv.config()

const
  brokers = [process.env.KAFKA_BROKER!],
  topic = process.env.TOPIC!,
  intervalMs = Number(process.env.INTERVAL_MS),
  subscriptionIds = process.env.SUBSCRIPTION_IDS!.split(',')

const kafka = new Kafka({ clientId: 'mock-scheduler', brokers })
const producer = kafka.producer()

const start = async () => {
  await producer.connect()
  setInterval(async () => {
    const timestamp = new Date().toISOString()
    subscriptionIds.map(async id => {
      const value = JSON.stringify({ subscriptionId: id, timestamp })
      await producer.send({ topic, messages: [{ value }] })
      console.log(`tick → ${id}@${timestamp}`)
    })
  }, intervalMs)
}

start().catch(console.error)
