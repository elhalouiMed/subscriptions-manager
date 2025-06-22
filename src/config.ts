import 'dotenv/config'

type EnvKey =
  | 'PORT'
  | 'PROJECT_NAME'
  | 'KAFKA_URI'
  | 'KAFKA_CONSUMER_GROUP'
  | 'MONGODB_URI'
  | 'WEBSOCKET_URI'
  | 'KAFKA_TOPIC_SCHEDULER'

const getEnv = (key: EnvKey): string => {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var ${key}`)
  return val
}

export const config = {
  port: Number(getEnv('PORT')),
  project_name: getEnv('PROJECT_NAME'),
  kafka_uri: getEnv('KAFKA_URI'),
  kafka_consumer_group: getEnv('KAFKA_CONSUMER_GROUP'),
  mongodb_uri: getEnv('MONGODB_URI'),
  websocket_uri: getEnv('WEBSOCKET_URI'),
  topics: {
    scheduler_events: getEnv('KAFKA_TOPIC_SCHEDULER')
  }
} as const
