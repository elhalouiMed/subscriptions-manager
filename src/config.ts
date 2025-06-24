import 'dotenv/config'

type EnvKey =
  | 'SERVER_PORT'
  | 'WEBSOCKET_PORT'
  | 'PROJECT_NAME'
  | 'KAFKA_URI'
  | 'KAFKA_CONSUMER_GROUP'
  | 'MONGODB_URI'
  | 'WEBSOCKET_URI'
  | 'KAFKA_TOPIC_SCHEDULER'
  | 'SCHEDULER_REGISTER_TOPIC'
  | 'SCHEDULER_TRIGGER_TOPIC'
  | 'METRICS_TOPIC_PREFIX'
  | 'AVAILABILITY_TOGGLE_TOPIC'
  | 'SCHEDULER_HTTP_URL'

const getEnv = (key: EnvKey): string => {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var ${key}`)
  return val
}

export const config = {
  server_port: Number(getEnv('SERVER_PORT')),
  websocket_port: Number(getEnv('WEBSOCKET_PORT')),
  project_name: getEnv('PROJECT_NAME'),
  kafka_uri: getEnv('KAFKA_URI'),
  kafka_consumer_group: getEnv('KAFKA_CONSUMER_GROUP'),
  mongodb_uri: getEnv('MONGODB_URI'),
  websocket_uri: getEnv('WEBSOCKET_URI'),
  topics: {
    scheduler_events: getEnv('KAFKA_TOPIC_SCHEDULER'),
    scheduler_register: getEnv('SCHEDULER_REGISTER_TOPIC'),
    scheduler_trigger: getEnv('SCHEDULER_TRIGGER_TOPIC'),
    metrics_prefix: getEnv('METRICS_TOPIC_PREFIX'),
    availability: getEnv('AVAILABILITY_TOGGLE_TOPIC')
  },
  schedulerHttpUrl: getEnv('SCHEDULER_HTTP_URL')
} as const
