import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'
dotenv.config()

interface Subscription {
  subscription: string
  data: unknown
}

const brokers = [process.env.KAFKA_BROKER!]
const topic   = process.env.TOPIC!

const raw       = readFileSync(resolve(__dirname, '../mock-data/subscriptions.json'), 'utf-8')
const mockJson  = JSON.parse(raw) as Record<string, Subscription[]>
const allSubs   = Object.values(mockJson).flat()

const kafka    = new Kafka({ clientId: 'mock-scheduler', brokers })
const producer = kafka.producer()

const publishRandom = async (): Promise<void> => {
  const sub   = allSubs[Math.floor(Math.random() * allSubs.length)]
  const value = JSON.stringify(sub)
  await producer.send({ topic, messages: [{ value }] })
  console.log(`► published ${sub.subscription} @ ${new Date().toISOString()}`)

  const nextMs = 5_000 + Math.random() * 5_000
  setTimeout(publishRandom, nextMs)
}

const start = async (): Promise<void> => {
  await producer.connect()
  publishRandom()
}

start().catch(err => console.error('mock-scheduler error', err))
