import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'
dotenv.config()

interface EventData {
  eventKey: string,
  data : any
}

interface Event {
  id: string
  payload: EventData
}

const brokers = [process.env.KAFKA_BROKER!]
const topic   = process.env.TOPIC!

const raw       = readFileSync(resolve(__dirname, '../mock-data/subscriptions.json'), 'utf-8')
const rawEvents = readFileSync(resolve(__dirname, '../mock-data/health-monitor-events.json'), 'utf-8')
const mockJson  = JSON.parse(rawEvents) as Record<string, Event[]>
const events    = Object.values(mockJson).flat()

const kafka    = new Kafka({ clientId: 'mock-scheduler', brokers })
const producer = kafka.producer()

const publishRandom = async (): Promise<void> => {
  const event   = events[Math.floor(Math.random() * events.length)]
  const value = JSON.stringify(event)
  const messages = [{key: event.payload.eventKey, value }]
  await producer.send({ topic, messages})
  console.log(`► published ${event.payload.eventKey} @ ${new Date().toISOString()}`)

  const nextMs = 1_000 + Math.random() * 1_000
  setTimeout(publishRandom, nextMs)
}

const start = async (): Promise<void> => {
  await producer.connect()
  publishRandom()
}

start().catch(err => console.error('mock-scheduler error', err))
