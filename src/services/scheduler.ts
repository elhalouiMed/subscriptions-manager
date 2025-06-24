import { createHash } from 'crypto'
import { config } from '../config'
import { produce } from './kafka/kafkaProducer'
import axios from 'axios'

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex')

export const registerTask = async (
  eventKey: string,
  cron?: string,
  payload?: any
): Promise<void> => {
  const id = sha256(eventKey)
  // in my case for the interval, i have no data to publish as payload
  await produce(config.topics.scheduler_register,id, {
    id,
    cron,
    payload
  })
}


export const deleteTask = async (
  eventKey: string
): Promise<void> => {
  const id = sha256(eventKey)
  const url = `${config.schedulerHttpUrl.replace(/\/$/, '')}/tasks/${id}`
  await axios.delete(url)
}